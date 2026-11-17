# DIAL light and dark themes

Shared by both DIAL skills. DIAL apps have a **light**, a **dark** and a **system** (follow the OS) theme. A screen
built only from kit components and kit token classes switches between them with no extra code. These rules keep it
that way.

## How it works

- The theme data lives in **epam/ai-dial-chat-themes** (`static/config.json`): per theme, ~210 colour tokens
  (`bg-layer-base`, `text-secondary`, `stroke-tertiary`, `shadow-md`…) plus light/dark logos in `images`. The plugin
  keeps a saved copy in `<core>/themes/config.json` (`kit-lookup.mjs theme` shows its version).
- An app applies a theme by writing every token to `<html>` as a custom property: `--bg-layer-base: #10151E`.
- The kit's CSS reads every colour as `var(--token, <light fallback>)`: `bg-layer-raised`, `text-primary`,
  `border-tertiary` (reads `--stroke-tertiary`) and all kit components switch when the properties change. The kit has
  no `dark:` variant and no `prefers-color-scheme` of its own — the tokens are the whole mechanism.
- Without any theme applied, the page shows the kit's fallbacks: close to the light theme, not identical (e.g.
  `text-primary` is `#161B2D` as a fallback, `#1B212D` in the light theme).

```
node <core>/kit-lookup.mjs theme                     # saved version, how it works
node <core>/kit-lookup.mjs theme token text-secondary bg-layer-raised   # light and dark value of tokens
node <core>/kit-lookup.mjs theme check               # kit tokens a theme doesn't define; kit classes with fixed colours
node <core>/kit-lookup.mjs theme css                 # both themes as CSS (:root / :root[data-theme="dark"])
node <core>/kit-lookup.mjs theme json                # the raw config (to bundle in a standalone app)
```

## Rules

1. **Colour only through kit token classes** (`<core>/foundations.md`). They switch with the theme.
2. **Never pick styles by theme** (`isDark ? 'bg-layer-raised' : 'bg-layer-sunken'`, `theme === 'dark' && …`). The token already has the
   right value in each theme. The one exception is brand art: choose a logo by theme.
3. **No `dark:` classes, no own `prefers-color-scheme` / `.dark` / `[data-theme=dark]` styles.**
4. **No fixed colours**: no `bg-[#…]`, hex/rgb values, or the few kit classes with a fixed colour (`text-white`,
   `text-red-500`, `ring-sky-400`, `border-[#F4CE46]` in kit 0.16 — `theme check` lists the current ones). They look
   the same in both themes, so they break in one of them.
5. **Brand art needs both versions.** Logos have `-light`/`-dark` versions in the theme config (`chat-logo-*`,
   `model-garden-logo-*`, `launchpad-logo-*`, `admin-logo-*`); icons should use `currentColor` (Tabler icons do). A
   dark-on-transparent logo disappears in dark.
6. **A part of the screen in a different theme** (e.g. a dark side panel in a light page) redefines the tokens on its
   root with a class and wraps itself in **`ThemeScope`** with that class — otherwise its `Dropdown`, `Popup`,
   `Tooltip` and `Calendar` overlays, which render at the end of `<body>`, open in the page's theme.
7. **Check both themes.** Screenshot the page in light and in dark (`?theme=dark`).

Validators: rules 3–4 are errors in both skills (React rule 10a); rule 2, rule 5 (a logo `<img>` with no dark version) and own dark
stylesheets are warnings in the React skill.

## Where theming is set up

- **Inside DIAL Chat** (or another app that already loads the DIAL themes): nothing to do; follow the rules.
- **A standalone app** (e.g. Model Garden, a new admin tool) with no theme handling yet: write the recipe into the
  project with **`node <core>/kit-lookup.mjs theme recipe`** (into `src/theme/` and `public/`; it prints the wiring
  steps; don't copy or retype the files by hand). Same mechanism as DIAL Chat:
  - `dial-theme.ts` — apply a theme to `<html>`, resolve `system`, cache colours, pick themed images;
  - `DialThemeProvider.tsx` — React provider + `useDialTheme()` (`mode`, `themeId`, `setMode`, `image(key)`); takes
    the bundled config (`dial-themes.json`, written by `theme recipe`) or a themes server URL
    (`THEMES_CONFIG_HOST`); `?theme=dark` previews a theme;
  - `theme-init.js` — load in `<head>` before the bundle so a reload doesn't flash the light theme.
  The user's choice belongs in the app's settings: a `Select` with Light / Dark / System, as in the `settings`
  pattern.
- **HTML prototypes**: the `<!-- kit-theme -->` block (every pattern has it) — real light and dark values, a toggle,
  `?theme=dark`.
