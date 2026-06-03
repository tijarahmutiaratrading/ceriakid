import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Crown, Star, Sprout } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const STORAGE_KEY = '__tier_preview_override';

const TIERS = [
  { id: 'asas',     label: 'Asas',     icon: Sprout, color: 'from-emerald-500 to-teal-500',  desc: '10/bucket' },
  { id: 'standard', label: 'Standard', icon: Star,   color: 'from-blue-500 to-indigo-500',   desc: '20/bucket' },
  { id: 'keluarga', label: 'Keluarga', icon: Crown,  color: 'from-amber-500 to-orange-500',  desc: 'Unlimited' },
];

// Floating admin-only widget to simulate a subscription tier without touching DB.
// Sets localStorage + window flag → getActiveTier() in lib/tierAccess.js reads it.
export default function TierPreviewSwitcher() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  // Enable global flag + read current override on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__ceriakid_admin_preview_enabled = user?.role === 'admin';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) setCurrent(v);
    } catch { /* ignore */ }
  }, [user?.role]);

  // Don't render for non-admins
  if (user?.role !== 'admin') return null;

  const setTier = (tier) => {
    try {
      localStorage.setItem(STORAGE_KEY, tier);
      setCurrent(tier);
      // Hard reload so all tier-dependent queries re-run with new value
      window.location.reload();
    } catch (e) {
      console.error('Failed to set tier preview:', e);
    }
  };

  const clearTier = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setCurrent(null);
      window.location.reload();
    } catch { /* ignore */ }
  };

  const currentTier = TIERS.find((t) => t.id === current);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto mb-3 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-amber-300 tracking-wide">ADMIN PREVIEW</p>
                <p className="text-sm font-black">Simulate Tier</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {TIERS.map((t) => {
                const Icon = t.icon;
                const active = current === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      active
                        ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                        : 'bg-white/5 hover:bg-white/10 text-white/90'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm leading-tight">{t.label}</p>
                      <p className="text-[11px] opacity-80 leading-tight">{t.desc}</p>
                    </div>
                    {active && <span className="text-xs font-black">✓ AKTIF</span>}
                  </button>
                );
              })}
            </div>

            {current && (
              <button
                onClick={clearTier}
                className="w-full mt-3 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-colors"
              >
                🔄 Reset (Guna Subscription Sebenar)
              </button>
            )}

            <p className="text-[10px] text-white/40 mt-3 leading-snug">
              Override ini tidak ubah DB. Hanya untuk preview UI. Page akan reload bila tukar.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-black text-sm transition-all ${
          currentTier
            ? `bg-gradient-to-r ${currentTier.color} text-white`
            : 'bg-slate-900 text-amber-300 border border-amber-400/40'
        }`}
        title="Admin Tier Preview"
      >
        <Eye className="w-4 h-4" />
        <span>{currentTier ? `Preview: ${currentTier.label}` : 'Preview Tier'}</span>
      </motion.button>
    </div>
  );
}