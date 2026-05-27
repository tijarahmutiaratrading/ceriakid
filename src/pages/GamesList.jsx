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
import GameLoadingScreen from '@/components/game/GameLoadingScreen';
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
    return <GameLoadingScreen message="Memuatkan senarai permainan..." />;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      {/* Floating orbs background — match dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24 overflow-x-hidden">

        {/* Header Card with Background Image */}
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
          {/* Animated floating emojis based on subject */}
          <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
            {(CATEGORY_ANIMATIONS[category] || ['✨', '⭐', '🎈']).map((emoji, i) => {
              const items = CATEGORY_ANIMATIONS[category] || ['✨', '⭐', '🎈'];
              const total = items.length;
              const leftPct = 8 + (i * (84 / Math.max(total - 1, 1)));
              const topPct = 15 + ((i * 37) % 65);
              const duration = 4 + (i % 3);
              const delay = (i * 0.4) % 2;
              const size = 26 + (i % 3) * 8;
              return (
                <motion.span
                  key={`${category}-${i}`}
                  className="absolute select-none drop-shadow-lg"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    fontSize: `${size}px`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                  }}
                  animate={{
                    y: [0, -14, 0, -8, 0],
                    x: [0, 6, 0, -4, 0],
                    rotate: [0, 12, -8, 6, 0],
                    scale: [1, 1.12, 1, 1.06, 1],
                  }}
                  transition={{
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {emoji}
                </motion.span>
              );
            })}
          </div>

          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 z-[2] bg-gradient-to-br from-purple-900/25 via-transparent to-pink-700/20" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 z-[2] bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <Link to={category?.startsWith('kafa_') ? '/kafa' : '/dashboard'} className="inline-flex items-center gap-2 text-white/95 text-xs font-black mb-4 drop-shadow-md">
              <ArrowLeft className="w-4 h-4" /> {category?.startsWith('kafa_') ? 'Kembali ke KAFA' : 'Kembali ke kategori'}
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                {getCategoryEmoji(category)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white leading-tight drop-shadow-lg tracking-tight">{getCategoryLabel(category, lang)}</h1>
                <p className="text-white text-sm font-bold mt-1 drop-shadow-md">🎮 {games.length} {t('games', lang)} · {t('selectForPlay', lang)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Darjah Tabs - Only for Sekolah Rendah — Apple pill style on glass */}
        {hasDarjah && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <p className="text-white text-[11px] font-black uppercase tracking-[0.18em] mb-2 px-1 drop-shadow-sm">{t('selectDarjah', lang)}</p>
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
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25 backdrop-blur-md'
                    }`}
                  >
                    {DARJAH_LABELS[d] || `Darjah ${d}`}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-slate-100 text-slate-600' : 'bg-white/25 text-white'
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
            className="rounded-3xl p-12 text-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-xl font-black text-white mb-2 tracking-tight drop-shadow-md">{t('newGamesComingSoon', lang)}</p>
            <p className="text-white/90 text-sm font-bold mb-6 drop-shadow-sm">{t('gamesBeingPrepared', lang)}</p>
            <Link to="/">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-sm shadow-lg"
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