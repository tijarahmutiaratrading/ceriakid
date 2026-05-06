import React from 'react';
import { motion } from 'framer-motion';

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
      className="fixed bottom-5 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-green-950/30 ring-4 ring-white/40 sm:bottom-6 sm:right-6"
      aria-label="Chat melalui WhatsApp"
    >
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
        1
      </span>
      <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden="true">
        <path d="M16.02 3.2c-7.05 0-12.78 5.7-12.78 12.72 0 2.24.59 4.43 1.72 6.36L3.2 28.8l6.69-1.75a12.86 12.86 0 0 0 6.13 1.56h.01c7.04 0 12.77-5.7 12.77-12.72S23.07 3.2 16.02 3.2Zm0 23.25h-.01c-1.9 0-3.77-.51-5.4-1.48l-.39-.23-3.97 1.04 1.06-3.86-.25-.4a10.47 10.47 0 0 1-1.61-5.6c0-5.83 4.75-10.57 10.59-10.57 2.83 0 5.48 1.1 7.48 3.1a10.49 10.49 0 0 1 3.1 7.47c-.01 5.83-4.76 10.53-10.6 10.53Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.81 1.03-.99 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </motion.a>
  );
}