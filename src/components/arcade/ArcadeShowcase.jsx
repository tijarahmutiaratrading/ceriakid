import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Hand } from 'lucide-react';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';

// Hero showcase gaya PS5 — game terpilih dipaparkan besar dengan info & butang Main
export default function ArcadeShowcase({ game, best }) {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 items-center">
      {/* Info panel */}
      <div className="order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={game.key}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                style={{ background: game.accent }}
              >
                Arcade
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">CeriaKid Games</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 drop-shadow-lg leading-tight">
              {game.emoji} {game.title}
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-bold max-w-md mb-5 leading-relaxed">
              {game.desc}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3.5 py-1.5 text-xs font-black text-white/90">
                <Hand className="w-3.5 h-3.5" /> {game.how}
              </span>
              {best > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-300/25 backdrop-blur px-3.5 py-1.5 text-xs font-black text-amber-300">
                  <Trophy className="w-3.5 h-3.5" /> Rekod: {best}
                </span>
              )}
            </div>

            <Link
              to={game.to}
              className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-black text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: game.accent }}>
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </span>
              Main Sekarang
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Art besar */}
      <div className="order-1 lg:order-2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={game.key}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative"
          >
            <div
              className="absolute -inset-4 rounded-[2rem] blur-3xl opacity-40"
              style={{ background: game.accent }}
            />
            <Link to={game.to} className="relative block overflow-hidden rounded-[1.75rem] border border-white/15 shadow-2xl group">
              <img
                src={ARCADE_ART[game.key]}
                alt={game.title}
                className="w-full aspect-[16/10] object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-white/10" />
              {/* Kilauan sudut */}
              <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}