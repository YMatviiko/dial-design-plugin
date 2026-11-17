/*
 * DIAL theme preload: paints the user's last theme before the app bundle loads, so a reload never flashes the
 * light palette first. Same approach as ai-dial-chat public/theme-init.js.
 *
 * Serve it as a plain file (e.g. public/theme-init.js) and load it in <head> BEFORE the app bundle:
 *   <script src="/theme-init.js"></script>
 * A classic script, not part of the bundle; it can't import anything, so the storage keys are spelled out here and
 * must match dial-theme.ts (THEME_MODE_KEY 'theme', THEME_COLORS_KEY 'themeColors', THEME_PRELOAD_ATTRIBUTE).
 */
(function () {
  try {
    var storage = window.localStorage;
    var asked = new URLSearchParams(window.location.search).get('theme');
    var stored = asked || storage.getItem('theme') || 'light';
    var themeId = stored;
    if (stored === 'system') {
      themeId = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    root.style.colorScheme = themeId === 'dark' ? 'dark' : 'light';

    var cache = JSON.parse(storage.getItem('themeColors') || 'null');
    var colors = cache && cache[themeId];
    if (!colors || typeof colors !== 'object') return;
    var written = [];
    Object.keys(colors).forEach(function (key) {
      if (typeof colors[key] !== 'string') return;
      root.style.setProperty('--' + key, colors[key]);
      written.push('--' + key);
    });
    if (written.length) root.setAttribute('data-theme-preload', written.join(' '));
  } catch (e) {
    /* Storage blocked or cache malformed: keep the default palette. */
  }
})();
