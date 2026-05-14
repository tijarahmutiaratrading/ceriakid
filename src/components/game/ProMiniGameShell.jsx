import React from 'react';
import { motion } from 'framer-motion';

export default function ProMiniGameShell({ data = {}, mode, children }) {
  const rounds = Array.isArray(data.rounds) ? data.rounds : [];
  const theme = data.visualTheme || data.generatedTheme || 'Genius Quest';
  const powerUps = Array.isArray(data.powerUps) && data.powerUps.length ? data.powerUps : ['Combo', 'Focus', 'Boost'];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-slate-950/55 p-3 shadow-2xl shadow-fuchsia-950/40 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.28),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(34,211,238,0.32),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.34),transparent_34%)]" />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute right-5 top-6 h-20 w-20 rounded-[2rem] bg-cyan-300/25 blur-sm"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute -left-4 bottom-20 h-28 w-28 rounded-full bg-pink-300/20 blur-sm"
      />

      <div className="relative mb-3 rounded-[1.65rem] border border-white/25 bg-white/12 p-4 shadow-inner shadow-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/80">3D Genius Arena</p>
            <h2 className="mt-1 text-lg font-black leading-tight text-white drop-shadow">{data.title || theme}</h2>
            <p className="mt-1 text-xs font-bold text-white/65">Mode: {String(mode || 'genius').replaceAll('_', ' ')}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-xl shadow-cyan-950/20">
            <p className="text-[10px] font-black uppercase text-purple-700">Power</p>
            <p className="text-lg font-black text-slate-950">⚡</p>
          </div>
        </div>

        {rounds.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {rounds.slice(0, 6).map((round, index) => (
              <span key={`${round}-${index}`} className="shrink-0 rounded-full bg-white/18 px-3 py-1 text-[11px] font-black text-white ring-1 ring-white/25">
                R{index + 1} · {String(round).replace(/^Round\s*\d+\s*:\s*/i, '').slice(0, 24)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {powerUps.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full bg-cyan-300/20 px-3 py-1 text-[11px] font-black text-cyan-50 ring-1 ring-cyan-100/25">{item}</span>
          ))}
        </div>
      </div>

      <div className="relative rounded-[1.75rem] border border-white/25 bg-gradient-to-br from-white/14 to-white/5 p-3 shadow-2xl shadow-black/20">
        {children}
      </div>
    </div>
  );
}