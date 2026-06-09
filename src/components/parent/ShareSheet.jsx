import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, MessageCircle, Facebook, Twitter } from 'lucide-react';

export default function ShareSheet({ childName, totalGames, avgStars }) {
  const [open, setOpen] = useState(false);

  const shareWhatsApp = () => {
    const msg = `🎓 Prestasi ${childName} di CeriaKid!\n\n📊 ${totalGames} permainan diselesaikan\n⭐ ${avgStars} bintang purata\n\nTeruskan usaha! 💪`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    setOpen(false);
  };
  const shareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
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
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
    setOpen(false);
  };

  const actions = [
    { label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600', onClick: shareWhatsApp },
    { label: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', onClick: shareFacebook },
    { label: 'Twitter / X', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600', onClick: shareTwitter },
    { label: 'Export .txt', icon: Download, color: 'bg-slate-700 hover:bg-slate-800', onClick: exportText },
  ];

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-sm transition-all shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        Kongsi Pencapaian {childName}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute bottom-full mb-3 left-0 right-0 z-50 bg-white rounded-2xl ring-1 ring-slate-200 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-slate-900 text-sm font-black">Kongsi Pencapaian</p>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {actions.map((a) => (
                  <button key={a.label} onClick={a.onClick}
                    className={`${a.color} text-white rounded-xl py-2.5 font-bold text-xs transition-colors flex items-center justify-center gap-1.5`}>
                    <a.icon className="w-3.5 h-3.5" /> {a.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}