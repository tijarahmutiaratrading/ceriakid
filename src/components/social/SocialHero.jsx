import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    tagline: 'KAWAN-KAWAN',
    title: 'Belajar lagi seronok bersama kawan',
    meta: 'Kongsi kod undangan & tambah kawan untuk main bersama',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6edd6aa29_generated_image.png',
  },
  {
    tagline: 'CABAR KAWAN',
    title: 'Bertanding & menang trofi',
    meta: 'Cabar kawan ikut subjek — siapa lebih hebat?',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b447b225b_generated_image.png',
  },
];

export default function SocialHero({ tab, setTab, friendCount = 0, challengeCount = 0 }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-950/40 aspect-[4/5] sm:aspect-[16/8] md:aspect-[16/7] max-h-[480px] sm:max-h-[520px] mb-4 sm:mb-6">
      {/* Background slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(15,5,40,0.92) 0%, rgba(15,5,40,0.7) 35%, rgba(15,5,40,0.2) 70%, rgba(15,5,40,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-xl shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-wider uppercase">Kawan & Cabaran</span>
        </motion.div>
      </div>

      {/* Content area */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 pt-16 sm:p-8 md:p-10">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-[#D4FF3D] font-black text-[10px] sm:text-xs tracking-[0.2em] mb-2 drop-shadow-lg">
                {slide.tagline}
              </p>
              <h1 className="text-white font-black text-xl sm:text-4xl md:text-5xl leading-tight mb-1.5 sm:mb-2 drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-white/85 text-[11px] sm:text-sm md:text-base font-bold mb-3 sm:mb-4 drop-shadow-md max-w-lg leading-snug">
                {slide.meta}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Tab switcher — inside hero */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.12] backdrop-blur-2xl border border-white/25 shadow-2xl">
            <button
              onClick={() => setTab('friends')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                tab === 'friends' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/85 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" strokeWidth={2.5} />
              Kawan
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${tab === 'friends' ? 'bg-purple-100 text-purple-700' : 'bg-white/20 text-white'}`}>
                {friendCount}
              </span>
            </button>
            <button
              onClick={() => setTab('challenges')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                tab === 'challenges' ? 'bg-white text-purple-700 shadow-lg' : 'text-white/85 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" strokeWidth={2.5} />
              Cabaran
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${tab === 'challenges' ? 'bg-purple-100 text-purple-700' : 'bg-white/20 text-white'}`}>
                {challengeCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-10 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}