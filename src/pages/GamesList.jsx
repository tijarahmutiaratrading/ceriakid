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
import { ArrowLeft } from 'lucide-react';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

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
    bahasa_tamil: '🇮🇳',
    bahasa_mandarin: '🇨🇳',
  };
  return emojis[category] || '📚';
};

const CATEGORY_BG_IMAGES = {
  bahasa_melayu: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a82b01ff6_generated_image.png',
  english: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8ffcc1bb9_generated_image.png',
  mathematics: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b948e01dd_generated_image.png',
  science: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6f0853b3a_generated_image.png',
  jawi: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/110e1698a_generated_image.png',
  worksheet: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5e14e4531_generated_image.png',
  bahasa_tamil: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1dac8b0f4_generated_image.png',
  bahasa_mandarin: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/477e24964_generated_image.png',
};

const DARJAH_ORDER = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];

const DARJAH_LABELS = {
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
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
        setUserTier(getActiveTier(subs[0]));
      }
    } catch (e) {
      // default free
    }
  };

  const loadGamesData = async () => {
    try {
      const dbGames = await base44.entities.Game.filter({ ageGroup, category, isPublished: true });
      if (dbGames.length > 0) {
      setAllGames(dbGames.sort((a, b) => {
        const da = DARJAH_ORDER.indexOf(a.darjah);
        const db = DARJAH_ORDER.indexOf(b.darjah);
        if (da !== db) return (da === -1 ? 99 : da) - (db === -1 ? 99 : db);
        return (a.order || 0) - (b.order || 0);
      }));
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

  const isGameLocked = useCallback((globalIdx) => (
    isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated })
  ), [isAuthenticated, userTier]);

  // Poll for game updates every 60 seconds (reduced from 10s)
  useEffect(() => {
    const interval = setInterval(loadGamesData, 60000);
    return () => clearInterval(interval);
  }, [ageGroup, category]);

  // Sekolah Rendah is always divided by Darjah 1-6
  const hasDarjah = ageGroup === 'sekolah_rendah';

  // Always show all Darjah tabs so subjects don't get mixed together
  const availableDarjah = hasDarjah ? DARJAH_ORDER : [];

  // Set default darjah on first load
  useEffect(() => {
    if (hasDarjah && selectedDarjah === null) {
      setSelectedDarjah('darjah_1');
    } else if (!hasDarjah) {
      setSelectedDarjah(null);
    }
  }, [hasDarjah, ageGroup, category, selectedDarjah]);

  // Filter games by selected Darjah for Sekolah Rendah
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
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative isolate overflow-hidden mb-5 p-5 rounded-3xl shadow-2xl border border-white/30 transform-gpu [clip-path:inset(0_round_1.5rem)] min-h-[180px]"
        >
          {/* Background image */}
          {CATEGORY_BG_IMAGES[category] && (
            <img
              src={CATEGORY_BG_IMAGES[category]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-br from-purple-900/70 via-purple-800/55 to-pink-700/65" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 z-[1] bg-gradient-to-t from-black/55 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/95 text-xs font-black mb-4 drop-shadow-md">
              <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                {getCategoryEmoji(category)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{getCategoryLabel(category, lang)}</h1>
                <p className="text-white text-sm font-bold mt-1 drop-shadow-md">🎮 {games.length} {t('games', lang)} · {t('selectForPlay', lang)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Darjah Tabs - Only for Sekolah Rendah */}
        {hasDarjah && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-white text-xs font-black uppercase tracking-wider mb-2 px-1">{t('selectDarjah', lang)}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {availableDarjah.map(d => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedDarjah(d)}
                  className={`flex-shrink-0 min-h-11 px-4 py-2.5 rounded-2xl font-black text-sm transition-all ${
                    selectedDarjah === d
                      ? 'bg-white text-purple-700 shadow-lg ring-2 ring-white/60'
                      : 'bg-white/20 text-white border border-white/40 shadow-md backdrop-blur-xl'
                  }`}
                >
                  {DARJAH_LABELS[d] || `Darjah ${d}`}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-black ${
                    selectedDarjah === d ? 'bg-purple-100 text-purple-700' : 'bg-white text-purple-900'
                  }`}>
                    {allGames.filter(g => g.darjah === d).length}
                  </span>
                </motion.button>
              ))}
            </div>
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
            <p className="text-white/90 text-sm font-bold mb-6">{t('gamesBeingPrepared', lang)}</p>
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
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {games.map((game) => {
              const globalIdx = allGames.findIndex((g) => g === game);
              const gameKey = `${ageGroup}-${category}-${globalIdx}`;
              const gameProgress = progress[gameKey];
              const locked = isGameLocked(globalIdx);
              return (
                <GameListCard
                  key={game.id || `game-${globalIdx}`}
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