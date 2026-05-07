import { renderPlaces, renderFilterChips } from './render.js';
import { initCarousels } from './carousel.js';
import { initVoting, updateAllCounters, updateStickyBar, renderMyList, copyList } from './voting.js';
import { applyStoredTheme, initTheme } from './theme.js';

// Apply stored theme before first paint (module is deferred, but this runs ASAP after HTML parse)
applyStoredTheme();

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('places-grid-list');
  const chips = document.getElementById('filter-chips');

  if (grid) {
    renderPlaces(grid);
    renderFilterChips(chips, grid);
    initCarousels();
  }

  initTheme();
  initVoting();
  renderMyList();

  // Sticky bar controls
  const stickyOpen = document.getElementById('sticky-open');
  const stickyClose = document.getElementById('sticky-close');

  if (stickyOpen) {
    stickyOpen.addEventListener('click', () => {
      document.getElementById('my-list')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (stickyClose) {
    stickyClose.addEventListener('click', () => {
      const bar = document.getElementById('sticky-bar');
      if (bar) {
        bar.setAttribute('hidden', '');
        sessionStorage.setItem('antalya18:bar-dismissed', '1');
      }
    });
  }

  // Don't show sticky bar if dismissed this session
  if (sessionStorage.getItem('antalya18:bar-dismissed')) {
    const bar = document.getElementById('sticky-bar');
    if (bar) bar.setAttribute('hidden', '');
  }

  // Copy list button
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) copyBtn.addEventListener('click', copyList);

  // Web Share
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    if (navigator.share) {
      shareBtn.addEventListener('click', () => {
        navigator.share({ title: '18 мест Антальи', url: location.href })
          .catch(() => {});
      });
    } else {
      shareBtn.hidden = true;
    }
  }

  // Clear list
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Очистить список?')) return;
      try { localStorage.removeItem('antalya18:list'); } catch {}
      document.querySelectorAll('.vote-btn[aria-pressed="true"]').forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
        const label = btn.querySelector('.vote-btn__label');
        if (label) label.textContent = 'Хочу сюда';
        const card = btn.closest('.place-card');
        if (card) card.dataset.voted = 'false';
      });
      updateAllCounters();
      updateStickyBar();
      renderMyList();
    });
  }
});
