---
name: dial-html-prototype
description: Build a standalone HTML prototype/mockup (single .html file, no build step, no React) in DIAL design-system 2.0 styling, using the latest @epam/ai-dial-ui-kit — its real component markup and its stylesheet, starting from a DIAL page pattern. Use when someone asks for a prototype, mockup, wireframe, demo page, clickable concept or "static HTML" in DIAL styles — including when they don't mention the kit. NOT for production UI in a React/TSX project; for that use the dial-design-vibecode skill.
---

# DIAL HTML Prototype

You are helping someone (often a designer or PM, not an engineer) make a **throwaway HTML prototype** that
looks like DIAL 2.0. It is a visual concept, not production code. The kit's React components can't run in plain
HTML, so the skill **renders the real components to static HTML** with the installed kit and styles the page with
the kit's own stylesheet. Never invent colours, spacing, fonts, components or layouts.

If the person actually wants a real feature in a React/TSX project, stop and use `dial-design-vibecode` instead.
Prototypes are never merged into a product codebase.

## Files

This skill shares a core with `dial-design-vibecode`. `<core>` below means `${CLAUDE_SKILL_DIR}/../../core` (the
`core` folder two levels up from this file).

| File | What's in it |
|---|---|
| `<core>/layouts.md` | **Read first.** DIAL screen rules, how to pick a pattern, CardShell for cards, plain layout |
| `<core>/foundations.md` | Colour tokens, typography, pairings, legacy tokens, raw values |
| `<core>/recipes.md` | Which component for what, with props |
| [`html.md`](html.md) (next to this file) | HTML only: props-JSON syntax, page skeleton, kit CSS gaps, overlays in a section, live Grid, static tooltip, status pills |
| `<core>/patterns/README.md` | Template syntax (`include`, `render`, `wrap`, `icon`, `asset`, `kit-grid`) |

## Tools

Everything goes through one script, run from the prototype folder. `K` below is shorthand for
`node "${CLAUDE_SKILL_DIR}/../../core/kit-lookup.mjs"`. **Type the full command every time, one command per Bash call.** Claude Code blocks or asks permission for shell
functions (`K() {…}`), variables (`L=…; node $L`), loops (`for c in …`) and `;`/`&&` chains — each one costs
turns or a permission prompt. To look up several components, pass them all to one call: `K info CardShell Badge Search`.

| Need | Command |
|---|---|
| Install / upgrade the kit to the latest version | `K update` |
| **List the DIAL page patterns** (area, name, layout) | `K patterns` |
| **A pattern's template** to start from | `K pattern <name> --source > page.tpl.html` |
| Build your edited template into the prototype | `K pattern page.tpl.html > page.html` |
| Find a component ("modal", "dropdown", "badge"…) | `K search <text>` |
| Its props, enum values and examples | `K info <Name> [<Name> …]` |
| What a prop's type contains (`DropdownItem` fields, enum members) | `K type <Name> [<Name> …]` |
| **Its real HTML**, rendered by the installed kit | `K render <Name> '<props JSON>'` (several: `K render '[{"name":…,"props":…}, …]'`) |
| Whether a utility class exists, and what it does | `K classes '<regex>'` |
| A standalone icon | `K icon <tabler-name> [16\|20\|24]` (add `-filled` for the filled style) |
| A DIAL brand asset (logo, gradient icons, model icon) | `K asset <name> [height]` |
| The stylesheet `<link>` to paste | `K version` |
| **A data table**: the kit's Grid 2.0, live (AG Grid + kit theme) | `K grid` (or `<!-- kit-grid -->` in a template) |

These are the only sanctioned ways to read the kit: don't `grep`/`find` inside `node_modules`.

## Setup (every run)

Run `K update` first. It installs the kit if the folder has none, upgrades it if npm has a newer version, and adds
what `render` needs (`react`, `react-dom`, `jsdom`). Report its result line in your reply (e.g. "kit updated
0.15.4 → 0.16.4"). Offline, it keeps the installed kit. If it fails, show the real error and stop; don't build from
memory. No MCP server or session restart is needed.

## Rules

1. **One self-contained `.html` file** that opens by double-click. No build tools, no frameworks, no Tailwind CDN,
   no external scripts. Plain HTML + CSS, plus an optional small inline `<script>` for click-through behaviour. One
   exception: a **data table uses the kit's Grid live**. Paste the `K grid` block unedited and call `dialGrid()`
   (see "Grid (table)" in `html.md`). Never load AG Grid any other way or hand-build a table the kit Grid covers.
2. **Start from the closest DIAL page pattern** (`K patterns`, then `K pattern <name> --source`). Never invent an
   app shell, header, navigation, composer or card. With no fitting pattern, start from the page skeleton in
   `html.md` and follow `<core>/layouts.md`.
3. **Light theme only.** Use the kit's built-in light values. Don't declare CSS variables (`--x: …`) or add any
   theme override. If someone asks for dark mode, say the prototype skill builds light only.
4. **Every kit component comes from `K render` (or a `render`/`wrap` marker), pasted as printed.** Don't write
   component markup by hand, don't copy a component's classes onto your own element, don't trim its classes, don't
   copy markup from an older prototype (the kit changes between versions). Read the `note:` lines. The one
   sanctioned edit is showing an overlay inside a section, as described in `html.md`.
5. **Cards in a grid are `CardShell`**: `<!-- wrap: CardShell {"className":"…"} -->…<!-- /wrap -->`. Change its
   layout with `className` (`"flex-row items-center"`, `"flex-1"`); never rebuild its look. The validator fails a
   hand-built CardShell.
6. **Your own markup (layout, plain elements) uses only classes that exist in the kit CSS** (plus `tabler-icon*`
   on icons). The kit CSS is a pruned Tailwind build: a missing class silently does nothing (`mx-auto`, `h-screen`,
   `w-4`, `max-w-sm`, `sticky` don't exist). Check with `K classes`; `html.md` lists the gaps and substitutes.
7. **No own classes and no raw values.** The page's `<style>` holds only the skeleton rules. No hex, `rgb()`, named
   colours, or `px`/`rem`/`em`/`vh` values in `style=""`, `<style>`, SVG `fill`/`stroke`, or styles set from the
   script. Percentages are fine. One exception: an exact **layout size** from the design (width, height and their
   min/max, e.g. `style="width: 336px"`) may be px when the kit has no class for it. Spacing and colour never are.
8. **Icons are Tabler** (the kit's set): `"@icon:<name>"` in render props, or `K icon` for a standalone icon,
   coloured with a kit `text-*` class. Brand art with its own colours (the DIAL Chat logo, the New chat icon, the
   starter sparkles, model icons) comes from `K asset`. No hand-drawn icons or emoji.
9. **Script hooks use `id` or `data-*` attributes, never made-up classes.** Show and hide with the kit's `hidden`
   class (`el.classList.toggle('hidden')`). Any class the script adds must exist in the kit CSS too.
10. **Only 2.0 components, and search before hand-building.** `K search` marks 1.0 (`Dial*`) components and names
    their 2.0 replacement; never use a 1.0 one. Every kit release adds components, so search for every element
    before treating it as plain layout. Rendered markup is tagged with `data-dial-component`; keep the tags. Plain
    layout gets no tag. If nothing fits, use the closest pattern in `<core>/layouts.md` and say what's approximate.
11. **Colours follow `<core>/foundations.md`**: pairings, and no legacy 1.0 tokens (`bg-layer-0…4`,
    `bg-controls-*`, `text-accent-primary`) — the validator fails them.
12. **Label it as a prototype.** Keep `<!-- DIAL prototype — not production code -->` right after `<!doctype html>`.
    In your reply, say it is an approximation, give the kit version, and list the `data-dial-component` names used,
    so an engineer knows what to build with.

## Workflow

0. `K update`.
1. Clarify only what blocks you (what feature, where it lives in the product, what states). Don't ask about
   styling: DIAL 2.0 styling is the rule, not a choice.
2. Read `<core>/layouts.md`. Run `K patterns` and pick the closest pattern **by layout**. Say which one and why.
3. Copy its template (`K pattern <name> --source > page.tpl.html`) and add the feature **in the template**: it is
   short and readable, and it keeps the markers. Build it with `K pattern page.tpl.html > page.html`; rebuild after
   every edit. Never edit the generated page by hand (it inlines all images).
4. List the new UI elements and map each to a 2.0 component (`<core>/recipes.md`, `K search`, `K info`). Add them as
   `render`/`wrap` markers.
5. Validate, fix every error, and re-run until it passes:
   ```
   node "${CLAUDE_SKILL_DIR}/validate-html.mjs" path/to/page.html
   ```
   Unknown-class errors suggest the nearest real class. Warnings are shown, not hidden.
6. **Look at it.** Screenshot it and read the image:
   ```
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1440,900 --virtual-time-budget=5000 --screenshot=/tmp/proto.png file:///abs/path/page.html
   ```
   (Linux: `google-chrome` / `chromium`.) Check that nothing is unstyled or invisible, buttons haven't stretched
   across a column, text doesn't overflow a card, and the page still looks like the pattern it came from. Fix and
   repeat 5–6. If no browser is available, say you couldn't check it visually.
7. Tell the person how to open it (double-click the file), the kit version, which pattern it started from, what is
   approximate, and which real components it uses.

## Handoff

If the prototype is approved for real build, the engineer starts a fresh task with `dial-design-vibecode`, names
the pattern the prototype started from, and uses the `data-dial-component` tags as the component list. The
prototype is a reference, not source to copy.
