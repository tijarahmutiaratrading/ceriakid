import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, BookOpen, Zap } from 'lucide-react';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

// New mini game system info panel.
// Replaces old MiniGamesGenerator + MiniGamesManager — those depended on AI
// generating mini game content which produced junk like "Epalkan (Buah)".
// New system: cognitive mini games built ON-THE-FLY from clean KSSR Subject Games.
export default function MiniGamesInfoPanel() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(16, 185, 129, 0.16) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 text-3xl">✨</div>
          <div className="flex-1">
            <h2 className="font-black text-white text-xl">Mini Games Versi Baru</h2>
            <p className="text-white/80 text-sm font-semibold mt-1">Template-based · 100% content bersih · No more AI hallucinations</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <BookOpen className="w-5 h-5 text-green-300 mb-2" />
            <p className="text-white font-black text-sm">Guna Content KSSR Sebenar</p>
            <p className="text-white/70 text-xs mt-1">Setiap mini game build dari 1,258 soalan Subject Games yang dah QC 100% bersih.</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <Zap className="w-5 h-5 text-yellow-300 mb-2" />
            <p className="text-white font-black text-sm">Instant Load</p>
            <p className="text-white/70 text-xs mt-1">Tiada lagi AI generation. Build on-the-fly bila user klik. Tiada cost LLM.</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 mb-2" />
            <p className="text-white font-black text-sm">Predictable & Selamat</p>
            <p className="text-white/70 text-xs mt-1">Tiada lagi "Epalkan", target tak match, atau jawapan betul ditolak. Logic clean dalam code.</p>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <Sparkles className="w-5 h-5 text-purple-300 mb-2" />
            <p className="text-white font-black text-sm">Variety Tak Habis</p>
            <p className="text-white/70 text-xs mt-1">Setiap kali user main, dapat soalan random dari pool KSSR. Boleh shuffle infinite.</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <h3 className="font-black text-white mb-4">🎮 8 Kategori Mini Games Aktif</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MINI_GAME_CATEGORIES.map(category => (
            <div key={category.id} className={`bg-gradient-to-br ${category.color} rounded-2xl p-4 shadow-lg`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-3xl">{category.emoji}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-white/30 text-white">6 cabaran</span>
              </div>
              <p className="text-white font-black text-sm leading-tight mb-1">{category.title}</p>
              <p className="text-white/85 text-[11px] font-semibold leading-snug line-clamp-2">{category.objective}</p>
            </div>
          ))}
        </div>
        <p className="text-white/55 text-xs mt-4 leading-relaxed">
          <strong className="text-white/80">Nota:</strong> Setiap kategori ada 6 cabaran (variant). Bila user klik cabaran, sistem build mini game terus dari soalan KSSR sebenar. Tiada lagi perlu generate, audit, atau repair mini games.
        </p>
      </div>
    </motion.div>
  );
}