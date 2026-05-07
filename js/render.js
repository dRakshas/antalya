import { PLACES } from '../data/places.js';

const HEART_SVG = `<svg class="vote-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const CHECK_SVG = `<svg class="vote-btn__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const CHECK_BADGE_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

const SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

export function renderPlaces(gridEl) {
  const frag = document.createDocumentFragment();

  PLACES.forEach((place, cardIdx) => {
    const li = document.createElement('li');
    li.innerHTML = buildCard(place, cardIdx);
    frag.appendChild(li);
  });

  gridEl.appendChild(frag);
}

function encodePath(path) {
  return path.split('/').map(seg => encodeURIComponent(seg).replace(/%2C/g, ',')).join('/');
}

function buildSlide(photo, isHero) {
  const loading = isHero ? 'eager' : 'lazy';
  const priority = isHero ? ' fetchpriority="high"' : '';

  if (photo.local) {
    const base = photo.local;
    const baseEnc = encodePath(base);
    const avifSrcset = `${baseEnc}-480w.avif 480w, ${baseEnc}-800w.avif 800w, ${baseEnc}-1280w.avif 1280w`;
    const webpSrcset = `${baseEnc}-480w.webp 480w, ${baseEnc}-800w.webp 800w, ${baseEnc}-1280w.webp 1280w`;
    return `<div class="carousel__slide">
      <picture>
        <source type="image/avif" srcset="${avifSrcset}" sizes="${SIZES}">
        <source type="image/webp" srcset="${webpSrcset}" sizes="${SIZES}">
        <img class="place-card__img"
             src="${esc(photo.src)}"
             alt="${esc(photo.alt)}"
             width="400" height="300"
             loading="${loading}"
             decoding="async"${priority}>
      </picture>
    </div>`;
  }

  return `<div class="carousel__slide">
    <img class="place-card__img"
         src="${esc(photo.src)}"
         alt="${esc(photo.alt)}"
         width="400" height="300"
         loading="${loading}"
         decoding="async"${priority}>
  </div>`;
}

function buildCard(place, cardIdx) {
  const isEarlyCard = cardIdx < 3;

  const slidesHTML = place.photos.map((photo, photoIdx) => {
    return buildSlide(photo, isEarlyCard && photoIdx === 0);
  }).join('');

  return `
    <article class="place-card" id="place-${esc(place.slug)}" data-voted="false" data-place-title="${esc(place.title)}">
      <div class="place-card__carousel"
           role="region"
           aria-roledescription="carousel"
           aria-label="${esc(place.title)} — фотографии">
        <div class="carousel__track" tabindex="0">
          ${slidesHTML}
        </div>
        <button class="carousel__prev" aria-label="Предыдущее фото" hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button class="carousel__next" aria-label="Следующее фото" hidden>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="carousel__dots" role="tablist" aria-label="Навигация по фото"></div>
        <div class="place-card__voted-badge" aria-hidden="true">${CHECK_BADGE_SVG}</div>
      </div>
      <div class="place-card__body">
        <span class="place-card__category">${esc(place.category)}</span>
        <h3 class="place-card__title">
          ${esc(place.title)}
          <span class="place-card__title-latin">${esc(place.titleLatin)}</span>
        </h3>
        <p class="place-card__desc">${esc(place.description)}</p>
        <button class="vote-btn" aria-pressed="false" data-slug="${esc(place.slug)}">
          ${HEART_SVG}
          ${CHECK_SVG}
          <span class="vote-btn__label">Хочу сюда</span>
        </button>
      </div>
    </article>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderFilterChips(chipsEl, gridEl) {
  const categories = ['Все', ...new Set(PLACES.map(p => p.category))];

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.setAttribute('aria-pressed', cat === 'Все' ? 'true' : 'false');
    btn.textContent = cat === 'Все' ? 'Все места' : capitalize(cat);
    btn.dataset.filter = cat;
    chipsEl.appendChild(btn);
  });

  chipsEl.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    chipsEl.querySelectorAll('.filter-chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');

    const filter = chip.dataset.filter;
    gridEl.querySelectorAll('li').forEach((li, i) => {
      const place = PLACES[i];
      const show = filter === 'Все' || place.category === filter;
      li.hidden = !show;
    });
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
