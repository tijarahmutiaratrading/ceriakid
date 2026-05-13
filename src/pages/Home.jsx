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
    base44.entities.UserSubscription.filter({ email: user.email }).then(async (subs) => {
      const sub = subs?.[0];
      const isExpired = sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();
      const tier = (sub && !isExpired) ? (sub.tier || 'free') : 'free';
      const result = await checkAndRegisterDevice(user.email, tier);
      setDeviceCheck({ status: result.allowed ? 'allowed' : 'blocked', devices: result.devices, tier });
      // Sync any offline-queued progress when back online
      if (navigator.onLine) {
        syncOfflineProgress(base44, user);
      }
    });
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.13) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-fuchsia-500/20 to-transparent" />
        <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute top-1/3 -left-28 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-5 md:px-6 pb-32 pt-28 md:pt-32 space-y-5 md:space-y-7 overflow-x-hidden">

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

        {/* Age Group Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-black/15 backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_1.5rem)] md:rounded-[2rem] md:p-5 md:[clip-path:inset(0_round_2rem)]"
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">🎯 {lang === 'bm' ? 'Pilih Umur Anak' : "Child's Age"}</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { key: 'prasekolah', label: `${t('prasekolah', lang)} · KSPK`, emoji: '🎨', sub: '4–6 tahun' },
              { key: 'sekolah_rendah', label: `${t('sekolahRendah', lang)} · KSSR`, emoji: '📚', sub: '7–12 tahun' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className={`py-2 md:py-3 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 md:gap-3 ${
                  safeAgeGroup === age.key
                    ? 'bg-white text-purple-700 shadow-xl shadow-purple-950/20'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/15'
                }`}
              >
                <span className="text-2xl">{age.emoji}</span>
                <div className="text-left">
                  <div className="font-black text-sm leading-tight">{age.label}</div>
                  <div className={`text-xs font-semibold ${safeAgeGroup === age.key ? 'text-purple-400' : 'text-white/60'}`}>{age.sub}</div>
                </div>
              </motion.button>
            ))}
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
              className="mb-5"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(249,115,22,0.45))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                <div className="absolute top-1 right-3 text-yellow-200 text-lg opacity-60 animate-pulse">✨</div>
                <div className="text-4xl">🎉</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-black text-sm">Permainan Baru Akan Datang!</p>
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full">{COMING_SOON_DATE}</span>
                  </div>
                  <p className="text-white/80 text-xs">Games baru untuk semua subjek akan dilancarkan pada {COMING_SOON_DATE} 🚀</p>
                  <p className="text-yellow-200 text-xs font-black mt-1">🌟 Coming Soon — Nantikan!</p>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="mb-4 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl transform-gpu [clip-path:inset(0_round_1.5rem)]">
            <div className="h-2 w-2 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/40" />
            <p className="text-white font-black text-base uppercase tracking-wider">
              {lang === 'bm' ? 'Pilih Subjek' : 'Choose Subject'}
            </p>
            <div className="h-px flex-1 bg-white/15" />
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