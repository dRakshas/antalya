import { getVotes, toggleVote } from './vote.js';

const STORAGE_KEY = 'antalya18:list';

export function initVoting() {
  const list = getVotes();
  list.forEach(slug => setVoted(slug, true, false));
  updateAllCounters();
  updateStickyBar();
  renderMyList();

  document.addEventListener('click', e => {
    const btn = e.target.closest('.vote-btn');
    if (btn) handleToggle(btn);

    const removeBtn = e.target.closest('[data-remove-slug]');
    if (removeBtn) {
      const slug = removeBtn.dataset.removeSlug;
      const voteBtn = document.querySelector(`.vote-btn[data-slug="${slug}"]`);
      if (voteBtn) handleToggle(voteBtn);
    }
  });

  // Cross-tab sync
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return;
    const updated = getVotes();
    document.querySelectorAll('.vote-btn[data-slug]').forEach(btn => {
      setVoted(btn.dataset.slug, updated.includes(btn.dataset.slug), false);
    });
    updateAllCounters();
    updateStickyBar();
    renderMyList();
  });
}

function handleToggle(btn) {
  const slug = btn.dataset.slug;
  if (!slug) return;
  const wasVoted = btn.getAttribute('aria-pressed') === 'true';
  const nowVoted = !wasVoted;

  // Capture source position BEFORE DOM changes (for FLIP)
  let firstRect = null;
  if (nowVoted && !prefersReduced()) {
    const card = document.getElementById(`place-${slug}`);
    if (card) firstRect = card.getBoundingClientRect();
  }

  toggleVote(slug);
  setVoted(slug, nowVoted, true);
  updateAllCounters();
  updateStickyBar();
  renderMyList(nowVoted ? { slug, firstRect } : null);
  announce(nowVoted ? 'Место добавлено в список' : 'Место удалено из списка');
}

function setVoted(slug, voted, animate) {
  const card = document.getElementById(`place-${slug}`);
  if (!card) return;
  card.dataset.voted = voted ? 'true' : 'false';

  const btn = card.querySelector('.vote-btn');
  if (!btn) return;
  btn.setAttribute('aria-pressed', voted ? 'true' : 'false');

  const label = btn.querySelector('.vote-btn__label');
  if (label) label.textContent = voted ? 'В списке' : 'Хочу сюда';

  if (animate && !prefersReduced()) {
    btn.classList.remove('vote-btn--spring');
    void btn.offsetWidth;
    btn.classList.add('vote-btn--spring');
  }
}

export function updateAllCounters() {
  const n = getVotes().length;
  document.querySelectorAll('[data-list-count]').forEach(el => {
    if (el.textContent !== String(n)) el.textContent = n;
  });
}

export function updateStickyBar() {
  const bar = document.getElementById('sticky-bar');
  if (!bar) return;
  if (getVotes().length > 0) bar.removeAttribute('hidden');
  else bar.setAttribute('hidden', '');
}

export function renderMyList(animate = null) {
  const container = document.getElementById('mylist-items');
  const empty = document.getElementById('mylist-empty');
  const actions = document.getElementById('mylist-actions');
  if (!container) return;

  const list = getVotes();
  const hasItems = list.length > 0;

  if (empty) empty.hidden = hasItems;
  if (actions) actions.hidden = !hasItems;

  // Update heading live counter
  const countEl = document.getElementById('mylist-count');
  if (countEl) countEl.textContent = list.length;

  import('../data/places.js').then(({ PLACES }) => {
    container.innerHTML = '';
    list.forEach(slug => {
      const place = PLACES.find(p => p.slug === slug);
      if (!place) return;
      const li = buildCompactItem(place);
      container.appendChild(li);

      // FLIP animation: item "flies" from its card position into the list
      if (animate?.slug === slug && animate?.firstRect && !prefersReduced()) {
        requestAnimationFrame(() => {
          const lastRect = li.getBoundingClientRect();
          const dy = animate.firstRect.top - lastRect.top;
          if (Math.abs(dy) > 1) {
            li.animate(
              [
                { transform: `translateY(${dy}px)`, opacity: 0.5 },
                { transform: 'none', opacity: 1 }
              ],
              { duration: 320, easing: 'cubic-bezier(.16, 1, .3, 1)' }
            );
          }
        });
      }
    });
  });
}

function buildCompactItem(place) {
  const li = document.createElement('li');
  li.className = 'mylist-item';
  li.innerHTML = `
    <img class="mylist-item__img"
         src="${place.photos[0].src}"
         alt="${place.photos[0].alt}"
         width="72" height="54"
         loading="lazy" decoding="async">
    <span class="mylist-item__title">${place.title}</span>
    <button class="mylist-item__remove"
            data-remove-slug="${place.slug}"
            aria-label="Убрать ${place.title} из списка">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  return li;
}

export function copyList() {
  import('../data/places.js').then(({ PLACES }) => {
    const list = getVotes();
    if (!list.length) return;
    const lines = list.map((slug, i) => {
      const p = PLACES.find(x => x.slug === slug);
      return `${i + 1}. ${p ? p.title : slug}`;
    });
    const text = `Список мест в Анталье:\n${lines.join('\n')}\n— ${location.href}`;

    const doFeedback = () => {
      const btn = document.getElementById('copy-btn');
      if (!btn) return;
      const origHTML = btn.innerHTML;
      btn.textContent = 'Скопировано ✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = origHTML; btn.classList.remove('copied'); }, 2000);
      announce('Список скопирован');
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(doFeedback).catch(() => execCopy(text, doFeedback));
    } else {
      execCopy(text, doFeedback);
    }
  });
}

function execCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); callback(); } catch {}
  ta.remove();
}

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function announce(msg) {
  const el = document.getElementById('a11y-announce');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = msg; });
}
