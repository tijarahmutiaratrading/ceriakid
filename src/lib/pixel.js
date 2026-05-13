export const trackPixelEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, params);
};

export const trackPixelCustomEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('trackCustom', eventName, params);
};