export function initCarousels() {
  document.querySelectorAll('.place-card__carousel').forEach(initOne);
}

function initOne(container) {
  const track = container.querySelector('.carousel__track');
  if (!track) return;

  const slides = Array.from(track.children);
  if (slides.length <= 1) {
    container.classList.add('carousel--single');
    return;
  }

  const dotsEl = container.querySelector('.carousel__dots');
  const prevBtn = container.querySelector('.carousel__prev');
  const nextBtn = container.querySelector('.carousel__next');

  // Show navigation controls (rendered hidden, revealed by JS)
  if (prevBtn) prevBtn.removeAttribute('hidden');
  if (nextBtn) nextBtn.removeAttribute('hidden');

  // Create dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'carousel__dot';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Фото ${i + 1} из ${slides.length}`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(btn);
  });

  let current = 0;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, slides.length - 1));
    slides[current].scrollIntoView({ behavior: prefersReduced() ? 'instant' : 'smooth', block: 'nearest', inline: 'start' });
    sync();
  }

  function sync() {
    const dots = dotsEl.querySelectorAll('.carousel__dot');
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current ? 'true' : 'false'));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === slides.length - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  container.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // Track scroll position to update dots
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        const idx = slides.indexOf(entry.target);
        if (idx !== -1 && idx !== current) { current = idx; sync(); }
      }
    });
  }, { root: track, threshold: 0.6 });

  slides.forEach(s => obs.observe(s));

  // Lazy-load images: trigger opacity transition after load
  track.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); return; }
    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
  });
  // Eager images also get .loaded
  track.querySelectorAll('img:not([loading="lazy"])').forEach(img => img.classList.add('loaded'));

  sync();
}

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
