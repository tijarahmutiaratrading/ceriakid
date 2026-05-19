import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_IMAGES = [
  {
    url: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/375ffb424_generated_image.png',
    alt: 'Children playing educational games'
  },
  {
    url: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/62bcb4737_generated_image.png',
    alt: 'Parent dashboard showing progress'
  },
  {
    url: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a525198ae_generated_image.png',
    alt: 'Children reading interactive stories'
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-200 to-pink-200 h-80 sm:h-96">
      {/* Images */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={HERO_IMAGES[current].url}
          alt={HERO_IMAGES[current].alt}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5 text-slate-900" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all hover:scale-110"
      >
        <ChevronRight className="w-5 h-5 text-slate-900" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current
                ? 'bg-white w-8 h-2.5 shadow-lg'
                : 'bg-white/50 w-2.5 h-2.5 hover:bg-white/70'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </div>
  );
}