import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Loader2, ArrowRight, GraduationCap, BookOpen, FileText, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  {
    to: '/ai-assistant',
    icon: GraduationCap,
    title: 'Cikgu Firdaus',
    desc: 'Tutor peribadi anak',
    cost: '1 kredit',
    bg: 'from-orange-100 via-orange-50 to-amber-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/61dba1f3a_generated_image.png',
  },
  {
    to: '/quiz-ai',
    icon: Brain,
    title: 'Cikgu Rosie',
    desc: 'Kuiz adaptif',
    cost: '1 kredit',
    bg: 'from-sky-100 via-blue-50 to-cyan-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4347879e0_generated_image.png',
  },
  {
    to: '/story-generator',
    icon: BookOpen,
    title: 'Cikgu Mira',
    desc: 'Penjana cerita',
    cost: '5 kredit',
    bg: 'from-rose-100 via-pink-50 to-pink-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d2061d998_generated_image.png',
  },
  {
    to: '/bbm-generator',
    icon: FileText,
    title: 'Cikgu Daniel',
    desc: 'Penjana BBM',
    cost: '10 kredit',
    bg: 'from-violet-100 via-purple-50 to-purple-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4c8ddef8e_generated_image.png',
  },
];

export default function AIHubCard() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getUserCredits', {});
        setCredits(res.data);
      } catch (e) {
        console.error('Failed to load credits:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balance = credits?.balance ?? 0;
  const isLow = !loading && balance < 10;

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] p-4 md:p-6 lg:p-7 shadow-xl border border-white/60"
      style={{ boxShadow: '0 18px 50px rgba(31, 16, 92, 0.25)' }}
    >
      {/* Classroom background image */}
      <img
        src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2bab62545_generated_image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Decorative sparkles */}
      <div className="pointer-events-none absolute top-4 left-4 text-2xl md:text-3xl opacity-80">✨</div>
      <div className="pointer-events-none absolute top-6 right-6 text-2xl md:text-3xl opacity-80">✨</div>
      <div className="pointer-events-none absolute bottom-6 left-6 text-xl md:text-2xl opacity-70">✨</div>
      <div className="pointer-events-none absolute top-1/2 right-12 text-xl md:text-2xl opacity-60 hidden md:block">🎓</div>

      {/* TOP ROW: Big credit card (left) + Top Up + status (right) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        {/* Big white credit card */}
        <Link to="/buy-credits" className="block w-full md:w-auto md:flex-1 md:max-w-md">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-3.5 md:p-4 border border-white/40"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <p className="text-white font-black text-[10px] md:text-xs tracking-wide mb-0.5">BAKI KREDIT AI</p>
            {loading ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-5 h-5 animate-spin text-white/70" />
              </div>
            ) : (
              <p className="text-white text-3xl md:text-4xl font-black leading-none my-0.5">{balance}</p>
            )}
            <p className="text-white/80 text-[11px] md:text-xs font-bold mt-1">
              {credits?.totalUsed ?? 0} digunakan
            </p>
            <p className="text-white/60 text-[10px] font-semibold mt-0.5">✅ Kredit tidak luput</p>
          </motion.div>
        </Link>

        {/* Top Up + Status */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <Link to="/buy-credits">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-white font-black text-xs md:text-sm border border-white/40 hover:bg-white/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)' }}
            >
              <Plus className="w-4 h-4" /> Top Up
            </motion.div>
          </Link>
          {isLow && (
            <p className="text-white font-bold text-xs md:text-sm flex items-center gap-1">
              Baki rendah — top up sekarang <ArrowRight className="w-3.5 h-3.5" />
            </p>
          )}
        </div>
      </div>

      {/* Section title */}
      <h2 className="relative z-10 text-white font-black text-base md:text-lg tracking-wide mb-3 md:mb-4">
        CIRI AI CERIAKID
      </h2>

      {/* AI Features Grid - 2x2 */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.title} to={f.to} className="block min-w-0" aria-label={`Buka ${f.title}`}>
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full overflow-hidden rounded-2xl p-3 md:p-3.5 border border-white/30 flex items-center gap-2.5 md:gap-3"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(14px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
              >
                {/* Avatar */}
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={f.title}
                    className="h-12 w-12 md:h-14 md:w-14 rounded-full object-cover flex-shrink-0 shadow-md ring-2 ring-white/80"
                  />
                ) : (
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-white ring-2 ring-white/80 flex-shrink-0 shadow-md">
                    <Icon className="h-6 w-6 text-slate-700" />
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white/80 text-xs md:text-sm leading-tight">
                    {f.title}
                  </p>
                  <p className="font-black text-white text-sm md:text-base leading-tight mt-0.5">
                    {f.desc}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] md:text-xs font-black bg-white/25 text-white px-2 py-0.5 rounded-full">
                    {f.cost}
                  </span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}