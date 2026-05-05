import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '60177844120';
const WHATSAPP_MESSAGE = 'Hi CeriaKid, saya berminat nak tahu lebih lanjut tentang pelan pembelajaran anak.';

export default function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-5 right-4 z-[60] flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-2xl shadow-green-950/30 ring-1 ring-white/30 sm:bottom-6 sm:right-6 sm:px-5"
      aria-label="Chat melalui WhatsApp"
    >
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
        1
      </span>
      <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
        <MessageCircle className="h-6 w-6 fill-white" />
      </span>
      <span className="text-left leading-tight">
        <span className="block text-xs font-black">Support 24/7 via WhatsApp</span>
        <span className="block text-[11px] font-bold text-white/85">Chat sekarang →</span>
      </span>
    </motion.a>
  );
}