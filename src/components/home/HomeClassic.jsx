import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

import CategoryGridClassic from '@/components/home/CategoryGridClassic';
import DailyChallenge from '@/components/home/DailyChallenge';
import AppleFitnessHero from '@/components/home/AppleFitnessHero';
import QuickAccessGrid from '@/components/home/QuickAccessGrid';
import SubscriptionExpiryBanner from '@/components/dashboard/SubscriptionExpiryBanner';
import InstallAppGuide from '@/components/home/InstallAppGuide';

// Tema KLASIK CERIA — versi lama cerah & berwarna (sebelum migrasi PS5).
// Dipapar bila user pilih tema "Klasik" dalam Settings → Tema Paparan.
export default function HomeClassic({ user, avatarUrl, onLogout, ageGroup, toggleAgeGroup }) {
  const { lang } = useLang();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative bg-pattern bg-background">
      {/* Latar gradient lembut — tema cerah */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full" aria-hidden="true">
        <div className="absolute -top-48 -right-40 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-yellow-300/25 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto page-px pb-40 pt-4 space-y-8 md:space-y-10">

        <AppleFitnessHero user={user} avatarUrl={avatarUrl || user?.avatarUrl} onLogout={onLogout} />

        {user?.email && <SubscriptionExpiryBanner userEmail={user.email} />}

        {/* Daily Challenge — terus selepas hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <DailyChallenge ageGroup={safeAgeGroup} />
        </motion.div>

        <InstallAppGuide />

        {/* Age Group Selector — Mascot Illustration Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-800 font-black text-base md:text-lg">Umur Anak</h2>
            <span className="text-slate-500 text-xs font-semibold">Tap untuk tukar</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              {
                key: 'prasekolah',
                title: `${t('prasekolah', lang)} (KSPK)`,
                age: '4–6 Tahun',
                emoji: '🎨',
                image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/98cf1f885_generated_image.png',
                gradient: 'from-sky-200 via-cyan-200 to-emerald-200',
              },
              {
                key: 'sekolah_rendah',
                title: `${t('sekolahRendah', lang)} (KSSR)`,
                age: '7–12 Tahun',
                emoji: '📚',
                image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d1137d39a_generated_image.png',
                gradient: 'from-pink-200 via-rose-200 to-amber-200',
              },
            ].map((age) => {
              const isActive = safeAgeGroup === age.key;
              return (
                <motion.button
                  key={age.key}
                  onClick={() => safeToggle(age.key)}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${age.gradient} p-2.5 sm:p-3 text-left shadow-lg shadow-black/15 transition-all border-2 ${
                    isActive ? 'border-white ring-2 ring-white/40' : 'border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center">
                      <img
                        src={age.image}
                        alt={age.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 text-xs sm:text-sm leading-tight">
                        {age.title}
                      </h3>
                      <p className="font-bold text-slate-700 text-xs flex items-center gap-1">
                        {age.age} <span>{age.emoji}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div
                      className={`w-full py-1.5 rounded-full text-center font-black text-xs shadow-sm transition-all ${
                        isActive ? 'brand-gradient text-white' : 'bg-white/80 text-slate-700'
                      }`}
                    >
                      {isActive ? '✓ Aktif' : 'Pilih'}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <QuickAccessGrid />

        {/* Game progress teaser */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 flex items-center justify-between gap-3 shadow-lg shadow-purple-950/5"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-2 ring-purple-100 flex-shrink-0 shadow-md text-xl">
              🏆
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 font-black text-sm leading-tight">Lihat Prestasi Anak</p>
              <p className="text-slate-600 text-xs mt-0.5 leading-tight">Pantau skor, subjek & streak harian</p>
            </div>
          </div>
          <Link to="/parent-dashboard" className="flex-shrink-0 px-3 py-1.5 rounded-full brand-gradient text-white font-black text-xs transition-all shadow-md">
            Buka →
          </Link>
        </motion.div>

        {/* Subject Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-2.5 backdrop-blur-md shadow-sm">
              <span className="text-xl">📚</span>
              <h2 className="text-slate-900 font-black text-lg md:text-xl">Pilih Subjek</h2>
            </div>
            <div className="h-1 flex-1 bg-gradient-to-r from-cyan-300 via-pink-300 to-transparent rounded-full" />
          </div>
          <CategoryGridClassic />
        </motion.div>

      </div>
    </div>
  );
}