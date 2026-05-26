// Track referral code dari URL (?ref=CODE) dan simpan dalam localStorage.
// Akan digunakan automatik bila user buat checkout.

const STORAGE_KEY = 'ck_referral_code';
const STORAGE_EXPIRY_DAYS = 30;

export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && /^[A-Z0-9]+$/i.test(ref)) {
      const data = { code: ref.toUpperCase().trim(), savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}

export function getStoredReferralCode() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const data = JSON.parse(raw);
    if (!data?.code) return '';
    const ageDays = (Date.now() - (data.savedAt || 0)) / (1000 * 60 * 60 * 24);
    if (ageDays > STORAGE_EXPIRY_DAYS) {
      localStorage.removeItem(STORAGE_KEY);
      return '';
    }
    return data.code;
  } catch {
    return '';
  }
}

export function clearStoredReferralCode() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}