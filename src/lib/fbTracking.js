// Helper untuk dapatkan _fbp & _fbc cookies (Meta browser ID) untuk hantar ke CAPI.
// Tanpa fbp/fbc, Meta tak boleh match server-side event dengan browser session.

export function getFbCookies() {
  if (typeof document === 'undefined') return { fbp: null, fbc: null };
  const cookies = document.cookie.split(';').reduce((acc, c) => {
    const [k, v] = c.trim().split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});
  return {
    fbp: cookies._fbp || null,
    fbc: cookies._fbc || null,
  };
}

// Generate event ID yang same antara browser pixel + CAPI untuk dedup.
export function genEventID(eventName) {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}