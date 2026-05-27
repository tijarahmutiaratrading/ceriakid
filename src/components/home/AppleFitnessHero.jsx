import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, LogOut, Settings } from 'lucide-react';

// Apple Fitness style hero carousel — full-bleed image, dark gradient, bottom-left content, CTA pill
const SLIDES = [
  {
    tagline: 'CUBA PERMAINAN BARU',
    title: 'Belajar dengan CeriaKid',
    meta: '200+ Permainan • Semua Subjek',
    cta: 'Mula Sekarang',
    ctaLink: '/games-hub',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/092310156_generated_image.png',
    imageMobile: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0489544af_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'AKTIVITI HARI INI',
    title: 'Cabaran Harian',
    meta: 'Dapatkan ganjaran bintang setiap hari',
    cta: 'Lihat Cabaran',
    ctaLink: '/challenges',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3932e4bfd_generated_image.png',
    imageMobile: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d17cc3032_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'CIRI AI BAHARU',
    title: 'Cikgu Firdaus AI',
    meta: 'Tutor peribadi 24/7 untuk anak anda',
    cta: 'Tanya Cikgu',
    ctaLink: '/ai-assistant',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/05975c0fa_generated_image.png',
    imageMobile: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/59c957095_generated_image.png',
    objectPos: 'center center',
  },
  {
    tagline: 'STORY KID',
    title: 'Dunia Cerita AI',
    meta: 'Cerita bergambar interaktif setiap hari',
    cta: 'Baca Sekarang',
    ctaLink: '/story-kid',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/618a93e8d_generated_image.png',
    imageMobile: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6eec87858_generated_image.png',
    objectPos: 'center center',
  },
];

export default function AppleFitnessHero({ user, avatarUrl, onLogout }) {
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const slide = SLIDES[index];

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const firstName = (user?.full_name || '').split(' ')[0] || 'Kawan';

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 aspect-[4/5] sm:aspect-[16/8] md:aspect-[16/7] max-h-[520px] sm:max-h-[560px]">
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
          {/* Mobile portrait image */}
          <img
            src={slide.imageMobile || slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover sm:hidden"
            style={{ objectPosition: slide.objectPos }}
          />
          {/* Desktop landscape image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover hidden sm:block"
            style={{ objectPosition: slide.objectPos }}
          />
          {/* Dark gradient overlay — different for mobile (bottom-heavy) vs desktop (left-heavy) */}
          <div
            className="absolute inset-0 sm:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.9) 100%)',
            }}
          />
          <div
            className="absolute inset-0 hidden sm:block"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Greeting top-left — big avatar + name beside */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 group"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/40 group-hover:ring-white/70 shadow-xl transition-all"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 flex items-center justify-center text-white font-black text-2xl ring-2 ring-white/40 group-hover:ring-white/70 shadow-xl transition-all">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-white font-black text-sm sm:text-base drop-shadow-lg">Hai, {firstName} 👋</p>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-3 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-20"
                style={{
                  background: 'rgba(20, 14, 38, 0.92)',
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                  <p className="font-black text-xs text-white truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[10px] text-white/65 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Tetapan</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onLogout?.(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/10 hover:text-red-300 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Log Keluar</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
            <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl leading-tight mb-2 drop-shadow-2xl">
              {slide.title}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-bold mb-5 drop-shadow-md">
              {slide.meta}
            </p>
            <Link to={slide.ctaLink}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#D4FF3D] text-slate-900 font-black text-sm shadow-2xl shadow-lime-400/30 hover:shadow-lime-400/50 transition-all"
              >
                <span>{slide.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
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