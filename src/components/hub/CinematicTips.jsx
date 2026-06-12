import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Trophy, Star, Sparkles } from 'lucide-react';

// Tip cards untuk bahagian bawah hub gaya PS5 — beri panduan ringkas kepada anak/ibu bapa.
const TIPS = [
  { icon: Star, color: '#fbbf24', title: 'Kutip Bintang', text: 'Main betul-betul untuk dapat 3 bintang setiap pusingan!' },
  { icon: Trophy, color: '#a78bfa', title: 'Naik Tahap', text: 'Setiap pusingan jadi lebih mencabar — cuba habiskan semua!' },
  { icon: Lightbulb, color: '#34d399', title: 'Belajar Sambil Main', text: 'Setiap permainan direka ikut sukatan supaya anak belajar.' },
  { icon: Sparkles, color: '#f472b6', title: 'Konsisten Setiap Hari', text: 'Main sikit-sikit setiap hari lebih berkesan dari sekali banyak.' },
];

export default function CinematicTips() {
  return (
    <div className="mt-10 sm:mt-14">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
        💡 Tip Untuk Ibu Bapa
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TIPS.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-4 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: `${tip.color}22` }}
            >
              <tip.icon className="w-5 h-5" style={{ color: tip.color }} />
            </div>
            <p className="text-white font-black text-sm mb-1">{tip.title}</p>
            <p className="text-white/55 text-xs font-medium leading-relaxed">{tip.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}