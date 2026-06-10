import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import PageLoader from '@/components/PageLoader';
import SocialHero from '@/components/social/SocialHero';
import FriendsPanel from '@/components/social/FriendsPanel';
import ChallengesPanel from '@/components/social/ChallengesPanel';

export default function Social() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [tab, setTab] = useState('friends');
  const [friendCount, setFriendCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) navigateToLogin();
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'challenges') setTab('challenges');
  }, []);

  // Fetch counts for hero badges
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Friend.filter({ userEmail: user.email, status: 'accepted' })
      .then((f) => setFriendCount(f?.length || 0)).catch(() => {});
    Promise.all([
      base44.entities.FriendChallenge.filter({ createdBy: user.email }),
      base44.entities.FriendChallenge.filter({ opponent: user.email }),
    ]).then(([a, b]) => setChallengeCount((a?.length || 0) + (b?.length || 0))).catch(() => {});
  }, [user?.email]);

  if (!isAuthenticated || !user) {
    return <PageLoader />;
  }

  return (
    <>
      <AppHeader title="Kawan & Cabaran" theme="light" />
      <div className="min-h-screen relative -mt-16 sm:-mt-20 pt-16 sm:pt-20">
        {/* Floating decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
          <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
          <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
          <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
          <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
        </div>

        <div className="relative p-4 sm:p-6 max-w-5xl mx-auto pb-32">
          <SocialHero
            tab={tab}
            setTab={setTab}
            friendCount={friendCount}
            challengeCount={challengeCount}
          />

          {tab === 'friends'
            ? <FriendsPanel onCountChange={setFriendCount} />
            : <ChallengesPanel onCountChange={setChallengeCount} />}
        </div>
      </div>
    </>
  );
}