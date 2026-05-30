import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Playful CeriaKid "Add Child" card — pastel candy theme match ParentDashboard.
 * Becomes a "Naik Taraf" lock card when capacity is reached.
 */
export default function AddChildCard({ canAdd, onAdd, currentCount, maxCount }) {
  if (canAdd) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98, y: 2 }}
        onClick={onAdd}
        className="rounded-[2rem] min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 relative group transition-all"
        style={{
          background: 'linear-gradient(135deg, #fef9f3 0%, #fce7f3 100%)',
          border: '3px dashed #f9a8d4',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 5px 0 #db2777, 0 8px 20px rgba(236, 72, 153, 0.3)' }}
        >
          <Plus className="w-8 h-8 text-white" strokeWidth={3} />
        </motion.div>
        <div className="text-center">
          <p className="text-slate-800 font-black text-base">Tambah Anak Baru 💕</p>
          <p className="text-slate-500 text-xs font-bold mt-1">Buat profil pembelajaran berasingan</p>
        </div>
        <div
          className="px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 0 #fde68a' }}
        >
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-wider">
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
        whileTap={{ scale: 0.98, y: 2 }}
        className="rounded-[2rem] min-h-[280px] flex flex-col items-center justify-center gap-3 p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
          boxShadow: '0 8px 20px rgba(251, 191, 36, 0.25), 0 0 0 2px rgba(251, 191, 36, 0.4)',
        }}
      >
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-amber-600" strokeWidth={3} />
        </div>
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)', boxShadow: '0 5px 0 #eab308, 0 8px 20px rgba(234, 179, 8, 0.3)' }}
        >
          <Crown className="w-8 h-8 text-yellow-900" strokeWidth={3} />
        </motion.div>
        <div className="text-center">
          <p className="text-slate-800 font-black text-base">Naik Taraf untuk lagi anak</p>
          <p className="text-amber-700 text-xs font-bold mt-1">Pelan Keluarga = sehingga 4 anak</p>
        </div>
        <div
          className="px-4 py-2 rounded-full font-black text-xs text-yellow-900"
          style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)', boxShadow: '0 3px 0 #eab308' }}
        >
          👑 Lihat Pelan
        </div>
      </motion.div>
    </Link>
  );
}