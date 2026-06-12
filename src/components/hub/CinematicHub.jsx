import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CinematicShowcase from './CinematicShowcase';
import CinematicRail from './CinematicRail';
import CinematicTips from './CinematicTips';

// Hub sinematik gaya PS5 — latar gelap dengan art item terpilih, showcase besar + rail thumbnail.
// items: [{ key, title, desc, emoji, art, accent, to?, metaChips?: [string] }]
// onPlay(item, index) — optional; default navigate ke item.to
// children boleh jadi render-prop: (item, index) => JSX (untuk kandungan bawah rail)
export default function CinematicHub({
  label,
  labelIcon: LabelIcon = null,
  backTo = '/dashboard',
  backLabel = 'Dashboard',
  items = [],
  playLabel = 'Mula Sekarang',
  railLabel = 'Pilih',
  onPlay,
  showcaseFit = 'cover',
  children,
}) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const item = items.length ? items[Math.min(selected, items.length - 1)] : null;

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-6xl">📭</p>
        <p className="text-white font-black text-xl">Belum ada kandungan</p>
        <Link to={backTo} className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-black text-white">
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>
      </div>
    );
  }

  const handlePlay = () => {
    if (onPlay) onPlay(item, selected);
    else if (item.to) navigate(item.to);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-28 relative overflow-hidden font-nunito">
      {/* Latar sinematik — art item terpilih blur penuh skrin */}
      <AnimatePresence mode="sync">
        <motion.div
          key={item.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          {item.art ? (
            <img src={item.art} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-30" />
          ) : (
            <div className="h-full w-full" style={{ background: `radial-gradient(80% 80% at 50% 30%, ${item.accent}44, transparent)` }} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950 pointer-events-none" />
      <motion.div
        animate={{ background: `radial-gradient(60% 50% at 70% 30%, ${item.accent}33 0%, transparent 70%)` }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto page-px pt-6 sm:pt-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2">
            {LabelIcon && <LabelIcon className="w-4 h-4 text-white" />}
            <span className="text-xs font-black text-white uppercase tracking-[0.25em]">{label}</span>
          </div>
        </div>

        <CinematicShowcase item={item} playLabel={playLabel} onPlay={handlePlay} fit={showcaseFit} />

        <div className="mt-8 sm:mt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
            {railLabel} · {selected + 1}/{items.length}
          </p>
          <CinematicRail items={items} selected={selected} onSelect={setSelected} onActivate={handlePlay} />
        </div>

        {typeof children === 'function' ? children(item, selected) : children}

        <CinematicTips />
      </div>
    </div>
  );
}