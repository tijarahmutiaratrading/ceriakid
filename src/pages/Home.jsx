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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-96 -right-96 w-[600px] h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-64 w-[500px] h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 right-1/3 w-[700px] h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-40 pt-20 md:pt-24 space-y-8 md:space-y-10 overflow-x-hidden">

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

        {/* Age Group Toggle - Bold design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-10 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full" />
            <p className="text-white text-sm font-black uppercase tracking-widest">Pilih Umur Anak</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {[
              { key: 'prasekolah', label: `${t('prasekolah', lang)} (KSPK)`, emoji: '🎨', sub: '4–6 Tahun' },
              { key: 'sekolah_rendah', label: `${t('sekolahRendah', lang)} (KSSR)`, emoji: '📚', sub: '7–12 Tahun' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.92 }}
                whileHover={{ y: -4 }}
                className={`py-4 md:py-5 px-5 md:px-6 rounded-2xl font-black text-sm md:text-base transition-all flex items-center gap-3 ${
                  safeAgeGroup === age.key
                    ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 text-white shadow-2xl shadow-orange-400/50 scale-105'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                <span className="text-3xl">{age.emoji}</span>
                <div className="text-left">
                  <div className="font-black text-sm">{age.label}</div>
                  <div className="text-xs font-bold opacity-90">{age.sub}</div>
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
              className="mb-6"
              >
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                className="p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 shadow-2xl shadow-yellow-400/50"
              >
                <div className="absolute top-3 right-4 text-2xl animate-bounce">✨</div>
                <div className="text-5xl flex-shrink-0">🎉</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-black text-base">Permainan Baru Akan Datang!</p>
                    <span className="px-3 py-1 bg-white text-orange-600 text-xs font-black rounded-full">{COMING_SOON_DATE}</span>
                  </div>
                  <p className="text-white font-bold text-sm">Games baru untuk semua subjek akan dilancarkan pada {COMING_SOON_DATE} 🚀</p>
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
          <div className="mb-7 flex items-center gap-3">
            <h2 className="text-white font-black text-2xl md:text-3xl">📚 Pilih Subjek</h2>
            <div className="h-1.5 flex-1 bg-gradient-to-r from-cyan-300 via-pink-300 to-transparent rounded-full" />
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