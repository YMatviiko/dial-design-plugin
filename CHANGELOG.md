# Changelog

Versioning (semver): **patch** = wording or pattern fix · **minor** = new pattern, rule or command · **major** = a
change that can block work that used to pass (e.g. a stricter validator). Each entry names the
`@epam/ai-dial-ui-kit` version it was checked with.

## 3.0.0 — 2026-11-17

Light and dark themes. Checked with `@epam/ai-dial-ui-kit` 0.16.4 and ai-dial-chat-themes @ 44c8ea1.
Major: the validators now fail classes they used to accept (fixed colours, `dark:` variants).

### Shared core
- **Saved copy of the DIAL themes** (`core/themes/config.json` from epam/ai-dial-chat-themes, with `SOURCE.json`).
- **`core/themes.md`**: how theming works (tokens on `<html>`, light/dark/system), the rules, where it's set up.
- **`kit-lookup.mjs theme`**: `token` (light and dark value), `check` (kit tokens a theme doesn't define, kit classes
  with fixed colours), `css`, `json`, `block` (prototype theme block), `recipe` (standalone-app files into a project), `update` (maintainers: refresh the saved copy).
- **`foundations.md`**: the token table shows light and dark values from the saved themes (it showed kit fallbacks,
  which differ from the light theme for 14 tokens, e.g. `text-primary`).
- **Validator rule `theme-breaking`** (both skills, error): kit classes with a fixed colour (worked out from the kit
  CSS: `text-white`, `text-red-500`, `ring-sky-400`, `border-[#F4CE46]` in 0.16.4), `bg-[#…]`-style colour classes,
  and `dark:` variants.
- **Dark assets**: `dial-chat-logo-dark`, `nav-new-chat-dark`, `chat-status-dark`; product logos in both versions from
  the themes repo (`model-garden-logo`, `launchpad-logo`, `admin-logo`).
- **Recipe for standalone apps** (`core/themes/react/`): `dial-theme.ts`, `DialThemeProvider.tsx` (`useDialTheme`:
  mode, themeId, setMode, image), `theme-init.js` (no light flash on reload). Same mechanism as DIAL Chat;
  `?theme=dark` previews. `kit-lookup.mjs theme recipe` writes it into a project (the live test agent couldn't copy files
  out of the plugin folder and retyped them).

### dial-design-vibecode
- Rule 10a: every screen works in light and dark; `ThemeScope` for a part of the screen in another theme.
- Setup Check step 4: finds out whether the app applies the DIAL themes; offers the recipe to standalone apps.
- "Look at it" also screenshots `?theme=dark`.
- Validator warnings: styles picked by theme (`isDark ? …`), a logo `<img>` with no dark version, an own dark block in
  a changed stylesheet. Fixed: project components named `Dial*` were reported as 1.0 kit components.

### dial-html-prototype
- **`<!-- kit-theme -->`** in every pattern: the real light and dark values, a toggle (bottom-right), `?theme=dark`,
  `?theme=system`, `?toggle=off`. Prototypes now show the production light colours instead of kit fallbacks.
  `asset` markers with a `-dark` twin switch automatically. The validator checks the block is unedited.
- Rule 3 is now "light and dark come from the theme block" (was "light theme only"). Workflow screenshots dark too.

### Release check
- Fails a pattern without `kit-theme` and a token table that doesn't match the saved themes; notes kit tokens a theme
  doesn't define, weak contrast of key pairs in either theme, and a newer themes config on GitHub. `--screenshots`
  writes light and dark.
- Found: both themes lack `shadow-sm-1` / `shadow-md-1`, which the kit reads (part of card shadows keeps its light tint
  in dark). Reported as a note; a theme-data fix.

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
