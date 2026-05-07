import { renderPlaces, renderFilterChips } from './render.js';
import { initCarousels } from './carousel.js';
import { initVoting, updateAllCounters, updateStickyBar, renderMyList, copyList } from './voting.js';
import { applyStoredTheme, initTheme } from './theme.js';
import { getVotes, clearVotes } from './vote.js';
import { initSubmit } from './submit.js';

applyStoredTheme();

// Transparent header over hero — switch on IntersectionObserver
(function initTransparentHeader() {
  const header = document.getElementById('site-header');
  const hero = document.querySelector('.hero');
  if (!header || !hero) return;

  const obs = new IntersectionObserver(
    ([entry]) => header.classList.toggle('site-header--transparent', entry.isIntersecting),
    { threshold: 0.1 }
  );
  obs.observe(hero);
})();

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
  initSubmit(getVotes);

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
        navigator.share({ title: '18 мест Антальи', url: location.href }).catch(() => {});
      });
    } else {
      shareBtn.hidden = true;
    }
  }

  // Clear list — two-step confirm (no browser dialog)
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    const origHTML = clearBtn.innerHTML;
    let clearPending = false;
    let clearTimer = null;

    const resetClear = () => {
      clearPending = false;
      clearBtn.innerHTML = origHTML;
      clearBtn.removeAttribute('data-confirm');
    };

    clearBtn.addEventListener('click', () => {
      if (!getVotes().length) return;

      if (!clearPending) {
        clearPending = true;
        clearBtn.textContent = 'Уверены? Нажмите ещё раз';
        clearBtn.dataset.confirm = 'true';
        clearTimer = setTimeout(resetClear, 3000);
      } else {
        clearTimeout(clearTimer);
        clearVotes();
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
        resetClear();
      }
    });
  }
});
