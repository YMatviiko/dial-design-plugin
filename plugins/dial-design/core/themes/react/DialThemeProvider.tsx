// React provider for DIAL light/dark/system theming in a standalone app. Copy next to dial-theme.ts.
//
//   <DialThemeProvider config={themesConfig}>            // bundled copy: kit-lookup.mjs theme json > src/theme/dial-themes.json
//   <DialThemeProvider configUrl={`${host}/config.json`} imagesHost={host}>   // live, from an ai-dial-chat-themes server
//
//   const { mode, themeId, setMode, image } = useDialTheme();
//   setMode('dark' | 'light' | 'system');  <img src={image('model-garden-logo')} … />
//
// ?theme=dark|light|system in the URL overrides the stored choice for that page load (previews, screenshots).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  applyThemeColors,
  cacheThemeColors,
  imageFor,
  osPrefersDark,
  readStoredMode,
  resolveThemeId,
  storeMode,
  type DialThemeMode,
  type DialThemesConfig,
} from './dial-theme';

interface DialThemeContextValue {
  /** What the user picked: light, dark or system. */
  mode: string;
  /** What is painted now: light or dark (system resolved). */
  themeId: string;
  setMode: (mode: DialThemeMode | string) => void;
  config: DialThemesConfig | undefined;
  /** A themed image URL for the current theme, e.g. image('chat-logo'). */
  image: (key: string) => string | undefined;
}

const DialThemeContext = createContext<DialThemeContextValue | null>(null);

const urlMode = (): string | null =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('theme');

export function DialThemeProvider({
  config: initialConfig,
  configUrl,
  imagesHost = '',
  defaultMode = 'light',
  children,
}: {
  config?: DialThemesConfig;
  configUrl?: string;
  imagesHost?: string;
  defaultMode?: DialThemeMode;
  children: ReactNode;
}) {
  const [config, setConfig] = useState<DialThemesConfig | undefined>(initialConfig);
  const [mode, setModeState] = useState<string>(() => urlMode() ?? readStoredMode(defaultMode));
  const [prefersDark, setPrefersDark] = useState(osPrefersDark);
  const written = useRef<string[]>([]);

  useEffect(() => {
    if (!configUrl) return;
    let cancelled = false;
    fetch(configUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((c: DialThemesConfig) => { if (!cancelled) setConfig(c); })
      .catch(() => { /* keep the bundled/cached theme */ });
    return () => { cancelled = true; };
  }, [configUrl]);

  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setPrefersDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mode]);

  const themeId = resolveThemeId(mode, prefersDark);

  useEffect(() => {
    if (!config) return;
    cacheThemeColors(config);
    const theme = config.themes.find((t) => t.id === themeId) ?? config.themes[0];
    written.current = applyThemeColors(document.documentElement, theme, written.current);
  }, [config, themeId]);

  const setMode = useCallback((next: string) => {
    setModeState(next);
    storeMode(next);
  }, []);

  const image = useCallback((key: string) => imageFor(config, key, themeId, imagesHost), [config, themeId, imagesHost]);

  const value = useMemo(() => ({ mode, themeId, setMode, config, image }), [mode, themeId, setMode, config, image]);
  return <DialThemeContext.Provider value={value}>{children}</DialThemeContext.Provider>;
}

export function useDialTheme(): DialThemeContextValue {
  const value = useContext(DialThemeContext);
  if (!value) throw new Error('useDialTheme must be used inside <DialThemeProvider>');
  return value;
}
