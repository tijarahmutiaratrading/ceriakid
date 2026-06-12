import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';

// Rail thumbnail gaya PS5 — tile terpilih membesar dengan ring bercahaya
export default function ArcadeRail({ games, selected, onSelect, bestScores }) {
  const navigate = useNavigate();
  const railRef = useRef(null);
  const tileRefs = useRef({});

  useEffect(() => {
    const el = tileRefs.current[selected];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [selected]);

  return (
    <div ref={railRef} className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-visible scrollbar-hide pt-8 pb-4 snap-x px-[45%] sm:px-[42%]">
      {games.map((g, i) => {
        const isSel = i === selected;
        const best = bestScores[g.key] || 0;
        return (
          <motion.button
            key={g.key}
            ref={(el) => { tileRefs.current[i] = el; }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, scale: isSel ? 1.12 : 1 }}
            transition={{ delay: i * 0.04, scale: { type: 'spring', stiffness: 300, damping: 22 } }}
            onClick={() => (isSel ? navigate(g.to) : onSelect(i))}
            className="relative shrink-0 snap-center focus:outline-none"
            aria-label={g.title}
          >
            <div
              className={`relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl transition-all duration-300 ${
                isSel
                  ? 'ring-[3px] ring-white shadow-[0_0_30px_rgba(255,255,255,0.35)]'
                  : 'ring-1 ring-white/15 opacity-60 hover:opacity-90'
              }`}
            >
              <img src={ARCADE_ART[g.key]} alt={g.title} loading="lazy" className="h-full w-full object-cover" />
              <div className={`absolute inset-0 transition-colors ${isSel ? 'bg-transparent' : 'bg-slate-950/30'}`} />
              <span className="absolute bottom-1 left-1.5 text-lg drop-shadow">{g.emoji}</span>
              {best > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-slate-950/70 backdrop-blur px-1.5 py-0.5 text-[8px] font-black text-amber-300">
                  <Trophy className="w-2 h-2" /> {best}
                </span>
              )}
            </div>
            {/* Titik penunjuk bawah tile aktif */}
            <div className={`mx-auto mt-2 h-1.5 rounded-full transition-all duration-300 ${isSel ? 'w-5 bg-white' : 'w-1.5 bg-white/25'}`} />
          </motion.button>
        );
      })}
    </div>
  );
}