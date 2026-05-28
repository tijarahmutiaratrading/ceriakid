import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Dashed "Add Child" card — sits inside the grid alongside profile cards.
 * Becomes a "Naik Taraf" lock card when capacity is reached.
 */
export default function AddChildCard({ canAdd, onAdd, currentCount, maxCount }) {
  if (canAdd) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAdd}
        className="rounded-3xl min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 relative group transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(14px)',
          border: '2px dashed rgba(255,255,255,0.35)',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all"
        >
          <Plus className="w-8 h-8 text-white" />
        </motion.div>
        <div className="text-center">
          <p className="text-white font-black text-base drop-shadow">Tambah Anak Baru</p>
          <p className="text-white/70 text-xs font-semibold mt-1">Buat profil pembelajaran berasingan</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
          <p className="text-white text-[10px] font-black uppercase tracking-wider">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="rounded-3xl min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,113,133,0.12))',
          backdropFilter: 'blur(14px)',
          border: '2px solid rgba(251,191,36,0.4)',
        }}
      >
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-yellow-200/60" />
        </div>
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl"
        >
          <Crown className="w-8 h-8 text-yellow-900" />
        </motion.div>
        <div className="text-center">
          <p className="text-white font-black text-base drop-shadow">Naik Taraf untuk lagi anak</p>
          <p className="text-yellow-100 text-xs font-semibold mt-1">Pelan Keluarga = sehingga 5 anak</p>
        </div>
        <div className="px-4 py-2 rounded-full bg-yellow-400 text-yellow-900 font-black text-xs shadow-lg">
          👑 Lihat Pelan
        </div>
      </motion.div>
    </Link>
  );
}