// DIAL light/dark/system theming for a standalone React app (e.g. Model Garden) — the same mechanism DIAL Chat
// uses (ai-dial-chat ThemeContext + public/theme-init.js): every key of theme.colors is written to <html> as a
// custom property, which the @epam/ai-dial-ui-kit CSS reads as var(--token). Kit token classes then switch on
// their own; components never branch on the theme for colours.
//
// Copy into the project (e.g. src/theme/dial-theme.ts) together with DialThemeProvider.tsx and theme-init.js.
// Source: dial-design plugin, core/themes/react/. Theme data: epam/ai-dial-chat-themes static/config.json.

export type DialThemeMode = 'light' | 'dark' | 'system';

export interface DialTheme {
  id: string;
  displayName: string;
  colors: Record<string, string | undefined>;
  topicColors?: Record<string, string | undefined>;
  authColors?: Record<string, string | undefined>;
  'font-family'?: string;
}

export interface DialThemesConfig {
  themes: DialTheme[];
  /** Image file names or URLs, e.g. "chat-logo-light" / "chat-logo-dark", relative to the themes host. */
  images?: Record<string, string>;
}

/** localStorage keys — read by theme-init.js before the bundle loads, so keep them in sync with it. */
export const THEME_MODE_KEY = 'theme';
export const THEME_COLORS_KEY = 'themeColors';
/** Attribute theme-init.js sets on <html>: the custom properties it wrote from the cache. */
export const THEME_PRELOAD_ATTRIBUTE = 'data-theme-preload';

export const osPrefersDark = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

/** The theme id to paint for a mode: "system" follows the OS. */
export const resolveThemeId = (mode: string, prefersDark: boolean = osPrefersDark()): string =>
  mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

/**
 * Writes a theme's colours to `root` as --<token> and removes the ones the previous call wrote that this theme
 * lacks. Returns the properties written (pass them back as `previous` next time). Also sets data-theme and
 * color-scheme so native scrollbars/controls and theme-specific art can follow.
 */
export function applyThemeColors(
  root: HTMLElement,
  theme: DialTheme | undefined,
  previous: readonly string[] = [],
): string[] {
  const written: string[] = [];
  for (const [key, value] of Object.entries(theme?.colors ?? {})) {
    if (typeof value !== 'string') continue;
    root.style.setProperty(`--${key}`, value);
    written.push(`--${key}`);
  }
  for (const property of previous) if (!written.includes(property)) root.style.removeProperty(property);
  // Properties painted by theme-init.js from the cache: drop any the fetched theme doesn't redefine.
  const preloaded = root.getAttribute(THEME_PRELOAD_ATTRIBUTE);
  if (preloaded != null) {
    for (const property of preloaded.split(' ')) if (property && !written.includes(property)) root.style.removeProperty(property);
    root.removeAttribute(THEME_PRELOAD_ATTRIBUTE);
  }
  if (theme) {
    root.setAttribute('data-theme', theme.id);
    root.style.colorScheme = theme.id === 'dark' ? 'dark' : 'light';
  }
  return written;
}

/** Caches every theme's colours so theme-init.js can paint the stored theme on the next load before React runs. */
export function cacheThemeColors(config: DialThemesConfig): void {
  try {
    localStorage.setItem(THEME_COLORS_KEY, JSON.stringify(Object.fromEntries(config.themes.map((t) => [t.id, t.colors]))));
  } catch {
    /* Blocked storage only costs the next load its early paint. */
  }
}

export function readStoredMode(fallback: DialThemeMode = 'light'): string {
  try {
    return localStorage.getItem(THEME_MODE_KEY) ?? fallback;
  } catch {
    return fallback;
  }
}

export function storeMode(mode: string): void {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * The URL of a themed image for the current theme: `imageFor(config, 'model-garden-logo', 'dark', host)` picks
 * "model-garden-logo-dark", falling back to "-light" and then the plain key. Relative names resolve against `host`
 * (the themes server, THEMES_CONFIG_HOST); absolute URLs are returned as they are.
 */
export function imageFor(config: DialThemesConfig | undefined, key: string, themeId: string, host = ''): string | undefined {
  const images = config?.images ?? {};
  const name = images[`${key}-${themeId === 'dark' ? 'dark' : 'light'}`] ?? images[`${key}-light`] ?? images[key];
  if (!name) return undefined;
  return /^(https?:)?\/\/|^data:|^\//.test(name) || !host ? name : `${host.replace(/\/$/, '')}/${name}`;
}
