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
      <div className="md:hidden">
        <AppHeader title="Kawan & Cabaran" />
      </div>
      <div className="min-h-screen relative">
        <div className="relative px-4 sm:px-6 pt-4 sm:pt-2 max-w-5xl mx-auto pb-16">
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