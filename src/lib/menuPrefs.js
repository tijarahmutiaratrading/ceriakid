/**
 * Local prefs untuk menu drawer — pinned items + recent items.
 * Disimpan dalam localStorage, scope per user (key dgn email).
 */

const PINNED_KEY = (email) => `menu_pinned_${email || 'guest'}`;
const RECENT_KEY = (email) => `menu_recent_${email || 'guest'}`;
const MAX_RECENT = 3;
const MAX_PINNED = 5;

export function getPinned(email) {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY(email)) || '[]'); } catch { return []; }
}

export function togglePinned(email, path, label) {
  try {
    const current = getPinned(email);
    const existing = current.find(p => p.path === path);
    let updated;
    if (existing) {
      updated = current.filter(p => p.path !== path);
    } else {
      if (current.length >= MAX_PINNED) return current; // limit reached
      updated = [...current, { path, label }];
    }
    localStorage.setItem(PINNED_KEY(email), JSON.stringify(updated));
    return updated;
  } catch {
    return getPinned(email);
  }
}

export function getRecent(email) {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY(email)) || '[]'); } catch { return []; }
}

export function trackRecent(email, path, label) {
  if (!path || path === '/') return;
  try {
    const current = getRecent(email).filter(r => r.path !== path);
    const updated = [{ path, label, at: Date.now() }, ...current].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY(email), JSON.stringify(updated));
    return updated;
  } catch {
    return getRecent(email);
  }
}