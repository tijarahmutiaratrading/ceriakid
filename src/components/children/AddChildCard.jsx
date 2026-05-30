import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Clean Linear/Stripe-style "Add Child" card.
 * Becomes a "Naik Taraf" lock card when capacity is reached.
 */
export default function AddChildCard({ canAdd, onAdd, currentCount, maxCount }) {
  if (canAdd) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAdd}
        aria-label="Tambah anak baru"
        className="rounded-2xl min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 bg-white ring-2 ring-dashed ring-slate-300 hover:ring-slate-900 hover:bg-slate-50 transition-all"
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-slate-900">
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="text-slate-900 font-black text-base">Tambah Anak Baru</p>
          <p className="text-slate-500 text-xs font-semibold mt-1">Buat profil pembelajaran berasingan</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-100 ring-1 ring-slate-200">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-label">
            {currentCount}/{maxCount} digunakan
          </p>
        </div>
      </motion.button>
    );
  }

  // Locked — capacity reached
  return (
    <Link to="/" className="block">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-2xl min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 relative bg-amber-50 ring-1 ring-amber-200 transition-all"
      >
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
        </div>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-amber-500">
          <Crown className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="text-slate-900 font-black text-base">Naik Taraf untuk lagi anak</p>
          <p className="text-amber-700 text-xs font-semibold mt-1">Pelan Keluarga = sehingga 4 anak</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg font-black text-xs text-white bg-amber-600 hover:bg-amber-700 transition-colors">
          Lihat Pelan
        </div>
      </motion.div>
    </Link>
  );
}