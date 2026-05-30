import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Crown, ChevronsUpDown } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import ChildSwitcherModal from '@/components/header/ChildSwitcherModal';
import { getChildAvatar } from '@/lib/childAvatars';

/**
 * Drawer header — profil + quick stats (kredit + streak) + active child switcher.
 * Theme: pastel candy gradient (match ParentDashboard).
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
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { childrenList = [], setSelectedChild } = useSelectedChild() || {};
  const handleProfileTap = () => {
    haptic('light');
    onClose?.();
  };

  return (
    <div
      className="px-4 py-4 relative overflow-hidden rounded-t-[2rem]"
      style={{
        background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 60%, #a78bfa 100%)',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
      }}
    >
      {/* Decorative orbs — kept inside boundary to avoid Safari blur clipping issues */}
      <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-20 h-20 rounded-full bg-pink-300/30 blur-2xl pointer-events-none" />

      {/* Top row: profile + close */}
      <div className="relative flex items-center gap-3 mb-4">
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

      {/* Active child switcher — tap untuk tukar anak */}
      {selectedChild && childCount > 1 && (
        <button
          type="button"
          onClick={() => { haptic('light'); setSwitcherOpen(true); }}
          aria-label={`Anak aktif: ${selectedChild.name}. Tap untuk tukar.`}
          className="relative w-full flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 shadow-md hover:bg-white active:scale-[0.98] transition-all"
        >
          <img
            src={getChildAvatar(selectedChild)}
            alt={selectedChild.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200 bg-white"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-pink-600 text-[9px] font-black uppercase tracking-wider leading-none">Anak Aktif</p>
            <p className="text-slate-800 text-xs font-black truncate leading-tight mt-0.5">{selectedChild.name}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-100">
            <span className="text-pink-600 text-[10px] font-black uppercase tracking-wider">Tukar</span>
            <ChevronsUpDown className="w-3 h-3 text-pink-600" strokeWidth={3} />
          </div>
        </button>
      )}

      <ChildSwitcherModal
        open={switcherOpen}
        children={childrenList}
        selectedChild={selectedChild}
        onSelect={setSelectedChild}
        onClose={() => setSwitcherOpen(false)}
        onAddChild={() => { setSwitcherOpen(false); onClose?.(); }}
      />

    </div>
  );
}