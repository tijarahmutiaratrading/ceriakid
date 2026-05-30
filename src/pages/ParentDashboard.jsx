import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
      style={{ background: '#fafafa' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <AppHeader showBack={true} backTo="/dashboard" theme="dark" />
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-20 sm:pt-6">

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
            className="rounded-[2rem] p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
              boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
            }}
          >
            <motion.p animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-6xl mb-4">👨‍👩‍👧‍👦</motion.p>
            <p className="text-slate-800 font-black text-xl mb-2">Belum ada profil anak</p>
            <p className="text-slate-500 text-sm font-bold mb-5">Tambah profil anak dulu untuk lihat prestasi mereka 💕</p>
            <Link to="/children-profiles">
              <motion.button
                whileTap={{ scale: 0.95, y: 2 }}
                className="min-h-12 px-7 py-3 rounded-full font-black text-white text-sm"
                style={{
                  background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                  boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)',
                }}
              >
                ➕ Tambah Anak
              </motion.button>
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
                      className="rounded-[2rem] p-8 text-center"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
                        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
                      }}
                    >
                      <motion.p animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-3">🎮</motion.p>
                      <p className="text-slate-800 font-black text-lg mb-2">{selectedChild} belum mula bermain</p>
                      <p className="text-slate-500 text-xs font-bold mb-5">Galakkan dia mulakan sesi pertama! ✨</p>
                      <Link to="/dashboard">
                        <motion.button
                          whileTap={{ scale: 0.95, y: 2 }}
                          className="rounded-full px-7 py-3 font-black text-sm text-white"
                          style={{
                            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                            boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)',
                          }}
                        >
                          Mula Main Game
                        </motion.button>
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