import React from 'react';
import { motion } from 'framer-motion';

// Welcome banner — fun illustrated CeriaKid header untuk user dashboard.
// Aspek banner ~ 1024:400 (2.5:1), maintained via aspect-ratio supaya tak crop.
export default function WelcomeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-900/20 ring-1 ring-white/30"
    >
      <img
        src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8a7a15443_ChatGPTImageJun32026at06_28_51PM.png"
        alt="Selamat datang ke CeriaKid"
        className="w-full h-auto block"
        style={{ aspectRatio: '1024 / 400', objectFit: 'cover' }}
        loading="eager"
        decoding="async"
      />
      {/* Subtle bottom fade supaya menyatu dgn hero di bawah */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
    </motion.div>
  );
}