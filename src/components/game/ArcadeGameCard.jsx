import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Play, Sparkles, Trophy, Zap } from 'lucide-react';

export default function ArcadeGameCard({ game, data, category, locked, to, index, modeLabel }) {
  const Wrapper = locked ? 'div' : Link;
  const wrapperProps = locked ? {} : { to };
  const difficulty = game.difficulty || data.difficulty || 'Mudah';
  const rounds = game.totalQuestions || data.itemsPerSet || data.rounds?.length || 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.045 }}
      whileHover={locked ? {} : { y: -5, scale: 1.015 }}
      className="relative"
    >
      <Wrapper {...wrapperProps} className={`group block overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/48 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl transition-all ${locked ? 'opacity-60' : 'hover:border-white/40'}`}>
        <div className={`relative min-h-44 overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${category.color} p-4`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.5),transparent_24%),radial-gradient(circle_at_90%_95%,rgba(0,0,0,0.35),transparent_34%)]" />
          <div className="absolute right-3 top-3 rounded-full bg-white/22 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/25">{difficulty}</div>

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 3.8 + index * 0.1 }}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.55rem] bg-white/24 text-5xl shadow-xl shadow-black/20 ring-1 ring-white/25"
              >
                {game.emoji || category.emoji}
              </motion.div>
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="line-clamp-2 text-lg font-black leading-tight text-white drop-shadow">{game.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-white/82">{data.objective || game.description || category.objective}</p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/20"><Zap className="h-3 w-3" /> {modeLabel}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/20"><Trophy className="h-3 w-3" /> {rounds} round</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/20"><Sparkles className="h-3 w-3" /> 3D</span>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-700 shadow-xl transition-transform group-hover:scale-110">
                {locked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </span>
            </div>
          </div>
        </div>
      </Wrapper>
      {locked && <p className="mt-2 text-center text-xs font-black text-yellow-200">Naik taraf untuk akses mini game ini</p>}
    </motion.div>
  );
}