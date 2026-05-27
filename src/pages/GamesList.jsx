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

const KAFA_LABELS = {
  kafa_quran: 'KAFA · Al-Quran & Hafazan',
  kafa_jawi: 'KAFA · Jawi & Khat',
  kafa_akidah: 'KAFA · Akidah',
  kafa_ibadah: 'KAFA · Ibadah & Fekah',
  kafa_sirah: 'KAFA · Sirah Nabawiyah',
  kafa_adab: 'KAFA · Adab & Akhlak',
  kafa_bahasa_arab: 'KAFA · Bahasa Arab',
};
const KAFA_EMOJIS = {
  kafa_quran: '📖',
  kafa_jawi: '✍️',
  kafa_akidah: '☪️',
  kafa_ibadah: '🕌',
  kafa_sirah: '🌙',
  kafa_adab: '🤲',
  kafa_bahasa_arab: '🔤',
};

const getCategoryLabel = (category, lang) => {
  if (KAFA_LABELS[category]) return KAFA_LABELS[category];
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
  if (KAFA_EMOJIS[category]) return KAFA_EMOJIS[category];
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

// Animated emojis per subject — cartoon-style mascots/items that float around the background
const CATEGORY_ANIMATIONS = {
  bahasa_melayu: ['📖', '✍️', '🇲🇾', '📝', '🎭', '💬'],
  english: ['📚', '🔤', '🇬🇧', '✏️', '🗣️', '📖'],
  mathematics: ['🔢', '➕', '➖', '✖️', '➗', '📐', '🧮'],
  science: ['🧪', '⚗️', '🔬', '🧫', '🔭', '🧬', '⚛️'],
  jawi: ['🕌', '📜', '🌙', '⭐', '📿'],
  worksheet: ['✏️', '📝', '📋', '✂️', '📎', '🖍️'],
  bahasa_tamil: ['📖', '✍️', '🇮🇳', '🪷', '🎭'],
  bahasa_mandarin: ['📖', '🏮', '🇨🇳', '🐉', '🧧'],
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
      <div className="min-h-screen flex items-center justify-center font-nunito bg-gradient-to-b from-[#f5f5f7] via-[#fafafa] to-white">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-3">🎓</div>
          <div className="w-7 h-7 border-[3px] border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative text-slate-900"
      style={{ background: 'linear-gradient(180deg, #f5f5f7 0%, #fafafa 40%, #ffffff 100%)' }}
    >
      {/* Subtle Apple-style ambient color blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #bae6fd 0%, transparent 70%)' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-24 md:pt-28 overflow-x-hidden">

        {/* Back link */}
        <Link
          to={category?.startsWith('kafa_') ? '/kafa' : '/dashboard'}
          className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> {category?.startsWith('kafa_') ? 'Kembali ke KAFA' : 'Kembali ke kategori'}
        </Link>

        {/* Header — clean Apple style */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Subjek</p>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white ring-1 ring-black/5 shadow-sm flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                {getCategoryEmoji(category)}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-black leading-[1.05] tracking-tight text-slate-900 truncate">
                  {getCategoryLabel(category, lang)}
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1.5">
                  {games.length} {t('games', lang)} · {t('selectForPlay', lang)}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Darjah Tabs - Only for Sekolah Rendah */}
        {hasDarjah && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-2 px-1">{t('selectDarjah', lang)}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {availableDarjah.map(d => {
                const active = selectedDarjah === d;
                const count = allGames.filter(g => g.darjah === d).length;
                return (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedDarjah(d)}
                    className={`flex-shrink-0 min-h-10 px-4 py-2 rounded-full font-semibold text-sm transition-all inline-flex items-center gap-2 ${
                      active
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50'
                    }`}
                  >
                    {DARJAH_LABELS[d] || `Darjah ${d}`}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-12 text-center bg-white ring-1 ring-black/5"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(15,23,42,0.06)' }}
          >
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{t('newGamesComingSoon', lang)}</p>
            <p className="text-slate-500 text-sm font-medium mb-6">{t('gamesBeingPrepared', lang)}</p>
            <Link to="/">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold text-sm shadow-sm"
              >
                ← {t('backToHome', lang)}
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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