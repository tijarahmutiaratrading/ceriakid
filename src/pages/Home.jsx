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
import AppleFitnessHero from '@/components/home/AppleFitnessHero';
import QuickAccessGrid from '@/components/home/QuickAccessGrid';
import SubscriptionExpiryBanner from '@/components/dashboard/SubscriptionExpiryBanner';
import InstallAppGuide from '@/components/home/InstallAppGuide';
import DeviceBlockedScreen from '@/components/DeviceBlockedScreen';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { checkAndRegisterDevice } from '@/lib/deviceManager';
import { syncOfflineProgress } from '@/lib/offlineSyncManager';
import { hasActiveSubscription } from '@/lib/tierAccess';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const authContext = useAuth();
  const { isAuthenticated, user, isLoadingAuth, logout } = authContext || {};
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const { lang } = useLang();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});
  const [deviceCheck, setDeviceCheck] = React.useState({ status: 'checking', devices: [] });
  const [homeAvatarUrl, setHomeAvatarUrl] = React.useState(user?.avatarUrl || '');
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Show onboarding wizard for first-time users (lepas device check pass)
  React.useEffect(() => {
    if (!user) return;
    if (deviceCheck.status !== 'allowed') return;
    // Tunjuk wizard kalau user belum complete onboarding
    if (user.onboardingCompleted !== true) {
      setShowOnboarding(true);
    }
  }, [user, deviceCheck.status]);

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

  // Check subscription + device registration once user is known.
  // Paywall: if no active paid subscription, redirect to landing pricing.
  React.useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    let cancelled = false;
    (async () => {
      try {
        const subs = await base44.entities.UserSubscription.filter({ email: user.email });
        const sub = subs?.[0];

        // No active paid subscription → kick to landing pricing
        if (!hasActiveSubscription(sub)) {
          if (!cancelled) window.location.href = '/#pricing';
          return;
        }

        const tier = sub.tier;
        const result = await checkAndRegisterDevice(user.email, tier);
        if (cancelled) return;
        setDeviceCheck({ status: result.allowed ? 'allowed' : 'blocked', devices: result.devices, tier });
        if (navigator.onLine) {
          syncOfflineProgress(base44, user);
        }
      } catch (err) {
        console.error('Device check failed:', err);
        if (!cancelled) setDeviceCheck({ status: 'allowed', devices: [], tier: 'asas' });
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      {/* Onboarding wizard untuk user baru */}
      {showOnboarding && (
        <OnboardingWizard
          user={user}
          onComplete={() => {
            setShowOnboarding(false);
            window.location.reload();
          }}
        />
      )}

      {/* Static background gradient — no animation for performance on low-end phones */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full" aria-hidden="true">
        <div className="absolute -top-48 -right-40 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-yellow-300/15 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-cyan-300/10 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-pink-300/8 rounded-full mix-blend-screen filter blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-40 pt-4 space-y-8 md:space-y-10">

      {isAuthenticated && <AppleFitnessHero user={user} avatarUrl={homeAvatarUrl || user?.avatarUrl} onLogout={logout} />}

      {isAuthenticated && user?.email && <SubscriptionExpiryBanner userEmail={user.email} />}

        {/* Daily Challenge — lebih prominent, terus selepas hero */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <DailyChallenge ageGroup={safeAgeGroup} />
          </motion.div>
        )}

      {isAuthenticated && <InstallAppGuide />}

        {/* Age Group Selector - Mascot Illustration Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-base md:text-lg">Umur Anak</h2>
            <span className="text-white/50 text-xs font-semibold">Tap untuk tukar</span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
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
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${age.gradient} p-2.5 sm:p-3 text-left shadow-lg shadow-black/15 transition-all border-2 ${
                    isActive ? 'border-white ring-2 ring-white/40' : 'border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Mascot Image */}
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center">
                      <img
                        src={age.image}
                        alt={age.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    {/* Text Content */}
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
                        isActive
                          ? 'brand-gradient text-white'
                          : 'bg-white/80 text-slate-700'
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

        {/* Game progress teaser — pacu anak habiskan lebih banyak game */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-white/30 px-4 py-3 flex items-center justify-between gap-3"
            style={{
              background: 'rgba(71,85,105,0.35)',
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-2 ring-white/80 flex-shrink-0 shadow-md text-xl">
                🏆
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-sm leading-tight">Lihat Prestasi Anak</p>
                <p className="text-white/80 text-xs mt-0.5 leading-tight">Pantau skor, subjek & streak harian</p>
              </div>
            </div>
            <Link to="/parent-dashboard" className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-slate-900 font-black text-xs transition-all">
              Buka →
            </Link>
          </motion.div>
        )}

        {/* Daily Challenge — removed here, moved to top */}

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

      </div>

    </div>
  );
}