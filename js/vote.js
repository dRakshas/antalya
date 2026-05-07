const KEY = 'antalya18:list';
let _storageOk = true;
let _memStore = [];

function _testStorage() {
  try {
    localStorage.setItem('__antalya18_probe__', '1');
    const ok = localStorage.getItem('__antalya18_probe__') === '1';
    localStorage.removeItem('__antalya18_probe__');
    return ok;
  } catch {
    return false;
  }
}

_storageOk = _testStorage();
if (!_storageOk) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _showFallbackToast);
  } else {
    setTimeout(_showFallbackToast, 0);
  }
}

function _showFallbackToast() {
  const el = document.createElement('div');
  el.className = 'storage-toast';
  el.setAttribute('role', 'alert');
  el.textContent = 'Список не сохранится после закрытия вкладки';
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('storage-toast--visible'));
  setTimeout(() => {
    el.classList.remove('storage-toast--visible');
    setTimeout(() => el.remove(), 400);
  }, 6000);
}

function _read() {
  if (!_storageOk) return [..._memStore];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function _write(list) {
  if (!_storageOk) { _memStore = [...list]; return; }
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    _storageOk = false;
    _memStore = [...list];
    _showFallbackToast();
  }
}

function _emit(action, slug, votes) {
  document.dispatchEvent(new CustomEvent('vote:change', {
    detail: { votes, action, slug }
  }));
}

export function getVotes() { return _read(); }

export function hasVote(slug) { return _read().includes(slug); }

export function addVote(slug) {
  const list = _read();
  if (list.includes(slug)) return;
  list.push(slug);
  _write(list);
  _emit('add', slug, [...list]);
}

export function removeVote(slug) {
  const list = _read().filter(s => s !== slug);
  _write(list);
  _emit('remove', slug, [...list]);
}

export function toggleVote(slug) {
  if (hasVote(slug)) { removeVote(slug); return false; }
  addVote(slug);
  return true;
}

export function clearVotes() {
  _write([]);
  _emit('clear', null, []);
}
