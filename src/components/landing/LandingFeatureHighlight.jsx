import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/landing/SectionWrapper';

const HIGHLIGHTS = [
  {
    badge: 'PALING DISUKAI IBU BAPA',
    emoji: '📚',
    title: 'Modul 3M',
    accent: 'Membaca · Menulis · Mengira',
    desc: 'Asas literasi & numerasi yang penting untuk anak prasekolah & sekolah rendah. Disusun dalam mini-game pendek yang seronok — anak belajar membaca, menulis dan mengira langkah demi langkah.',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dd42df217_generated_image.png',
    points: ['Latihan Membaca suku kata & perkataan', 'Aktiviti Menulis & tracing huruf', 'Mengira nombor & operasi asas'],
    color: 'from-blue-500 via-sky-400 to-emerald-300',
  },
  {
    badge: 'EKSKLUSIF UNTUK SUBSCRIBER',
    emoji: '📒',
    title: 'Library Hub',
    accent: 'Nota & Mind Map Silibus',
    desc: 'Koleksi nota ringkas dan mind map berwarna yang dijana mengikut silibus KSPK & KSSR. Mudah untuk anak ulang kaji dan untuk ibu bapa bimbing — semua poin penting dalam satu tempat.',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cbafc9750_generated_image.png',
    points: ['Nota ringkas ikut topik silibus', 'Mind map berwarna mudah faham', 'Fakta menarik untuk tarik minat anak'],
    color: 'from-purple-500 via-fuchsia-400 to-pink-300',
  },
  {
    badge: 'IKUT SILIBUS KSPK & KSSR',
    emoji: '🎓',
    title: 'Semua Subjek Sekolah',
    accent: 'Prasekolah hingga Darjah 6',
    desc: 'Liputan penuh subjek sekolah anak — daripada Bahasa Melayu, English, Matematik sampai Sains, Jawi dan banyak lagi. Setiap subjek ada game, nota dan latihan yang disusun ikut tahap anak.',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png',
    points: [
      '📖 Bahasa Melayu · 🔤 English · ➗ Matematik',
      '🔬 Sains · ✍️ Jawi · 🕌 Pendidikan Islam',
      '🌍 Sejarah · 💛 Pendidikan Moral · 🎨 Seni & lagi',
    ],
    color: 'from-orange-500 via-amber-400 to-yellow-300',
  },
];

export default function LandingFeatureHighlight() {
  return (
    <SectionWrapper
      badge="BARU & EKSKLUSIF"
      badgeIcon="✨"
      title="Bukan sekadar game —"
      titleAccent="ada nota & modul 3M"
      subtitle="Dua ciri yang paling ibu bapa suka: Modul 3M untuk asas membaca, menulis, mengira dan Library Hub penuh nota & mind map silibus."
      variant="vibrant"
    >
      <div className="space-y-6 md:space-y-8">
        {HIGHLIGHTS.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
          >
            {/* Image */}
            <div className="relative h-52 md:h-auto overflow-hidden [direction:ltr]">
              <img src={h.image} alt={h.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${h.color} opacity-40`} />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-md">
                {h.emoji} {h.title}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 text-left [direction:ltr]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] font-black mb-3">
                {h.badge}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">{h.title}</h3>
              <p className="text-white/90 font-bold text-base mb-3">{h.accent}</p>
              <p className="text-white/65 text-sm leading-relaxed mb-5">{h.desc}</p>
              <div className="space-y-2.5">
                {h.points.map((p) => (
                  <div key={p} className="flex items-center gap-2.5 text-white/85 text-sm font-semibold">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}