import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

import AppHeader from '@/components/AppHeader';
import CategoryGrid from '@/components/home/CategoryGrid';
import DailyChallenge from '@/components/home/DailyChallenge';
import DashboardHero from '@/components/home/DashboardHero';
import QuickAccessGrid from '@/components/home/QuickAccessGrid';
import DeviceBlockedScreen from '@/components/DeviceBlockedScreen';
import { checkAndRegisterDevice } from '@/lib/deviceManager';
import { syncOfflineProgress } from '@/lib/offlineSyncManager';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const authContext = useAuth();
  const { isAuthenticated, user, isLoadingAuth } = authContext || {};
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const { lang } = useLang();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});
  const [deviceCheck, setDeviceCheck] = React.useState({ status: 'checking', devices: [] });
  const [homeAvatarUrl, setHomeAvatarUrl] = React.useState(user?.avatarUrl || '');

  React.useEffect(() => {
    setHomeAvatarUrl(user?.avatarUrl || '');
  }, [user?.avatarUrl]);

  React.useEffect(() => {
    const handleAvatarUpdated = (event) => setHomeAvatarUrl(event.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handleAvatarUpdated);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdated);
  }, []);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
    }
  }, [isLoadingAuth, isAuthenticated]);

  // Check device registration once user is known
  React.useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const subs = await base44.entities.UserSubscription.filter({ email: user.email });
        const sub = subs?.[0];
        const isExpired = sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();
        const tier = (sub && !isExpired) ? (sub.tier || 'free') : 'free';
        const result = await checkAndRegisterDevice(user.email, tier);
        if (cancelled) return;
        setDeviceCheck({ status: result.allowed ? 'allowed' : 'blocked', devices: result.devices, tier });
        if (navigator.onLine) {
          syncOfflineProgress(base44, user);
        }
      } catch (err) {
        console.error('Device check failed:', err);
        if (!cancelled) setDeviceCheck({ status: 'allowed', devices: [], tier: 'free' });
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.email]);

  if (!isAuthenticated) return null;

  if (isAuthenticated && deviceCheck.status === 'blocked') {
    return (
      <DeviceBlockedScreen
        devices={deviceCheck.devices}
        tier={deviceCheck.tier || 'free'}
        onDeviceRemoved={() => setDeviceCheck({ status: 'checking', devices: [] })}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 md:pl-[17rem] lg:pl-[18rem] pb-40 pt-20 md:pt-8 space-y-8 md:space-y-10">

      {isAuthenticated && <DashboardHero user={user} avatarUrl={homeAvatarUrl} lang={lang} />}

        {/* Not logged in welcome */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-3xl flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <p className="text-white font-black text-lg">Selamat datang ke CeriaKid!</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="px-4 py-2 bg-white text-purple-600 rounded-full text-sm font-black shadow-lg"
            >
              Log Masuk
            </motion.button>
          </motion.div>
        )}

        {/* Age Group Selector - Mascot Illustration Style */}
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
                sub: 'Bahasa, Matematik, Sains & banyak lagi',
                image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/98cf1f885_generated_image.png',
                gradient: 'from-sky-200 via-cyan-200 to-emerald-200',
              },
              {
                key: 'sekolah_rendah',
                title: `${t('sekolahRendah', lang)} (KSSR)`,
                age: '7–12 Tahun',
                emoji: '📚',
                desc: 'Tahap umur Sekolah Rendah (KSSR) 7–12 Tahun',
                sub: 'Darjah 1 hingga Darjah 6 mengikut KSSR',
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
                    {/* Mascot Image */}
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center">
                      <img
                        src={age.image}
                        alt={age.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    {/* Text Content */}
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

                  {/* Pilih Button */}
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

        <QuickAccessGrid />

        {/* New Games Coming Soon Banner — tukar COMING_SOON_DATE untuk ubah tarikh, set null untuk sembunyikan */}
        {(() => {
          const COMING_SOON_DATE = '1 Julai 2026';
          const HIDE_AFTER = new Date('2026-07-01');
          if (!COMING_SOON_DATE || new Date() >= HIDE_AFTER) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mb-6"
              >
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                className="p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 shadow-lg"
              >
                <div className="absolute top-2 right-2 sm:top-3 sm:right-4 text-lg sm:text-2xl animate-bounce">✨</div>
                <div className="text-4xl sm:text-5xl flex-shrink-0">🎉</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <p className="text-white font-black text-sm sm:text-base">Permainan Baru Akan Datang!</p>
                    <span className="inline-block px-3 py-1 bg-white text-orange-600 text-xs font-black rounded-full w-fit">{COMING_SOON_DATE}</span>
                  </div>
                  <p className="text-white font-bold text-xs sm:text-sm">Games baru untuk semua subjek akan dilancarkan pada {COMING_SOON_DATE} 🚀</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}


        {/* Daily Challenge */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <DailyChallenge ageGroup={safeAgeGroup} />
          </motion.div>
        )}

        {/* Subject Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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

        {/* CTA if not logged in */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 rounded-3xl text-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          >
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-white font-black text-lg mb-2">
              {lang === 'bm' ? 'Belum Mendaftar?' : 'Not Registered Yet?'}
            </p>
            <p className="text-white/80 text-sm mb-5">
              {lang === 'bm' ? 'Daftar sekarang untuk akses 200+ permainan edukatif!' : 'Sign up now to access 200+ educational games!'}
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg hover:shadow-xl transition-all"
              >
                {lang === 'bm' ? 'Lihat Pelan Sekarang' : 'View Packages'}
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}