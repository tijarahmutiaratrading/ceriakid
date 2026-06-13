import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

// Showcase hero — item terpilih dipaparkan besar dengan info & butang utama
export default function CinematicShowcase({ item, playLabel, onPlay }) {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 items-center">
      {/* Info panel */}
      <div className="order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {item.badge && (
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ background: item.accent }}
                >
                  {item.badge}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">CeriaKid</span>
              </div>
            )}

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 drop-shadow-lg leading-tight">
              {item.emoji} {item.title}
            </h2>
            {item.desc && (
              <p className="text-white/70 text-sm sm:text-base font-bold max-w-md mb-5 leading-relaxed">
                {item.desc}
              </p>
            )}

            {item.metaChips?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {item.metaChips.map((chip, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3.5 py-1.5 text-xs font-black text-white/90">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {playLabel && (
              <button
                onClick={onPlay}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: item.accent }}>
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </span>
                {playLabel}
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Art besar */}
      <div className="order-1 lg:order-2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-40" style={{ background: item.accent }} />
            <button onClick={onPlay} className="relative block w-full overflow-hidden rounded-[1.75rem] border border-white/15 shadow-2xl group text-left isolate [transform:translateZ(0)] [clip-path:inset(0_round_1.75rem)]">
              {item.art ? (
                <img
                  src={item.art}
                  alt={item.title}
                  className="w-full aspect-[16/10] object-cover group-hover:scale-[1.04] transition-transform duration-700"
                />
              ) : (
                <div
                  className="w-full aspect-[16/10] flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${item.accent}, #0f172a)` }}
                >
                  <span className="text-8xl drop-shadow-2xl">{item.emoji}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-white/10" />
              <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}