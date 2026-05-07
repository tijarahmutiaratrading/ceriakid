import React from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Save, Sparkles } from 'lucide-react';

export default function PremiumBBMPreview({ html, title, loading, onPrint, onSave, saved }) {
  if (loading) {
    return (
      <div className="min-h-[34rem] rounded-[2rem] bg-white/10 border border-white/20 flex items-center justify-center text-center p-8">
        <div>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-500 mx-auto flex items-center justify-center text-3xl shadow-xl">✨</motion.div>
          <p className="text-white font-black mt-4">AI sedang design BBM premium...</p>
          <p className="text-white/60 text-sm mt-1">Menyusun visual, ikon, aktiviti dan skema jawapan.</p>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-[34rem] rounded-[2rem] bg-white/10 border border-white/20 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-7xl mb-4">🎨</div>
          <p className="text-white font-black text-xl">Preview BBM akan muncul di sini</p>
          <p className="text-white/60 text-sm mt-2">Pilih mode, isi topik dan tekan Generate Premium BBM.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white/10 border border-white/20 overflow-hidden shadow-2xl shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/15 bg-white/10">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-200 mb-1"><Sparkles className="w-3 h-3" /> Premium Preview</div>
          <p className="text-white font-black truncate">{title || 'AI BBM Preview'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onSave} disabled={saved} className="px-3 py-2 rounded-2xl bg-emerald-400 text-emerald-950 font-black text-xs disabled:opacity-60 flex items-center gap-1.5"><Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save'}</button>
          <button onClick={onPrint} className="px-3 py-2 rounded-2xl bg-white text-purple-700 font-black text-xs flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print/PDF</button>
        </div>
      </div>
      <div className="bg-slate-100 p-3 sm:p-5 max-h-[42rem] overflow-auto">
        <div className="mx-auto max-w-[820px] bg-white shadow-xl" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}