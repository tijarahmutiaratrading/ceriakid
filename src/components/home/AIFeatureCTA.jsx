import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, ArrowRight, BookOpen, FileText } from 'lucide-react';

const FEATURES = [
  {
    to: '/ai-assistant',
    icon: GraduationCap,
    title: 'Cikgu AI',
    desc: 'Tanya apa-apa soalan pelajaran',
    cost: '1 kredit',
    color: 'from-amber-400 to-orange-500',
    ready: true,
  },
  {
    to: '/story-generator',
    icon: BookOpen,
    title: 'Penjana Cerita',
    desc: 'Cerita kreatif untuk anak',
    cost: '5 kredit',
    color: 'from-pink-400 to-rose-500',
    ready: true,
  },
  {
    to: '/bbm-generator',
    icon: FileText,
    title: 'Penjana BBM',
    desc: 'Lembaran kerja tersuai',
    cost: '10 kredit',
    color: 'from-violet-400 to-purple-500',
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.title} to={f.to}>
              <motion.div
                whileHover={{ y: -2 }}
                className={`relative rounded-2xl p-3 bg-gradient-to-br ${f.color} text-white shadow-lg overflow-hidden h-full`}
              >
                {!f.ready && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-black bg-white/30 text-white px-1.5 py-0.5 rounded-full">SOON</span>
                )}
                <Icon className="w-5 h-5 mb-1.5" />
                <p className="font-black text-xs leading-tight mb-0.5">{f.title}</p>
                <p className="text-white/80 text-[10px] font-semibold leading-snug mb-1.5">{f.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black bg-white/25 px-1.5 py-0.5 rounded-full">{f.cost}</span>
                  {f.ready && <ArrowRight className="w-3 h-3" />}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}