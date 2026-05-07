const KEY = 'antalya18:theme';

// Called immediately (before DOMContentLoaded) to prevent FOUC
export function applyStoredTheme() {
  const saved = localStorage.getItem(KEY);
  if (saved) applyTheme(saved);
}

// Called after DOM is ready to wire up the button
export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const syncBtn = (theme) => {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Светлая тема' : 'Тёмная тема');
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = isDark ? 'none' : '';
    if (moon) moon.style.display = isDark ? '' : 'none';
  };

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(KEY, next);
    syncBtn(next);
  });

  const theme = document.documentElement.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  syncBtn(theme);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
