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
import GameLoadingScreen from '@/components/game/GameLoadingScreen';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import { getSubjectArt, getSubjectAccent } from '@/lib/subjectArt';
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
      pendidikan_islam: 'Pendidikan Islam',
      pendidikan_moral: 'Pendidikan Moral',
      sejarah: 'Sejarah',
      rbt: 'Reka Bentuk & Teknologi',
      pjk: 'PJ & Kesihatan',
      seni: 'Seni Visual',
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
      pendidikan_islam: 'Islamic Education',
      pendidikan_moral: 'Moral Education',
      sejarah: 'History',
      rbt: 'Design & Technology',
      pjk: 'Physical & Health Ed',
      seni: 'Visual Arts',
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
      pendidikan_islam: '伊斯兰教育',
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
      pendidikan_islam: 'இஸ்லாமியக் கல்வி',
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
    pendidikan_islam: '🕋',
    pendidikan_moral: '🤝',
    sejarah: '📜',
    rbt: '🔧',
    pjk: '⚽',
    seni: '🎨',
    worksheet: '✏️',
    bahasa_tamil: '🇮🇳',
    bahasa_mandarin: '🇨🇳',
  };
  return emojis[category] || '📚';
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

  // Pass bucket-local index (not global). Bucket = darjah for Sekolah Rendah,
  // or the whole subject for Prasekolah. This ensures every darjah has its own
  // mix of unlocked + locked games (user Asas tak stuck kat Darjah 1-2 sahaja).
  const isGameLocked = useCallback((bucketIdx) => (
    isGameIndexLocked({ index: bucketIdx, tier: userTier, isAuthenticated })
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

  const art = getSubjectArt(category);
  const accent = getSubjectAccent(category);
  const backTo = category?.startsWith('kafa_') ? '/kafa' : '/games-subjek';
  const backLabel = category?.startsWith('kafa_') ? 'KAFA' : 'Subjek';

  return (
    <div className="min-h-screen bg-slate-950 pb-28 relative overflow-hidden font-nunito">
      {/* Latar sinematik — art subjek blur penuh skrin */}
      <div className="absolute inset-0 pointer-events-none">
        {art ? (
          <img src={art} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-30" />
        ) : (
          <div className="h-full w-full" style={{ background: `radial-gradient(80% 80% at 50% 30%, ${accent}44, transparent)` }} />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(60% 50% at 70% 30%, ${accent}33 0%, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto page-px pt-6 sm:pt-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2">
            <Gamepad2 className="w-4 h-4 text-white" />
            <span className="text-xs font-black text-white uppercase tracking-[0.25em]">Games</span>
          </div>
        </div>

        {/* Hero showcase — art Pixar 3D subjek */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl mb-6 sm:mb-8"
        >
          <div className="relative h-52 sm:h-72">
            {art ? (
              <img src={art} alt={getCategoryLabel(category, lang)} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}88, ${accent}33)` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-2.5 backdrop-blur"
                style={{ background: `${accent}55`, border: `1px solid ${accent}88` }}
              >
                {getCategoryEmoji(category)} {ageGroup === 'sekolah_rendah' ? 'Sekolah Rendah (KSSR)' : 'Prasekolah (KSPK)'}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                {getCategoryLabel(category, lang)}
              </h1>
              <p className="text-white/80 text-sm font-bold mt-1.5 drop-shadow-md">
                🎮 {games.length} {t('games', lang)} · {t('selectForPlay', lang)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Darjah Tabs - Only for Sekolah Rendah — pill glass gelap */}
        {hasDarjah && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 px-1">{t('selectDarjah', lang)}</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              {availableDarjah.map(d => {
                const active = selectedDarjah === d;
                const count = allGames.filter(g => g.darjah === d).length;
                return (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedDarjah(d)}
                    className={`flex-shrink-0 min-h-10 px-4 py-2 rounded-full font-black text-sm transition-all inline-flex items-center gap-2 ${
                      active
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/20'
                    }`}
                  >
                    {DARJAH_LABELS[d] || `Darjah ${d}`}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-slate-900/10 text-slate-700' : 'bg-white/10 text-white/60'
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
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
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
            {games.map((game, bucketIdx) => {
              // globalIdx — kekal untuk gameKey/progress tracking (jangan break old data)
              const globalIdx = allGames.findIndex((g) => g === game);
              const gameKey = `${ageGroup}-${category}-${globalIdx}`;
              const gameProgress = progress[gameKey];
              // bucketIdx — index dalam darjah/subject semasa, dipakai utk lock check
              // supaya setiap darjah ada quota unlock sendiri.
              const locked = isGameLocked(bucketIdx);
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
                    bucketIdx < 2 ? 'new' :
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