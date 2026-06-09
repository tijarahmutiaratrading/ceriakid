import React from 'react';
import { motion } from 'framer-motion';
import {
  Star, Award, Gamepad2, Edit2, Trash2, Camera, Loader2,
  TrendingUp, ChevronRight, Calendar, Crown, Flame, CheckCircle2, UserCheck,
} from 'lucide-react';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { haptic } from '@/lib/haptics';

const CATEGORY_LABELS = {
  bahasa_melayu: 'BM',
  english: 'BI',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  general: 'Umum',
};
const CATEGORY_EMOJIS = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🔬',
  jawi: '✍️',
  general: '🎯',
};

export default function ChildProfileCard({
  child,
  idx,
  games = [],
  avatars,
  isLeader = false,
  uploading = false,
  onEdit,
  onDelete,
  onUploadAvatar,
  onOpenPerformance,
}) {
  const { selectedChild, setSelectedChild, childrenList = [] } = useSelectedChild() || {};
  const isActive = selectedChild?.id === child.id;
  const showSetActiveBtn = childrenList.length > 1 && !isActive;

  const handleSetActive = (e) => {
    e.stopPropagation();
    haptic('medium');
    setSelectedChild?.(child);
  };

  const totalGames = games.length;
  const totalStars = games.reduce((s, g) => s + (g.bestStars || 0), 0);
  const perfectGames = games.filter((g) => g.bestStars === 3).length;
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';

  // Top subject
  const subjectStats = {};
  games.forEach((g) => {
    if (!subjectStats[g.category]) subjectStats[g.category] = { stars: 0, count: 0 };
    subjectStats[g.category].stars += g.bestStars || 0;
    subjectStats[g.category].count += 1;
  });
  let topSubject = null;
  let topAvg = 0;
  Object.entries(subjectStats).forEach(([cat, s]) => {
    const avg = s.stars / s.count;
    if (avg > topAvg) { topAvg = avg; topSubject = { cat, avg }; }
  });

  // Activity status
  const lastPlayed = games.map((g) => g.lastPlayedDate).filter(Boolean).sort().reverse()[0];
  const lastPlayedDate = lastPlayed ? new Date(lastPlayed) : null;
  const daysSinceLastPlay = lastPlayedDate
    ? Math.floor((Date.now() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const activeToday = daysSinceLastPlay === 0;
  const hasPlayed = totalGames > 0;

  const lastPlayedLabel = lastPlayedDate
    ? daysSinceLastPlay === 0 ? 'Hari ini'
    : daysSinceLastPlay === 1 ? 'Semalam'
    : daysSinceLastPlay < 7 ? `${daysSinceLastPlay} hari lepas`
    : lastPlayedDate.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
    : null;

  const levelLabel = child.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah';
  const levelEmoji = child.ageGroup === 'prasekolah' ? '🎨' : '📚';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`bg-white rounded-3xl shadow-xl overflow-hidden border ${
        isActive ? 'border-purple-300 ring-1 ring-purple-200' : 'border-white/60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-slate-100">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${
            activeToday ? 'ring-purple-300' : 'ring-slate-200'
          } bg-slate-100`}>
            <img
              src={child.avatarUrl || avatars[idx % avatars.length]}
              alt={child.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onUploadAvatar}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 hover:bg-slate-700 flex items-center justify-center text-white disabled:opacity-60 transition-colors"
            aria-label={`Tukar gambar ${child.name}`}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-slate-900 font-black text-base truncate">{child.name}</p>
            {isLeader && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            {isActive && childrenList.length > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
              {levelEmoji} {levelLabel}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
              activeToday ? 'bg-purple-50 text-purple-700'
              : hasPlayed ? 'bg-fuchsia-50 text-fuchsia-700'
              : 'bg-slate-100 text-slate-500'
            }`}>
              {activeToday ? '🔥 Aktif' : hasPlayed ? '💤 Tidak Aktif' : '✨ Baru'}
            </span>
          </div>
          {lastPlayedLabel && (
            <div className="flex items-center gap-1 mt-1 text-slate-400 text-[10px] font-semibold">
              <Calendar className="w-3 h-3" />
              <span>Terakhir main: {lastPlayedLabel}</span>
            </div>
          )}
        </div>

        {/* Edit / Delete */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
            title="Padam"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-px bg-slate-100">
        {[
          { icon: Gamepad2, value: totalGames, label: 'Games', iconColor: 'text-purple-600' },
          { icon: Star, value: totalStars, label: 'Bintang', iconColor: 'text-fuchsia-500' },
          { icon: Award, value: perfectGames, label: 'Perfect', iconColor: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white px-3 py-3 text-center">
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.iconColor}`} strokeWidth={2.5} />
            <p className="font-black text-base text-slate-900 leading-none tabular-nums">{s.value}</p>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top subject + avg */}
      {hasPlayed && (
        <div className="grid grid-cols-2 gap-px bg-slate-100">
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Subjek Top</p>
            {topSubject ? (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{CATEGORY_EMOJIS[topSubject.cat] || '📚'}</span>
                <div>
                  <p className="font-black text-sm text-slate-900">{CATEGORY_LABELS[topSubject.cat] || topSubject.cat}</p>
                  <p className="text-purple-600 text-[10px] font-bold">{topSubject.avg.toFixed(1)}⭐ purata</p>
                </div>
              </div>
            ) : <p className="text-slate-400 text-xs">—</p>}
          </div>
          <div className="bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Purata Skor</p>
            <p className="font-black text-2xl text-slate-900 leading-none tabular-nums">{avgStars}<span className="text-sm ml-0.5 text-fuchsia-500">⭐</span></p>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">dari 3.0</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4 flex items-stretch gap-2">
        {showSetActiveBtn && (
          <button
            onClick={handleSetActive}
            className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Jadikan Aktif
          </button>
        )}
        <button
          onClick={onOpenPerformance}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          {hasPlayed ? 'Lihat Prestasi' : 'Mula Belajar'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}