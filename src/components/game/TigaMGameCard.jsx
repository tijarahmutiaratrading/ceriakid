import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';

// Apple-style soft accent tints — rotate per card for subtle variety (ikut GameListCard)
const CARD_THEMES = [
  { iconBg: 'bg-orange-100' },
  { iconBg: 'bg-pink-100' },
  { iconBg: 'bg-blue-100' },
  { iconBg: 'bg-emerald-100' },
  { iconBg: 'bg-violet-100' },
  { iconBg: 'bg-amber-100' },
];

export default function TigaMGameCard({ game, idx, to, locked, emoji }) {
  const theme = useMemo(() => CARD_THEMES[idx % CARD_THEMES.length], [idx]);

  const cardInner = (
    <div
      className="relative h-full rounded-3xl overflow-hidden ring-1 ring-white/60"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {/* Glass shine overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)' }} aria-hidden="true" />
      {/* Soft tinted accent strip on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.iconBg} opacity-80`} aria-hidden="true" />

      <div className="relative p-4 sm:p-5 flex items-center gap-3 sm:gap-4 min-h-[100px] sm:min-h-[120px]">
        {/* Emoji icon + step number */}
        <div className="flex-shrink-0 relative">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center ${locked ? 'opacity-40 grayscale' : ''}`}>
            <span className="text-4xl sm:text-5xl leading-none">{game.emoji || emoji}</span>
          </div>
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
            <span className="text-amber-900 font-black text-[10px]">{idx + 1}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg leading-tight text-slate-900 line-clamp-2 tracking-tight">
            {game.title}
          </h3>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1.5 line-clamp-2">
            {game.objective || 'Cabaran menarik menanti!'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-[11px] sm:text-xs text-emerald-700">10 pusingan</span>
          </div>
        </div>

        {/* Trailing action */}
        <div className="flex-shrink-0 self-center">
          {locked ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" strokeWidth={2.25} />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full brand-gradient-br flex items-center justify-center shadow-sm">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {/* Premium label */}
      {locked && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full ring-1 ring-amber-200 uppercase tracking-wide">
            ⭐ Premium
          </span>
        </div>
      )}
    </div>
  );

  const motionProps = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: Math.min(idx * 0.03, 0.5) },
    whileHover: { y: -2 },
    whileTap: { scale: 0.985 },
    className: 'h-full cursor-pointer',
  };

  if (locked) {
    return <motion.div {...motionProps}>{cardInner}</motion.div>;
  }

  return (
    <Link to={to} className="block">
      <motion.div {...motionProps}>{cardInner}</motion.div>
    </Link>
  );
}