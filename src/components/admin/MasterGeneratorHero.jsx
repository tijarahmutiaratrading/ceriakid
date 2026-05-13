import React from 'react';
import { CheckCircle2, Clock, Database, Loader2, Users, AlertTriangle, Sparkles } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl shadow-black/10 md:rounded-3xl md:p-4">
    <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl ${tone}`} />
    <div className="relative flex items-center justify-between gap-3">
      <div>
        <p className="text-lg font-black text-white leading-none md:text-2xl">{value}</p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-white/55 md:text-[11px]">{label}</p>
      </div>
      <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 sm:flex">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function MasterGeneratorHero({ totalGames, totalFull, totalPlayers, pendingTasks, runningTasks, failedTasks }) {
  const queueTotal = (pendingTasks?.length || 0) + (runningTasks?.length || 0);

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 p-3.5 shadow-2xl shadow-fuchsia-950/30 backdrop-blur-3xl md:rounded-[2.25rem] md:p-7">
      <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-white/6 to-transparent" />
      <div className="absolute -right-32 -top-28 h-56 w-56 rounded-full bg-pink-500/30 blur-3xl md:-right-20 md:-top-24 md:h-64 md:w-64" />
      <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-yellow-200" /> Admin Content Studio
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 text-2xl shadow-2xl shadow-purple-950/30 ring-1 ring-white/30 md:h-20 md:w-20 md:rounded-[1.65rem] md:text-4xl">
              🎮
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-white md:text-5xl">Master Generator</h1>
              <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-white/70 md:text-base">
                Kawal generation, mini games, Story Kid, quality control dan queue dalam satu cockpit admin yang lebih teratur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/15 px-3 py-2 text-xs font-black text-yellow-100">
              <Clock className="h-3.5 w-3.5" /> {queueTotal} queue aktif
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-300/15 px-3 py-2 text-xs font-black text-blue-100">
              <Loader2 className="h-3.5 w-3.5" /> {runningTasks?.length || 0} running
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-300/25 bg-red-300/15 px-3 py-2 text-xs font-black text-red-100">
              <AlertTriangle className="h-3.5 w-3.5" /> {failedTasks?.length || 0} failed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 lg:grid-cols-1 xl:grid-cols-3">
          <StatCard icon={Database} label="Games" value={totalGames} tone="bg-yellow-300/30" />
          <StatCard icon={CheckCircle2} label="Soalan Penuh" value={totalFull} tone="bg-green-300/25" />
          <StatCard icon={Users} label="Players" value={totalPlayers} tone="bg-pink-300/25" />
        </div>
      </div>
    </div>
  );
}