import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, ArrowRight, BookOpen, FileText, Brain } from 'lucide-react';

const FEATURES = [
  {
    to: '/ai-assistant',
    icon: GraduationCap,
    title: 'Cikgu Firdaus',
    desc: 'Tutor peribadi untuk anak',
    cost: '1 kredit',
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    ready: true,
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fc07612a5_generated_image.png',
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
    <div className="pro-glass rounded-2xl p-3 h-full">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <p className="text-amber-200 text-[9px] font-black uppercase tracking-widest">Ciri AI CeriaKid</p>
      </div>
      <h3 className="text-white text-sm md:text-base font-black mb-2.5 leading-tight">
        Bantuan pembelajaran berkuasa AI ✨
      </h3>

      <div className="grid grid-cols-2 gap-2">
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
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 ring-1 ring-white/70 flex-shrink-0 shadow-md">
                        <Icon className="h-3.5 w-3.5 text-slate-800" />
                      </div>
                    )}
                    {!f.ready && (
                      <span className="text-[7px] font-black bg-white/30 text-white px-1 py-0.5 rounded-full">SOON</span>
                    )}
                  </div>
                  <p className="font-black text-white text-xs leading-tight">{f.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/90 leading-snug flex-1">{f.desc}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black bg-white/95 text-slate-900 px-1.5 py-0.5 rounded-full shadow-sm">{f.cost}</span>
                    {f.ready && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm">
                        <ArrowRight className="w-3 h-3" />
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