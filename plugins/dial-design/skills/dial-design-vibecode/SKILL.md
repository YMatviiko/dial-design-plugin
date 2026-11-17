---
name: dial-design-vibecode
description: Generate/update UI in the current project in strict compliance with @epam/ai-dial-ui-kit — starts every new screen from the closest DIAL page pattern, uses real 2.0 kit components (CardShell for cards, never hand-built copies), never invents components/props/tokens, never uses a 1.0 (Dial*) component, and runs a deterministic validator before showing any diff. Use whenever building, editing, or reviewing UI code that uses @epam/ai-dial-ui-kit, and also when starting or vibecoding new UI/frontend features in a project where the kit isn't installed yet — the Setup Check installs it. For a throwaway HTML mockup, use dial-html-prototype instead.
---

# DIAL Design Vibecode

You are helping an engineer build or modify UI in this project. Every visual element must come from
`@epam/ai-dial-ui-kit`, and every new screen starts from a DIAL page pattern. Two things go wrong without this
skill, and it exists to stop both: **made-up layouts** and **hand-built copies of kit components** (a card styled
to look like `CardShell` instead of `CardShell`).

## Files and tools

This skill shares a core with `dial-html-prototype`. `<core>` below means `${CLAUDE_SKILL_DIR}/../../core` (the
`core` folder two levels up from this file).

| File | What's in it |
|---|---|
| `<core>/layouts.md` | **Read before any new screen.** DIAL screen rules, picking a pattern, CardShell, plain layout |
| [`react.md`](react.md) (next to this file) | How to read a pattern template as JSX; which template parts not to port |
| `<core>/recipes.md` | Which component for what, with props (JSON ↔ JSX) |
| `<core>/foundations.md` | Colour tokens (light and dark values), typography, pairings, legacy tokens, raw values |
| `<core>/themes.md` | Light/dark/system: how theming works, the rules, the setup recipe for standalone apps |

`K` below is shorthand for `node "${CLAUDE_SKILL_DIR}/../../core/kit-lookup.mjs"`, run from the project root. It reads
the kit installed in this project. **Type the full command every time, one command per Bash call.** Claude Code blocks or asks permission for shell
functions (`K() {…}`), variables (`L=…; node $L`), loops (`for c in …`) and `;`/`&&` chains — each one costs
turns or a permission prompt. To look up several components, pass them all to one call: `K info CardShell Badge Search`.

| Need | Command |
|---|---|
| Installed kit vs npm latest, and what a newer kit adds | `K status` |
| The DIAL page patterns (area, name, layout) | `K patterns` |
| A pattern's template — the layout spec | `K pattern <name> --source` |
| Find a component ("modal", "card", "empty state"…) | `K search <text>` |
| Its props, enum types and the kit's own examples | `K info <Name> [<Name> …]` |
| What a prop's type contains (`DropdownItem` fields, `MenuItemMark` members) | `K type <Name> [<Name> …]` (`K type ""` lists all) |
| Whether a utility class exists, and what it does | `K classes '<regex>'` |
| A theme token's light and dark value; kit tokens a theme lacks | `K theme token <name> […]`, `K theme check` |
| Light/dark/system for a standalone app: write the recipe into the project | `K theme recipe` (`src/theme/`, `public/`) |

**Never run `K update`, `K render` or `K grid` in a product repo** — they are for HTML prototypes (`update` adds
react/jsdom to the folder). **Never use `rg`/`grep`/`find`/`ls`/`cat` inside `node_modules` to discover components or types**:
it misses examples and costs turns; `info` and `type` read the same definitions. If the kit's MCP server (`searchEntity` / `getEntityDetails`) happens to be
configured, you may use it too; it reads the same installed manifest. Nothing here needs it, and nothing needs a
session restart.

## Configuration (edit this once per project)

- **Design review contact**: Yuliia Matviiko (MS Teams) — receives `composed-components.log.md` for review
  (rule 13c). If this is ever blank or a placeholder when rule 13c fires, ask the engineer who to send it to.

## Setup Check (once per session, before any UI work)

1. **Print the skill version** once: read `version` from `${CLAUDE_SKILL_DIR}/../../.claude-plugin/plugin.json`
   and say "dial-design-vibecode vX.Y.Z" (or "version unknown"). Updates come through the plugin
   (`claude plugin marketplace update dial-design`); don't check or pull anything yourself.
2. **Run `K status`.**
   - Kit installed → report "kit X.Y.Z" in one line. If it says a newer kit exists, tell the engineer once, with the
     new components it lists. **Never upgrade on your own**: it changes the lockfile and can break existing screens
     (see "Kit upgrades").
   - Kit not installed → `npm install @epam/ai-dial-ui-kit`, make sure the app imports the kit stylesheet
     (`@epam/ai-dial-ui-kit/styles.css` or `dist/index.css`, per the kit's README), and report what you did.
   - Install fails (registry, permissions) → stop and show the actual error.
3. If the output has a `note:` that the patterns were checked with a different kit, mention it once: layouts still
   apply; the validator flags any class the kit dropped.
4. **Theme handling**: find out once whether the app already applies the DIAL themes — DIAL Chat does; otherwise
   search the project for a theme provider writing `--bg-layer-*` properties, `THEMES_CONFIG_HOST`, or
   `DialThemeProvider`. If a standalone app (e.g. Model Garden) has none, say so in the mapping plan and offer the
   recipe from `<core>/themes.md`; when asked for it, write it with `K theme recipe` (never copy or retype the files).
   Never add it unasked: it changes the app shell.

## Non-negotiable rules

**Layout**

1. **Every new screen, page, panel or dialog starts from the closest DIAL pattern** (`K patterns`, pick by layout as
   `<core>/layouts.md` explains, then `K pattern <name> --source`). Build the feature into that layout: same
   heading row, toolbar, grid, drawer or form columns, same components. Never invent an app shell, header bar,
   navigation, composer, card or page structure. If nothing fits, say so in the mapping plan and follow
   `<core>/layouts.md`.
2. **Keep the project's own app shell.** The patterns' navigation stands for "the app's navigation": in an existing
   app, put the feature inside its shell. **If the project has no app shell yet**, ask in the mapping plan whether to
   add the DIAL navigation (the 336px sidebar, or the 72px rail on builders/forms, as in the pattern). If you can't
   wait for an answer, build the page without it and say so in your reply — never leave it out silently.

**Components**

3. **Only Generation 2.0 components — never a 1.0 (`Dial*`) component**, even one with no replacement. `K search`
   marks 1.0 components and names their replacement; check with `K info` rather than trusting a hardcoded list.
   Use the closest 2.0 match, including an imperfect fit, before building anything.
4. **Never hand-build what the kit ships.** Use the component itself, not its look: a browse-grid card is
   `CardShell` (layout changes via `className`, e.g. `"flex-row items-center"`), a backdrop comes with
   `Popup`/`SideDrawer`, a tooltip is `Tooltip`, an empty list is `NoDataContent`, a status label is `Badge`, a form
   section is `FormSection`, a sort control is a `GhostButton` (sort icon) opening a `Dropdown`, and searched text
   is shown with `Highlight` so matches are marked. Never copy a component's classes (including `dial-kit-*` internals) onto your own
   element. The validator fails the common cases.
5. **Search before deciding something has no component.** Every kit release adds components; `K search` with two
   or three different words ("card", "tile", "panel") before falling back.
6. **Never invent a component, prop, enum value, hook or token** that `K search` / `K info` / `K classes` doesn't
   return. When unsure whether a component fits, read its examples (`K info`) before deciding it doesn't.
7. **A need only a 1.0 component covers** is treated as "nothing fits" (rule 8), never as permission to use it. For
   something as complex as a file manager or data grid, don't attempt a sprawling raw-HTML rebuild: stop and ask.

**Fallback**

8. **Raw HTML is a last resort**, allowed only when both hold: no kit component — even adapted — can serve the need,
   AND the missing piece is crucial to the user flow (without it the task can't be completed). A cosmetic gap or a
   "would look better" preference never qualifies; use the closest component, or flag the gap and suggest
   simplifying the requirement.
9. Raw-HTML fallback markup follows rule 10 too. If even the tokens needed to style it don't exist, stop and ask —
   that's a genuine DS gap.

**Styling**

10. **Only kit classes and tokens** (`<core>/foundations.md`): no hex, `rgb()`, named colours, or px/rem spacing;
    no legacy 1.0 tokens (`bg-layer-0…4`, `text-accent-primary`…). An exact layout size from the design may be a
    numeric style (`style={{ width: 336 }}`) when the kit has no class. Check unknown classes with `K classes`.
10a. **Every screen works in light and dark** (`<core>/themes.md`): colour only through kit token classes; never pick
    styles by theme (`isDark ? …`); no `dark:` classes, own `prefers-color-scheme` styles or fixed colours
    (`text-white`, `bg-[#…]`); logos come in light and dark versions; a part of the screen in another theme wraps
    itself in `ThemeScope` so its overlays follow.

**Gates**

11. After generating or editing code, run the validator before showing the diff, and report pass/fail with it.
    Never silently suppress a failure.
12. Whenever you fall back to raw HTML (rule 8), flag it inline in the diff as "not an `ai-dial-ui-kit` component —
    raw HTML (last resort: nothing fit, crucial to flow)" and silently append one row to
    `composed-components.log.md` (format below).
13. Mapping completeness is checked agent-side — **there is no git hook wired in for this**; it only holds while
    this skill drives the commit (the engineer may wire `validate.mjs --mode pre-commit` into a real hook; that's
    their call, since it touches shared repo tooling).
    - **(a) Before committing** ("let's commit", "ready to commit", or whenever you're about to run `git commit`):
      run `--mode pre-commit`, which checks exactly what's staged. Anything failing → stop and say exactly what;
      don't commit over it.
    - **(b) Before a PR** ("this is done", "create the PR"): optionally re-run `--mode pre-pr` over the whole branch.
    - **(c) Design handoff — advisory only.** Once (b) is clean (or skipped), if the log has entries for this
      feature, advise sending `composed-components.log.md` to the design review contact above. Never send it
      yourself; if nothing was logged, say nothing.
14. **Pre-existing code** that fails to map to a real component (or fails the validator): offer to fix it with the
    same rules, logged with a `retrofit` tag. Present fixes as reviewable diffs grouped by file — never auto-apply in
    bulk. A violation the engineer declines stays open and keeps blocking the gate.

## Workflow

0. **Setup Check** (above).
1. **Component Mapping Plan — before writing any code** for a new screen or a visible change. Present:
   - **Pattern**: the one you start from and why (by layout). Or "none fits", and what you'll follow instead.
   - **Layout**: the pattern's structure you keep (heading row, toolbar, grid/drawer/form columns).
   - **Elements**: each UI element → its 2.0 component (from the pattern, `<core>/recipes.md`, `K search`), with
     key props. Cards → `CardShell`. Mark raw-HTML fallback candidates and genuine gaps.
   - **Kit gaps**: anything that needs a newer kit (from `K status`).
   Nothing is logged at this stage. For a small edit inside an existing screen, a one-line plan is enough.
2. Read the pattern template (`K pattern <name> --source`) and `react.md`; translate the markers to JSX. Check
   every component's props with `K info` (the examples show the import and enum names).
3. Generate/edit the code.
4. Run the validator from the project root:
   ```
   node "${CLAUDE_SKILL_DIR}/validate.mjs"
   ```
   Fix every error and re-run. Warnings are shown, not hidden.
5. **Look at it.** If the project has a dev server and Chrome is installed: start the server in the background
   (`npm run dev`), screenshot the page and read the image:
   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1440,900 --virtual-time-budget=5000 --screenshot=/tmp/dial-page.png http://localhost:<port>/<route>
   ```
   (Linux: `google-chrome` / `chromium`.) Check: it has the pattern's structure; nothing overflows a card or column;
   text and badges of the same kind have the same size; buttons haven't stretched; nothing is unstyled or invisible.
   **Then the dark theme**: the same screenshot with `?theme=dark` (the DIAL recipe and DIAL Chat's preload read it;
   otherwise use the app's own theme switch). Check nothing disappears or keeps a light colour (logos, icons,
   borders). Fix and repeat 4–5, then stop the dev server. If you can't run it, say you didn't check the page visually.
6. Present the diff + validator result, including any "raw HTML — last resort" flag and log row (rule 12). Say which
   pattern the screen follows.
7. **Before committing**: `node "${CLAUDE_SKILL_DIR}/validate.mjs" --mode pre-commit` (rule 13a).
8. **Before a PR**, optionally: `node "${CLAUDE_SKILL_DIR}/validate.mjs" --mode pre-pr --base <base branch>`, then
   the design handoff check (13c).

## What the validator checks

Changed `.tsx`/`.jsx` files against the installed kit:
- **errors**: a `Dial*` (1.0) component; a kit import that isn't in the manifest; a quoted hex colour; raw px in
  `style={{}}`; a legacy 1.0 token; a hand-built kit component (CardShell look, `bg-backdrop`,
  `bg-control-inverted`, a filled accent control); a `dial-kit-*` internal class; a theme-breaking class (a kit
  class with a fixed colour like `text-white`, `bg-[#…]`, a `dark:` variant); a class that's in neither the kit CSS
  nor the project's own CSS.
- **warnings**: a prop the manifest doesn't list (it misses some inherited props); unknown classes when the project
  runs its own Tailwind (they may be generated there); styles picked by theme (`isDark ? …`); a logo `<img>` with no
  dark version; an own dark block (`prefers-color-scheme`, `.dark`) in a changed stylesheet.

## Kit upgrades

`K status` lists what a newer kit adds. When the engineer agrees to upgrade: `npm install
@epam/ai-dial-ui-kit@<version>`, then run `node "${CLAUDE_SKILL_DIR}/validate.mjs" <every .tsx/.jsx file that
imports the kit>` and fix what the new kit dropped or renamed. When a needed component only exists in a newer kit,
say so in the mapping plan ("`ToggleChip` would fit; it needs 0.16") instead of hand-building a substitute.

## The log file: `composed-components.log.md` (repo root)

Append-only, one row per raw-HTML fallback, written automatically at fallback time (rule 12). Create it with this
header if it doesn't exist:

```markdown
| Date | Feature/branch | Element | Location | Origin | Fallback markup used | Why last resort (nothing fit + crucial to flow) |
| ---- | -------------- | ------- | -------- | ------ | -------------------- | ----------------------------------------------- |
```

`Origin` is `fresh` (decided during normal development) or `retrofit` (existing code brought into compliance,
rule 14).
