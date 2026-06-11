import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Category → { emoji, gradient }
const CATEGORY_STYLE = {
  bahasa_melayu:   { emoji: '📖', gradient: 'from-blue-500 to-cyan-400' },
  english:         { emoji: '🌍', gradient: 'from-emerald-500 to-teal-400' },
  mathematics:     { emoji: '🔢', gradient: 'from-orange-500 to-amber-400' },
  science:         { emoji: '🔬', gradient: 'from-purple-500 to-violet-400' },
  jawi:            { emoji: '✍️', gradient: 'from-green-600 to-emerald-400' },
  worksheet:       { emoji: '📝', gradient: 'from-pink-500 to-rose-400' },
  bahasa_tamil:    { emoji: '🔤', gradient: 'from-red-500 to-orange-400' },
  bahasa_mandarin: { emoji: '🀄', gradient: 'from-red-600 to-red-400' },
  kafa_quran:      { emoji: '📕', gradient: 'from-green-700 to-green-500' },
  kafa_jawi:       { emoji: '✍️', gradient: 'from-teal-600 to-cyan-500' },
  kafa_akidah:     { emoji: '⭐', gradient: 'from-amber-500 to-yellow-400' },
  kafa_ibadah:     { emoji: '🕌', gradient: 'from-emerald-600 to-green-400' },
  kafa_sirah:      { emoji: '📜', gradient: 'from-sky-600 to-blue-400' },
  kafa_adab:       { emoji: '🤲', gradient: 'from-violet-600 to-purple-400' },
  kafa_bahasa_arab:{ emoji: '🔤', gradient: 'from-orange-600 to-amber-400' },
};

// Game type fallback styles
const TYPE_STYLE = {
  letter_match:    { emoji: '🔡', gradient: 'from-blue-500 to-cyan-400' },
  number_match:    { emoji: '🔢', gradient: 'from-orange-500 to-amber-400' },
  picture_quiz:    { emoji: '🖼️', gradient: 'from-pink-500 to-rose-400' },
  drag_drop:       { emoji: '🧩', gradient: 'from-violet-500 to-purple-400' },
  multiple_choice: { emoji: '🧠', gradient: 'from-indigo-500 to-blue-400' },
  counting:        { emoji: '🔢', gradient: 'from-amber-500 to-yellow-400' },
  word_builder:    { emoji: '📝', gradient: 'from-teal-500 to-emerald-400' },
  math_puzzle:     { emoji: '➗', gradient: 'from-orange-600 to-red-400' },
  science_quiz:    { emoji: '🔬', gradient: 'from-purple-600 to-violet-400' },
  shape_sort:      { emoji: '🔷', gradient: 'from-sky-500 to-blue-400' },
  color_match:     { emoji: '🎨', gradient: 'from-pink-600 to-fuchsia-400' },
  pattern_fill:    { emoji: '🔲', gradient: 'from-cyan-500 to-teal-400' },
  memory_game:     { emoji: '🧠', gradient: 'from-violet-600 to-indigo-400' },
  sound_match:     { emoji: '🎵', gradient: 'from-fuchsia-500 to-pink-400' },
  spelling:        { emoji: '🔤', gradient: 'from-blue-600 to-sky-400' },
  reading:         { emoji: '📖', gradient: 'from-emerald-500 to-green-400' },
  phonics:         { emoji: '🗣️', gradient: 'from-rose-500 to-pink-400' },
  sorting:         { emoji: '📊', gradient: 'from-amber-600 to-orange-400' },
  tile_match:      { emoji: '🎮', gradient: 'from-indigo-600 to-violet-400' },
  story_adventure: { emoji: '📚', gradient: 'from-green-500 to-teal-400' },
  physics:         { emoji: '⚡', gradient: 'from-yellow-500 to-amber-400' },
  tracing:         { emoji: '✏️', gradient: 'from-pink-500 to-rose-400' },
};

// Title keyword → { emoji, gradient }
const TITLE_KEYWORD_MAP = [
  { keys: ['buah', 'fruit', 'epal', 'mangga', 'pisang', 'limau', 'tembikai', 'durian', 'nanas', 'betik', 'ciku', 'jambu', 'rambutan', 'manggis'], emoji: '🍎', gradient: 'from-red-500 to-orange-400' },
  { keys: ['keluarga', 'family', 'ibu', 'bapa', 'ayah', 'adik', 'kakak', 'abang', 'datuk', 'nenek', 'ahli keluarga'], emoji: '👨‍👩‍👧', gradient: 'from-pink-500 to-rose-400' },
  { keys: ['sayur', 'vegetable', 'kubis', 'bayam', 'lobak', 'brokoli', 'timun', 'tomato', 'bendi', 'kangkung'], emoji: '🥦', gradient: 'from-green-500 to-emerald-400' },
  { keys: ['haiwan', 'animal', 'binatang', 'kucing', 'anjing', 'harimau', 'gajah', 'singa', 'arnab', 'ikan', 'burung', 'monyet', 'kuda', 'lembu', 'kambing', 'ayam', 'itik', 'katak', 'ular', 'buaya'], emoji: '🐱', gradient: 'from-amber-500 to-orange-400' },
  { keys: ['nombor', 'number', 'matematik', 'math', 'tambah', 'tolak', 'darab', 'bahagi', 'kira', 'count', 'digit', 'angka', 'jumlah', 'pengiraan'], emoji: '🔢', gradient: 'from-blue-500 to-indigo-400' },
  { keys: ['huruf', 'abjad', 'vokal', 'konsonan', 'letter', 'alphabet', 'ejaan', 'sebutan', 'fonik', 'phonics', 'eja'], emoji: '🔤', gradient: 'from-violet-500 to-purple-400' },
  { keys: ['warna', 'colour', 'color', 'merah', 'biru', 'hijau', 'kuning', 'ungu', 'oren', 'hitam', 'putih', 'pelangi'], emoji: '🎨', gradient: 'from-fuchsia-500 to-pink-400' },
  { keys: ['bentuk', 'shape', 'bulat', 'segi', 'segitiga', 'empat', 'lonjong', 'diamond', 'bintang'], emoji: '🔷', gradient: 'from-sky-500 to-blue-400' },
  { keys: ['pakaian', 'baju', 'cloth', 'kasut', 'seluar', 'tudung', 'topi', 'stokin', 'dress', 'uniform'], emoji: '👕', gradient: 'from-purple-500 to-violet-400' },
  { keys: ['pengangkutan', 'kenderaan', 'kereta', 'bas', 'vehicle', 'transport', 'kapal', 'motosikal', 'lori', 'teksi', 'tren'], emoji: '🚗', gradient: 'from-slate-500 to-blue-400' },
  { keys: ['sekolah', 'school', 'alat', 'tulis', 'pensil', 'pen', 'buku', 'getah', 'pembaris', 'beg', 'kelas', 'guru', 'cikgu'], emoji: '🏫', gradient: 'from-amber-500 to-yellow-400' },
  { keys: ['alam', 'nature', 'pokok', 'hutan', 'bukit', 'sungai', 'laut', 'pantai', 'gunung', 'rumput', 'bunga', 'taman'], emoji: '🌳', gradient: 'from-green-600 to-teal-400' },
  { keys: ['makanan', 'food', 'minuman', 'makan', 'minum', 'nasi', 'roti', 'susu', 'air', 'kuih', 'lauk', 'masak', 'dapur', 'resepi'], emoji: '🍽️', gradient: 'from-orange-500 to-amber-400' },
  { keys: ['anggota', 'badan', 'body', 'tangan', 'kaki', 'kepala', 'mata', 'telinga', 'hidung', 'mulut', 'gigi', 'rambut'], emoji: '🫀', gradient: 'from-red-500 to-pink-400' },
  { keys: ['sains', 'science', 'eksperimen', 'fizik', 'kimia', 'biologi', 'magnet', 'cahaya', 'bunyi', 'tenaga', 'graviti'], emoji: '🔬', gradient: 'from-purple-600 to-violet-400' },
  { keys: ['cuaca', 'weather', 'hujan', 'panas', 'sejuk', 'angin', 'ribut', 'banjir', 'salji', 'mendung', 'pelangi', 'matahari'], emoji: '☀️', gradient: 'from-yellow-500 to-orange-400' },
  { keys: ['nama', 'kata', 'perkataan', 'word', 'ayat', 'sentence', 'karangan', 'cerita', 'kisah', 'novel'], emoji: '📖', gradient: 'from-blue-500 to-cyan-400' },
  { keys: ['jawi', 'arab', 'quran', 'al-quran', 'hafazan', 'surah', 'doa', 'solat', 'ibadah', 'akidah', 'akhlak', 'adab', 'sirah', 'nabi'], emoji: '📕', gradient: 'from-emerald-600 to-green-400' },
  { keys: ['lagu', 'muzik', 'music', 'nyanyian', 'irama', 'nada'], emoji: '🎵', gradient: 'from-pink-500 to-fuchsia-400' },
  { keys: ['sukan', 'sport', 'senaman', 'berlari', 'berenang', 'bola', 'badminton', 'berbasikal', 'gym', 'aktif'], emoji: '⚽', gradient: 'from-green-500 to-teal-400' },
  { keys: ['profesion', 'pekerjaan', 'kerja', 'doktor', 'polis', 'bomba', 'jurutera', 'pilot', 'chef'], emoji: '👷', gradient: 'from-indigo-500 to-blue-400' },
  { keys: ['angkasa', 'planet', 'space', 'bumi', 'bulan', 'galaksi', 'astronaut', 'roket'], emoji: '🚀', gradient: 'from-indigo-600 to-purple-400' },
  { keys: ['serangga', 'insect', 'rama-rama', 'lebah', 'semut', 'nyamuk', 'lipas', 'ulat', 'kumbang'], emoji: '🐛', gradient: 'from-lime-500 to-green-400' },
];

// Gradients pool for fallback rotation
const GRADIENT_POOL = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-pink-500 to-rose-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-fuchsia-500 to-pink-400',
  'from-sky-500 to-blue-400',
  'from-green-500 to-emerald-400',
  'from-yellow-500 to-amber-400',
  'from-orange-500 to-red-400',
  'from-indigo-500 to-violet-400',
  'from-teal-500 to-cyan-400',
];

function getGameStyle(game, idx) {
  const titleLower = (game.title || '').toLowerCase();

  // Try to match title keywords first
  for (const entry of TITLE_KEYWORD_MAP) {
    if (entry.keys.some(k => titleLower.includes(k))) {
      return { emoji: entry.emoji, gradient: entry.gradient };
    }
  }

  // Fallback: category/type emoji + rotating gradient
  const catStyle = CATEGORY_STYLE[game.category];
  const typeStyle = TYPE_STYLE[game.type];
  const emoji = catStyle?.emoji || typeStyle?.emoji || '🎮';
  const gradient = GRADIENT_POOL[idx % GRADIENT_POOL.length];
  return { emoji, gradient };
}

function GameIcon({ game, locked, idx }) {
  const style = getGameStyle(game, idx);
  const emoji = game.emoji || style.emoji;
  return (
    <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center ${locked ? 'opacity-40 grayscale' : ''}`}>
      <span className="text-4xl sm:text-5xl leading-none">{emoji}</span>
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
        {/* SVG icon bubble — gradient varies per card */}
        <div className="flex-shrink-0">
          <GameIcon game={game} locked={locked} idx={idx} />
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