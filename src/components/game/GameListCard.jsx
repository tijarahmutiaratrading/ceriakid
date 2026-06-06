import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play, BookOpen, Calculator, FlaskConical, Globe, PenLine, Brain, Puzzle, Layers, Music, Palette, Zap, Star, Shapes, Trophy, Gamepad2, BookMarked, Sigma, Microscope, Languages, AlignLeft } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Category → { icon, gradient, iconColor }
const CATEGORY_STYLE = {
  bahasa_melayu:   { icon: BookOpen,    gradient: 'from-blue-500 to-cyan-400',      iconColor: 'text-white' },
  english:         { icon: Globe,       gradient: 'from-emerald-500 to-teal-400',   iconColor: 'text-white' },
  mathematics:     { icon: Calculator,  gradient: 'from-orange-500 to-amber-400',   iconColor: 'text-white' },
  science:         { icon: FlaskConical,gradient: 'from-purple-500 to-violet-400',  iconColor: 'text-white' },
  jawi:            { icon: PenLine,     gradient: 'from-green-600 to-emerald-400',  iconColor: 'text-white' },
  worksheet:       { icon: PenLine,     gradient: 'from-pink-500 to-rose-400',      iconColor: 'text-white' },
  bahasa_tamil:    { icon: Languages,   gradient: 'from-red-500 to-orange-400',     iconColor: 'text-white' },
  bahasa_mandarin: { icon: Languages,   gradient: 'from-red-600 to-red-400',        iconColor: 'text-white' },
  kafa_quran:      { icon: BookMarked,  gradient: 'from-green-700 to-green-500',    iconColor: 'text-white' },
  kafa_jawi:       { icon: PenLine,     gradient: 'from-teal-600 to-cyan-500',      iconColor: 'text-white' },
  kafa_akidah:     { icon: Star,        gradient: 'from-amber-500 to-yellow-400',   iconColor: 'text-white' },
  kafa_ibadah:     { icon: BookMarked,  gradient: 'from-emerald-600 to-green-400',  iconColor: 'text-white' },
  kafa_sirah:      { icon: BookOpen,    gradient: 'from-sky-600 to-blue-400',       iconColor: 'text-white' },
  kafa_adab:       { icon: Brain,       gradient: 'from-violet-600 to-purple-400',  iconColor: 'text-white' },
  kafa_bahasa_arab:{ icon: Languages,   gradient: 'from-orange-600 to-amber-400',   iconColor: 'text-white' },
};

// Game type fallback styles
const TYPE_STYLE = {
  letter_match:    { icon: AlignLeft,   gradient: 'from-blue-500 to-cyan-400',      iconColor: 'text-white' },
  number_match:    { icon: Sigma,       gradient: 'from-orange-500 to-amber-400',   iconColor: 'text-white' },
  picture_quiz:    { icon: Layers,      gradient: 'from-pink-500 to-rose-400',      iconColor: 'text-white' },
  drag_drop:       { icon: Puzzle,      gradient: 'from-violet-500 to-purple-400',  iconColor: 'text-white' },
  multiple_choice: { icon: Brain,       gradient: 'from-indigo-500 to-blue-400',    iconColor: 'text-white' },
  counting:        { icon: Calculator,  gradient: 'from-amber-500 to-yellow-400',   iconColor: 'text-white' },
  word_builder:    { icon: BookOpen,    gradient: 'from-teal-500 to-emerald-400',   iconColor: 'text-white' },
  math_puzzle:     { icon: Sigma,       gradient: 'from-orange-600 to-red-400',     iconColor: 'text-white' },
  science_quiz:    { icon: Microscope,  gradient: 'from-purple-600 to-violet-400',  iconColor: 'text-white' },
  shape_sort:      { icon: Shapes,      gradient: 'from-sky-500 to-blue-400',       iconColor: 'text-white' },
  color_match:     { icon: Palette,     gradient: 'from-pink-600 to-fuchsia-400',   iconColor: 'text-white' },
  pattern_fill:    { icon: Layers,      gradient: 'from-cyan-500 to-teal-400',      iconColor: 'text-white' },
  memory_game:     { icon: Brain,       gradient: 'from-violet-600 to-indigo-400',  iconColor: 'text-white' },
  sound_match:     { icon: Music,       gradient: 'from-fuchsia-500 to-pink-400',   iconColor: 'text-white' },
  spelling:        { icon: BookOpen,    gradient: 'from-blue-600 to-sky-400',       iconColor: 'text-white' },
  reading:         { icon: BookOpen,    gradient: 'from-emerald-500 to-green-400',  iconColor: 'text-white' },
  phonics:         { icon: Music,       gradient: 'from-rose-500 to-pink-400',      iconColor: 'text-white' },
  sorting:         { icon: Layers,      gradient: 'from-amber-600 to-orange-400',   iconColor: 'text-white' },
  tile_match:      { icon: Gamepad2,    gradient: 'from-indigo-600 to-violet-400',  iconColor: 'text-white' },
  story_adventure: { icon: BookOpen,    gradient: 'from-green-500 to-teal-400',     iconColor: 'text-white' },
  physics:         { icon: Zap,         gradient: 'from-yellow-500 to-amber-400',   iconColor: 'text-white' },
  tracing:         { icon: PenLine,     gradient: 'from-pink-500 to-rose-400',      iconColor: 'text-white' },
};

function getGameStyle(game) {
  return CATEGORY_STYLE[game.category] || TYPE_STYLE[game.type] || { icon: Gamepad2, gradient: 'from-slate-500 to-slate-400', iconColor: 'text-white' };
}

function GameIcon({ game, locked }) {
  const style = getGameStyle(game);
  const IconComp = style.icon;
  return (
    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-md ${locked ? 'opacity-40 grayscale' : ''}`}>
      <IconComp className={`w-7 h-7 sm:w-8 sm:h-8 ${style.iconColor}`} strokeWidth={1.75} />
    </div>
  );
}

// Apple-style soft accent tints — rotate per card for subtle variety
const CARD_THEMES = [
  { tint: 'bg-orange-50',  iconBg: 'bg-orange-100',  iconText: 'text-orange-600',  accent: '#F97316' },
  { tint: 'bg-pink-50',    iconBg: 'bg-pink-100',    iconText: 'text-pink-600',    accent: '#EC4899' },
  { tint: 'bg-blue-50',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    accent: '#3B82F6' },
  { tint: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', accent: '#10B981' },
  { tint: 'bg-violet-50',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  accent: '#8B5CF6' },
  { tint: 'bg-amber-50',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   accent: '#F59E0B' },
];

const difficultyConfig = {
  easy:   { label: 'Mudah',     dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { label: 'Sederhana', dot: 'bg-orange-500',  text: 'text-orange-700' },
  hard:   { label: 'Sukar',     dot: 'bg-red-500',     text: 'text-red-700' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const theme = useMemo(() => CARD_THEMES[idx % CARD_THEMES.length], [idx]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

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
        {/* SVG icon bubble — gradient per subject */}
        <div className="flex-shrink-0">
          <GameIcon game={game} locked={locked} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-base sm:text-lg leading-tight text-slate-900 line-clamp-2 tracking-tight">
              {game.title}
            </h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          {/* Meta row — difficulty dot + game type */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
              <span className={`font-semibold text-[11px] sm:text-xs ${difficulty.text}`}>{difficulty.label}</span>
            </div>
            {game.type && (
              <>
                <span className="text-slate-300 text-xs">·</span>
                <p className="text-slate-500 text-[11px] sm:text-xs font-medium capitalize truncate">
                  {game.type.replace(/_/g, ' ')}
                </p>
              </>
            )}
          </div>

          {/* Stars + plays */}
          {gameProgress && (
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex gap-0.5" aria-label={`${stars} bintang daripada 3`}>
                {[1,2,3].map(s => (
                  <span
                    key={s}
                    className="text-sm sm:text-base leading-none"
                    style={{ color: s <= stars ? '#FACC15' : '#E2E8F0' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold">
                {playCount}× main
              </span>
            </div>
          )}
        </div>

        {/* Trailing action — minimal chevron / lock */}
        <div className="flex-shrink-0 self-center">
          {locked ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" strokeWidth={2.25} />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
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

  if (locked) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          aria-label={`${game.title} — Permainan premium, klik untuk upgrade`}
          className="block text-left w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -1 }}
            className="h-full cursor-pointer"
          >
            {cardInner}
          </motion.div>
        </button>
        <UpgradeLockModal open={showUpgrade} onClose={() => setShowUpgrade(false)} gameTitle={game.title} />
      </>
    );
  }

  return (
    <Link to={`/play/${category}/${idx}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}