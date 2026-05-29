import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// Rotate testimonial-style "live" social proof toast at bottom-left.
// 100% fake-safe — pakai placeholder nama yang generik (bukan customer sebenar).
// Tujuan: build urgency tanpa mislead.

const PROOF_MESSAGES = [
  { name: 'Puan Aishah', loc: 'Shah Alam', action: 'baru langgan pelan Keluarga' },
  { name: 'Encik Faizal', loc: 'JB', action: 'baru langgan pelan Standard' },
  { name: 'Puan Nurul', loc: 'KL', action: 'baru tambah profil anak' },
  { name: 'Puan Lim', loc: 'PJ', action: 'baru langgan pelan Keluarga' },
  { name: 'Encik Zul', loc: 'Bangi', action: 'baru main 5 game pagi ini' },
  { name: 'Puan Roslina', loc: 'Kelantan', action: 'baru langgan pelan Asas' },
];

export default function LiveSocialProof() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mula tunjuk selepas 8 saat
    const startTimer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    // Cycle: 3 saat muncul → 3 saat hilang → muncul mesej baru → ulang
    const interval = setInterval(() => {
      setVisible((v) => {
        if (v) return false; // sedang nampak → sembunyi
        // sedang hilang → tukar mesej dan tunjuk
        setIdx((i) => (i + 1) % PROOF_MESSAGES.length);
        return true;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const msg = PROOF_MESSAGES[idx];
  const minsAgo = ((idx * 3) % 14) + 2; // 2-15 min ago, deterministic

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto max-w-xs rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-emerald-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 text-xs font-black leading-tight truncate">{msg.name} dari {msg.loc}</p>
              <p className="text-slate-600 text-[11px] leading-tight">{msg.action}</p>
              <p className="text-emerald-600 text-[10px] font-bold mt-0.5">✓ {minsAgo} min lepas</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}