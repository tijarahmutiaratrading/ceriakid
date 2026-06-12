import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Rail thumbnail gaya PS5 — tile terpilih membesar dengan ring bercahaya
export default function CinematicRail({ items, selected, onSelect, onActivate }) {
  const tileRefs = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = tileRefs.current[selected];
    const container = scrollRef.current;
    if (el && container) {
      // Scroll dalam container sahaja (jangan guna scrollIntoView yang boleh anjak seluruh page)
      const target = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [selected]);

  return (
    <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-visible scrollbar-hide pt-10 pb-8 px-3 -mx-3 snap-x">
      {items.map((it, i) => {
        const isSel = i === selected;
        return (
          <motion.button
            key={it.key}
            ref={(el) => { tileRefs.current[i] = el; }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, scale: isSel ? 1.12 : 1 }}
            transition={{ delay: i * 0.04, scale: { type: 'spring', stiffness: 300, damping: 22 } }}
            onClick={() => (isSel ? onActivate?.() : onSelect(i))}
            className="relative shrink-0 snap-center focus:outline-none"
            aria-label={it.title}
          >
            <div
              className={`relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl transition-all duration-300 ${
                isSel
                  ? 'ring-[3px] ring-white shadow-[0_0_30px_rgba(255,255,255,0.35)]'
                  : 'ring-1 ring-white/15 opacity-60 hover:opacity-90'
              }`}
            >
              {it.art ? (
                <img src={it.art} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${it.accent}, #0f172a)` }}>
                  <span className="text-3xl">{it.emoji}</span>
                </div>
              )}
              <div className={`absolute inset-0 transition-colors ${isSel ? 'bg-transparent' : 'bg-slate-950/30'}`} />
              {it.art && <span className="absolute bottom-1 left-1.5 text-lg drop-shadow">{it.emoji}</span>}
            </div>
            <div className={`mx-auto mt-2 h-1.5 rounded-full transition-all duration-300 ${isSel ? 'w-5 bg-white' : 'w-1.5 bg-white/25'}`} />
          </motion.button>
        );
      })}
    </div>
  );
}