import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

import AppHeader from '@/components/AppHeader';
import HomeSubjectShowcase from '@/components/home/HomeSubjectShowcase';
import AppleFitnessHero from '@/components/home/AppleFitnessHero';
import HomeHubShowcase from '@/components/home/HomeHubShowcase';
import CinematicTips from '@/components/hub/CinematicTips';
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative bg-slate-950">
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

      {/* Latar sinematik PS5-style — gelap dengan glow halus */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950" />
        <div className="absolute -top-48 -right-40 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-violet-600/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-500/12 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-fuchsia-500/12 rounded-full filter blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-40 pt-4 space-y-8 md:space-y-10">

      {isAuthenticated && <AppleFitnessHero user={user} avatarUrl={homeAvatarUrl || user?.avatarUrl} onLogout={logout} />}

      {isAuthenticated && user?.email && <SubscriptionExpiryBanner userEmail={user.email} />}

      {isAuthenticated && <InstallAppGuide />}

        {/* Hub Showcase — gaya PS5: hero besar + rail tile boleh scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">🎮 Hub Utama</p>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Pilih &amp; Buka</span>
          </div>
          <HomeHubShowcase />
        </motion.div>


        {/* Age Group Selector - Mascot Illustration Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 px-1">Pilih Umur Anak</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {[
              { key: 'prasekolah', label: `${t('prasekolah', lang)} (KSPK)`, sub: '4–6 Tahun', emoji: '🎨' },
              { key: 'sekolah_rendah', label: `${t('sekolahRendah', lang)} (KSSR)`, sub: '7–12 Tahun', emoji: '📚' },
            ].map((age) => {
              const isActive = safeAgeGroup === age.key;
              return (
                <motion.button
                  key={age.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => safeToggle(age.key)}
                  className={`flex-shrink-0 min-h-10 px-4 py-2 rounded-full font-black text-sm transition-all inline-flex items-center gap-2 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/20'
                  }`}
                >
                  {age.emoji} {age.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-900/10 text-slate-700' : 'bg-white/10 text-white/60'
                  }`}>
                    {age.sub}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Subject Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">📚 Pilih Subjek</p>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Pilih &amp; Buka</span>
          </div>
          <HomeSubjectShowcase />
        </motion.div>

        <CinematicTips />

      </div>

    </div>
  );
}