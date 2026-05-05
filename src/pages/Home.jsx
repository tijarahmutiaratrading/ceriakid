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
import ChildSelector from '@/components/ChildSelector';
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
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader />

      <div className="relative max-w-2xl mx-auto px-3 md:px-4 pb-32 pt-28 md:pt-32 space-y-5">

        {/* Welcome Card */}
        {isAuthenticated && (
          <Link to="/settings">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 p-3 md:p-4 rounded-3xl flex items-center gap-3 md:gap-4 cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            {homeAvatarUrl ? (
              <img src={homeAvatarUrl} alt="Avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow-inner flex-shrink-0 border-2 border-white/50" />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/40 flex items-center justify-center text-2xl md:text-3xl shadow-inner flex-shrink-0">🐱</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-bold">
                {lang === 'bm' ? 'Selamat datang kembali!' : 'Welcome back!'}
              </p>
              <p className="text-white font-black text-lg truncate">{user?.full_name || 'Teman'}</p>
            </div>
            <div className="flex-shrink-0">
              <ChildSelector />
            </div>
          </motion.div>
          </Link>
        )}

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
          className="mb-4 md:mb-5 p-3 md:p-4 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">🎯 {lang === 'bm' ? 'Pilih Umur Anak' : "Child's Age"}</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { key: 'prasekolah', label: t('prasekolah', lang), emoji: '🎨', sub: '4–6 tahun' },
              { key: 'sekolah_rendah', label: t('sekolahRendah', lang), emoji: '📚', sub: '7–12 tahun' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className={`py-2 md:py-3 px-3 md:px-4 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 md:gap-3 ${
                  safeAgeGroup === age.key
                    ? 'bg-white text-purple-600 shadow-xl'
                    : 'bg-white/20 text-white border border-white/30'
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

        {/* Quick Access Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-5"
        >
          <Link to="/games-hub" className="block">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl h-full"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div className="text-3xl mb-2">🎮</div>
              <p className="text-white font-black text-sm leading-tight">Game Hub</p>
              <p className="text-white/70 text-xs mt-1">Permainan interaktif</p>
              <div className="mt-2 text-white/60 text-xs">→</div>
            </motion.div>
          </Link>

          <Link to="/drawing" className="block">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl h-full"
              style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div className="text-3xl mb-2">🎨</div>
              <p className="text-white font-black text-sm leading-tight">Studio Lukisan</p>
              <p className="text-white/70 text-xs mt-1">Lukis bebas & tracing</p>
              <div className="mt-2 text-white/60 text-xs">→</div>
            </motion.div>
          </Link>
        </motion.div>

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

        {/* BBM Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-5"
        >
          <Link to="/bbm" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="p-4 rounded-2xl flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.4))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div className="text-4xl">📚</div>
              <div className="flex-1">
                <p className="text-white font-black text-sm">Bahan Bantu Mengajar (BBM)</p>
                <p className="text-white/70 text-xs mt-0.5">Lembaran kerja, RPH, kad imbasan & lebih</p>
                <p className="text-yellow-300 text-xs font-black mt-1">✨ Untuk Cikgu & Ibu Bapa →</p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

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
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-6 rounded-full bg-white/60" />
            <p className="text-white font-black text-base uppercase tracking-wider">
              {lang === 'bm' ? 'Pilih Subjek' : 'Choose Subject'}
            </p>
            <div className="h-1 flex-1 rounded-full bg-white/20" />
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