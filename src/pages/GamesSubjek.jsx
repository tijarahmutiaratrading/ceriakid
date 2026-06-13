import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

import AppHeader from '@/components/AppHeader';
import CategoryGrid from '@/components/home/CategoryGrid';

export default function GamesSubjek() {
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const { lang } = useLang();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      {/* Floating sparkles for playful vibe */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-28 left-6 text-2xl text-white/40 animate-float">✨</div>
        <div className="absolute top-40 right-10 text-xl text-yellow-300/60 animate-float" style={{ animationDelay: '1.2s' }}>⭐</div>
        <div className="absolute top-1/3 left-1/4 text-lg text-pink-300/50 animate-float" style={{ animationDelay: '2s' }}>💫</div>
        <div className="absolute top-1/2 right-8 text-2xl text-cyan-300/50 animate-float" style={{ animationDelay: '2.6s' }}>✨</div>
        <div className="absolute bottom-40 left-10 text-xl text-yellow-300/60 animate-float" style={{ animationDelay: '3.5s' }}>⭐</div>
        <div className="absolute bottom-1/3 right-1/4 text-lg text-purple-300/50 animate-float" style={{ animationDelay: '4.2s' }}>✨</div>
      </div>

      <AppHeader showBack={true} backTo="/dashboard" theme="dark" />

      <div className="relative z-10 w-full max-w-7xl mx-auto page-px pb-40 pt-4 space-y-8 md:space-y-10">

        {/* Back button */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-2 px-4 py-2.5 rounded-full font-black text-sm text-slate-700 transition-all hover:scale-[1.02]"
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
            📚
          </motion.div>
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100 mb-2">Belajar Ikut Subjek</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white mb-2">
              Belajar Ikut Subjek! 🎓
            </h1>
            <p className="text-white/85 text-sm sm:text-base font-bold max-w-lg leading-snug">
              Pilih peringkat anak dan subjek yang ingin dipelajari.
            </p>
          </div>
        </motion.div>

        {/* Age Group Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white font-black text-xl md:text-2xl mb-4">Pilih Umur Anak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[
              {
                key: 'prasekolah',
                title: `${t('prasekolah', lang)} (KSPK)`,
                age: '4–6 Tahun',
                emoji: '🎨',
                desc: 'Tahap umur Prasekolah (KSPK) 4–6 Tahun',
                image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/98cf1f885_generated_image.png',
                gradient: 'from-sky-200 via-cyan-200 to-emerald-200',
              },
              {
                key: 'sekolah_rendah',
                title: `${t('sekolahRendah', lang)} (KSSR)`,
                age: '7–12 Tahun',
                emoji: '📚',
                desc: 'Tahap umur Sekolah Rendah (KSSR) 7–12 Tahun',
                image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d1137d39a_generated_image.png',
                gradient: 'from-pink-200 via-rose-200 to-amber-200',
              },
            ].map((age) => {
              const isActive = safeAgeGroup === age.key;
              return (
                <motion.button
                  key={age.key}
                  onClick={() => safeToggle(age.key)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${age.gradient} p-3 sm:p-3.5 text-left shadow-lg shadow-black/15 transition-all border-2 ${
                    isActive ? 'border-white ring-2 ring-white/40' : 'border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center">
                      <img
                        src={age.image}
                        alt={age.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight">
                        {age.title}
                      </h3>
                      <p className="font-black text-slate-800 text-sm flex items-center gap-1 mb-1">
                        {age.age} <span>{age.emoji}</span>
                      </p>
                      <p className="text-slate-700 text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2">
                        {age.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div
                      className={`w-full py-2 rounded-full text-center font-black text-xs sm:text-sm shadow-sm transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white text-slate-800 group-hover:bg-slate-50'
                      }`}
                    >
                      {isActive ? '✓ Dipilih' : 'Pilih'}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Subject Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 backdrop-blur-md">
              <span className="text-xl">📚</span>
              <h2 className="text-white font-black text-lg md:text-xl">Pilih Subjek</h2>
            </div>
            <div className="h-1 flex-1 bg-gradient-to-r from-cyan-300 via-pink-300 to-transparent rounded-full" />
          </div>
          <CategoryGrid />
        </motion.div>
      </div>

    </div>
  );
}