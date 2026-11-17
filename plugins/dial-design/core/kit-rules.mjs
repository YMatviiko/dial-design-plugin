// Shared checks for both DIAL skills (dial-html-prototype, dial-design-vibecode).
// Everything here is true in plain HTML and in React: which classes the kit CSS has, which tokens are legacy 1.0,
// and which class combinations are a hand-built copy of a real kit component.
// The skill validators import this file; keep it dependency-free.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const KIT = '@epam/ai-dial-ui-kit';

export function findUp(start, rel) {
  for (let d = start; ; d = dirname(d)) {
    if (existsSync(join(d, rel))) return join(d, rel);
    if (dirname(d) === d) return null;
  }
}

// The installed kit: { dir, version, cssPath, manifest, componentNames } or null.
export function findKit(...startDirs) {
  for (const s of startDirs) {
    const dir = s && findUp(s, `node_modules/${KIT}`);
    if (!dir) continue;
    const version = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).version;
    const cssPath = join(dir, 'dist/index.css');
    const mPath = join(dir, 'dist/components-manifest.json');
    const manifest = existsSync(mPath) ? JSON.parse(readFileSync(mPath, 'utf8')) : null;
    return { dir, version, cssPath, manifest, componentNames: manifest ? new Set(manifest.components.map((c) => c.name)) : null };
  }
  return null;
}

// Kit class and variable sets. Selectors only: empty innermost rule bodies and drop url()/at-rule preludes first,
// so decimals ("0.5rem" -> "5rem") and data-URI hosts ("www.w3.org") don't leak in as fake classes.
export function loadKitCss(cssPath) {
  const css = readFileSync(cssPath, 'utf8');
  const selectorsOnly = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '').replace(/\{[^{}]*\}/g, '{}').replace(/@[^{;]*/g, '');
  const classes = new Set([...selectorsOnly.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)].map((m) => m[1].replace(/\\(.)/g, '$1')));
  const vars = new Set([...css.matchAll(/--[\w-]+/g)].map((m) => m[0]));
  // Classes that paint a fixed colour (a raw value outside var(--token, …)): they look the same in every theme,
  // so they break the light/dark switch. Transparent and the kit's own internals (dial-*, editor, grid) are fine.
  const fixedColour = new Set();
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2].replace(/var\([^()]*(\([^()]*\))?[^()]*\)/g, '');
    const colours = [...body.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|oklch\([^)]*\)|hsla?\([^)]*\)/gi)].map((x) => x[0].toLowerCase());
    if (!colours.length || colours.every((c) => /^#0000(0000)?$|^rgba?\([^)]*,\s*0\)$/.test(c))) continue;
    for (const c of m[1].matchAll(/\.((?:\\.|[\w-])+)/g)) {
      const n = c[1].replace(/\\(.)/g, '$1');
      if (!/^([a-z-]+:)*(dial-|ag-|w-md-editor|wmde-)/.test(n)) fixedColour.add(n);
    }
  }
  return { classes, vars, fixedColour };
}

// Known gaps in the pruned kit build, with what to use instead.
export const SUBSTITUTES = {
  'mx-auto': 'center with a flex parent: "flex justify-center"',
  'mr-auto': 'use "ml-auto" on the next sibling, or "justify-between" on the parent',
  'h-screen': 'use "min-h-screen", or html,body{height:100%} plus "h-full"',
  'hover:underline': 'use a rendered LinkButton',
  'max-w-sm': 'use max-w-[420px]', 'max-w-md': 'use max-w-[450px]', 'max-w-lg': 'use max-w-[600px]',
  'max-w-xl': 'use max-w-[600px]', 'max-w-2xl': 'use max-w-[600px] or max-w-full', 'max-w-3xl': 'use max-w-full or max-w-[600px]',
  // dropped in kit 0.16 (Tailwind v4)
  'text-tertiary': 'use "text-secondary" (the kit\'s own hint colour)',
  'outline-none': 'on a bare textarea/input use style="outline: none"',
  'placeholder:text-secondary': 'leave it out: the default placeholder colour is what the kit\'s inputs use',
  'z-10': 'use "z-popup" on a page overlay; a raised sidebar only needs "relative"',
  'z-50': 'use "z-popup"',
  'self-end': 'use "items-end" on the parent, or "self-stretch flex items-end"',
  'pl-6': 'use "ml-6", or "pl-4" plus "ml-2" on the first child',
  'grid-cols-4': 'use "grid" + style="grid-template-columns: repeat(4, minmax(0, 1fr))"',
  'break-all': 'use "break-words"',
  // dropped in kit 0.16.x
  'sticky': 'use style="position: sticky" with a kit inset class (top-0, right-0)',
  'inline-block': 'use "block" or "flex"',
  'border-info': 'use "border-accent"',
};

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// " Instead: …" / " Nearest kit classes: …" hint for a class the kit doesn't have.
export function suggest(cls, kitClasses) {
  if (SUBSTITUTES[cls]) return ` Instead: ${SUBSTITUTES[cls]}.`;
  const m = cls.match(/^(?:([a-z-]+:))?w-(\d+(?:\.\d+)?)$/);
  if (m && kitClasses.has(`${m[1] ?? ''}size-${m[2]}`)) return ` For a square, "size-${m[2]}" exists.`;
  const px = cls.match(/^(?:([a-z-]+:))?size-\[(\d+)px\]$/);
  if (px && Number(px[2]) % 4 === 0 && kitClasses.has(`${px[1] ?? ''}size-${Number(px[2]) / 4}`)) return ` "size-${Number(px[2]) / 4}" is the same size.`;
  const head = cls.replace(/^([a-z-]+:)*/, '').split('-')[0];
  const near = [...kitClasses].filter((k) => k.replace(/^([a-z-]+:)*/, '').split('-')[0] === head)
    .map((k) => [k, lev(cls, k)]).filter(([, n]) => n <= 3).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k]) => k);
  return near.length ? ` Nearest kit classes: ${near.join(', ')}.` : ' Check with: kit-lookup.mjs classes <regex>.';
}

export const isIconClass = (c) => c === 'tabler-icon' || c.startsWith('tabler-icon-');

// Legacy 1.0 tokens: still in the kit CSS for old components, never for new UI.
const LEGACY = [
  [/^bg-layer-[0-4]$/, 'bg-layer-base / bg-layer-raised / bg-layer-sunken'],
  [/^bg-accent-/, 'bg-control-accent or bg-control-accent-alpha'],
  [/^bg-controls-/, 'bg-control-*'],
  [/^text-accent-primary$/, 'text-accent'],
  [/^text-controls-/, 'text-control-permanent (on a filled control)'],
  [/^border-accent-primary$/, 'border-accent'],
];
export function legacyToken(cls) {
  const bare = cls.replace(/^([a-z-]+:)*/, '');
  const hit = LEGACY.find(([re]) => re.test(bare));
  return hit ? hit[1] : null;
}

// Hand-built copies of kit components, recognised by their look. `look` = classes that together mean "this is
// that component's appearance"; `marker` = a class only the real rendered component carries (so rendered kit
// markup in a prototype never trips the rule). `scope`: 'both' or 'react' (the HTML skill has sanctioned static
// stand-ins for some of these, e.g. the tooltip). check-release.mjs re-renders each component and fails if a
// `look` or `marker` class is no longer in its output, so these stay true across kit versions.
export const HAND_BUILT = [
  { component: 'CardShell', scope: 'both', look: ['rounded-[20px]', 'bg-layer-raised', /^shadow-(md|lg)$/, 'p-5'], marker: 'transition-[transform,box-shadow]',
    why: 'a browse-grid card is the kit CardShell (pass layout changes via className, e.g. "flex-row items-center")' },
  { component: 'Popup', scope: 'react', look: ['bg-backdrop'], marker: null, why: 'modal backdrops come with Popup / ConfirmationPopup' },
  { component: 'Tooltip', scope: 'react', look: ['bg-control-inverted'], marker: null, why: 'use the kit Tooltip around the trigger' },
  { component: 'PrimaryButton', scope: 'react', look: ['bg-control-accent', 'text-control-permanent'], marker: null, why: 'a filled accent control is PrimaryButton / PrimaryIconButton' },
];
// Returns the matching HAND_BUILT entry for a list of classes, or null.
export function handBuilt(classList, scope) {
  const set = new Set(classList); // the resting look only: hover:/focus: variants don't count
  for (const r of HAND_BUILT) {
    if (r.scope !== 'both' && r.scope !== scope) continue;
    if (r.marker && set.has(r.marker)) continue;
    if (r.look.every((l) => (l instanceof RegExp ? [...set].some((c) => l.test(c)) : set.has(l)))) return r;
  }
  return null;
}

// Theme-breaking classes: they paint the same colour in light and dark.
const ARBITRARY_COLOUR = /^([a-z-]+:)*(bg|text|border(-[trblxyse])?|ring|ring-offset|fill|stroke|from|via|to|shadow|outline|decoration|divide|placeholder|caret|accent)-\[(#|rgb|hsl|oklch|color)/i;
export function themeBreaking(cls, fixedColour) {
  if (/(^|:)dark:/.test(cls) || cls.startsWith('dark:'))
    return 'a dark: variant — the kit has none; light and dark come from the theme tokens, so the plain token class already switches';
  if (ARBITRARY_COLOUR.test(cls)) return 'a fixed colour — it stays the same in light and dark; use a kit token class';
  if (fixedColour?.has(cls)) return 'a kit class with a fixed colour — it stays the same in light and dark; use a kit token class (foundations.md)';
  return null;
}

// One class list -> findings [{ level, rule, cls, msg }]. Options: kitClasses (Set), fixedColour (Set, from
// loadKitCss), scope ('html'|'react'), unknownLevel ('error' | 'warning' — React projects with their own Tailwind).
export function checkClassList(classList, { kitClasses, fixedColour, scope, unknownLevel = 'error', where = '' }) {
  const out = [];
  for (const cls of classList) {
    if (isIconClass(cls)) continue;
    const tb = themeBreaking(cls, fixedColour);
    if (tb) { out.push({ level: 'error', rule: 'theme-breaking', cls, msg: `"${cls}"${where} is ${tb}.` }); continue; }
    const leg = legacyToken(cls);
    if (leg) { out.push({ level: 'error', rule: 'legacy-token', cls, msg: `"${cls}"${where} is a legacy 1.0 token — use ${leg}.` }); continue; }
    // dial-kit-* classes are the kit components' internals: in React, use the component (in HTML they come from render).
    if (scope === 'react' && /^([a-z-]+:)*dial-kit-/.test(cls)) {
      out.push({ level: 'error', rule: 'kit-internal-class', cls, msg: `"${cls}"${where} is an internal class of a kit component — use the component itself (kit-lookup.mjs search).` });
      continue;
    }
    if (kitClasses && !kitClasses.has(cls))
      out.push({ level: unknownLevel, rule: 'unknown-class', cls, msg: `"${cls}"${where} is not in the kit CSS${unknownLevel === 'error' ? ' — it would silently do nothing' : ''}.${suggest(cls, kitClasses)}` });
  }
  const hb = handBuilt(classList, scope);
  if (hb) out.push({ level: 'error', rule: 'hand-built-component', cls: classList.join(' '), msg: `Hand-built ${hb.component}${where}: ${hb.why}.` });
  return out;
}
