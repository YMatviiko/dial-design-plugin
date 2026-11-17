# Changelog

Versioning (semver): **patch** = wording or pattern fix · **minor** = new pattern, rule or command · **major** = a
change that can block work that used to pass (e.g. a stricter validator). Each entry names the
`@epam/ai-dial-ui-kit` version it was checked with.

## 2.0.0 — 2026-11-17

First release as one plugin. Merges `dial-design-vibecode` 1.0.1 and `dial-html-prototype` 1.2.0 around a shared core.
Checked with `@epam/ai-dial-ui-kit` 0.16.4.

### dial-design-vibecode
- **Starts every new screen from a DIAL page pattern.** The Component Mapping Plan now names the pattern and the layout
  kept from it; `react.md` explains how to read a pattern template as JSX and which static stand-ins not to port.
- **No more hand-built kit components.** New rule: use the component, never its look (`CardShell` for cards,
  `Popup` for backdrops, `Tooltip`, `NoDataContent`, `Badge`, `FormSection`).
- **No MCP server or restart needed.** Kit discovery goes through `core/kit-lookup.mjs` (`search`, `info`, `classes`,
  `patterns`, `status`). The MCP server is optional.
- **Kit version check:** `kit-lookup.mjs status` compares the project's kit with npm and lists the new 2.0 components;
  the skill never upgrades without asking.
- **Validator** (major: can fail code that used to pass) now checks class strings (`className`, `*ClassName`,
  `cn()`/`clsx()`/`classNames()`/`twMerge()`): legacy 1.0 tokens, hand-built components (CardShell look,
  `bg-backdrop`, `bg-control-inverted`, filled accent controls), `dial-kit-*` internals, and classes that are neither in
  the kit CSS nor in the project's CSS (a warning when the project runs its own Tailwind). It now finds the kit from
  the project folder (it used to look next to the skill, which fails when installed as a plugin).
- The validator is a normal file now; it's no longer embedded in SKILL.md.

### dial-html-prototype
- The pattern list comes from `kit-lookup.mjs patterns` (built from each pattern's new `pattern-meta` line) instead of
  a table in SKILL.md.
- New rule: cards are `CardShell`. The validator fails a hand-built CardShell and legacy 1.0 tokens (shared rules in
  `core/kit-rules.mjs`).
- `components.md` split: shared parts moved to `core/foundations.md`, `core/layouts.md`, `core/recipes.md`; HTML-only
  parts are in `html.md`.

### Patterns
- `catalog`, `catalog-details`, `catalog-delete`, `toolsets-details`: 42 hand-built cards replaced with the real
  `CardShell` (`wrap` marker). Pixel-identical in `catalog`; the cards now get CardShell's hover lift.
- `tables`: kit 0.16.4 dropped `sticky`, `inline-block`, `size-[8px]` and `border-info`; replaced with
  `style="position: sticky"`, `block`, `size-2`, `border-accent`.
- Every pattern has a `pattern-meta` line (area, layout, checked-with-kit).
- Toolbars: the sort control is the `GhostButton` (sort icon) as the trigger of a kit `Dropdown` with a check on the current
  option, and search results mark the match with the kit `Highlight` (pattern comments, `layouts.md`, `recipes.md`,
  `react.md`, vibecode rule 4). Found in the first live test: the agent used `InlineSelect` and plain text.

### From the live tests
- Both skills: type full `kit-lookup` commands, one per call. Claude Code blocks or prompts for shell functions,
  variables, loops and chains. `kit-lookup.mjs info` takes several names at once.
- dial-design-vibecode: when the project has no app shell, ask about the DIAL navigation (or say it was left out);
  new "Look at it" step: screenshot the page through the dev server when possible.
- `react.md`: add `@tabler/icons-react` to `package.json` when the project doesn't list it.
- New `kit-lookup.mjs type <Name>`: an interface's fields or an enum's members from the kit manifest (e.g. `DropdownItem`,
  `MenuItemMark`); `info` points to it for kit types in props. The third test session searched `node_modules` for these.
- `recipes.md`: `Badge` `textClassName` replaces the type class; truncate with `"dial-tiny-text truncate"`.

### Maintenance
- `check-release.mjs`: builds and validates every pattern against the newest (or a given) kit, checks the
  hand-built rules against the real rendered components, checks every class and component named in the core docs,
  and checks versions. Optional screenshots.
- `.github/workflows/kit-check.yml`: runs it weekly and opens an issue on failure.
- `dial-pattern-maintainer` skill (repo-only): updating patterns from Figma, adding rules, releasing.
