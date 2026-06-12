// Helper class & style untuk tema main game (Gelap / Cerah).
// Tema Cerah = background putih dengan garis halus; Gelap = PS5 sinematik.

export function getGameThemeClasses(isDark) {
  return {
    // Pembungkus halaman
    page: isDark ? 'bg-slate-950' : 'bg-slate-50',
    // Warna teks utama / sekunder
    text: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-white/60' : 'text-slate-500',
    backLink: isDark ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-slate-900',
    // Kad header
    headerCard: isDark
      ? 'bg-white/8 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]'
      : 'bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-200/50',
    // Eyebrow / label kecil
    eyebrow: isDark ? 'text-violet-300' : 'text-violet-600',
  };
}

// Background sinematik (gelap) vs background garis halus (cerah)
export function getGameThemeBackground(isDark) {
  return isDark;
}