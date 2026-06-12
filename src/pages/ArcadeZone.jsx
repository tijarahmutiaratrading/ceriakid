import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Trophy } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getBest } from '@/components/arcade/arcadeValues';

const GAMES = [
  {
    to: '/arcade/runner',
    key: 'runner',
    emoji: '🦊',
    title: 'Lari Si Comel',
    desc: 'Lompat elak halangan, kutip nilai murni sambil berlari sejauh mungkin!',
    how: 'Tap untuk lompat',
    color: 'from-orange-400 to-amber-300',
    bg: 'bg-orange-50 border-orange-100',
  },
  {
    to: '/arcade/catch',
    key: 'catch',
    emoji: '🧺',
    title: 'Tangkap Ceria',
    desc: 'Tangkap buah & buku yang jatuh, elak sampah! Pantas & seronok.',
    how: 'Gerakkan bakul kiri-kanan',
    color: 'from-pink-400 to-rose-300',
    bg: 'bg-pink-50 border-pink-100',
  },
  {
    to: '/arcade/flappy',
    key: 'flappy',
    emoji: '🐦',
    title: 'Burung Ceria',
    desc: 'Terbang lalu celah pokok, kutip bintang nilai murni di udara!',
    how: 'Tap untuk terbang',
    color: 'from-sky-400 to-cyan-300',
    bg: 'bg-sky-50 border-sky-100',
  },
];

export default function ArcadeZone() {
  return (
    <div className="min-h-screen bg-background bg-pattern pb-24">
      <AppHeader title="Arcade Zone" />

      <div className="max-w-7xl mx-auto page-px pt-20 sm:pt-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-black text-purple-600 hover:text-purple-800 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 sm:p-8 mb-6 shadow-xl"
        >
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-black text-white mb-3">
              🕹️ ZON SANTAI & SERONOK
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Arcade Zone 🎮</h1>
            <p className="text-white/80 text-sm sm:text-base font-bold max-w-lg">
              Game arcade sebenar untuk anak release tension — sambil kutip nilai murni macam jujur, baik hati & rajin belajar! ⭐
            </p>
          </div>
        </motion.div>

        {/* Game cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((g, i) => {
            const best = getBest(g.key);
            return (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={g.to} className="block group">
                  <div className={`rounded-3xl border ${g.bg} bg-white shadow-xl border-white/60 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all`}>
                    <div className={`relative h-32 bg-gradient-to-br ${g.color} flex items-center justify-center`}>
                      <span className="text-6xl group-hover:scale-110 transition-transform drop-shadow-lg">{g.emoji}</span>
                      {best > 0 && (
                        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-amber-600 shadow">
                          <Trophy className="w-3 h-3" /> {best}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-slate-900 text-lg mb-1">{g.title}</h3>
                      <p className="text-slate-600 text-xs font-semibold leading-snug mb-3">{g.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">👆 {g.how}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-xs font-black text-white shadow group-hover:opacity-90">
                          <Play className="w-3 h-3 fill-white" /> Main
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Nilai murni info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl bg-white shadow-xl border border-white/60 p-5"
        >
          <h3 className="font-black text-slate-900 text-sm mb-3">⭐ Kutip Nilai Murni Dalam Setiap Game!</h3>
          <div className="flex flex-wrap gap-2">
            {[
              '⭐ Jujur', '❤️ Baik Hati', '🤝 Tolong-Menolong', '📖 Rajin Belajar', '🙏 Hormat', '😊 Sabar',
            ].map((v) => (
              <span key={v} className="rounded-full bg-purple-50 border border-purple-100 px-3 py-1.5 text-xs font-black text-purple-700">
                {v}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}