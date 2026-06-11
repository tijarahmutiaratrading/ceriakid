import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Bar baki kredit AI + butang Top Up — dipaparkan di AI Hub.
export default function CreditTopUpBar() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getUserCredits', {});
        setCredits(res.data);
      } catch (e) {
        console.error('Failed to load credits:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balance = credits?.balance ?? 0;
  const isLow = !loading && balance < 10;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Baki kredit */}
      <Link to="/buy-credits" className="block w-full sm:w-auto sm:flex-1 sm:max-w-sm">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-2xl p-3.5 md:p-4"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          <p className="text-white font-black text-[10px] md:text-xs tracking-wide mb-0.5">BAKI KREDIT AI</p>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white/70 my-1" />
          ) : (
            <p className="text-white text-3xl md:text-4xl font-black leading-none my-0.5">{balance}</p>
          )}
          <p className="text-white/80 text-[11px] md:text-xs font-bold mt-1">{credits?.totalUsed ?? 0} digunakan</p>
          <p className="text-white/60 text-[10px] font-semibold mt-0.5">✅ Kredit tidak luput</p>
        </motion.div>
      </Link>

      {/* Top Up + status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/buy-credits">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-black text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            <Plus className="w-4 h-4" /> Top Up Kredit
          </motion.div>
        </Link>
        {isLow && (
          <p className="text-rose-600 font-bold text-xs md:text-sm flex items-center gap-1">
            Baki rendah — top up sekarang <ArrowRight className="w-3.5 h-3.5" />
          </p>
        )}
      </div>
    </div>
  );
}