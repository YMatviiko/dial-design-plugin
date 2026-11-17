#!/usr/bin/env node
// Release check for the dial-design plugin. Run from the repo root before every release, and on a schedule
// (.github/workflows/kit-check.yml) to catch kit releases that break something.
//
//   node check-release.mjs                     against the newest kit on npm
//   node check-release.mjs --kit 0.16.4        against a given kit version
//   node check-release.mjs --screenshots dir   also screenshot every built pattern into dir (needs Chrome)
//   node check-release.mjs --keep              keep the temporary kit folder (path is printed)
//
// Checks:
//   1. every pattern builds with the kit and passes validate-html.mjs (a class or component the kit dropped fails)
//   2. every pattern has a <!-- pattern-meta … --> line (the pattern list is built from it)
//   3. the hand-built-component rules in core/kit-rules.mjs still match the kit: their classes exist, and a rule's
//      look + marker classes are still in the real component's rendered output
//   4. every token/type class named in core/foundations.md, core/layouts.md and core/recipes.md exists in the kit CSS,
//      and every component named in recipes.md is a 2.0 component of the kit
//   5. versions agree: plugin.json, marketplace.json, top CHANGELOG entry
//   6. themes: every pattern has <!-- kit-theme -->; the token table in foundations.md matches the saved themes;
//      notes for kit tokens a theme doesn't define, weak contrast of key pairs in either theme, and a newer
//      config on GitHub than the saved copy (core/themes/config.json)
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(ROOT, 'plugins/dial-design');
const CORE = join(PLUGIN, 'core');
const KL = join(CORE, 'kit-lookup.mjs');
const VALIDATE_HTML = join(PLUGIN, 'skills/dial-html-prototype/validate-html.mjs');

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const kitWanted = opt('--kit') ?? 'latest';
const shotsDir = opt('--screenshots') ? resolve(opt('--screenshots')) : null;
const keep = args.includes('--keep');

const problems = [], notes = [];
const fail = (m) => problems.push(m);

// ---- 5. versions (cheap, first)
const plugin = JSON.parse(readFileSync(join(PLUGIN, '.claude-plugin/plugin.json'), 'utf8'));
const market = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
const entry = market.plugins.find((p) => p.name === plugin.name);
if (!entry) fail(`marketplace.json has no plugin "${plugin.name}"`);
else if (entry.version && entry.version !== plugin.version) fail(`marketplace.json version ${entry.version} ≠ plugin.json ${plugin.version}`);
const top = (readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').match(/^## v?(\d+\.\d+\.\d+)/m) || [])[1];
if (top !== plugin.version) fail(`top CHANGELOG entry is ${top ?? 'missing'}, plugin.json says ${plugin.version}`);

// ---- install the kit in a temp folder
const work = mkdtempSync(join(tmpdir(), 'dial-design-check-'));
console.log(`kit folder: ${work}`);
execSync('npm init -y', { cwd: work, stdio: 'ignore' });
try {
  execSync(`npm install @epam/ai-dial-ui-kit@${kitWanted} react react-dom jsdom --no-audit --no-fund`, { cwd: work, stdio: ['ignore', 'ignore', 'inherit'] });
} catch { console.error('npm install failed (see above).'); process.exit(1); }
const kitDir = join(work, 'node_modules/@epam/ai-dial-ui-kit');
const kitVersion = JSON.parse(readFileSync(join(kitDir, 'package.json'), 'utf8')).version;
console.log(`checking against @epam/ai-dial-ui-kit ${kitVersion}\n`);
const { loadKitCss, HAND_BUILT, legacyToken } = await import(join(CORE, 'kit-rules.mjs'));
const TH = await import(join(CORE, 'themes.mjs'));
const { classes: kitClasses } = loadKitCss(join(kitDir, 'dist/index.css'));
const manifest = JSON.parse(readFileSync(join(kitDir, 'dist/components-manifest.json'), 'utf8'));
const v2 = new Set(manifest.components.filter((c) => c.generation === '2.0').map((c) => c.name));
const kl = (...a) => execFileSync('node', [KL, ...a], { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });

// ---- 1 + 2. patterns
const patterns = readdirSync(join(CORE, 'patterns')).filter((f) => /^[a-z].*\.html$/.test(f)).map((f) => f.replace(/\.html$/, ''));
const out = join(work, 'built');
mkdirSync(out);
const checkedWith = new Set();
for (const p of patterns) {
  const src = readFileSync(join(CORE, 'patterns', `${p}.html`), 'utf8');
  const meta = src.match(/<!-- pattern-meta ([^>]*)-->/);
  if (!meta) fail(`pattern ${p}: no <!-- pattern-meta area="…" layout="…" checked-with-kit="…" --> line`);
  else for (const k of ['area', 'layout', 'checked-with-kit']) {
    const m = meta[1].match(new RegExp(`${k}="([^"]*)"`));
    if (!m) fail(`pattern ${p}: pattern-meta has no ${k}`);
    else if (k === 'checked-with-kit') checkedWith.add(m[1]);
  }
  if (!src.includes('<!-- kit-theme -->')) fail(`pattern ${p}: no <!-- kit-theme --> in <head> (light/dark block)`);
  try { writeFileSync(join(out, `${p}.html`), kl('pattern', p)); process.stdout.write('.'); }
  catch (e) { fail(`pattern ${p} doesn't build: ${String(e.stderr || e.message).trim().split('\n').slice(-3).join(' | ')}`); }
}
console.log(` built ${patterns.length} patterns`);
const built = patterns.map((p) => join(out, `${p}.html`)).filter(existsSync);
try { execFileSync('node', [VALIDATE_HTML, ...built], { cwd: work, encoding: 'utf8' }); console.log('patterns pass validate-html'); }
catch (e) { fail(`patterns fail validate-html:\n${String(e.stdout).split('\n').filter((l) => l.startsWith('  ')).join('\n')}`); }
const stale = [...checkedWith].filter((v) => v !== kitVersion);
if (stale.length) notes.push(`patterns say checked-with-kit ${stale.join(', ')}; this run used ${kitVersion}. If everything passes, bump checked-with-kit in the pattern-meta lines (and look at the screenshots).`);

// ---- 3. hand-built rules still describe the real components
for (const r of HAND_BUILT) {
  for (const l of r.look) if (typeof l === 'string' && !kitClasses.has(l)) fail(`kit-rules: ${r.component} look class "${l}" is not in the kit CSS any more`);
  if (!r.marker) continue;
  if (!v2.has(r.component)) { fail(`kit-rules: ${r.component} is not a 2.0 component in kit ${kitVersion}`); continue; }
  const html = kl('render', r.component, '{"children":"x"}');
  const cls = new Set((html.match(/class="([^"]*)"/) || ['', ''])[1].split(/\s+/));
  for (const l of [...r.look, r.marker]) {
    const ok = l instanceof RegExp ? [...cls].some((c) => l.test(c)) : cls.has(l);
    if (!ok) fail(`kit-rules: rendered ${r.component} no longer has "${l}" — update its look/marker in core/kit-rules.mjs`);
  }
}
console.log('hand-built rules checked');

// ---- 4. docs name only real classes and components
for (const doc of ['foundations.md', 'layouts.md', 'recipes.md', 'themes.md']) {
  const text = readFileSync(join(CORE, doc), 'utf8').replace(/```[\s\S]*?```/g, ''); // fenced blocks would shift backtick pairing
  const legacySection = doc === 'foundations.md' ? (text.match(/## Don't use[\s\S]*?(?=\n## )/) || [''])[0] : '';
  const scan = text.replace(legacySection, '');
  for (const span of scan.matchAll(/`([^`]+)`/g))
    for (const tok of span[1].split(/\s+/)) {
      const t = tok.replace(/^["'(]+|["'),.;]+$/g, '');
      if (!/^(hover:)?(bg|text|border|dial|shadow|rounded)-[\w\-\[\]./]+$/.test(t) || /[…*]/.test(t) || /\.(ts|tsx|js|mjs|json|md|svg)$/.test(t)) continue;
      if (legacyToken(t)) fail(`${doc}: recommends legacy token "${t}"`);
      else if (!kitClasses.has(t)) fail(`${doc}: "${t}" is not in kit ${kitVersion} CSS`);
    }
  if (doc === 'recipes.md')
    for (const m of text.matchAll(/`([A-Z][A-Za-z]+)`/g))
      if (!/^Icon[A-Z]/.test(m[1]) && !v2.has(m[1]) && !/^(JSON|JSX)$/.test(m[1])) fail(`recipes.md: "${m[1]}" is not a 2.0 component in kit ${kitVersion}`);
}
console.log('docs checked');

// ---- 6. themes
{
  const cfg = TH.loadThemes(), src = TH.loadSource();
  const light = TH.theme(cfg, 'light'), dark = TH.theme(cfg, 'dark');
  const tokens = TH.kitThemeTokens(readFileSync(join(kitDir, 'dist/index.css'), 'utf8'));
  for (const t of [light, dark]) {
    const miss = TH.uncovered(tokens, t);
    if (miss.length) notes.push(`theme "${t.id}" (saved ${src.commit}) doesn't define kit tokens: ${miss.join(', ')} — a theme-data gap; report it to ai-dial-chat-themes.`);
  }
  for (const [fg, bg, min, what] of TH.CONTRAST_PAIRS)
    for (const t of [light, dark]) {
      if (!t.colors[fg] || !t.colors[bg]) { notes.push(`contrast: ${t.id} theme has no ${!t.colors[fg] ? fg : bg}`); continue; }
      const r = TH.contrast(t.colors[fg], t.colors[bg], t.colors['bg-layer-base'] ?? '#FFFFFF');
      if (r < min) notes.push(`contrast ${r.toFixed(2)} < ${min} in ${t.id}: ${fg} on ${bg} (${what})`);
    }
  // foundations.md token table: Light / Dark cells must match the saved themes
  const table = readFileSync(join(CORE, 'foundations.md'), 'utf8').split('\n').filter((l) => /^\| .* \| `[^`]+` \| #/.test(l));
  for (const row of table) {
    const [, , cls, lv, dv] = row.split('|').map((x) => x.trim());
    const tok = cls.replace(/`/g, '').replace('hover:', '').replace(/^border-/, 'stroke-');
    if (light.colors[tok] !== lv || dark.colors[tok] !== dv) fail(`foundations.md: ${cls} shows ${lv} / ${dv}, saved themes have ${light.colors[tok]} / ${dark.colors[tok]}`);
  }
  if (!table.length) fail('foundations.md: no token rows with light/dark values found');
  try {
    const r = await fetch(TH.THEMES_URL, { signal: AbortSignal.timeout(15000) });
    if (r.ok) {
      const { createHash } = await import('node:crypto');
      const remote = createHash('sha256').update(await r.text()).digest('hex');
      if (remote !== src.sha256) notes.push(`ai-dial-chat-themes on GitHub has a newer config than the saved copy (${src.commit}). Update: node plugins/dial-design/core/kit-lookup.mjs theme update`);
    }
  } catch { notes.push('couldn\'t reach GitHub to compare the saved themes (offline?)'); }
  console.log(`themes checked (saved ${src.commit}, ${table.length} token rows)`);
}

// ---- screenshots for review
if (shotsDir) {
  const chrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'google-chrome', 'chromium'].find((c) => { try { execFileSync(c, ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } });
  if (!chrome) notes.push('no Chrome found: skipped screenshots');
  else {
    mkdirSync(shotsDir, { recursive: true });
    for (const f of built) {
      const png = join(shotsDir, f.split('/').pop().replace(/\.html$/, '.png'));
      for (const [suffix, query] of [['', '?toggle=off'], ['-dark', '?theme=dark&toggle=off']])
        try { execFileSync(chrome, ['--headless=new', '--hide-scrollbars', '--window-size=1440,900', '--virtual-time-budget=5000', `--screenshot=${png.replace(/\.png$/, `${suffix}.png`)}`, `file://${f}${query}`], { stdio: 'ignore', timeout: 60000 }); } catch {}
    }
    console.log(`screenshots: ${shotsDir}`);
  }
}

if (!keep) rmSync(work, { recursive: true, force: true });
for (const n of notes) console.log(`\nnote: ${n}`);
if (problems.length) {
  console.log(`\nFAIL — ${problems.length} problem(s) with kit ${kitVersion}:\n`);
  for (const p of problems) console.log(`- ${p}`);
  process.exit(1);
}
console.log(`\nOK — plugin ${plugin.version}, kit ${kitVersion}. Release:
  git add -A && git commit -m "Release v${plugin.version}"
  git tag v${plugin.version} && git push && git push --tags`);
