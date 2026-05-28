import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Zap, BookOpen, Share2, Award, Flame, Target, Sparkles, Download } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import SubjectBreakdown from '@/components/home/SubjectBreakdown';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';
import ParentHeroCard from '@/components/parent/ParentHeroCard';
import InsightsCard from '@/components/parent/InsightsCard';
import RecentActivity from '@/components/parent/RecentActivity';


const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

export default function ParentDashboard() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const { ageGroup } = useAgeGroup();
  const { selectedChild: contextChild, childrenList, setSelectedChild: setContextChild } = useSelectedChild() || {};
  const [childrenData, setChildrenData] = useState({});
  const [registeredChildren, setRegisteredChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  // Auth guard — use isLoadingAuth from auth context, not local loading state
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigateToLogin();
    }
  }, [isLoadingAuth, isAuthenticated]);

  // Sync with SelectedChildContext
  useEffect(() => {
    if (contextChild?.name) {
      setSelectedChild(contextChild.name);
    }
  }, [contextChild]);

  useEffect(() => {
    if (user) {
      loadChildrenProgress();
    }
  }, [user]);

  // Sync registered children from context (kemas kini bila ChildrenProfiles tambah/edit/padam)
  useEffect(() => {
    if (Array.isArray(childrenList)) setRegisteredChildren(childrenList);
  }, [childrenList]);

  const loadChildrenProgress = async () => {
    try {
      const [progressData, subs] = await Promise.all([
        base44.entities.ChildGameProgress.filter({ userEmail: user.email }).catch(() => []),
        base44.entities.UserSubscription.filter({ email: user.email }).catch(() => []),
      ]);

      const grouped = {};
      (progressData || []).forEach(progress => {
        if (!grouped[progress.childName]) {
          grouped[progress.childName] = [];
        }
        grouped[progress.childName].push(progress);
      });

      setChildrenData(grouped);
      setRegisteredChildren(subs[0]?.children || []);

      // Set first child as selected if not already set
      const firstChild = subs[0]?.children?.[0]?.name || Object.keys(grouped)[0];
      if (firstChild && !selectedChild) {
        setSelectedChild(firstChild);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      setChildrenData({});
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (name) => {
    setSelectedChild(name);
    const childObj = registeredChildren.find(c => c.name === name);
    if (childObj && setContextChild) setContextChild(childObj);
  };

  const analyzeWeakSubjects = (games) => {
    const subjectStats = {};
    
    games.forEach(game => {
      if (!subjectStats[game.category]) {
        subjectStats[game.category] = {
          totalStars: 0,
          totalPlayed: 0,
          averageStars: 0,
        };
      }
      subjectStats[game.category].totalStars += game.bestStars || 0;
      subjectStats[game.category].totalPlayed += 1;
    });

    // Calculate average stars per subject
    Object.keys(subjectStats).forEach(category => {
      const stats = subjectStats[category];
      stats.averageStars = stats.totalStars / stats.totalPlayed;
    });

    // Sort by weakest (lowest average stars)
    return Object.entries(subjectStats)
      .map(([category, stats]) => ({
        category,
        ...stats,
      }))
      .sort((a, b) => a.averageStars - b.averageStars);
  };

  const shareToWhatsApp = (childName, stats) => {
    const message = `🎓 Prestasi ${childName} di CeriaKid!\n\n📊 ${stats.totalGames} permainan diselesaikan\n⭐ ${stats.avgStars} bintang purata\n\nTeruskan usaha! 💪`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = (childName, stats) => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Prestasi ${childName}: ${stats.totalGames} games, ${stats.avgStars} stars! 🎓`)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToTwitter = (childName, stats) => {
    const message = `🎓 Prestasi ${childName} di @CeriaKidMY:\n${stats.totalGames} permainan, ${stats.avgStars}⭐ rata-rata!\n\n#Pendidikan #Pembelajaran #CeriaKid`;
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank');
  };

  const exportAsText = (childName, stats) => {
    const text = `LAPORAN PRESTASI ${childName.toUpperCase()}\n${'='.repeat(40)}\n\nTarikh: ${new Date().toLocaleDateString('ms-MY')}\n\nRINGKASAN PRESTASI:\n- Jumlah Permainan: ${stats.totalGames}\n- Purata Bintang: ${stats.avgStars}/3\n- Status: ${stats.avgStars >= 2.5 ? 'Cemerlang! 🔥' : 'Terus Berkembang ✨'}\n\nUntuk laporan terperinci, masuk ke aplikasi CeriaKid.\n\n🎓 CeriaKid - Platform Pembelajaran Anak`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `prestasi-${childName}-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-nunito">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Total anak = anak terdaftar (subscription) ATAU yang ada progress (fallback)
  const allChildNames = Array.from(new Set([
    ...registeredChildren.map(c => c.name),
    ...Object.keys(childrenData),
  ]));
  const totalChildren = allChildNames.length;

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24">

        {/* Hero Card with overview stats */}
        {(() => {
          const allGames = Object.values(childrenData).flat();
          const totalGames = allGames.length;
          const totalStars = allGames.reduce((sum, g) => sum + (g.bestStars || 0), 0);
          const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
          return (
            <ParentHeroCard
              totalChildren={totalChildren}
              totalGames={totalGames}
              totalStars={totalStars}
              avgStars={avgStars}
            />
          );
        })()}

        {/* Child Selector Chips — sync dengan ChildrenProfiles */}
        {totalChildren > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-3xl p-3 flex gap-2 overflow-x-auto"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.78), rgba(88,28,135,0.7))', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            {allChildNames.map((name) => {
              const isActive = selectedChild === name;
              const childObj = registeredChildren.find(c => c.name === name);
              const emoji = childObj?.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';
              const gameCount = (childrenData[name] || []).length;
              return (
                <motion.button
                  key={name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectChild(name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-white/20 text-white/80'}`}>
                    {gameCount}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Insights & Recent Activity (combined view across all children) */}
        {totalChildren > 0 && Object.keys(childrenData).length > 0 && (
          <div className="grid lg:grid-cols-2 gap-4 mb-1">
            <InsightsCard games={Object.values(childrenData).flat()} />
            <RecentActivity games={Object.values(childrenData).flat()} />
          </div>
        )}

        {/* Empty state — no children registered at all */}
        {totalChildren === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-10 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-white font-black text-lg mb-2 drop-shadow">Belum ada data</p>
            <p className="text-white/90 text-sm mb-5">Biarkan anak bermain permainan untuk melihat prestasi mereka di sini</p>
            <Link to="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="min-h-12 px-6 py-3 bg-white text-purple-700 rounded-full font-black shadow-lg"
              >
                🎯 Mula Main Game
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Smart Recommendations + Leaderboard side-by-side on desktop */}
            {selectedChild && (
              <div className="grid lg:grid-cols-2 gap-4">
                <SmartRecommendations userEmail={user.email} childName={selectedChild} ageGroup={ageGroup} />
                <LeaderboardWidget userEmail={user.email} childName={selectedChild} ageGroup={ageGroup} />
              </div>
            )}

            {allChildNames.map((childName, idx) => {
              const games = childrenData[childName] || [];
              const totalGames = games.length;

              // Anak terdaftar tapi belum main game
              if (totalGames === 0) {
                const childObj = registeredChildren.find(c => c.name === childName);
                const emoji = childObj?.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';
                return (
                  <motion.div
                    key={childName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-3xl p-5"
                    style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl ring-1 ring-white/20">{emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black text-white drop-shadow truncate">{childName}</h2>
                        <p className="text-white/80 text-xs font-bold">{childObj?.ageGroup === 'sekolah_rendah' ? 'Sekolah Rendah' : 'Prasekolah'} · Belum main</p>
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <p className="text-3xl mb-2">🎮</p>
                      <p className="text-white font-bold text-sm mb-3">{childName} belum mula bermain</p>
                      <Link to="/dashboard">
                        <motion.button whileTap={{ scale: 0.95 }} className="bg-white text-purple-700 rounded-full px-5 py-2 font-black text-xs shadow-lg">
                          Mula Main Game
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                );
              }

              const weakSubjects = analyzeWeakSubjects(games);
              const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
              const avgStars = (totalStars / totalGames).toFixed(1);
              const categoryEmojis = { bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢', science: '🧪', jawi: '🕌', bahasa_tamil: '🌺', bahasa_mandarin: '🏮' };

              return (
                <motion.div
                  key={childName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl p-5 space-y-4"
                  style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  {/* Child Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/15">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl ring-1 ring-white/20">🌟</div>
                      <div>
                        <h2 className="text-xl font-black text-white drop-shadow">{childName}</h2>
                        <p className="text-white/90 text-sm font-bold">{totalGames} permainan dimainkan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/90 text-xs font-bold">Rata-rata</p>
                      <p className="text-white font-black text-2xl drop-shadow">{avgStars}<span className="text-sm text-yellow-300">★</span></p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Permainan', value: totalGames, emoji: '🎮' },
                      { label: 'Bintang', value: totalStars, emoji: '⭐' },
                      { label: 'Subjek', value: weakSubjects.length, emoji: '📚' },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <p className="text-xl mb-1">{stat.emoji}</p>
                        <p className="text-white font-black text-lg leading-none">{stat.value}</p>
                        <p className="text-white/90 text-xs font-bold mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <p className="text-white text-xs font-black uppercase tracking-wider">📈 Prestasi Per Subjek</p>
                    {weakSubjects.map((subject) => {
                      const percentage = (subject.averageStars / 3) * 100;
                      return (
                        <div key={subject.category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-white text-sm font-bold flex items-center gap-1.5">
                              {categoryEmojis[subject.category]} {categoryLabels[subject.category] || subject.category}
                            </span>
                            <span className="text-white/90 text-xs font-bold">{subject.totalPlayed} games · {Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className={`h-3 rounded-full ${
                                percentage >= 66 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                                percentage >= 33 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                                'bg-gradient-to-r from-red-400 to-pink-400'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subject Breakdown */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <SubjectBreakdown progress={games} />
                  </div>

                  {/* Alert / Motivation */}
                  {weakSubjects[0]?.averageStars < 2 && (
                    <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.4)' }}>
                      <TrendingDown className="w-5 h-5 text-yellow-200 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-black text-white">Subjek perlu ditingkatkan</p>
                        <p className="text-white/95 font-semibold">{categoryLabels[weakSubjects[0].category]} perlukan lebih latihan</p>
                      </div>
                    </div>
                  )}

                  {parseFloat(avgStars) >= 2.5 && (
                    <div className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(52,211,153,0.25)', border: '1px solid rgba(52,211,153,0.4)' }}>
                      <Flame className="w-5 h-5 text-emerald-200 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-black text-white">Cemerlang! 🔥</p>
                        <p className="text-white/95 font-semibold">{childName} sedang dalam momentum terbaik!</p>
                      </div>
                    </div>
                  )}

                  {/* Share Buttons */}
                  <div className="pt-2 border-t border-white/15 space-y-2">
                    <p className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-3 h-3" /> Kongsi Pencapaian
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => shareToWhatsApp(childName, { totalGames, avgStars })}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-xl min-h-11 py-2.5 font-bold text-xs transition-all">
                        💬 WhatsApp
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => shareToFacebook(childName, { totalGames, avgStars })}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl min-h-11 py-2.5 font-bold text-xs transition-all">
                        f Facebook
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => shareToTwitter(childName, { totalGames, avgStars })}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl min-h-11 py-2.5 font-bold text-xs transition-all">
                        𝕏 Twitter
                      </motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportAsText(childName, { totalGames, avgStars })}
                      className="w-full bg-white/25 hover:bg-white/35 text-white rounded-xl min-h-11 py-2.5 font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Export Laporan
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}