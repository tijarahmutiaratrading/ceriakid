// PageView tracker — auto-log setiap route change untuk admin analytics.
// Disimpan dalam Base44 entity PageView untuk dashboard filter ikut tarikh.

import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'ck_session_id';
const FIRST_VISIT_KEY = 'ck_first_visit_logged';

// Generate/retrieve session ID — kekal sepanjang tab session
function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `s_fallback_${Date.now()}`;
  }
}

// Detect traffic source dari referrer + UTM
function detectSource(referrer, utmSource) {
  if (utmSource) return utmSource.toLowerCase();
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes('facebook') || host.includes('fb.com') || host.includes('instagram')) return 'facebook';
    if (host.includes('google')) return 'google';
    if (host.includes('tiktok')) return 'tiktok';
    if (host.includes('youtube')) return 'youtube';
    if (host.includes('whatsapp')) return 'whatsapp';
    if (host.includes('telegram') || host.includes('t.me')) return 'telegram';
    return 'referral';
  } catch {
    return 'unknown';
  }
}

// Cache untuk elak double-log path yang sama dalam 2 saat (StrictMode, dll)
let lastLogged = { path: null, time: 0 };

export async function logPageView(path, userEmail = '') {
  if (typeof window === 'undefined') return;

  // Skip kalau path baru dilog kurang 2 saat lepas (anti-double)
  const now = Date.now();
  if (lastLogged.path === path && now - lastLogged.time < 2000) return;
  lastLogged = { path, time: now };

  try {
    const sessionId = getSessionId();
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';
    const utmSource = params.get('utm_source') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    const source = detectSource(referrer, utmSource);

    // Check first visit (per session)
    const isFirstVisit = !sessionStorage.getItem(FIRST_VISIT_KEY);
    if (isFirstVisit) sessionStorage.setItem(FIRST_VISIT_KEY, '1');

    await base44.entities.PageView.create({
      path,
      sessionId,
      userEmail: userEmail || '',
      referrer: referrer.slice(0, 500),
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      userAgent: (navigator.userAgent || '').slice(0, 300),
      isFirstVisit,
    });
  } catch (err) {
    // Silent fail — analytics tak patut break user experience
    console.debug('PageView log failed:', err?.message);
  }
}