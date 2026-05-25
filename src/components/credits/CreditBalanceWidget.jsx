import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-3xl p-5 shadow-xl overflow-hidden ${isLow ? 'ring-2 ring-amber-300/70' : ''}`}
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(76, 29, 149, 0.85) 0%, rgba(107, 33, 168, 0.8) 50%, rgba(131, 24, 67, 0.85) 100%), url('https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/64310c310_generated_image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/85 text-[10px] font-black uppercase tracking-widest truncate">Baki Kredit AI</p>
            <p className="text-white text-3xl font-black leading-tight">{balance}</p>
          </div>
        </div>
        <Link
          to="/buy-credits"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-game-purple font-black text-xs shadow hover:shadow-lg transition-all flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Top Up
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/15 rounded-xl px-3 py-2">
          <p className="text-white/80 font-bold">Dibeli</p>
          <p className="text-white font-black">{credits?.totalPurchased ?? 0}</p>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-2">
          <p className="text-white/80 font-bold">Digunakan</p>
          <p className="text-white font-black">{credits?.totalUsed ?? 0}</p>
        </div>
      </div>

      {isLow && (
        <p className="mt-3 text-amber-200 text-xs font-bold flex items-center gap-1.5">
          ⚠️ Baki rendah — top up untuk terus guna AI
        </p>
      )}
      </div>
    </motion.div>
  );
}