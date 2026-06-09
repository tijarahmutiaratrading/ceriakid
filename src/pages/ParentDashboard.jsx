import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import ParentHeroCard from '@/components/parent/ParentHeroCard';
import InsightsCard from '@/components/parent/InsightsCard';
import RecentActivity from '@/components/parent/RecentActivity';
import SiblingCompareStrip from '@/components/parent/SiblingCompareStrip';
import ActivitySparkline from '@/components/parent/ActivitySparkline';
import ActionItemsCard from '@/components/parent/ActionItemsCard';
import ChildSnapshotCard from '@/components/parent/ChildSnapshotCard';
import ChildSubjectProgress from '@/components/parent/ChildSubjectProgress';
import ShareSheet from '@/components/parent/ShareSheet';

export default function ParentDashboard() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const { ageGroup } = useAgeGroup();
  const { selectedChild: contextChild, childrenList, setSelectedChild: setContextChild } = useSelectedChild() || {};
  const [childrenData, setChildrenData] = useState({});
  const [leaderboards, setLeaderboards] = useState([]);
  const [registeredChildren, setRegisteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigateToLogin();
  }, [isLoadingAuth, isAuthenticated]);

  useEffect(() => {
    if (contextChild?.name) setSelectedChild(contextChild.name);
  }, [contextChild]);

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  useEffect(() => {
    if (Array.isArray(childrenList)) setRegisteredChildren(childrenList);
  }, [childrenList]);

  const loadProgress = async () => {
    try {
      const [progressData, subs, leaderData] = await Promise.all([
        base44.entities.ChildGameProgress.filter({ userEmail: user.email }).catch(() => []),
        base44.entities.UserSubscription.filter({ email: user.email }).catch(() => []),
        base44.entities.Leaderboard.filter({ userEmail: user.email }).catch(() => []),
      ]);

      const grouped = {};
      (progressData || []).forEach((p) => {
        if (!grouped[p.childName]) grouped[p.childName] = [];
        grouped[p.childName].push(p);
      });

      setChildrenData(grouped);
      setLeaderboards(leaderData || []);
      setRegisteredChildren(subs[0]?.children || []);

      const firstChild = subs[0]?.children?.[0]?.name || Object.keys(grouped)[0];
      if (firstChild && !selectedChild) setSelectedChild(firstChild);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (name) => {
    setSelectedChild(name);
    const childObj = registeredChildren.find((c) => c.name === name);
    if (childObj && setContextChild) setContextChild(childObj);
  };

  // Merge registered children with leaderboard streak data
  const enrichedChildren = useMemo(() => {
    const allNames = Array.from(new Set([...registeredChildren.map((c) => c.name), ...Object.keys(childrenData)]));
    return allNames.map((name) => {
      const reg = registeredChildren.find((c) => c.name === name);
      const lb = leaderboards.find((l) => l.childName === name);
      return {
        name,
        ageGroup: reg?.ageGroup || lb?.ageGroup || 'prasekolah',
        avatarUrl: reg?.avatarUrl || '',
        currentStreak: lb?.currentStreak || 0,
      };
    });
  }, [registeredChildren, childrenData, leaderboards]);

  const totalChildren = enrichedChildren.length;
  const allGames = useMemo(() => Object.values(childrenData).flat(), [childrenData]);

  // Selected child's data
  const selectedChildObj = enrichedChildren.find((c) => c.name === selectedChild);
  const selectedGames = childrenData[selectedChild] || [];
  const selectedStreak = selectedChildObj?.currentStreak || 0;
  const selectedTotalGames = selectedGames.length;
  const selectedAvgStars = selectedTotalGames > 0
    ? (selectedGames.reduce((s, g) => s + (g.bestStars || 0), 0) / selectedTotalGames).toFixed(1)
    : '0.0';

  // Overall family stats
  const totalGamesAll = allGames.length;
  const totalStarsAll = allGames.reduce((s, g) => s + (g.bestStars || 0), 0);
  const avgStarsAll = totalGamesAll > 0 ? (totalStarsAll / totalGamesAll).toFixed(1) : '0.0';

  return (
    <div
      className="min-h-screen font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
    >
      {/* Floating decorations — CeriaKid vibe (same as Challenges) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>
      <AppHeader showBack={true} backTo="/dashboard" theme="light" />
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-20 sm:pt-6">

        {/* 1. Family Hero — overall snapshot */}
        <ParentHeroCard
          totalChildren={totalChildren}
          totalGames={totalGamesAll}
          totalStars={totalStarsAll}
          avgStars={avgStarsAll}
        />

        {/* Empty state — no children at all */}
        {totalChildren === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-12 text-center bg-white shadow-xl border border-white/60"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-slate-900 font-black text-xl mb-2">Belum ada profil anak</p>
            <p className="text-slate-500 text-sm font-medium mb-5 max-w-sm mx-auto">Tambah profil anak dulu untuk lihat prestasi mereka.</p>
            <Link to="/children-profiles">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all">
                <Plus className="w-4 h-4" /> Tambah Anak
              </button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* 2. Sibling Comparison Strip — mini leaderboard (only if 2+ children) */}
            <SiblingCompareStrip
              children={enrichedChildren}
              childrenData={childrenData}
              selectedChild={selectedChild}
              onSelect={handleSelectChild}
            />

            {/* 3. Per-Child Section — focused on ONE child */}
            <AnimatePresence mode="wait">
              {selectedChild && (
                <motion.div
                  key={selectedChild}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Child snapshot */}
                  <ChildSnapshotCard
                    child={selectedChildObj}
                    games={selectedGames}
                    streak={selectedStreak}
                  />

                  {/* If no games yet — empty state per child */}
                  {selectedTotalGames === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-3xl p-10 text-center bg-white shadow-xl border border-white/60"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <p className="text-slate-900 font-black text-lg mb-2">{selectedChild} belum mula bermain</p>
                      <p className="text-slate-500 text-sm font-medium mb-5">Galakkan dia mulakan sesi pertama!</p>
                      <Link to="/dashboard">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all">
                          Mula Main Game
                        </button>
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      {/* Action items — what to do next */}
                      <ActionItemsCard childName={selectedChild} games={selectedGames} />

                      {/* Activity trend (7-day) + Insights */}
                      <div className="grid lg:grid-cols-2 gap-4">
                        <ActivitySparkline games={selectedGames} />
                        <InsightsCard games={selectedGames} />
                      </div>

                      {/* Subject progress */}
                      <ChildSubjectProgress games={selectedGames} />

                      {/* Recent activity + Smart Recommendations */}
                      <div className="grid lg:grid-cols-2 gap-4">
                        <RecentActivity games={selectedGames} />
                        <SmartRecommendations userEmail={user.email} childName={selectedChild} ageGroup={ageGroup} />
                      </div>

                      {/* Share */}
                      <ShareSheet
                        childName={selectedChild}
                        totalGames={selectedTotalGames}
                        avgStars={selectedAvgStars}
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}