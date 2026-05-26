import React from 'react';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  'Trusted by 5,000+ Parents',
  '⭐ 4.9 Rating',
  '✓ Verified Safe',
  'Learn & Play Together',
  '🇲🇾 Anak Malaysia',
  '🎮 Belajar Sambil Main',
];

export default function TrustedMarquee() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className="overflow-hidden">
      <div className="text-center mb-4">
        <p className="text-orange-600/80 text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] mb-1.5">Dipaparkan & dipercayai oleh</p>
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900">Dipercayai 5,000+ Keluarga Malaysia 🇲🇾</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-amber-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-amber-50 to-transparent z-10" />

        <motion.div
          className="flex gap-2.5 md:gap-3 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="shrink-0 rounded-full border border-white bg-white/80 px-4 md:px-5 py-2 text-xs md:text-sm font-black text-slate-800 shadow-md backdrop-blur-xl"
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}