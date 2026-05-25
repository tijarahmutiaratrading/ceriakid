import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, ArrowRight, BookOpen, FileText, Brain } from 'lucide-react';

const FEATURES = [
  {
    to: '/ai-assistant',
    icon: GraduationCap,
    title: 'Cikgu AI',
    desc: 'Tanya soalan pelajaran',
    cost: '1 kredit',
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    ready: true,
  },
  {
    to: '/quiz-ai',
    icon: Brain,
    title: 'Kuiz AI',
    desc: 'Soalan interaktif & adaptif',
    cost: '1 kredit',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    ready: true,
  },
  {
    to: '/story-generator',
    icon: BookOpen,
    title: 'Penjana Cerita',
    desc: 'Cerita kreatif untuk anak',
    cost: '5 kredit',
    gradient: 'from-pink-500 via-rose-500 to-rose-600',
    ready: true,
  },
  {
    to: '/bbm-generator',
    icon: FileText,
    title: 'Penjana BBM',
    desc: 'Lembaran kerja tersuai',
    cost: '10 kredit',
    gradient: 'from-violet-500 via-purple-500 to-purple-600',
    ready: true,
  },
];

export default function AIFeatureCTA() {
  return (
    <div className="pro-glass rounded-3xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <p className="text-amber-200 text-[10px] font-black uppercase tracking-widest">Ciri AI CeriaKid</p>
      </div>
      <h3 className="text-white text-lg md:text-xl font-black mb-4 leading-tight">
        Bantuan pembelajaran berkuasa AI ✨
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.title} to={f.to} className="block min-w-0" aria-label={`Buka ${f.title}`}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative h-full min-h-[160px] overflow-hidden rounded-[1.5rem] border border-white/30 bg-gradient-to-br ${f.gradient} p-4 shadow-lg shadow-purple-950/20 flex flex-col`}
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30" />
                <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 ring-1 ring-white/70 flex-shrink-0 shadow-lg">
                      <Icon className="h-5 w-5 text-slate-800" />
                    </div>
                    {!f.ready && (
                      <span className="text-[8px] font-black bg-white/30 text-white px-1.5 py-0.5 rounded-full">SOON</span>
                    )}
                  </div>
                  <p className="font-black text-white text-sm leading-tight">{f.title}</p>
                  <p className="mt-1 text-[11px] font-bold text-white/90 leading-snug flex-1">{f.desc}</p>
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black bg-white/95 text-slate-900 px-2 py-1 rounded-full shadow-md">{f.cost}</span>
                    {f.ready && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
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