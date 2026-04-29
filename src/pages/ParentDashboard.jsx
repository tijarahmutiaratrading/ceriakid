import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Zap, BookOpen, Share2, Award, Flame, Target, Sparkles, Download } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { base44 } from '@/api/base44Client';
import SubjectBreakdown from '@/components/home/SubjectBreakdown';
import SmartRecommendations from '@/components/dashboard/SmartRecommendations';
import LeaderboardWidget from '@/components/dashboard/LeaderboardWidget';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
};

export default function ParentDashboard() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const { ageGroup } = useAgeGroup();
  const [childrenData, setChildrenData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigateToLogin();
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (user) {
      loadChildrenProgress();
    }
  }, [user]);

  const loadChildrenProgress = async () => {
    try {
      const progressData = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
      });

      const grouped = {};
      progressData.forEach(progress => {
        if (!grouped[progress.childName]) {
          grouped[progress.childName] = [];
        }
        grouped[progress.childName].push(progress);
      });

      setChildrenData(grouped);
      
      // Set first child as selected if not already set
      if (Object.keys(grouped).length > 0 && !selectedChild) {
        setSelectedChild(Object.keys(grouped)[0]);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
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
    const message = `🎓 Prestasi ${childName} di Jom Belajar!\n\n📊 ${stats.totalGames} permainan diselesaikan\n⭐ ${stats.avgStars} bintang rata-rata\n\nCubit terus! 💪`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = (childName, stats) => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`Prestasi ${childName}: ${stats.totalGames} games, ${stats.avgStars} stars! 🎓`)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToTwitter = (childName, stats) => {
    const message = `🎓 Prestasi ${childName} di @JomBelajarMY:\n${stats.totalGames} permainan, ${stats.avgStars}⭐ rata-rata!\n\n#Pendidikan #Pembelajaran #JomBelajar`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank');
  };

  const exportAsText = (childName, stats) => {
    const text = `LAPORAN PRESTASI ${childName.toUpperCase()}\n${'='.repeat(40)}\n\nTanggal: ${new Date().toLocaleDateString('ms-MY')}\n\nRINGKASAN PRESTASI:\n- Total Permainan: ${stats.totalGames}\n- Rata-rata Bintang: ${stats.avgStars}/3\n- Status: ${stats.avgStars >= 2.5 ? 'Cemerlang! 🔥' : 'Terus Berkembang ✨'}\n\nUntuk laporan detail, masuk ke aplikasi Jom Belajar.\n\n🎓 Jom Belajar - Platform Pembelajaran Anak`;
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
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const totalChildren = Object.keys(childrenData).length;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📊</span>
            <h1 className="text-3xl font-black text-gray-800">Prestasi Anak</h1>
          </div>
          <p className="text-sm text-gray-600 ml-13">{totalChildren} anak sedang belajar dengan kami</p>
        </motion.div>

        {/* Children Summary */}
        {totalChildren === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 text-center border-2 border-amber-200 shadow-lg"
          >
            <p className="text-lg font-bold mb-2">Belum ada data</p>
            <p className="text-sm text-gray-600">
              Biarkan anak bermain permainan untuk melihat prestasi mereka di sini
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Smart Recommendations for selected child */}
            {selectedChild && (
              <SmartRecommendations 
                userEmail={user.email} 
                childName={selectedChild}
                ageGroup={ageGroup}
              />
            )}

            {/* Leaderboard Widget */}
            {selectedChild && (
              <LeaderboardWidget 
                userEmail={user.email} 
                childName={selectedChild}
                ageGroup={ageGroup}
              />
            )}

            {Object.entries(childrenData).map(([childName, games], idx) => {
              if (selectedChild) setSelectedChild(childName);
              const weakSubjects = analyzeWeakSubjects(games);
              const totalGames = games.length;
              const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
              const avgStars = (totalStars / totalGames).toFixed(1);

              return (
                <motion.div
                   key={childName}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-6 space-y-5 border-2 border-amber-200 shadow-lg"
                 >
                   {/* Child Header */}
                   <div className="flex items-start justify-between pb-4 border-b border-amber-200">
                     <div>
                       <h2 className="text-2xl font-black text-gray-800 mb-3">
                         {childName} 🌟
                       </h2>
                       <div className="flex gap-6">
                         <div className="flex items-center gap-2">
                           <span className="text-xl">🎮</span>
                           <div>
                             <p className="text-xs text-gray-600">Permainan</p>
                             <p className="font-black text-lg text-game-purple">{totalGames}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-xl">⭐</span>
                           <div>
                             <p className="text-xs text-gray-600">Rata-rata</p>
                             <p className="font-black text-lg text-game-pink">{avgStars}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                     {avgStars >= 2.5 && <Award className="w-8 h-8 text-game-yellow animate-pulse" />}
                   </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 bg-white rounded-2xl p-4 border-2 border-amber-200">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <Target className="w-4 h-4 text-game-purple" />
                      Prestasi Per Subjek
                    </h3>
                    {weakSubjects.map((subject) => {
                      const percentage = (subject.averageStars / 3) * 100;
                      const categoryEmojis = {
                        bahasa_melayu: '🇲🇾',
                        english: '🇬🇧',
                        mathematics: '🔢',
                        science: '🧪'
                      };
                      return (
                        <motion.div key={subject.category} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold flex items-center gap-2">
                              {categoryEmojis[subject.category]} {categoryLabels[subject.category] || subject.category}
                            </span>
                            <span className="text-xs font-bold text-game-purple bg-game-purple/10 px-2 py-1 rounded-full">
                              {subject.totalPlayed} games
                            </span>
                          </div>
                          <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`h-4 rounded-full font-bold text-xs flex items-center justify-end pr-2 ${
                                percentage >= 66
                                  ? 'bg-gradient-to-r from-game-green to-green-400 text-white'
                                  : percentage >= 33
                                  ? 'bg-gradient-to-r from-game-orange to-yellow-400'
                                  : 'bg-gradient-to-r from-game-red to-red-400 text-white'
                              }`}
                            >
                              {percentage > 10 && `${Math.round(percentage)}%`}
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Subject Breakdown Detailed */}
                  <div className="bg-white rounded-2xl p-4 border-2 border-amber-200">
                    <SubjectBreakdown progress={games} />
                  </div>

                  {/* Weak Subjects Alert */}
                  {weakSubjects[0]?.averageStars < 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-orange-100 rounded-2xl p-4 flex gap-3 border border-orange-200"
                    >
                      <TrendingDown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-orange-900">Subjek yang perlu ditingkatkan</p>
                        <p className="text-orange-800">
                          {categoryLabels[weakSubjects[0].category]} memerlukan latihan lebih
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Motivation */}
                  {avgStars >= 2.5 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-game-green/10 to-green-100/50 rounded-2xl p-4 flex gap-3 border border-game-green/20"
                    >
                      <Flame className="w-5 h-5 text-game-green flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-game-green">Cemerlang! 🔥</p>
                        <p className="text-game-green/80">
                          {childName} sedang dalam momentum terbaik! Teruskan momentum ini.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-game-blue/10 to-blue-100/50 rounded-2xl p-4 flex gap-3 border border-game-blue/20"
                    >
                      <Sparkles className="w-5 h-5 text-game-blue flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-game-blue">Terus Berusaha! ✨</p>
                        <p className="text-game-blue/80">
                          Setiap permainan adalah peluang untuk belajar dan berkembang.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Share & Export Buttons */}
                  <div className="pt-4 border-t border-amber-200 space-y-3">
                    <p className="text-xs font-bold text-game-purple flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Kongsi Pencapaian Luar Biasa
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => shareToWhatsApp(childName, { totalGames, avgStars })}
                        className="bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl py-3 font-bold text-sm transition-all shadow-lg"
                      >
                        💬 WhatsApp
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => shareToFacebook(childName, { totalGames, avgStars })}
                        className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-3 font-bold text-sm transition-all shadow-lg"
                      >
                        f Facebook
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => shareToTwitter(childName, { totalGames, avgStars })}
                        className="bg-gradient-to-br from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl py-3 font-bold text-sm transition-all shadow-lg"
                      >
                        𝕏 Twitter
                      </motion.button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => exportAsText(childName, { totalGames, avgStars })}
                      className="w-full bg-gradient-to-r from-game-orange to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl py-2 px-4 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Export Laporan
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