import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Camera, Loader2, ChevronRight, Star, Gamepad2, TrendingUp, Crown, Flame, Award, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_EMOJIS = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🧪',
  jawi: '🕌',
  bahasa_tamil: '🌺',
  bahasa_mandarin: '🏮',
};

const CATEGORY_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  bahasa_tamil: 'Tamil',
  bahasa_mandarin: 'Mandarin',
};

/**
 * Premium child profile card — shows avatar, stats, top subject, last activity, achievements.
 */
export default function ChildProfileCard({
  child,
  idx,
  games = [],
  avatars = [],
  isLeader = false,
  uploading = false,
  onEdit,
  onDelete,
  onUploadAvatar,
  onOpenPerformance,
}) {
  // Compute stats
  const totalGames = games.length;
  const totalStars = games.reduce((s, g) => s + (g.bestStars || 0), 0);
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
  const perfectGames = games.filter((g) => g.bestStars === 3).length;
  const hasPlayed = totalGames > 0;

  // Top subject (highest avg stars)
  const subjectMap = {};
  games.forEach((g) => {
    if (!subjectMap[g.category]) subjectMap[g.category] = { total: 0, count: 0 };
    subjectMap[g.category].total += g.bestStars || 0;
    subjectMap[g.category].count += 1;
  });
  const topSubject = Object.entries(subjectMap)
    .map(([cat, s]) => ({ cat, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  // Last activity
  const lastPlayed = games
    .map((g) => (g.lastPlayedDate ? new Date(g.lastPlayedDate).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  const lastPlayedLabel = lastPlayed > 0
    ? (() => {
        try { return formatDistanceToNow(new Date(lastPlayed), { addSuffix: true }); }
        catch { return 'baru-baru ini'; }
      })()
    : null;

  // Activity status
  const today = new Date().toDateString();
  const activeToday = games.some((g) => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today);

  const isPrasekolah = child.ageGroup === 'prasekolah';
  const levelEmoji = isPrasekolah ? '🎨' : '📚';
  const levelLabel = isPrasekolah ? 'Prasekolah' : 'Sekolah Rendah';
  const levelAge = isPrasekolah ? '4–6 tahun' : '7–12 tahun';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, type: 'spring', stiffness: 220 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="rounded-3xl relative overflow-hidden group transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.65), rgba(49,16,90,0.55))',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 12px 40px -10px rgba(15,23,42,0.5)',
      }}
    >

      {/* Leader crown */}
      {isLeader && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, delay: 0.4 }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg ring-2 ring-white/30"
        >
          <Crown className="w-3 h-3 text-yellow-900" />
          <span className="text-yellow-900 text-[9px] font-black uppercase tracking-wider">Top</span>
        </motion.div>
      )}

      <div className="relative p-4 sm:p-5 flex flex-col gap-3.5">

        {/* TOP ROW: Avatar + Name + Actions */}
        <div className="flex items-start gap-3">
          {/* Avatar with status ring */}
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 -m-1 rounded-3xl ${activeToday ? 'bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 animate-pulse' : 'bg-white/15'}`} />
            <div className="relative w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner ring-2 ring-white/40 overflow-hidden">
              <img
                src={child.avatarUrl || avatars[idx % avatars.length]}
                alt={child.name}
                className="w-full h-full object-cover"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onUploadAvatar}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-lg ring-2 ring-purple-300 disabled:opacity-60 z-10"
              title="Tukar gambar"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </motion.button>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white font-black text-lg leading-tight truncate drop-shadow">{child.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur border border-white/25">
                <span className="text-xs">{levelEmoji}</span>
                <span className="text-white text-[10px] font-black uppercase tracking-wider">{levelLabel}</span>
              </span>
              <span className="text-white/70 text-[10px] font-bold">{levelAge}</span>
            </div>

            {/* Activity status pill */}
            <div className="mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                activeToday
                  ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/40'
                  : hasPlayed
                  ? 'bg-amber-400/20 text-amber-100 border border-amber-300/30'
                  : 'bg-white/10 text-white/70 border border-white/20'
              }`}>
                {activeToday ? '🔥 Aktif Hari Ini' : hasPlayed ? '💤 Tidak Aktif' : '✨ Baru'}
              </span>
            </div>
          </div>

          {/* Actions (compact) */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="w-8 h-8 bg-white/12 text-white rounded-lg flex items-center justify-center hover:bg-white/25 transition-all border border-white/20"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="w-8 h-8 bg-red-500/25 text-white rounded-lg flex items-center justify-center hover:bg-red-500/45 transition-all border border-red-300/30"
              title="Padam"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        {/* HIGHLIGHT ROW: Top subject + Avg stars (the "wow") */}
        {hasPlayed ? (
          <div className="grid grid-cols-2 gap-2">
            {/* Top subject card */}
            <div className="rounded-2xl p-3 bg-gradient-to-br from-yellow-400/20 to-orange-400/15 border border-yellow-300/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3 h-3 text-yellow-300" />
                <p className="text-yellow-200 text-[9px] font-black uppercase tracking-wider">Subjek Top</p>
              </div>
              {topSubject ? (
                <>
                  <p className="text-2xl leading-none">{CATEGORY_EMOJIS[topSubject.cat] || '📚'}</p>
                  <p className="text-white font-black text-xs mt-1 truncate">{CATEGORY_LABELS[topSubject.cat] || topSubject.cat}</p>
                  <p className="text-yellow-200 text-[10px] font-bold">{topSubject.avg.toFixed(1)}⭐ purata</p>
                </>
              ) : (
                <p className="text-white/70 text-xs">—</p>
              )}
            </div>

            {/* Score gauge */}
            <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/15 border border-purple-300/30 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-pink-300" />
                <p className="text-pink-200 text-[9px] font-black uppercase tracking-wider">Skor</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-white font-black text-3xl leading-none drop-shadow">{avgStars}</p>
                <p className="text-yellow-300 text-base font-black">⭐</p>
              </div>
              <p className="text-white/75 text-[10px] font-bold mt-1">dari 3.0 maksimum</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-3 bg-white/8 border border-white/15 text-center">
            <p className="text-3xl mb-1">🎯</p>
            <p className="text-white text-xs font-black">Belum mula bermain</p>
            <p className="text-white/70 text-[10px] font-semibold mt-0.5">Mainkan game pertama untuk lihat statistik!</p>
          </div>
        )}

        {/* STATS ROW: 3 stats — compact */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-xl p-2 text-center bg-white/8 border border-white/15">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-300 mx-auto mb-0.5" />
            <p className="text-white font-black text-base leading-none">{totalGames}</p>
            <p className="text-white/65 text-[9px] font-bold uppercase tracking-wider mt-0.5">Main</p>
          </div>
          <div className="rounded-xl p-2 text-center bg-white/8 border border-white/15">
            <Star className="w-3.5 h-3.5 text-yellow-300 mx-auto mb-0.5 fill-yellow-300" />
            <p className="text-white font-black text-base leading-none">{totalStars}</p>
            <p className="text-white/65 text-[9px] font-bold uppercase tracking-wider mt-0.5">Bintang</p>
          </div>
          <div className="rounded-xl p-2 text-center bg-white/8 border border-white/15">
            <Award className="w-3.5 h-3.5 text-emerald-300 mx-auto mb-0.5" />
            <p className="text-white font-black text-base leading-none">{perfectGames}</p>
            <p className="text-white/65 text-[9px] font-bold uppercase tracking-wider mt-0.5">Perfect</p>
          </div>
        </div>

        {/* Last played row */}
        {lastPlayedLabel && (
          <div className="flex items-center gap-1.5 text-white/65 text-[10px] font-semibold">
            <Calendar className="w-3 h-3" />
            <span>Terakhir main: {lastPlayedLabel}</span>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOpenPerformance}
          className={`w-full rounded-2xl py-3 font-black text-sm flex items-center justify-center gap-1.5 transition-all shadow-lg ${
            hasPlayed
              ? 'bg-gradient-to-r from-white to-pink-50 text-purple-700 hover:shadow-xl'
              : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
          }`}
        >
          {hasPlayed ? (
            <>
              <TrendingUp className="w-4 h-4" />
              Lihat Prestasi Penuh
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" />
              Mulakan Pembelajaran
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}