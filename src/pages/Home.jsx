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
import AIHubCard from '@/components/home/AIHubCard';
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

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pb-40 pt-4 space-y-8 md:space-y-10">

      {isAuthenticated && <AppleFitnessHero user={user} avatarUrl={homeAvatarUrl} onLogout={logout} />}

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

        {/* Age Group Selector - Simple Pill Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {[
            { key: 'prasekolah', label: `🎨 ${t('prasekolah', lang)}`, sub: '4–6 Tahun' },
            { key: 'sekolah_rendah', label: `📚 ${t('sekolahRendah', lang)}`, sub: '7–12 Tahun' },
          ].map((age) => {
            const isActive = safeAgeGroup === age.key;
            return (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.96 }}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition-all border-2 ${
                  isActive
                    ? 'bg-white text-purple-700 border-white shadow-lg shadow-white/20'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <div>{age.label}</div>
                <div className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-purple-500' : 'text-white/60'}`}>{age.sub}</div>
              </motion.button>
            );
          })}
        </motion.div>

        <QuickAccessGrid />

        {/* Game progress teaser — pacu anak habiskan lebih banyak game */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-white/20 px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
          >
            <div>
              <p className="text-white font-black text-sm">🏆 Lihat Prestasi Anak</p>
              <p className="text-white/60 text-xs mt-0.5">Pantau skor, subjek & streak harian</p>
            </div>
            <Link to="/parent-dashboard" className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-black text-xs transition-all border border-white/20">
              Buka →
            </Link>
          </motion.div>
        )}

        {/* Kredit AI + Ciri AI (merged) */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <AIHubCard />
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