import React from 'react';
import { motion } from 'framer-motion';

const toneStyles = {
  value: 'from-emerald-100 to-cyan-100 text-emerald-900 border-emerald-200',
  item: 'from-amber-100 to-pink-100 text-amber-950 border-amber-200',
  word: 'from-violet-100 to-indigo-100 text-violet-950 border-violet-200',
};

export default function MemoryCard({ card, isFlipped, isMatched, onClick }) {
  const tone = toneStyles[card.tone || card.side] || toneStyles.word;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      animate={{ rotateY: isFlipped ? 180 : 0, scale: isMatched ? 0.96 : 1 }}
      transition={{ duration: 0.32 }}
      className="relative aspect-[4/5] rounded-[1.35rem] overflow-hidden font-black shadow-xl"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-slate-900/80 via-purple-800/80 to-fuchsia-700/80 border border-white/30 flex items-center justify-center">
        <div className="absolute inset-2 rounded-2xl border-2 border-dashed border-white/25" />
        <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/20" />
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-yellow-300/25" />
        <span className="text-white text-3xl drop-shadow-lg">?</span>
      </div>

      <div
        className={`absolute inset-0 rounded-[1.35rem] bg-gradient-to-br ${tone} border-2 flex flex-col items-center justify-center p-2 text-center`}
        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
      >
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/60" />
        <div className="absolute bottom-2 left-2 w-7 h-2 rounded-full bg-white/50" />
        <span className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{card.side === 'item' ? 'Barang' : 'Nilai'}</span>
        <span className="text-sm sm:text-base leading-tight line-clamp-3">{card.label}</span>
        {isMatched && <span className="mt-2 text-xs bg-white/70 rounded-full px-2 py-0.5">Padan</span>}
      </div>
    </motion.button>
  );
}