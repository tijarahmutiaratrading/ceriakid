import React from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, Loader } from 'lucide-react';
import { PARENT_AVATARS } from '@/lib/parentAvatars';

/**
 * Pilihan avatar parent (ayah/mak watak 3D) ATAU upload gambar sendiri.
 */
export default function ParentAvatarPicker({ selectedUrl, saving, onSelect, onUpload }) {
  return (
    <div className="rounded-3xl bg-white shadow-xl border border-white/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-slate-900 font-black text-sm">Gambar Profil</p>
          <p className="text-slate-500 text-xs font-medium">Pilih avatar 3D atau muat naik gambar sendiri</p>
        </div>
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl brand-gradient text-white font-bold text-xs cursor-pointer shadow-lg hover:opacity-90 transition-opacity">
          <input type="file" accept="image/*" onChange={onUpload} disabled={saving} className="hidden" />
          {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Muat Naik
        </label>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {PARENT_AVATARS.map((url, i) => {
          const active = selectedUrl === url;
          return (
            <motion.button
              key={url}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(url)}
              className={`relative aspect-square rounded-2xl overflow-hidden transition-all ring-2 ${
                active ? 'ring-pink-500 shadow-lg' : 'ring-slate-200 hover:ring-purple-300'
              }`}
              aria-label={`Avatar parent ${i + 1}`}
              aria-pressed={active}
            >
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              {active && (
                <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}