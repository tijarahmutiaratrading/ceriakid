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
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/923e87785_generated_image.png',
  },
  {
    to: '/quiz-ai',
    icon: Brain,
    title: 'Cikgu Aina',
    desc: 'Kuiz adaptif',
    cost: '1 kredit',
    bg: 'from-sky-100 via-blue-50 to-cyan-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/49507dc3a_generated_image.png',
  },
  {
    to: '/story-generator',
    icon: BookOpen,
    title: 'Cikgu Mira',
    desc: 'Penjana cerita',
    cost: '5 kredit',
    bg: 'from-rose-100 via-pink-50 to-pink-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/83e11f7f6_generated_image.png',
  },
  {
    to: '/bbm-generator',
    icon: FileText,
    title: 'Cikgu Daniel',
    desc: 'Penjana BBM',
    cost: '10 kredit',
    bg: 'from-violet-100 via-purple-50 to-purple-100',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8c2146d49_generated_image.png',
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
      className="relative overflow-hidden rounded-[2rem] p-6 md:p-10 lg:p-12 shadow-xl border border-white/60"
      style={{
        background: 'linear-gradient(135deg, #fef3e7 0%, #fde8d4 30%, #fce7f3 70%, #fbcfe8 100%)',
      }}
    >
      {/* Decorative sparkles */}
      <div className="pointer-events-none absolute top-4 left-4 text-2xl md:text-3xl opacity-80">✨</div>
      <div className="pointer-events-none absolute top-6 right-6 text-2xl md:text-3xl opacity-80">✨</div>
      <div className="pointer-events-none absolute bottom-6 left-6 text-xl md:text-2xl opacity-70">✨</div>
      <div className="pointer-events-none absolute top-1/2 right-12 text-xl md:text-2xl opacity-60 hidden md:block">🎓</div>

      {/* TOP ROW: Big credit card (left) + Top Up + status (right) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        {/* Big white credit card */}
        <Link to="/buy-credits" className="block w-full md:w-auto md:flex-1 md:max-w-md">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/80"
          >
            <p className="text-slate-900 font-black text-sm md:text-base tracking-wide mb-1">BAKI KREDIT AI</p>
            {loading ? (
              <div className="flex items-center gap-2 my-1">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <p className="text-slate-900 text-5xl md:text-6xl font-black leading-none my-1">{balance}</p>
            )}
            <p className="text-slate-500 text-sm md:text-base font-semibold mt-2">
              {credits?.totalUsed ?? 0} digunakan
            </p>
          </motion.div>
        </Link>

        {/* Top Up + Status */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <Link to="/buy-credits">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-5 py-2.5 md:px-6 md:py-3 rounded-2xl bg-white text-slate-900 font-black text-sm md:text-base shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-white/80 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Top Up
            </motion.div>
          </Link>
          {isLow && (
            <p className="text-slate-600 font-semibold text-sm md:text-base flex items-center gap-1">
              Baki rendah — top up sekarang <ArrowRight className="w-4 h-4" />
            </p>
          )}
        </div>
      </div>

      {/* Section title */}
      <h2 className="relative z-10 text-slate-900 font-black text-2xl md:text-3xl tracking-wide mb-5 md:mb-7">
        CIRI AI CERIAKID
      </h2>

      {/* AI Features Grid - 2x2 */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.title} to={f.to} className="block min-w-0" aria-label={`Buka ${f.title}`}>
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br ${f.bg} p-4 md:p-5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] border border-white/60 flex items-center gap-3 md:gap-4`}
              >
                {/* Avatar */}
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt={f.title}
                    className="h-16 w-16 md:h-20 md:w-20 rounded-2xl object-cover flex-shrink-0 shadow-md ring-2 ring-white/80"
                  />
                ) : (
                  <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-white ring-2 ring-white/80 flex-shrink-0 shadow-md">
                    <Icon className="h-8 w-8 text-slate-700" />
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-700 text-xs md:text-sm leading-tight flex items-center gap-1">
                    <span className="text-base">👤</span> {f.title} -
                  </p>
                  <p className="font-black text-slate-900 text-base md:text-lg leading-tight mt-0.5">
                    {f.desc}
                  </p>
                  <span className="inline-block mt-2 md:mt-3 text-xs md:text-sm font-bold bg-white/80 text-slate-700 px-3 py-1 rounded-full shadow-sm">
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