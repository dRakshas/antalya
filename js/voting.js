const KEY = 'antalya18:list';

function getList() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

function saveList(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); }
  catch { /* in-memory only */ }
}

export function initVoting() {
  // Apply saved state before first paint
  const list = getList();
  list.forEach(slug => setVoted(slug, true, false));
  updateAllCounters();
  updateStickyBar();

  // Click delegation
  document.addEventListener('click', e => {
    const btn = e.target.closest('.vote-btn');
    if (btn) toggle(btn);

    const removeBtn = e.target.closest('[data-remove-slug]');
    if (removeBtn) {
      const slug = removeBtn.dataset.removeSlug;
      const card = document.querySelector(`.vote-btn[data-slug="${slug}"]`);
      if (card) toggle(card);
    }
  });

  // Cross-tab sync
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    const updated = getList();
    document.querySelectorAll('.vote-btn[data-slug]').forEach(btn => {
      setVoted(btn.dataset.slug, updated.includes(btn.dataset.slug), false);
    });
    updateAllCounters();
    updateStickyBar();
    renderMyList();
  });
}

function toggle(btn) {
  const slug = btn.dataset.slug;
  if (!slug) return;
  const wasVoted = btn.getAttribute('aria-pressed') === 'true';
  const nowVoted = !wasVoted;

  let list = getList();
  if (nowVoted) { if (!list.includes(slug)) list.push(slug); }
  else { list = list.filter(s => s !== slug); }
  saveList(list);

  setVoted(slug, nowVoted, true);
  updateAllCounters();
  updateStickyBar();
  renderMyList();

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
  const n = getList().length;
  document.querySelectorAll('[data-list-count]').forEach(el => {
    if (el.textContent !== String(n)) el.textContent = n;
  });
}

export function updateStickyBar() {
  const bar = document.getElementById('sticky-bar');
  if (!bar) return;
  const hasItems = getList().length > 0;
  if (hasItems) {
    bar.removeAttribute('hidden');
  } else {
    bar.setAttribute('hidden', '');
  }
}

export function renderMyList() {
  const container = document.getElementById('mylist-items');
  const empty = document.getElementById('mylist-empty');
  if (!container) return;

  const list = getList();

  if (empty) empty.hidden = list.length > 0;

  // Import PLACES lazily
  import('../data/places.js').then(({ PLACES }) => {
    container.innerHTML = '';
    list.forEach(slug => {
      const place = PLACES.find(p => p.slug === slug);
      if (!place) return;
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
      container.appendChild(li);
    });
  });
}

export function copyList() {
  import('../data/places.js').then(({ PLACES }) => {
    const list = getList();
    if (!list.length) return;
    const lines = list.map((slug, i) => {
      const p = PLACES.find(x => x.slug === slug);
      return `${i + 1}. ${p ? p.title : slug}`;
    });
    const text = `Мои места в Анталье:\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-btn');
      if (!btn) return;
      const orig = btn.textContent;
      btn.textContent = 'Скопировано ✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
      announce('Список скопирован');
    });
  });
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
