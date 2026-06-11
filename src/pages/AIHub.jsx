import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CreditTopUpBar from '@/components/home/CreditTopUpBar';

const AI_CIKGU = [
  {
    to: '/ai-assistant',
    name: 'Cikgu Firdaus',
    role: 'Tutor AI Serba Boleh',
    desc: 'Tanya apa sahaja — soalan sekolah, penjelasan topik & bantuan belajar.',
    emoji: '🧑‍🏫',
    color: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    to: '/quiz-ai',
    name: 'Cikgu Rosie',
    role: 'Penjana Kuiz',
    desc: 'Latih anak dengan kuiz interaktif ikut subjek & tahap.',
    emoji: '🦉',
    color: 'from-sky-500 via-blue-500 to-cyan-500',
  },
  {
    to: '/story-generator',
    name: 'Cikgu Mira',
    role: 'Pencipta Cerita',
    desc: 'Hasilkan cerita penuh pengajaran moral untuk anak.',
    emoji: '📖',
    color: 'from-pink-500 via-rose-500 to-orange-400',
  },
  {
    to: '/bbm-generator',
    name: 'Cikgu Daniel',
    role: 'Penjana BBM',
    desc: 'Cipta bahan bantu mengajar — lembaran kerja, nota & lagi.',
    emoji: '📝',
    color: 'from-emerald-500 via-teal-500 to-green-500',
  },
];

export default function AIHub() {
  return (
    <div className="min-h-screen w-full font-nunito relative">
      <AppHeader showBack={true} backTo="/dashboard" title="AI Hub" />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-16 pt-4 space-y-6">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-sm text-slate-700 transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] p-5 sm:p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            boxShadow: '0 20px 50px rgba(168,85,247,0.4), 0 8px 20px rgba(0,0,0,0.15)',
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-3 right-4 text-4xl"
          >
            🤖
          </motion.div>
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100 mb-2">AI Hub</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white mb-2">
              Cikgu AI ✨
            </h1>
            <p className="text-white/85 text-sm sm:text-base font-bold max-w-lg leading-snug">
              Pilih Cikgu AI untuk bantu anak belajar, jana kuiz, cerita & bahan mengajar.
            </p>
          </div>
        </motion.div>

        {/* Baki kredit + Top Up */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CreditTopUpBar />
        </motion.div>

        {/* Cikgu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {AI_CIKGU.map((cikgu, idx) => (
            <Link key={cikgu.to} to={cikgu.to}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-3xl overflow-hidden cursor-pointer h-full min-h-[160px] relative border border-white/50 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow bg-gradient-to-br ${cikgu.color}`}
              >
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 45%)'
                }} />
                <div className="relative z-10 p-5 h-full min-h-[160px] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-3xl shadow-md mb-3">
                      {cikgu.emoji}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80">{cikgu.role}</p>
                    <h3 className="font-black text-xl sm:text-2xl text-white leading-tight drop-shadow-md">{cikgu.name}</h3>
                    <p className="text-white/85 text-xs font-semibold mt-1 drop-shadow-md line-clamp-2">{cikgu.desc}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black shadow-xl ring-1 ring-white/40 bg-white/25 backdrop-blur-lg w-fit">
                    <span className="text-xs text-white whitespace-nowrap leading-none">Buka</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}