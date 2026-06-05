// Centralised Malaysia Time (MYT / Asia/Kuala_Lumpur, UTC+8) helpers.
// Semua tarikh dalam app guna fungsi ni supaya tak bergantung pada timezone browser.
// MYT tak ada DST, jadi offset tetap +8 jam.

const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Pulangkan Date object yang represent midnight (00:00) waktu Malaysia hari ini,
 * sebagai instant UTC sebenar.
 *
 * Contoh: kalau sekarang 6 Jun 6:30 AM MYT, fungsi ni return Date yang ==
 * `2026-06-05T16:00:00.000Z` (= 6 Jun 00:00 MYT).
 */
export function startOfTodayMY() {
  const now = new Date();
  // Shift +8h, ambil tarikh dalam UTC, balikkan -8h supaya jadi midnight MYT dalam UTC.
  const shifted = new Date(now.getTime() + MYT_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  return new Date(Date.UTC(y, m, d) - MYT_OFFSET_MS);
}

/** Tambah/tolak hari dari satu Date instant (return Date baru). */
export function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Format tarikh untuk display ringkas (ms-MY, MYT). */
export function formatMY(date, opts = { dateStyle: 'short' }) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('ms-MY', { ...opts, timeZone: 'Asia/Kuala_Lumpur' });
}