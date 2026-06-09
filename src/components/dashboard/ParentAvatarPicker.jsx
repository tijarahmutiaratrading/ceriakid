import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload, Loader, X } from 'lucide-react';
import { PARENT_AVATARS } from '@/lib/parentAvatars';

/**
 * Popup modal — pilih avatar parent (ayah/mak watak 3D) ATAU upload gambar sendiri.
 */
export default function ParentAvatarPicker({ open, selectedUrl, saving, onSelect, onUpload, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-slate-900 font-black text-sm">Gambar Profil</p>
                <p className="text-slate-500 text-xs font-medium">Pilih avatar 3D atau muat naik gambar sendiri</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Upload button */}
              <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl brand-gradient text-white font-bold text-sm cursor-pointer shadow-lg hover:opacity-90 transition-opacity">
                <input type="file" accept="image/*" onChange={onUpload} disabled={saving} className="hidden" />
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Muat Naik Gambar Sendiri
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Atau pilih avatar</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-3 gap-2.5">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}