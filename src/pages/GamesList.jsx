import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory } from '@/lib/gameLibrary';
import GameListCard from '@/components/game/GameListCard';
import AppHeader from '@/components/AppHeader';
import { useSelectedChild } from '@/lib/SelectedChildContext';

const getCategoryLabel = (category, lang) => {
  const labels = {
    bm: {
      bahasa_melayu: 'Bahasa Melayu',
      english: 'English',
      mathematics: 'Matematik',
      science: 'Sains',
      jawi: 'Aksara Jawi',
      worksheet: 'Worksheet & Tracing',
      bahasa_tamil: 'Bahasa Tamil',
      bahasa_mandarin: 'Bahasa Mandarin',
    },
    en: {
      bahasa_melayu: 'Bahasa Melayu',
      english: 'English',
      mathematics: 'Mathematics',
      science: 'Science',
      jawi: 'Jawi',
      worksheet: 'Worksheet & Tracing',
      bahasa_tamil: 'Tamil Language',
      bahasa_mandarin: 'Mandarin Language',
    },
    zh: {
      bahasa_melayu: '马来语',
      english: '英文',
      mathematics: '数学',
      science: '科学',
      jawi: '爪夷文',
      worksheet: '工作表和追踪',
      bahasa_tamil: '泰米尔语',
      bahasa_mandarin: '汉语',
    },
    ta: {
      bahasa_melayu: 'மலாய் மொழி',
      english: 'ஆங்கிலம்',
      mathematics: 'கணிதம்',
      science: 'அறிவியல்',
      jawi: 'ஜாவி',
      worksheet: 'பணிப்புத்தகம் மற்றும் ട്രേസ്',
      bahasa_tamil: 'தமிழ் மொழி',
      bahasa_mandarin: 'மாண்டரின் மொழி',
    }
  };
  return labels[lang]?.[category] || labels.bm[category] || category;
};

const getCategoryEmoji = (category) => {
  const emojis = {
    bahasa_melayu: '🇲🇾',
    english: '🇬🇧',
    mathematics: '🔢',
    science: '🧪',
    jawi: '🕌',
    worksheet: '✏️',
  };
  return emojis[category] || '📚';
};

const DARJAH_LABELS = {
  1: 'Darjah 1',
  2: 'Darjah 2',
  3: 'Darjah 3',
  4: 'Darjah 4',
  5: 'Darjah 5',
  6: 'Darjah 6',
};

export default function GamesList() {
  const { category } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { ageGroup } = useAgeGroup();
  const { lang } = useLang();
  const { selectedChild } = useSelectedChild();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [selectedDarjah, setSelectedDarjah] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [allGames, setAllGames] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserTier();
    }
    if (ageGroup && category) {
      loadGamesData();
    }
  }, [user, ageGroup, category]);

  const loadUserTier = async () => {
    try {
      const subs = await base44.entities.UserSubscription.filter({ email: user.email });
      if (subs.length > 0) {
        const sub = subs[0];
        const isExpired = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date();
        if ((sub.status === 'active' || sub.status === 'trial') && !isExpired) {
          setUserTier(sub.tier || 'free');
        }
        // If trial expired, keep as free
        if (sub.status === 'trial' && isExpired) {
          setUserTier('free');
        }
      }
    } catch (e) {
      // default free
    }
  };

  const loadGamesData = async () => {
    try {
      const dbGames = await base44.entities.Game.filter({ ageGroup, category, isPublished: true });
      if (dbGames.length > 0) {
        setAllGames(dbGames.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        setAllGames(getGamesByAgeAndCategory(ageGroup, category));
      }
    } catch (err) {
      console.error('Failed to load games from DB:', err);
      setAllGames(getGamesByAgeAndCategory(ageGroup, category));
    } finally {
      setLoading(false);
    }
  };

  // Determine if a game index is accessible based on tier + ageGroup rules
  const isGameLocked = useCallback((globalIdx) => {
    if (!isAuthenticated) return globalIdx >= 5; // guests: first 5 only

    // Trial tier — AKSES PENUH SEMUA GAMES
    if (userTier === 'trial') return false;

    // Tier: keluarga — akses penuh semua peringkat
    if (userTier === 'keluarga') return false;

    // Tier: standard — Sekolah Rendah sahaja
    if (userTier === 'standard') {
      if (ageGroup === 'prasekolah') return true; // blocked for prasekolah
      return false; // full access for sekolah rendah
    }

    // Tier: asas — Prasekolah sahaja
    if (userTier === 'asas') {
      if (ageGroup === 'sekolah_rendah') return true; // blocked for sekolah rendah
      return false; // full access for prasekolah
    }

    // Legacy tiers
    if (userTier === 'pro') return false;
    if (userTier === 'premium') return globalIdx >= 100;

    return globalIdx >= 5; // free
  }, [isAuthenticated, userTier, ageGroup]);

  // Poll for game updates every 60 seconds (reduced from 10s)
  useEffect(() => {
    const interval = setInterval(loadGamesData, 60000);
    return () => clearInterval(interval);
  }, [ageGroup, category]);

  // Check if games have darjah field (sekolah rendah)
  const hasDarjah = ageGroup === 'sekolah_rendah' && allGames.some(g => g.darjah);

  // Get available darjah levels
  const availableDarjah = hasDarjah
    ? [...new Set(allGames.map(g => g.darjah).filter(Boolean))].sort()
    : [];

  // Set default darjah on first load
  useEffect(() => {
    if (hasDarjah && availableDarjah.length > 0 && selectedDarjah === null) {
      setSelectedDarjah(availableDarjah[0]);
    } else if (!hasDarjah) {
      setSelectedDarjah(null);
    }
  }, [hasDarjah, ageGroup, category]);

  // Filter games by darjah
  const games = hasDarjah && selectedDarjah !== null
    ? allGames.filter(g => g.darjah === selectedDarjah)
    : allGames;

  useEffect(() => {
    if (user && category) {
      loadProgress();
    }
  }, [user, category, selectedChild]);

  const loadProgress = async () => {
    try {
      const childName = selectedChild?.name || user.full_name || 'Default';
      const progressData = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
        childName,
      });
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.gameType] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎓</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
            {getCategoryEmoji(category)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{getCategoryLabel(category, lang)}</h1>
            <p className="text-white/70 text-xs font-semibold mt-0.5">🎮 {games.length} {t('games', lang)} · {t('selectForPlay', lang)}</p>
          </div>
        </motion.div>

        {/* Darjah Tabs - Only for Sekolah Rendah */}
        {hasDarjah && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2 px-1">{t('selectDarjah', lang)}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableDarjah.map(d => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedDarjah(d)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
                    selectedDarjah === d
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white border border-white/30'
                  }`}
                >
                  {DARJAH_LABELS[d] || `Darjah ${d}`}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    selectedDarjah === d ? 'bg-purple-100 text-purple-600' : 'bg-white/20 text-white/80'
                  }`}>
                    {allGames.filter(g => g.darjah === d).length}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tier restriction banner */}
        {((userTier === 'standard' && ageGroup === 'prasekolah') || (userTier === 'asas' && ageGroup === 'sekolah_rendah')) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,200,0,0.4)' }}
          >
            <p className="text-white font-black text-sm mb-1">🔒 Pelan Anda Tidak Merangkumi Ini</p>
            <p className="text-white/80 text-xs mb-3">
              {userTier === 'standard'
                ? 'Pelan Standard hanya untuk Sekolah Rendah. Naik taraf ke Keluarga untuk akses Prasekolah juga!'
                : 'Pelan Asas hanya untuk Prasekolah. Naik taraf ke Keluarga untuk akses Sekolah Rendah juga!'}
            </p>
            <Link to="/">
              <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white text-purple-600 rounded-full font-black text-xs shadow-lg">
                👑 Naik Taraf ke Keluarga →
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-xl font-black text-white mb-2">{t('newGamesComingSoon', lang)}</p>
            <p className="text-white/70 text-sm mb-6">{t('gamesBeingPrepared', lang)}</p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg"
              >
                ← {t('backToHome', lang)}
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {games.map((game, i) => {
              const globalIdx = allGames.findIndex((g) => g === game);
              const gameKey = `${ageGroup}-${category}-${globalIdx}`;
              const gameProgress = progress[gameKey];
              const locked = isGameLocked(globalIdx);
              return (
                <GameListCard
                  key={`game-${globalIdx}`}
                  game={game}
                  gameKey={gameKey}
                  gameProgress={gameProgress}
                  idx={globalIdx}
                  category={category}
                  locked={locked}
                  badge={
                    locked ? 'locked' :
                    globalIdx < 2 ? 'new' :
                    gameProgress && gameProgress.bestStars < 2 ? 'recommended' :
                    null
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}