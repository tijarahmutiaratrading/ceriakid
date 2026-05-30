/**
 * Lightweight haptic feedback wrapper.
 * Best-effort — silently no-ops on devices/browsers tanpa vibrate API.
 *
 * Usage:
 *   import { haptic } from '@/lib/haptics';
 *   haptic('light');   // tap/select
 *   haptic('medium');  // confirm/save
 *   haptic('success'); // correct answer
 *   haptic('warning'); // error/wrong
 */

const PATTERNS = {
  light: 10,
  medium: 25,
  heavy: 40,
  success: [15, 40, 15],
  warning: [30, 60, 30],
  error: [50, 80, 50],
};

let enabled = true;

export function setHapticsEnabled(value) {
  enabled = !!value;
  try { localStorage.setItem('haptics_enabled', enabled ? '1' : '0'); } catch {}
}

export function getHapticsEnabled() {
  try {
    const stored = localStorage.getItem('haptics_enabled');
    if (stored !== null) enabled = stored === '1';
  } catch {}
  return enabled;
}

export function haptic(type = 'light') {
  if (!getHapticsEnabled()) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(PATTERNS[type] || PATTERNS.light);
  } catch {
    // silently ignore
  }
}