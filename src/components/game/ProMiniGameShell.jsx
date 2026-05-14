import React from 'react';
import { motion } from 'framer-motion';

export default function ProMiniGameShell({ data = {}, mode, children }) {
  const rounds = Array.isArray(data.rounds) ? data.rounds : [];
  const theme = data.visualTheme || data.generatedTheme || 'Genius Quest';
  const powerUps = Array.isArray(data.powerUps) && data.powerUps.length ? data.powerUps : ['Combo', 'Focus', 'Boost'];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/80 bg-gradient-to-br from-yellow-100/95 via-pink-100/95 to-sky-100/95 p-3 shadow-2xl shadow-purple-300/35 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(251,191,36,0.45),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(45,212,191,0.38),transparent_34%)]" />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute right-5 top-6 h-20 w-20 rounded-[2rem] bg-yellow-300/45 blur-sm"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 12, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute -left-4 bottom-20 h-28 w-28 rounded-full bg-pink-300/45 blur-sm"
      />

      <div className="relative mb-3 rounded-[1.65rem] border-2 border-white/80 bg-white/75 p-4 shadow-xl shadow-pink-200/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-600">Genius Kids Arena</p>
            <h2 className="mt-1 text-lg font-black leading-tight text-slate-900">{data.title || theme}</h2>
            <p className="mt-1 text-xs font-black text-purple-700">Mode: {String(mode || 'genius').replaceAll('_', ' ')}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-xl shadow-cyan-950/20">
            <p className="text-[10px] font-black uppercase text-purple-700">Power</p>
            <p className="text-lg font-black text-slate-950">⚡</p>
          </div>
        </div>

        {rounds.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {rounds.slice(0, 6).map((round, index) => (
              <span key={`${round}-${index}`} className="shrink-0 rounded-full bg-gradient-to-r from-yellow-300 to-pink-300 px-3 py-1 text-[11px] font-black text-purple-900 ring-2 ring-white/80 shadow-sm">
                R{index + 1} · {String(round).replace(/^Round\s*\d+\s*:\s*/i, '').slice(0, 24)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {powerUps.slice(0, 3).map((item) => (
            <span key={item} className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-black text-slate-900 ring-2 ring-white/80 shadow-sm">{item}</span>
          ))}
        </div>
      </div>

      <div className="relative rounded-[1.75rem] border-4 border-white/85 bg-gradient-to-br from-white/92 via-yellow-50/92 to-sky-50/92 p-3 shadow-xl shadow-purple-200/40">
        {children}
      </div>
    </div>
  );
}