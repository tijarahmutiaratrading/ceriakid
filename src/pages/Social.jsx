import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AppHeader from '@/components/AppHeader';
import PageLoader from '@/components/PageLoader';
import FriendsPanel from '@/components/social/FriendsPanel';
import ChallengesPanel from '@/components/social/ChallengesPanel';

export default function Social() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [tab, setTab] = useState('friends');

  useEffect(() => {
    if (!isAuthenticated) navigateToLogin();
  }, [isAuthenticated]);

  // Allow deep-link to challenges tab via ?tab=challenges
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'challenges') setTab('challenges');
  }, []);

  if (!isAuthenticated || !user) {
    return <PageLoader />;
  }

  const tabs = [
    { id: 'friends', label: 'Kawan', icon: Users },
    { id: 'challenges', label: 'Cabaran', icon: Zap },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20">
      {/* Floating decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-32 pt-4 overflow-x-hidden">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center gap-4 bg-white shadow-xl border border-white/60"
        >
          <div className="w-14 h-14 rounded-2xl brand-gradient-br flex items-center justify-center shadow-lg flex-shrink-0">
            <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">Kawan & Cabaran</h1>
            <p className="text-slate-600 text-xs font-semibold mt-0.5">Berkawan dan bertanding bersama</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 p-1.5 rounded-2xl bg-white shadow-xl border border-white/60">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all ${
                tab === id
                  ? 'brand-gradient-br text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.5} />
              {label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {tab === 'friends' ? <FriendsPanel /> : <ChallengesPanel />}
      </div>
    </div>
  );
}