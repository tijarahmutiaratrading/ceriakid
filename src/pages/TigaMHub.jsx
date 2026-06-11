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

      <div className="relative w-full max-w-7xl mx-auto page-px pb-16 pt-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative isolate overflow-hidden mb-6 p-6 rounded-3xl shadow-2xl border border-white/30"
          style={{ background: 'linear-gradient(135deg, hsl(220 80% 55%), hsl(160 70% 45%), hsl(35 95% 55%))' }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 40%)'
          }} />
          <Link to="/dashboard" className="relative inline-flex items-center gap-2 text-white/95 text-xs font-black mb-3 drop-shadow-md">
            <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
          </Link>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
              📚
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">Modul 3M</h1>
              <p className="text-white/95 text-sm font-bold mt-1 drop-shadow-md">Membaca · Menulis · Mengira</p>
              <p className="text-white/80 text-xs font-semibold mt-0.5">Kemahiran asas untuk Prasekolah & Darjah Rendah</p>
            </div>
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