import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { TIGA_M_CATEGORIES } from '@/lib/tigaMBlueprints';

export default function TigaMHub() {
  return (
    <div className="min-h-screen w-full font-nunito relative">
      <AppHeader showBack={true} backTo="/dashboard" title="3M" />

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

        {/* Hero — style ikut Games Subjek */}
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
            📚
          </motion.div>
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100 mb-2">Modul 3M</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white mb-2">
              Membaca · Menulis · Mengira 🎓
            </h1>
            <p className="text-white/85 text-sm sm:text-base font-bold max-w-lg leading-snug">
              Kemahiran asas untuk Prasekolah & Darjah Rendah. Pilih modul untuk mula belajar.
            </p>
          </div>
        </motion.div>

        {/* 3 Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {TIGA_M_CATEGORIES.map((category, idx) => (
            <Link key={category.id} to={`/3m/${category.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-3xl overflow-hidden cursor-pointer h-full min-h-[170px] sm:min-h-[200px] relative border border-white/50 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow bg-gradient-to-br ${category.color}`}
              >
                {category.bgImage && (
                  <img
                    src={category.bgImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity"
                  />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t opacity-80 ${category.color}`} style={{ maskImage: 'linear-gradient(to top, black 30%, transparent 100%)' }} />
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 45%)'
                }} />
                <div className="relative z-10 p-5 h-full min-h-[170px] sm:min-h-[200px] flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-3xl shadow-md mb-3">
                      {category.emoji}
                    </div>
                    <h3 className="font-black text-xl sm:text-2xl text-white leading-tight drop-shadow-md">{category.title}</h3>
                    <p className="text-white/85 text-xs font-semibold mt-1 drop-shadow-md line-clamp-2">{category.objective}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-black shadow-xl ring-1 ring-white/40 bg-white/25 backdrop-blur-lg w-fit">
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    <p className="text-xs text-white whitespace-nowrap leading-none font-bold">
                      {category.games.length} <span className="text-white/90">Game</span>
                    </p>
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