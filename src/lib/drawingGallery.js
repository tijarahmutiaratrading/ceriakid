// Simple localStorage-backed gallery for the Drawing Studio.
// Stores artworks as data URLs with title + timestamp. Cap at 24 entries
// so we never bust localStorage quota even with ~500KB images.

const KEY = 'ceriakid_drawing_gallery_v1';
const MAX_ENTRIES = 24;

const safeRead = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeWrite = (items) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    // quota exceeded — drop oldest and retry once
    try {
      localStorage.setItem(KEY, JSON.stringify(items.slice(0, Math.max(1, items.length - 5))));
      return true;
    } catch {
      return false;
    }
  }
};

export const listArtworks = () => safeRead().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

export const saveArtwork = ({ dataUrl, title, mode }) => {
  if (!dataUrl) return null;
  const items = safeRead();
  const entry = {
    id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dataUrl,
    title: title || 'Lukisan saya',
    mode: mode || 'draw',
    createdAt: Date.now(),
  };
  items.unshift(entry);
  if (items.length > MAX_ENTRIES) items.length = MAX_ENTRIES;
  safeWrite(items);
  return entry;
};

export const deleteArtwork = (id) => {
  const items = safeRead().filter((a) => a.id !== id);
  safeWrite(items);
  return items;
};

export const clearGallery = () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
};