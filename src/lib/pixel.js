// Meta Pixel helper — wraps window.fbq with safe no-op if pixel hasn't loaded yet.
// Supports eventID for deduplication across browser pixel + Conversions API (if added later).

export const trackPixelEvent = (eventName, params = {}, eventID = null) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (eventID) {
    window.fbq('track', eventName, params, { eventID });
  } else {
    window.fbq('track', eventName, params);
  }
};

export const trackPixelCustomEvent = (eventName, params = {}, eventID = null) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  if (eventID) {
    window.fbq('trackCustom', eventName, params, { eventID });
  } else {
    window.fbq('trackCustom', eventName, params);
  }
};

// Track PageView manually — useful for SPA route changes (after first load).
export const trackPageView = () => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
};