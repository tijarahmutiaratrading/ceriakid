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
 * Playful CeriaKid child profile card — pastel candy theme.
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
  const totalGames = games.length;
  const totalStars = games.reduce((s, g) => s + (g.bestStars || 0), 0);
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
  const perfectGames = games.filter((g) => g.bestStars === 3).length;
  const hasPlayed = totalGames > 0;

  const subjectMap = {};
  games.forEach((g) => {
    if (!subjectMap[g.category]) subjectMap[g.category] = { total: 0, count: 0 };
    subjectMap[g.category].total += g.bestStars || 0;
    subjectMap[g.category].count += 1;
  });
  const topSubject = Object.entries(subjectMap)
    .map(([cat, s]) => ({ cat, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  const lastPlayed = games
    .map((g) => (g.lastPlayedDate ? new Date(g.lastPlayedDate).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  const lastPlayedLabel = lastPlayed > 0
    ? (() => {
        try { return formatDistanceToNow(new Date(lastPlayed), { addSuffix: true }); }
        catch { return 'baru-baru ini'; }
      })()
    : null;

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
      whileHover={{ y: -3 }}
      className="rounded-[2rem] relative overflow-hidden group transition-all"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      {/* Leader crown */}
      {isLeader && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, delay: 0.4 }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)', boxShadow: '0 3px 0 #eab308' }}
        >
          <Crown className="w-3 h-3 text-yellow-900" strokeWidth={3} />
          <span className="text-yellow-900 text-[9px] font-black uppercase tracking-wider">Top</span>
        </motion.div>
      )}

      <div className="relative p-4 sm:p-5 flex flex-col gap-3.5">

        {/* TOP ROW: Avatar + Name + Actions */}
        <div className="flex items-start gap-3">
          {/* Avatar with status ring */}
          <div className="relative flex-shrink-0">
            <div
              className={`absolute inset-0 -m-1 rounded-3xl ${activeToday ? 'animate-pulse' : ''}`}
              style={{
                background: activeToday
                  ? 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)'
                  : 'transparent',
              }}
            />
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 100%)', boxShadow: '0 3px 0 #f9a8d4' }}
            >
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
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-60 z-10"
              style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 2px 0 #db2777' }}
              title="Tukar gambar"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" strokeWidth={3} />}
            </motion.button>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-slate-800 font-black text-lg leading-tight truncate">{child.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: '#fef3c7', boxShadow: '0 2px 0 #fde68a' }}
              >
                <span className="text-xs">{levelEmoji}</span>
                <span className="text-slate-700 text-[10px] font-black uppercase tracking-wider">{levelLabel}</span>
              </span>
              <span className="text-slate-500 text-[10px] font-bold">{levelAge}</span>
            </div>

            {/* Activity status pill */}
            <div className="mt-1.5">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide"
                style={
                  activeToday
                    ? { background: '#dcfce7', color: '#15803d', boxShadow: '0 2px 0 #86efac' }
                    : hasPlayed
                    ? { background: '#fef3c7', color: '#a16207', boxShadow: '0 2px 0 #fde68a' }
                    : { background: '#fce7f3', color: '#be185d', boxShadow: '0 2px 0 #f9a8d4' }
                }
              >
                {activeToday ? '🔥 Aktif Hari Ini' : hasPlayed ? '💤 Tidak Aktif' : '✨ Baru'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-20 flex flex-col gap-1.5 flex-shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              aria-label={`Edit profil ${child.name}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 transition-all cursor-pointer hover:brightness-95"
              style={{ background: '#fef9f3', boxShadow: '0 2px 0 #fde68a' }}
              title="Edit"
            >
              <Edit2 className="w-4 h-4" strokeWidth={3} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              aria-label={`Padam profil ${child.name}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 transition-all cursor-pointer hover:brightness-95"
              style={{ background: '#fee2e2', boxShadow: '0 2px 0 #fca5a5' }}
              title="Padam"
            >
              <Trash2 className="w-4 h-4" strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* HIGHLIGHT ROW: Top subject + Avg stars */}
        {hasPlayed ? (
          <div className="grid grid-cols-2 gap-2">
            {/* Top subject card */}
            <div
              className="rounded-2xl p-3"
              style={{ background: '#fef3c7', boxShadow: '0 3px 0 #fcd34d' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3 h-3 text-amber-600" strokeWidth={3} />
                <p className="text-amber-700 text-[9px] font-black uppercase tracking-wider">Subjek Top</p>
              </div>
              {topSubject ? (
                <>
                  <p className="text-2xl leading-none">{CATEGORY_EMOJIS[topSubject.cat] || '📚'}</p>
                  <p className="text-slate-800 font-black text-xs mt-1 truncate">{CATEGORY_LABELS[topSubject.cat] || topSubject.cat}</p>
                  <p className="text-amber-700 text-[10px] font-bold">{topSubject.avg.toFixed(1)}⭐ purata</p>
                </>
              ) : (
                <p className="text-slate-500 text-xs">—</p>
              )}
            </div>

            {/* Score gauge */}
            <div
              className="rounded-2xl p-3 flex flex-col justify-center"
              style={{ background: '#fce7f3', boxShadow: '0 3px 0 #f9a8d4' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-pink-600" strokeWidth={3} />
                <p className="text-pink-700 text-[9px] font-black uppercase tracking-wider">Skor</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-slate-800 font-black text-3xl leading-none">{avgStars}</p>
                <p className="text-yellow-500 text-base font-black">⭐</p>
              </div>
              <p className="text-slate-500 text-[10px] font-bold mt-1">dari 3.0 maksimum</p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-3 text-center"
            style={{ background: '#fef9f3', boxShadow: '0 3px 0 #fde68a' }}
          >
            <p className="text-3xl mb-1">🎯</p>
            <p className="text-slate-800 text-xs font-black">Belum mula bermain</p>
            <p className="text-slate-500 text-[10px] font-bold mt-0.5">Mainkan game pertama untuk lihat statistik!</p>
          </div>
        )}

        {/* STATS ROW: 3 stats — bigger touch targets, clearer hierarchy */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Gamepad2, value: totalGames, label: 'Main', bg: '#dbeafe', shadow: '#93c5fd', color: '#1e40af' },
            { icon: Star, value: totalStars, label: 'Bintang', bg: '#fef3c7', shadow: '#fcd34d', color: '#a16207' },
            { icon: Award, value: perfectGames, label: 'Perfect', bg: '#dcfce7', shadow: '#86efac', color: '#15803d' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-2.5 text-center"
              style={{ background: s.bg, boxShadow: `0 3px 0 ${s.shadow}` }}
            >
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} strokeWidth={3} />
              <p className="text-slate-800 font-black text-lg leading-none tabular-nums">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Last played row */}
        {lastPlayedLabel && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
            <Calendar className="w-3 h-3" strokeWidth={3} />
            <span>Terakhir main: {lastPlayedLabel}</span>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97, y: 2 }}
          onClick={onOpenPerformance}
          className="w-full rounded-full py-3 font-black text-sm flex items-center justify-center gap-1.5 transition-all text-white"
          style={
            hasPlayed
              ? { background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }
              : { background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)', boxShadow: '0 4px 0 #8b5cf6' }
          }
        >
          {hasPlayed ? (
            <>
              <TrendingUp className="w-4 h-4" strokeWidth={3} />
              Lihat Prestasi Penuh
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" strokeWidth={3} />
              Mulakan Pembelajaran
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}