import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CREDIT_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/83f08c3af_generated_image.png';

export default function CreditBalanceWidget({ compact = false }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await base44.functions.invoke('getUserCredits', {});
      setCredits(res.data);
    } catch (e) {
      console.error('Failed to load credits:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="pro-glass rounded-2xl p-4 flex items-center justify-center gap-2 text-white/80">
        <Loader2 className="w-4 h-4 animate-spin" /> <span className="text-xs font-bold">Memuat kredit...</span>
      </div>
    );
  }

  const balance = credits?.balance ?? 0;
  const isLow = balance < 10;

  if (compact) {
    return (
      <Link to="/buy-credits" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xs shadow-md hover:shadow-lg transition-all">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{balance}</span>
        <span className="opacity-80">kredit AI</span>
      </Link>
    );
  }

  return (
    <Link to="/buy-credits" className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative h-full min-h-[180px] overflow-hidden rounded-[1.75rem] border border-white/40 bg-gradient-to-br from-amber-400/30 to-orange-400/20 p-5 shadow-lg shadow-amber-200/20 backdrop-blur-xl transform-gpu [clip-path:inset(0_round_1.75rem)] ${isLow ? 'ring-2 ring-amber-300/70' : ''}`}
      >
        <img
          src={CREDIT_BG}
          alt="Kredit AI"
          className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500"
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/85 via-orange-950/55 to-orange-900/30 z-[1]" />
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30 z-[1]" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50 ring-1 ring-white/70">
              <Sparkles className="w-6 h-6 text-amber-700" />
            </div>
            <p className="text-white/90 text-[10px] font-black uppercase tracking-widest">Baki Kredit AI</p>
            <p className="text-white text-4xl font-black leading-tight">{balance}</p>
          </div>
          <div className="flex h-11 px-3 flex-shrink-0 items-center justify-center rounded-2xl bg-white/90 text-orange-600 shadow-lg shadow-white/20 hover:bg-white transition-colors gap-1.5 font-black text-xs">
            <Plus className="w-3.5 h-3.5" /> Top Up
          </div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
            <p className="text-white/75 text-[10px] font-bold">Dibeli</p>
            <p className="text-white font-black text-sm">{credits?.totalPurchased ?? 0}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
            <p className="text-white/75 text-[10px] font-bold">Digunakan</p>
            <p className="text-white font-black text-sm">{credits?.totalUsed ?? 0}</p>
          </div>
        </div>

        {isLow ? (
          <p className="relative z-10 mt-3 text-amber-200 text-xs font-black flex items-center gap-1.5">
            ⚠️ Baki rendah — top up sekarang <ArrowRight className="w-3 h-3" />
          </p>
        ) : (
          <p className="relative z-10 mt-3 inline-flex items-center gap-1 text-xs font-black text-white">
            Tambah Kredit <ArrowRight className="h-3.5 w-3.5" />
          </p>
        )}
      </motion.div>
    </Link>
  );
}