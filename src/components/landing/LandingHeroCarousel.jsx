import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Apple Fitness style hero carousel for landing page — full-bleed image,
// dark gradient overlay, content bottom-left, lime CTA pill.
const SLIDES = [
  {
    tagline: 'UNTUK ANAK MALAYSIA',
    title: 'Anak belajar sambil main game',
    meta: '7 subjek • KSPK + KSSR • Tanpa iklan',
    cta: '🎮 Cuba Sekarang',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/092310156_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'CIKGU AI 24/7',
    title: 'Cikgu Firdaus AI',
    meta: 'Tutor peribadi untuk anak anda — sentiasa sedia',
    cta: '🎮 Cuba Sekarang',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/05975c0fa_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'CABARAN HARIAN',
    title: 'Belajar setiap hari',
    meta: 'Streak harian + ganjaran bintang untuk motivasi anak',
    cta: '🎮 Cuba Sekarang',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3932e4bfd_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'STORY KID AI',
    title: 'Dunia Cerita Interaktif',
    meta: 'Cerita bergambar AI yang anak boleh pilih sendiri',
    cta: '🎮 Cuba Sekarang',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/618a93e8d_generated_image.png',
    objectPos: 'center center',
  },
];

export default function LandingHeroCarousel({ onCTAClick, onPricingClick }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/8] max-h-[600px]">
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: slide.objectPos }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top-left Malaysia badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md shadow-lg">
          <span className="text-base">🇲🇾</span>
          <span className="text-white text-[10px] sm:text-xs font-black tracking-wide">Untuk anak Malaysia</span>
        </div>
      </div>

      {/* Content bottom-left */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10 max-w-2xl">
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
            <h1 className="text-white font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-3 drop-shadow-2xl tracking-tight">
              {slide.title}
            </h1>
            <p className="text-white/85 text-xs sm:text-sm md:text-base font-bold mb-5 sm:mb-6 drop-shadow-md max-w-md">
              {slide.meta}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onCTAClick}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#D4FF3D] text-slate-900 font-black text-sm shadow-2xl shadow-lime-400/30 hover:shadow-lime-400/50 transition-all"
              >
                <span>{slide.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onPricingClick}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-black text-white text-sm bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md transition-colors"
              >
                Lihat Harga
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator bottom-center */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}