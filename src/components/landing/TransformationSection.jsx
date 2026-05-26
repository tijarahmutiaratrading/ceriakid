import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * "Before vs After" — emotional transformation section.
 * Shows parents what life looks like before and after CeriaKid.
 * High-converting because it makes the outcome tangible.
 */
const BEFORE = [
  { emoji: '😩', text: '"Mama, saya tak nak buat homework!"' },
  { emoji: '😤', text: 'Sebut belajar = anak nak menangis' },
  { emoji: '📱', text: 'Anak main TikTok berjam-jam, tak belajar' },
  { emoji: '💸', text: 'Bayar tuisyen RM300/bulan, hasil tak nampak' },
];

const AFTER = [
  { emoji: '🤩', text: '"Mama, boleh saya main CeriaKid?"' },
  { emoji: '🎯', text: 'Anak excited sendiri nak belajar' },
  { emoji: '📚', text: '15 minit sehari, anak belajar 7 subjek' },
  { emoji: '✅', text: 'RM4.08/bulan — jimat 98% berbanding tuisyen' },
];

export default function TransformationSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-5 sm:px-8 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5">
            <span>✨</span>
            <span className="text-white/90 text-xs sm:text-sm font-bold">TRANSFORMASI SEBENAR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight mb-4">
            Dari "tak nak belajar"<br />
            kepada{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              "mama, bila boleh main?"
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Lihat perubahan yang ibu bapa lain alami selepas anak guna CeriaKid setiap hari.
          </p>
        </motion.div>

        {/* Before vs After grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 relative">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl p-6 md:p-7 bg-gradient-to-br from-rose-950/80 to-red-950/80 border border-red-500/20 backdrop-blur-md"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-300/30 mb-5">
              <span className="text-base">😩</span>
              <span className="text-red-200 text-xs font-black uppercase tracking-wider">Sebelum CeriaKid</span>
            </div>
            <div className="space-y-3">
              {BEFORE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <p className="text-white/85 text-sm sm:text-base font-semibold leading-snug pt-0.5">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Center arrow — desktop only */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', boxShadow: '0 10px 30px rgba(234,88,12,0.6)' }}
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Mobile divider */}
          <div className="md:hidden flex justify-center -my-2">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl rotate-90"
              style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)' }}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </motion.div>
          </div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-3xl p-6 md:p-7 bg-gradient-to-br from-emerald-950/80 to-teal-950/80 border-2 border-emerald-400/40 backdrop-blur-md shadow-2xl shadow-emerald-500/10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-300/40 mb-5">
              <span className="text-base">🌟</span>
              <span className="text-emerald-200 text-xs font-black uppercase tracking-wider">Selepas CeriaKid</span>
            </div>
            <div className="space-y-3">
              {AFTER.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.2 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <p className="text-white text-sm sm:text-base font-semibold leading-snug pt-0.5">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom emotional kicker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:mt-12"
        >
          <p className="text-lg sm:text-xl font-black text-white leading-snug max-w-2xl mx-auto">
            Anak anda hanya kecil sekali. <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">
              Berikan mereka permulaan terbaik. 💛
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}