import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory } from '@/lib/gameLibrary';
import GameLoadingScreen from '@/components/game/GameLoadingScreen';
import CinematicShowcase from '@/components/hub/CinematicShowcase';
import CinematicRail from '@/components/hub/CinematicRail';
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
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();

  // Reset pilihan bila tukar darjah/kategori
  useEffect(() => {
    setSelectedIdx(0);
  }, [selectedDarjah, category, ageGroup]);

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

        {/* Showcase + rail gaya PS5 */}
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
        ) : (() => {
          // Bina item rail — kekalkan globalIdx untuk progress & route, bucketIdx untuk lock
          const items = games.map((game, bucketIdx) => {
            const globalIdx = allGames.findIndex((g) => g === game);
            const gameKey = `${ageGroup}-${category}-${globalIdx}`;
            const gameProgress = progress[gameKey];
            const locked = isGameLocked(bucketIdx);
            const stars = gameProgress?.bestStars || 0;
            return {
              key: game.id || `game-${globalIdx}`,
              title: game.title,
              desc: game.description,
              emoji: game.emoji || '🎮',
              art: game.iconUrl || art,
              accent,
              badge: locked ? '🔒 Premium' : getCategoryLabel(category, lang),
              metaChips: [
                `❓ ${game.totalQuestions || 8} soalan`,
                gameProgress ? `⭐ ${stars}/3 bintang` : '✨ Belum dimainkan',
                ...(game.darjah ? [`🎓 ${DARJAH_LABELS[game.darjah] || ''}`] : []),
              ],
              locked,
              globalIdx,
            };
          });
          const safeIdx = Math.min(selectedIdx, items.length - 1);
          const item = items[safeIdx];
          const handlePlay = () => {
            if (item.locked) navigate('/settings');
            else navigate(`/play/${category}/${item.globalIdx}`);
          };
          return (
            <>
              <CinematicShowcase
                item={item}
                playLabel={item.locked ? '🔒 Buka dengan Langganan' : 'Main Sekarang'}
                onPlay={handlePlay}
              />
              <div className="mt-8 sm:mt-12">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
                  Pilih Game · {safeIdx + 1}/{items.length}
                </p>
                <CinematicRail items={items} selected={safeIdx} onSelect={setSelectedIdx} onActivate={handlePlay} />
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}