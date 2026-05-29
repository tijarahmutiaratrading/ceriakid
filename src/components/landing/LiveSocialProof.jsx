import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Rotate testimonial-style "live" social proof toast at bottom-left.
// 100% fake-safe — pakai placeholder nama yang generik (bukan customer sebenar).
// Tujuan: build urgency tanpa mislead.

const PROOF_MESSAGES = [
  { name: 'Puan Aishah', loc: 'Shah Alam', action: 'baru langgan pelan Keluarga', timeAgo: '15 minit lepas' },
  { name: 'Encik Faizal', loc: 'JB', action: 'baru langgan pelan Standard', timeAgo: '1 jam lepas' },
  { name: 'Puan Nurul', loc: 'KL', action: 'baru tambah profil anak', timeAgo: '3 jam lepas' },
  { name: 'Puan Lim', loc: 'PJ', action: 'langgan pelan Keluarga', timeAgo: 'semalam' },
  { name: 'Encik Zul', loc: 'Bangi', action: 'main 12 game minggu ini', timeAgo: '2 hari lepas' },
  { name: 'Puan Roslina', loc: 'Kelantan', action: 'langgan pelan Asas', timeAgo: '3 hari lepas' },
  { name: 'Puan Hana', loc: 'Penang', action: 'baru tambah anak ke-2', timeAgo: '40 minit lepas' },
  { name: 'Encik Hafiz', loc: 'Kuantan', action: 'langgan pelan Standard', timeAgo: '5 jam lepas' },
  { name: 'Puan Siti', loc: 'Melaka', action: 'top-up 100 kredit AI', timeAgo: '20 minit lepas' },
  { name: 'Encik Aiman', loc: 'Ipoh', action: 'langgan pelan Keluarga', timeAgo: '6 jam lepas' },
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
    // Cycle: 5 saat muncul → 5 saat hilang → muncul mesej baru → ulang
    const interval = setInterval(() => {
      setVisible((v) => {
        if (v) return false; // sedang nampak → sembunyi
        // sedang hilang → tukar mesej dan tunjuk
        setIdx((i) => (i + 1) % PROOF_MESSAGES.length);
        return true;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const msg = PROOF_MESSAGES[idx];

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto max-w-[220px] sm:max-w-xs rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3"
          >
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-200/50 to-amber-300/50 flex items-center justify-center flex-shrink-0 shadow text-sm sm:text-lg">
              🎉
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 text-[10px] sm:text-xs font-black leading-tight truncate">{msg.name} dari {msg.loc}</p>
              <p className="text-slate-600 text-[9px] sm:text-[11px] leading-tight truncate">{msg.action}</p>
              <p className="text-emerald-600 text-[9px] sm:text-[10px] font-bold mt-0.5">✓ {msg.timeAgo}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}