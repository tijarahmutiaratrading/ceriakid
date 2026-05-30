import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Flame, Coins, Crown } from 'lucide-react';
import { haptic } from '@/lib/haptics';

/**
 * Drawer header — profil + quick stats (kredit + streak) + active child switcher.
 * Theme: pastel candy gradient (match ParentDashboard).
 */
export default function DrawerProfileHeader({
  user,
  avatarUrl,
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
    <div
      className="px-4 py-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 60%, #a78bfa 100%)',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-pink-300/30 blur-2xl pointer-events-none" />

      {/* Top row: profile + close */}
      <div className="relative flex items-center gap-3 mb-2.5">
        <Link
          to="/settings"
          onClick={handleProfileTap}
          className="flex-1 flex items-center gap-3 min-w-0"
        >
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/95 ring-2 ring-white flex items-center justify-center text-2xl shadow-lg">🐱</div>
            )}
            {tier && tier !== 'free' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-[10px] ring-2 ring-white shadow">
                <Crown className="w-3 h-3 text-yellow-900" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm truncate drop-shadow">
              {user?.full_name || 'User'}
            </p>
            <p className="text-white/80 text-[11px] font-bold truncate">Tap untuk tetapan</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => { haptic('light'); onClose?.(); }}
          aria-label="Tutup menu"
          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white flex-shrink-0 transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Quick stats pills */}
      <div className="relative grid grid-cols-2 gap-2">
        <Link
          to="/buy-credits"
          onClick={() => { haptic('light'); onClose?.(); }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/95 hover:bg-white shadow-md transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Coins className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-orange-600 text-[9px] font-black uppercase tracking-wider leading-none">Kredit</p>
            <p className="text-slate-800 text-sm font-black leading-tight mt-0.5">{credits ?? '—'}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/95 shadow-md">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Flame className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-pink-600 text-[9px] font-black uppercase tracking-wider leading-none">Streak</p>
            <p className="text-slate-800 text-sm font-black leading-tight mt-0.5">{streak ?? 0} hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}