const API_BASE = 'https://trips.148.227.170.181.nip.io';
const TRIP_ID = 'antalya2025';
const USER_KEY = 'antalya18:user_id';
const SUBMITTED_KEY = 'antalya18:submitted';

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `submit-toast submit-toast--${type}`;
  el.setAttribute('role', 'alert');
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('submit-toast--visible'));
  setTimeout(() => {
    el.classList.remove('submit-toast--visible');
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

function buildModal(places) {
  const existing = document.getElementById('submit-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'submit-modal';
  overlay.className = 'submit-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'submit-modal-title');

  const isUpdate = !!localStorage.getItem(SUBMITTED_KEY);
  const placeTitles = places.map(slug => {
    const card = document.querySelector(`.vote-btn[data-slug="${slug}"]`)?.closest('[data-place-title]');
    return card?.dataset.placeTitle || slug;
  });

  overlay.innerHTML = `
    <div class="submit-modal__backdrop"></div>
    <div class="submit-modal__dialog">
      <h2 id="submit-modal-title" class="submit-modal__title">
        ${isUpdate ? 'Обновить выбор' : 'Отправить список'}
      </h2>
      <p class="submit-modal__meta">${places.length} ${pluralPlaces(places.length)}</p>
      <ul class="submit-modal__places">
        ${placeTitles.map(t => `<li>${t}</li>`).join('')}
      </ul>
      <label class="submit-modal__label" for="submit-name">
        Ваше имя <span class="submit-modal__optional">(необязательно)</span>
      </label>
      <input id="submit-name" class="submit-modal__input" type="text"
             placeholder="Например: Аня" maxlength="80"
             value="${localStorage.getItem('antalya18:name') || ''}">
      <div class="submit-modal__actions">
        <button id="submit-confirm" class="submit-modal__btn submit-modal__btn--primary" type="button">
          ${isUpdate ? 'Обновить' : 'Отправить'}
        </button>
        <button id="submit-cancel" class="submit-modal__btn submit-modal__btn--ghost" type="button">
          Отмена
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('submit-modal--open'));

  const nameInput = overlay.querySelector('#submit-name');
  nameInput.focus();

  overlay.querySelector('.submit-modal__backdrop').addEventListener('click', closeModal);
  overlay.querySelector('#submit-cancel').addEventListener('click', closeModal);

  overlay.querySelector('#submit-confirm').addEventListener('click', async () => {
    const name = nameInput.value.trim() || null;
    if (name) localStorage.setItem('antalya18:name', name);
    await doSubmit(places, name);
    closeModal();
  });

  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('submit-modal');
  if (!modal) return;
  modal.classList.remove('submit-modal--open');
  setTimeout(() => modal.remove(), 250);
}

async function doSubmit(places, name) {
  const userId = getOrCreateUserId();
  const btn = document.getElementById('submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Отправка…'; }

  try {
    const res = await fetch(`${API_BASE}/api/${TRIP_ID}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, name, places }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    localStorage.setItem(SUBMITTED_KEY, '1');
    updateSubmitButton(true);
    showToast('✓ Список сохранён!');
  } catch (err) {
    showToast('Не удалось отправить. Проверьте соединение.', 'error');
    console.error('submit error', err);
  } finally {
    if (btn) { btn.disabled = false; }
  }
}

function updateSubmitButton(submitted) {
  document.querySelectorAll('.submit-trigger').forEach(btn => {
    btn.textContent = submitted ? 'Обновить список' : 'Отправить список';
    btn.classList.toggle('submit-trigger--sent', submitted);
  });
}

function pluralPlaces(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'место';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'места';
  return 'мест';
}

export function initSubmit(getVotesFn) {
  const submitted = !!localStorage.getItem(SUBMITTED_KEY);

  document.querySelectorAll('.submit-trigger').forEach(btn => {
    if (submitted) {
      btn.textContent = 'Обновить список';
      btn.classList.add('submit-trigger--sent');
    }
    btn.addEventListener('click', () => {
      const places = getVotesFn();
      if (!places.length) {
        showToast('Сначала выбери хотя бы одно место', 'error');
        return;
      }
      buildModal(places);
    });
  });
}
