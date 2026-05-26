import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CreditBalanceWidget({ compact = false, variant = 'solid' }) {
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

  if (variant === 'glass') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pro-glass rounded-3xl p-5"
      >
        {/* Header — match "Kos Setiap Ciri AI" style */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h2 className="text-white font-black text-base">Baki Kredit AI</h2>
          </div>
          <Link
            to="/buy-credits"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 hover:shadow-amber-500/50 transition-all font-black text-[11px]"
          >
            <Plus className="w-3 h-3" /> Top Up
          </Link>
        </div>

        {/* Inner cards — slate-900/50 black tiles like the AI feature costs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
            <p className="text-2xl">💎</p>
            <p className="text-white font-black text-sm mt-1">Baki Semasa</p>
            <p className="text-amber-300 text-xs font-black">{balance} kredit</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
            <p className="text-2xl">🛒</p>
            <p className="text-white font-black text-sm mt-1">Dibeli</p>
            <p className="text-amber-300 text-xs font-black">{credits?.totalPurchased ?? 0} kredit</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
            <p className="text-2xl">⚡</p>
            <p className="text-white font-black text-sm mt-1">Digunakan</p>
            <p className="text-amber-300 text-xs font-black">{credits?.totalUsed ?? 0} kredit</p>
          </div>
        </div>

        {isLow ? (
          <p className="text-amber-300 text-xs font-black mt-4 flex items-center gap-1.5">
            ⚠️ Baki rendah — top up sekarang untuk teruskan guna ciri AI.
          </p>
        ) : (
          <p className="text-white text-xs font-bold mt-4">
            💡 Kredit tidak luput. Boleh dipakai bila-bila masa.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <Link to="/buy-credits" className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative h-full min-h-[180px] overflow-hidden rounded-2xl p-5 border border-white/30 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 shadow-xl shadow-amber-950/20 ${isLow ? 'ring-2 ring-amber-300/70' : ''}`}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30" />
        <div className="pointer-events-none absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-600 drop-shadow" />
            </div>
            <p className="text-white/95 text-[10px] font-black uppercase tracking-widest drop-shadow">Baki Kredit AI</p>
            <p className="text-white text-4xl font-black leading-tight drop-shadow-md">{balance}</p>
          </div>
          <div className="flex h-11 px-3 flex-shrink-0 items-center justify-center rounded-2xl bg-white/90 text-orange-600 shadow-lg backdrop-blur-md border border-white/60 hover:bg-white transition-colors gap-1.5 font-black text-xs">
            <Plus className="w-3.5 h-3.5" /> Top Up
          </div>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/30 shadow-sm">
            <p className="text-white/80 text-[10px] font-bold">Dibeli</p>
            <p className="text-white font-black text-sm drop-shadow">{credits?.totalPurchased ?? 0}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/30 shadow-sm">
            <p className="text-white/80 text-[10px] font-bold">Digunakan</p>
            <p className="text-white font-black text-sm drop-shadow">{credits?.totalUsed ?? 0}</p>
          </div>
        </div>

        {isLow ? (
          <p className="relative z-10 mt-3 text-amber-100 text-xs font-black flex items-center gap-1.5 drop-shadow">
            ⚠️ Baki rendah — top up sekarang <ArrowRight className="w-3 h-3" />
          </p>
        ) : (
          <p className="relative z-10 mt-3 inline-flex items-center gap-1 text-xs font-black text-white drop-shadow">
            Tambah Kredit <ArrowRight className="h-3.5 w-3.5" />
          </p>
        )}
      </motion.div>
    </Link>
  );
}