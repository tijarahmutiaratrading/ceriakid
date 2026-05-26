import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

/**
 * Trust badge — emphasizes risk-reversal to reduce buyer hesitation.
 * Place near pricing/checkout.
 */
export default function GuaranteeBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl rounded-3xl p-5 md:p-6 mb-8 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-2 border-emerald-300/40 backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-black text-white text-base md:text-lg leading-tight">Jaminan Pulang Wang 7 Hari</p>
          <p className="text-white/75 text-xs md:text-sm font-semibold mt-1 leading-snug">
            Tak puas hati? Hubungi kami dalam 7 hari pertama untuk refund penuh — tanpa soal jawab.
          </p>
        </div>
      </div>
    </motion.div>
  );
}