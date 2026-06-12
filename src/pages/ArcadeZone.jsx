import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { getBest } from '@/components/arcade/arcadeValues';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';
import ArcadeShowcase from '@/components/arcade/ArcadeShowcase';
import ArcadeRail from '@/components/arcade/ArcadeRail';
import CinematicTips from '@/components/hub/CinematicTips';

const GAMES = [
  { to: '/arcade/runner', key: 'runner', emoji: '🦊', title: 'Lari Si Comel', desc: 'Lompat elak halangan, kutip nilai murni sambil berlari sejauh mungkin!', how: 'Tap untuk lompat', accent: '#f97316' },
  { to: '/arcade/catch', key: 'catch', emoji: '🧺', title: 'Tangkap Ceria', desc: 'Tangkap buah & buku yang jatuh, elak sampah! Pantas & seronok.', how: 'Gerakkan bakul kiri-kanan', accent: '#ec4899' },
  { to: '/arcade/flappy', key: 'flappy', emoji: '🐦', title: 'Burung Ceria', desc: 'Terbang lalu celah pokok, kutip bintang nilai murni di udara!', how: 'Tap untuk terbang', accent: '#0ea5e9' },
  { to: '/arcade/space', key: 'space', emoji: '🚀', title: 'Angkasa Ceria', desc: 'Kemudi roket elak asteroid, kutip bintang & nilai murni di angkasa!', how: 'Gerakkan jari kemudi roket', accent: '#8b5cf6' },
  { to: '/arcade/jump', key: 'jump', emoji: '🐰', title: 'Lompat Awan', desc: 'Lompat platform demi platform sampai ke angkasa — spring lompat super!', how: 'Gerakkan jari kiri-kanan', accent: '#06b6d4' },
  { to: '/arcade/brick', key: 'brick', emoji: '🧱', title: 'Pecah Blok', desc: 'Pecahkan semua blok dengan bola, naik level & dapatkan power-up!', how: 'Gerakkan paddle kiri-kanan', accent: '#a855f7' },
  { to: '/arcade/snake', key: 'snake', emoji: '🐍', title: 'Ular Ceria', desc: 'Klasik! Makan buah, jadi panjang — jangan langgar diri sendiri!', how: 'Swipe untuk tukar arah', accent: '#22c55e' },
  { to: '/arcade/racer', key: 'racer', emoji: '🏎️', title: 'Pelumba Ceria', desc: 'Tukar lorong elak kereta lain, kutip syiling & nitro kebal!', how: 'Tap kiri/kanan tukar lorong', accent: '#ef4444' },
  { to: '/arcade/whack', key: 'whack', emoji: '🔨', title: 'Ketuk Ceria', desc: 'Ketuk tikus secepat kilat dalam 45 saat — tapi jangan ketuk bom!', how: 'Tap tikus yang muncul', accent: '#f59e0b' },
  { to: '/arcade/balloon', key: 'balloon', emoji: '🎈', title: 'Letup Belon', desc: 'Letupkan belon berwarna-warni sebelum terbang — elak bom!', how: 'Tap belon untuk letup', accent: '#fb7185' },
];

const VALUES = ['⭐ Jujur', '❤️ Baik Hati', '🤝 Tolong-Menolong', '📖 Rajin Belajar', '🙏 Hormat', '😊 Sabar'];

export default function ArcadeZone() {
  const [selected, setSelected] = useState(0);
  const game = GAMES[selected];
  const bestScores = useMemo(() => Object.fromEntries(GAMES.map((g) => [g.key, getBest(g.key)])), []);

  return (
    <div className="min-h-screen bg-slate-950 pb-28 relative overflow-hidden">
      {/* ── Latar sinematik: art game terpilih blur penuh skrin ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={game.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          <img
            src={ARCADE_ART[game.key]}
            alt=""
            className="h-full w-full object-cover scale-110 blur-2xl opacity-30"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950 pointer-events-none" />
      {/* Glow ambient ikut warna game */}
      <motion.div
        animate={{ background: `radial-gradient(60% 50% at 70% 30%, ${game.accent}33 0%, transparent 70%)` }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto page-px pt-6 sm:pt-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2">
            <Gamepad2 className="w-4 h-4 text-white" />
            <span className="text-xs font-black text-white uppercase tracking-[0.25em]">Arcade Zone</span>
          </div>
        </div>

        {/* Hero showcase */}
        <ArcadeShowcase game={game} best={bestScores[game.key]} />

        {/* Rail thumbnail */}
        <div className="mt-8 sm:mt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
            Pilih Permainan · {selected + 1}/{GAMES.length}
          </p>
          <ArcadeRail games={GAMES} selected={selected} onSelect={setSelected} bestScores={bestScores} />
        </div>

        {/* Nilai murni */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5"
        >
          <h3 className="font-black text-white/90 text-sm mb-3">⭐ Kutip Nilai Murni Dalam Setiap Game!</h3>
          <div className="flex flex-wrap gap-2">
            {VALUES.map((v) => (
              <span key={v} className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-black text-white/80">
                {v}
              </span>
            ))}
          </div>
        </motion.div>

        <CinematicTips />
      </div>
    </div>
  );
}