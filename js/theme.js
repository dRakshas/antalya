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

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(KEY, next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Светлая тема' : 'Тёмная тема');
  });

  // Sync icon on init
  const theme = document.documentElement.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  btn.setAttribute('aria-label', theme === 'dark' ? 'Светлая тема' : 'Тёмная тема');
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
