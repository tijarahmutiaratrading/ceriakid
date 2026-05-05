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
    <section className="py-8 md:py-10 overflow-hidden border-y border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 text-center mb-5">
        <p className="text-white/55 text-xs font-black uppercase tracking-[0.22em] mb-2">Dipaparkan & dipercayai oleh</p>
        <h2 className="text-2xl md:text-3xl font-black text-white">Dipercayai 5,000+ Keluarga Malaysia 🇲🇾</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-slate-950/80 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-slate-950/80 to-transparent z-10" />

        <motion.div
          className="flex gap-3 md:gap-4 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-5 md:px-7 py-3 text-sm md:text-base font-black text-white shadow-xl backdrop-blur-xl"
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}