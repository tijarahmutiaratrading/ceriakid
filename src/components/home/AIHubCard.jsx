import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Loader2, ArrowRight, GraduationCap, BookOpen, FileText, Brain } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  {
    to: '/ai-assistant',
    icon: GraduationCap,
    title: 'Cikgu Firdaus',
    desc: 'Tutor peribadi anak',
    cost: '1 kredit',
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fc07612a5_generated_image.png',
  },
  {
    to: '/quiz-ai',
    icon: Brain,
    title: 'Kuiz AI',
    desc: 'Soalan adaptif',
    cost: '1 kredit',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
  },
  {
    to: '/story-generator',
    icon: BookOpen,
    title: 'Penjana Cerita',
    desc: 'Cerita kreatif',
    cost: '5 kredit',
    gradient: 'from-pink-500 via-rose-500 to-rose-600',
  },
  {
    to: '/bbm-generator',
    icon: FileText,
    title: 'Penjana BBM',
    desc: 'Lembaran tersuai',
    cost: '10 kredit',
    gradient: 'from-violet-500 via-purple-500 to-purple-600',
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
      className={`relative overflow-hidden rounded-[1.75rem] p-4 md:p-5 shadow-xl border border-white/30 ${
        isLow ? 'ring-2 ring-amber-300/70' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.10))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 bottom-0 h-20 w-20 rounded-full bg-pink-400/20 blur-2xl" />

      {/* TOP ROW: Credit balance + Top Up */}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
        <Link to="/buy-credits" className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-inner flex-shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300 drop-shadow" />
          </div>
          <div className="min-w-0">
            <p className="text-orange-700 text-[9px] font-black uppercase tracking-widest">Baki Kredit AI</p>
            {loading ? (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold">Memuat...</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-slate-900 text-3xl md:text-4xl font-black leading-none">{balance}</p>
                <span className="text-slate-700 text-[10px] font-bold">
                  {credits?.totalUsed ?? 0} digunakan
                </span>
              </div>
            )}
          </div>
        </Link>
        <Link to="/buy-credits">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/95 text-orange-600 font-black text-xs shadow-lg backdrop-blur-md border border-white/60 hover:bg-white transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Top Up
          </motion.div>
        </Link>
      </div>

      {/* Low balance warning */}
      {isLow && (
        <div className="relative z-10 mb-3 px-3 py-1.5 rounded-xl bg-amber-500/90 border border-amber-600/60">
          <p className="text-white text-[11px] font-black flex items-center gap-1.5">
            ⚠️ Baki rendah — top up sekarang <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      )}

      {/* DIVIDER label */}
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <Sparkles className="w-3 h-3 text-orange-600" />
        <p className="text-orange-700 text-[9px] font-black uppercase tracking-widest">Ciri AI CeriaKid</p>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-400/30 to-transparent" />
      </div>

      {/* AI Features Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.title} to={f.to} className="block min-w-0" aria-label={`Buka ${f.title}`}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative h-full min-h-[110px] overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br ${f.gradient} p-2.5 shadow-md shadow-purple-950/20 flex flex-col`}
              >
                <div className="absolute -right-4 -top-4 h-14 w-14 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30" />
                <div className="absolute -left-3 -bottom-3 h-12 w-12 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-1.5 mb-2">
                    {f.avatar ? (
                      <img
                        src={f.avatar}
                        alt={f.title}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/90 flex-shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 ring-1 ring-white/70 flex-shrink-0 shadow-md">
                        <Icon className="h-4.5 w-4.5 text-slate-800" />
                      </div>
                    )}
                  </div>
                  <p className="font-black text-white text-xs leading-tight">{f.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/90 leading-snug flex-1">{f.desc}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black bg-white/95 text-slate-900 px-1.5 py-0.5 rounded-full shadow-sm">{f.cost}</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}