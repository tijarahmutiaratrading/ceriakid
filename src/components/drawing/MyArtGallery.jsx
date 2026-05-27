import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2 } from 'lucide-react';
import { listArtworks, deleteArtwork } from '@/lib/drawingGallery';

// Modal gallery showing all artworks the child has saved locally.
// Lets them re-download or delete pieces — fosters a sense of ownership.
export default function MyArtGallery({ open, onClose }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) setItems(listArtworks());
  }, [open]);

  const handleDelete = (id) => {
    setItems(deleteArtwork(id));
  };

  const handleDownload = (item) => {
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = `${item.title || 'lukisan'}-${item.id}.png`;
    a.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[115] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[88vh] rounded-[2rem] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/60 bg-white/60 backdrop-blur-md">
              <div>
                <p className="text-purple-500 text-[11px] font-black uppercase tracking-[0.22em]">Galeri Saya</p>
                <h2 className="text-slate-800 font-black text-xl sm:text-2xl">🖼️ Kerja Saya ({items.length})</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-6xl mb-3">🎨</p>
                  <p className="text-slate-700 font-black text-lg">Belum ada lukisan disimpan</p>
                  <p className="text-slate-500 text-sm font-bold mt-1">Tekan butang "Simpan" untuk simpan lukisan pertama anda!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow border-2 border-white"
                    >
                      <div className="aspect-square bg-[#fff9f0] flex items-center justify-center">
                        <img src={item.dataUrl} alt={item.title} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="p-2">
                        <p className="text-slate-700 font-black text-xs truncate">{item.title}</p>
                        <p className="text-slate-400 text-[10px] font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-2 pb-3">
                        <button onClick={() => handleDownload(item)} className="p-2 rounded-full bg-white text-purple-600 shadow-lg hover:scale-110 transition-transform" title="Muat turun">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 transition-transform" title="Padam">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}