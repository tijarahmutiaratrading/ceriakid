import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X } from 'lucide-react';

/**
 * Single share menu — replaces 4 separate share buttons per child card.
 * Tap → reveals options. Cleaner, less visual clutter.
 */
export default function ShareSheet({ childName, totalGames, avgStars }) {
  const [open, setOpen] = useState(false);

  const shareWhatsApp = () => {
    const msg = `🎓 Prestasi ${childName} di CeriaKid!\n\n📊 ${totalGames} permainan diselesaikan\n⭐ ${avgStars} bintang purata\n\nTeruskan usaha! 💪`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    setOpen(false);
  };

  const shareFacebook = () => {
    const url = window.location.href;
    const quote = `Prestasi ${childName}: ${totalGames} games, ${avgStars} stars! 🎓`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`, '_blank');
    setOpen(false);
  };

  const shareTwitter = () => {
    const msg = `🎓 Prestasi ${childName} di @CeriaKidMY:\n${totalGames} permainan, ${avgStars}⭐ rata-rata!\n\n#Pendidikan #CeriaKid`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(msg)}`, '_blank');
    setOpen(false);
  };

  const exportText = () => {
    const text = `LAPORAN PRESTASI ${childName.toUpperCase()}\n${'='.repeat(40)}\n\nTarikh: ${new Date().toLocaleDateString('ms-MY')}\n\n- Jumlah Permainan: ${totalGames}\n- Purata Bintang: ${avgStars}/3\n- Status: ${parseFloat(avgStars) >= 2.5 ? 'Cemerlang! 🔥' : 'Terus Berkembang ✨'}\n\n🎓 CeriaKid`;
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute('download', `prestasi-${childName}-${Date.now()}.txt`);
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-full text-white rounded-2xl min-h-12 py-3 font-black text-sm transition-all flex items-center justify-center gap-2 hover:bg-white/10"
        style={{ background: 'rgba(30,30,40,0.35)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}
      >
        <Share2 className="w-4 h-4" />
        Kongsi Pencapaian {childName}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-0 right-0 z-50 rounded-2xl p-2 shadow-2xl border border-white/30"
              style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(88,28,135,0.92))', backdropFilter: 'blur(22px)' }}
            >
              <div className="flex justify-between items-center px-2 py-1 mb-1">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-wider">Pilih platform</p>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={shareWhatsApp} className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 font-bold text-xs transition-all">
                  💬 WhatsApp
                </button>
                <button onClick={shareFacebook} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold text-xs transition-all">
                  f Facebook
                </button>
                <button onClick={shareTwitter} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-2.5 font-bold text-xs transition-all">
                  𝕏 Twitter
                </button>
                <button onClick={exportText} className="bg-white/20 hover:bg-white/30 text-white rounded-xl py-2.5 font-bold text-xs transition-all flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}