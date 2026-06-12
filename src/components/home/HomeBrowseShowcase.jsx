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
      {/* Toggle pill */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">Terokai</p>
        <div className="flex gap-1 p-1 rounded-full bg-white/10 border border-white/15">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative px-4 py-1.5 rounded-full text-xs font-black transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="browse-tab-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative ${active ? 'text-slate-900' : 'text-white/70'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
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