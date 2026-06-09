import { base44 } from '@/api/base44Client';

// Preset tema yang boleh dipilih admin.
// primary/secondary/accent dalam format HSL channel (untuk CSS variables --primary dll).
// gradientFrom/gradientTo dalam hex (untuk gradient bg-gradient-to-r).
export const THEME_PRESETS = [
  {
    id: 'purple_pink',
    label: 'Purple → Pink',
    primary: '280 60% 55%',
    secondary: '190 80% 55%',
    accent: '340 80% 60%',
    gradientFrom: '#a855f7',
    gradientTo: '#ec4899',
  },
  {
    id: 'orange_pink',
    label: 'Orange → Pink',
    primary: '25 95% 58%',
    secondary: '190 80% 55%',
    accent: '340 80% 60%',
    gradientFrom: '#fb923c',
    gradientTo: '#ec4899',
  },
  {
    id: 'blue_cyan',
    label: 'Blue → Cyan',
    primary: '220 85% 58%',
    secondary: '190 80% 55%',
    accent: '200 85% 58%',
    gradientFrom: '#3b82f6',
    gradientTo: '#06b6d4',
  },
  {
    id: 'green_teal',
    label: 'Green → Teal',
    primary: '160 70% 42%',
    secondary: '190 80% 55%',
    accent: '145 65% 48%',
    gradientFrom: '#10b981',
    gradientTo: '#14b8a6',
  },
  {
    id: 'red_orange',
    label: 'Red → Orange',
    primary: '0 75% 58%',
    secondary: '25 95% 58%',
    accent: '25 95% 58%',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
  },
  {
    id: 'indigo_purple',
    label: 'Indigo → Purple',
    primary: '245 70% 60%',
    secondary: '190 80% 55%',
    accent: '280 60% 55%',
    gradientFrom: '#6366f1',
    gradientTo: '#a855f7',
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0];

// Apply tema ke CSS variables + custom properties global untuk gradient.
export function applyTheme(theme) {
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme.primary) {
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--game-purple', theme.primary);
  }
  if (theme.secondary) {
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--game-blue', theme.secondary);
  }
  if (theme.accent) {
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--game-pink', theme.accent);
  }
  if (theme.gradientFrom) root.style.setProperty('--brand-gradient-from', theme.gradientFrom);
  if (theme.gradientTo) root.style.setProperty('--brand-gradient-to', theme.gradientTo);
}

// Load tema aktif dari DB & apply. Dipanggil masa app boot.
export async function loadAndApplyTheme() {
  try {
    const rows = await base44.entities.AppTheme.filter({ key: 'active' });
    const theme = rows?.[0];
    if (theme) {
      applyTheme(theme);
      return theme;
    }
  } catch {
    // Senyap — guna default kalau gagal
  }
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}

// Simpan tema pilihan admin (upsert singleton).
export async function saveTheme(preset) {
  const payload = {
    key: 'active',
    presetId: preset.id,
    primary: preset.primary,
    secondary: preset.secondary,
    accent: preset.accent,
    gradientFrom: preset.gradientFrom,
    gradientTo: preset.gradientTo,
  };
  const existing = await base44.entities.AppTheme.filter({ key: 'active' });
  if (existing?.[0]) {
    await base44.entities.AppTheme.update(existing[0].id, payload);
  } else {
    await base44.entities.AppTheme.create(payload);
  }
  applyTheme(payload);
  return payload;
}