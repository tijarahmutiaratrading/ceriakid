import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HomeSubjectShowcase from '@/components/home/HomeSubjectShowcase';
import HomeHubShowcase from '@/components/home/HomeHubShowcase';

// Satu section dengan toggle: Subjek atau Hub — boleh klik tukar pandangan.
const TABS = [
  { key: 'subjek', label: '📚 Subjek' },
  { key: 'hub', label: '🎮 Hub' },
];

export default function HomeBrowseShowcase() {
  const [tab, setTab] = useState('subjek');

  return (
    <div>
      {/* Tajuk + butang pilih kategori — jelas macam pemilih umur */}
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white px-1 mb-2">Pilih Kategori</p>
      <div className="flex gap-3 mb-5">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <motion.button
              key={t.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t.key)}
              className={`rounded-full py-2 px-4 font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                active
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/15'
              }`}
            >
              {t.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'subjek' ? <HomeSubjectShowcase /> : <HomeHubShowcase />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}