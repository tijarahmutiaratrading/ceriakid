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
 * Clean Linear/Stripe-style child profile card for parent zone.
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
      whileHover={{ y: -2 }}
      className="rounded-2xl relative overflow-hidden group transition-all bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md hover:ring-slate-300"
    >
      {/* Leader crown */}
      {isLeader && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, delay: 0.3 }}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white"
        >
          <Crown className="w-3 h-3" strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-label">Top</span>
        </motion.div>
      )}

      <div className="relative p-4 sm:p-5 flex flex-col gap-3.5">

        {/* TOP ROW: Avatar + Name + Actions */}
        <div className="flex items-start gap-3">
          {/* Avatar with status ring */}
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 -m-1 rounded-2xl ${activeToday ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white' : ''}`} />
            <div className="relative w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-slate-100 ring-1 ring-slate-200">
              <img
                src={child.avatarUrl || avatars[idx % avatars.length]}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onUploadAvatar}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-60 z-10 bg-slate-900 hover:bg-slate-800 shadow-md transition-colors"
              aria-label={`Tukar gambar ${child.name}`}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </motion.button>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-slate-900 font-black text-lg leading-tight truncate">{child.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200">
                <span className="text-xs" aria-hidden="true">{levelEmoji}</span>
                <span className="text-slate-700 text-[10px] font-bold uppercase tracking-label">{levelLabel}</span>
              </span>
              <span className="text-slate-500 text-[10px] font-semibold">{levelAge}</span>
            </div>

            {/* Activity status pill */}
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-label-tight ring-1 ${
                  activeToday
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : hasPlayed
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : 'bg-slate-50 text-slate-600 ring-slate-200'
                }`}
              >
                {activeToday ? 'Aktif Hari Ini' : hasPlayed ? 'Tidak Aktif' : 'Baru'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-20 flex flex-col gap-1.5 flex-shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              aria-label={`Edit profil ${child.name}`}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 bg-slate-50 ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
            >
              <Edit2 className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              aria-label={`Padam profil ${child.name}`}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 bg-red-50 ring-1 ring-red-200 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* HIGHLIGHT ROW: Top subject + Avg stars */}
        {hasPlayed ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 bg-slate-50 ring-1 ring-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3 h-3 text-slate-500" strokeWidth={2.5} />
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-label">Subjek Top</p>
              </div>
              {topSubject ? (
                <>
                  <p className="text-2xl leading-none" aria-hidden="true">{CATEGORY_EMOJIS[topSubject.cat] || '📚'}</p>
                  <p className="text-slate-900 font-black text-xs mt-1 truncate">{CATEGORY_LABELS[topSubject.cat] || topSubject.cat}</p>
                  <p className="text-slate-600 text-[10px] font-semibold">{topSubject.avg.toFixed(1)}⭐ purata</p>
                </>
              ) : (
                <p className="text-slate-400 text-xs">—</p>
              )}
            </div>

            <div className="rounded-xl p-3 flex flex-col justify-center bg-slate-50 ring-1 ring-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-slate-500" strokeWidth={2.5} />
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-label">Skor</p>
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-slate-900 font-black text-3xl leading-none">{avgStars}</p>
                <p className="text-amber-500 text-base font-black" aria-hidden="true">⭐</p>
              </div>
              <p className="text-slate-500 text-[10px] font-semibold mt-1">dari 3.0 maksimum</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-3 text-center bg-slate-50 ring-1 ring-slate-200">
            <p className="text-3xl mb-1" aria-hidden="true">🎯</p>
            <p className="text-slate-900 text-xs font-black">Belum mula bermain</p>
            <p className="text-slate-500 text-[10px] font-semibold mt-0.5">Mainkan game pertama untuk lihat statistik.</p>
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-xl overflow-hidden ring-1 ring-slate-200">
          {[
            { icon: Gamepad2, value: totalGames, label: 'Main' },
            { icon: Star, value: totalStars, label: 'Bintang' },
            { icon: Award, value: perfectGames, label: 'Perfect' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-2.5 text-center">
              <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" strokeWidth={2.5} />
              <p className="text-slate-900 font-black text-lg leading-none tabular-nums">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-label-tight mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Last played row */}
        {lastPlayedLabel && (
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold">
            <Calendar className="w-3 h-3" strokeWidth={2.5} />
            <span>Terakhir main: {lastPlayedLabel}</span>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOpenPerformance}
          className={`w-full rounded-xl py-2.5 font-black text-sm flex items-center justify-center gap-1.5 transition-colors text-white ${
            hasPlayed ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {hasPlayed ? (
            <>
              <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
              Lihat Prestasi Penuh
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </>
          ) : (
            <>
              <Flame className="w-4 h-4" strokeWidth={2.5} />
              Mulakan Pembelajaran
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}