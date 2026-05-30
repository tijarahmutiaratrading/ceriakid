import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ChevronRight, Flame, Coins } from 'lucide-react';
import { haptic } from '@/lib/haptics';

/**
 * Drawer header — profil user + quick stats (kredit + streak) + active child.
 * Tap profile area = navigate ke /settings (close drawer).
 */
export default function DrawerProfileHeader({
  user,
  avatarUrl,
  selectedChild,
  childCount,
  credits,
  streak,
  tier,
  onClose,
}) {
  const handleProfileTap = () => {
    haptic('light');
    onClose?.();
  };

  return (
    <div className="px-4 py-4 border-b border-white/10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      {/* Top row: profile + close */}
      <div className="flex items-center gap-3 mb-3">
        <Link
          to="/settings"
          onClick={handleProfileTap}
          className="flex-1 flex items-center gap-3 min-w-0 group"
        >
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white/60" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/40 border-2 border-white/60 flex items-center justify-center text-2xl">🐱</div>
            )}
            {tier && tier !== 'free' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-[10px] border-2 border-slate-800">
                👑
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm truncate group-hover:text-yellow-200 transition-colors">
              {user?.full_name || 'User'}
            </p>
            <p className="text-white/60 text-[11px] truncate">Tap untuk tetapan</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => { haptic('light'); onClose?.(); }}
          aria-label="Tutup menu"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active child indicator */}
      {selectedChild && childCount > 1 && (
        <Link
          to="/children-profiles"
          onClick={() => { haptic('light'); onClose?.(); }}
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
        >
          {selectedChild.avatarUrl ? (
            <img src={selectedChild.avatarUrl} alt={selectedChild.name} className="w-7 h-7 rounded-full object-cover border border-white/40" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-pink-400/40 flex items-center justify-center text-sm">
              {selectedChild.ageGroup === 'prasekolah' ? '🎨' : '📚'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-[9px] font-black uppercase tracking-wider leading-none">Anak Aktif</p>
            <p className="text-white text-xs font-black truncate leading-tight mt-0.5">{selectedChild.name}</p>
          </div>
          <span className="text-white/50 text-[10px] font-bold">Tukar</span>
        </Link>
      )}

      {/* Quick stats pills */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/buy-credits"
          onClick={() => { haptic('light'); onClose?.(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 hover:from-amber-400/30 hover:to-orange-400/30 border border-amber-300/30 transition-all"
        >
          <Coins className="w-4 h-4 text-amber-300 flex-shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-amber-200/70 text-[9px] font-black uppercase tracking-wider leading-none">Kredit</p>
            <p className="text-white text-xs font-black leading-tight mt-0.5">{credits ?? '—'}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-rose-400/20 to-pink-400/20 border border-rose-300/30">
          <Flame className="w-4 h-4 text-rose-300 flex-shrink-0" strokeWidth={2.5} />
          <div className="min-w-0">
            <p className="text-rose-200/70 text-[9px] font-black uppercase tracking-wider leading-none">Streak</p>
            <p className="text-white text-xs font-black leading-tight mt-0.5">{streak ?? 0} hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}