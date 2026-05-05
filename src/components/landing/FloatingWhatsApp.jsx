import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const WHATSAPP_NUMBER = '60177844120';
const WHATSAPP_MESSAGE = 'Hi CeriaKid, saya berminat nak tahu lebih lanjut tentang pelan pembelajaran anak.';

export default function FloatingWhatsApp() {
  const [showBubble, setShowBubble] = useState(true);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="relative max-w-[230px] rounded-3xl border border-green-200 bg-white px-4 py-3 pr-9 text-left shadow-2xl shadow-green-950/20"
          >
            <button
              type="button"
              onClick={() => setShowBubble(false)}
              className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Tutup notifikasi WhatsApp"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
              1
            </div>
            <p className="text-xs font-black text-slate-900">Perlukan bantuan?</p>
            <p className="mt-0.5 text-xs font-bold leading-snug text-slate-600">Chat WhatsApp kami sekarang — reply pantas.</p>
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-green-200 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-2xl shadow-green-950/30 ring-4 ring-white/40 sm:h-[70px] sm:w-[70px]"
        aria-label="Chat melalui WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <span className="relative">☎️</span>
        {!showBubble && <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white" />}
      </motion.a>
    </div>
  );
}