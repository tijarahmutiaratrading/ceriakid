import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GraduationCap, BookOpen, FileText, Brain, ArrowRight } from 'lucide-react';
import SectionWrapper from '@/components/landing/SectionWrapper';

const CIKGU_AVATAR = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/61dba1f3a_generated_image.png';

const AI_FEATURES = [
  {
    icon: GraduationCap,
    title: 'Cikgu Firdaus',
    persona: 'Tutor Peribadi',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/61dba1f3a_generated_image.png',
    desc: 'Tutor peribadi AI yang sentiasa sedia jawab soalan anak — Matematik, Sains, BM, English, Jawi.',
    cost: '1 kredit / soalan',
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/30',
  },
  {
    icon: Brain,
    title: 'Cikgu Rosie',
    persona: 'Kuiz AI Adaptif',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/811b6df2e_generated_image.png',
    desc: 'Soalan interaktif yang adapt ikut tahap anak. Semakin main, semakin pandai.',
    cost: '1 kredit / soalan',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/30',
  },
  {
    icon: BookOpen,
    title: 'Cikgu Mira',
    persona: 'Penjana Cerita',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d2061d998_generated_image.png',
    desc: 'Cerita kreatif & berunsur pendidikan untuk anak. Tulis tema, AI jana cerita penuh.',
    cost: '5 kredit / cerita',
    gradient: 'from-pink-500 via-rose-500 to-rose-600',
    glow: 'shadow-pink-500/30',
  },
  {
    icon: FileText,
    title: 'Cikgu Daniel',
    persona: 'Penjana BBM',
    avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4c8ddef8e_generated_image.png',
    desc: 'Lembaran kerja & latihan tersuai mengikut subjek dan tahap anak. Cetak & guna.',
    cost: '8 kredit / lembaran',
    gradient: 'from-violet-500 via-purple-500 to-purple-600',
    glow: 'shadow-purple-500/30',
  },
];

export default function LandingAISection() {
  return (
    <SectionWrapper
      id="ai"
      badge="BANTUAN PEMBELAJARAN BERKUASA AI"
      badgeIcon="✨"
      title="Bukan sekadar game —"
      titleAccent="ada Cikgu AI yang membantu"
      subtitle="CeriaKid bawa teknologi AI terkini untuk bantu anak faham pelajaran dengan lebih mendalam. Tanya soalan, jana cerita, buat latihan — semua dalam satu app."
      variant="sky"
    >
      {/* 4 AI features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AI_FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br ${f.gradient} shadow-xl ${f.glow}`}
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/20 blur-2xl pointer-events-none group-hover:bg-white/30 transition-all" />
              <div className="absolute -left-3 -bottom-3 h-16 w-16 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative">
                {/* Avatar */}
                <img
                  src={f.avatar}
                  alt={f.title}
                  className="h-20 w-20 rounded-full object-cover bg-white mb-3 ring-4 ring-white/90 shadow-lg"
                />
                <p className="text-white/80 text-[10px] font-black uppercase tracking-wider mb-0.5">{f.persona}</p>
                <h4 className="font-black text-white text-lg leading-tight mb-1.5">{f.title}</h4>
                <p className="text-white/90 text-xs leading-relaxed mb-3 min-h-[3rem]">{f.desc}</p>
                <span className="inline-block text-[10px] font-black bg-white/95 text-slate-900 px-2.5 py-1 rounded-full shadow-sm">
                  {f.cost}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Free credits highlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-7 rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-2 border-yellow-300/50 shadow-2xl shadow-yellow-500/20"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="text-5xl flex-shrink-0 drop-shadow-lg">🎁</div>
          <div className="flex-1">
            <p className="text-yellow-300 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1.5">
              ✨ BONUS PERCUMA UNTUK PELAN KELUARGA
            </p>
            <h4 className="text-white font-black text-lg sm:text-xl leading-tight mb-1.5">
              Dapat <span className="bg-yellow-300 text-slate-900 px-2 py-0.5 rounded-lg inline-block">50 kredit AI PERCUMA</span> bila langgan pelan Keluarga!
            </h4>
            <p className="text-white/85 text-xs sm:text-sm">
              Cuba Cikgu Firdaus, jana cerita, atau buat lembaran kerja — tanpa kos tambahan dalam minggu pertama. ✨
            </p>
          </div>
          <a
            href="#pricing"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-yellow-300 hover:bg-yellow-200 text-slate-900 font-black text-sm shadow-lg shadow-yellow-500/40 transition-all"
          >
            Tuntut Sekarang <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}