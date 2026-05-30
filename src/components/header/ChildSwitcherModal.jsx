import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Users } from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { getChildAvatar } from '@/lib/childAvatars';

/**
 * Modal pilih anak aktif — slide up dari bawah, list semua anak.
 * Tap nama anak → setSelectedChild + close.
 */
export default function ChildSwitcherModal({
  open,
  children = [],
  selectedChild,
  onSelect,
  onClose,
  onAddChild,
}) {
  if (!open) return null;

  const handlePick = (child) => {
    haptic('medium');
    onSelect?.(child);
    onClose?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Pilih anak aktif"
          className="w-full max-w-md rounded-[2rem] overflow-hidden"
          style={{
            background: 'linear-gradient(165deg, #ffffff 0%, #fef9f3 100%)',
            boxShadow: '0 25px 60px -10px rgba(168, 85, 247, 0.5)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)' }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-yellow-300/30 blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-pink-600" strokeWidth={3} />
              </div>
              <div>
                <p className="text-white/85 text-[10px] font-black uppercase tracking-wider leading-none">Tukar Anak</p>
                <p className="text-white text-base font-black leading-tight mt-1 drop-shadow">Pilih Anak Aktif</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="relative p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          {/* Children list */}
          <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2">
            {children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-5xl mb-2" aria-hidden="true">👶</p>
                <p className="text-slate-700 font-black text-sm">Belum ada anak terdaftar</p>
                <p className="text-slate-500 text-xs font-bold mt-1">Tambah anak pertama anda</p>
              </div>
            ) : (
              children.map((child) => {
                const isActive = selectedChild?.id === child.id;
                const levelEmoji = child.ageGroup === 'prasekolah' ? '🎨' : '📚';
                const levelLabel = child.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah';

                return (
                  <motion.button
                    key={child.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePick(child)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      isActive ? 'shadow-lg' : 'hover:brightness-95'
                    }`}
                    style={
                      isActive
                        ? { background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)', boxShadow: '0 4px 14px rgba(192, 132, 252, 0.4)' }
                        : { background: '#fff', boxShadow: '0 2px 0 #fde68a' }
                    }
                  >
                    <img
                      src={getChildAvatar(child)}
                      alt={child.name}
                      loading="lazy"
                      className={`w-12 h-12 rounded-2xl object-cover flex-shrink-0 ring-2 bg-white ${isActive ? 'ring-white' : 'ring-pink-100'}`}
                    />

                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-black text-sm truncate ${isActive ? 'text-white drop-shadow' : 'text-slate-800'}`}>
                        {child.name}
                      </p>
                      <p className={`text-[11px] font-bold truncate ${isActive ? 'text-white/85' : 'text-slate-500'}`}>
                        {levelEmoji} {levelLabel}
                      </p>
                    </div>

                    {isActive && (
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow">
                        <Check className="w-4 h-4 text-pink-600" strokeWidth={4} />
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}

            {/* Add child link */}
            <Link
              to="/children-profiles"
              onClick={() => { haptic('light'); onAddChild?.(); }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-pink-500" strokeWidth={3} />
              </div>
              <div className="text-left">
                <p className="text-slate-700 font-black text-sm">Urus Anak</p>
                <p className="text-slate-500 text-[11px] font-bold">Tambah / edit / padam</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}