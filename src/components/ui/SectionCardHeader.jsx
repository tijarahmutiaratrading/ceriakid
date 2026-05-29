import React from 'react';

/**
 * Reusable section card header — icon gradient box + title + subtitle.
 * Pattern: dipakai dalam glass-dark cards (Settings, Parent Dashboard, dsb).
 *
 * variant:
 *   - 'dark'  (default) — utk background gelap/glass (text putih)
 *   - 'light' — utk background terang/putih (text slate)
 *
 * Usage:
 *   <SectionCardHeader icon={User} title="Maklumat Peribadi" subtitle="..." gradient="from-orange-400 to-pink-500" />
 *   <SectionCardHeader icon={User} title="..." variant="light" />
 */
export default function SectionCardHeader({
  icon: Icon,
  title,
  subtitle,
  gradient = 'from-purple-500 to-pink-500',
  right = null,
  variant = 'dark',
}) {
  const titleColor = variant === 'light' ? 'text-slate-900' : 'text-white';
  const subtitleColor = variant === 'light' ? 'text-slate-600' : 'text-white/70';

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
        {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${titleColor} font-black text-base leading-tight`}>{title}</p>
        {subtitle && <p className={`${subtitleColor} text-xs font-semibold`}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}