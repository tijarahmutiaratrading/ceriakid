import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { getNoteColor, getSubjectMeta, getLevelMeta } from '@/lib/libraryConfig';
import NoteMindMap from './NoteMindMap';

// Modal pembaca nota penuh: ringkasan, poin berwarna, mind map, fun fact.
export default function StudyNoteReader({ note, onClose }) {
  return (
    <AnimatePresence>
      {note && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 bg-gradient-to-br ${getSubjectMeta(note.subject)?.gradient || 'from-purple-400 to-pink-500'} p-5 text-white`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-black">{getSubjectMeta(note.subject)?.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-black">{getLevelMeta(note.level)?.label}</span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight">{note.emoji} {note.title}</h2>
                </div>
                <button onClick={onClose} className="flex-shrink-0 h-9 w-9 rounded-full bg-white/25 flex items-center justify-center active:scale-90">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              {note.summary && <p className="mt-2 text-white/90 font-bold text-sm">{note.summary}</p>}
            </div>

            <div className="p-5 space-y-6">
              {/* Poin ringkas berwarna */}
              {note.keyPoints?.length > 0 && (
                <div>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-wide mb-2">Poin Penting</p>
                  <div className="space-y-2">
                    {note.keyPoints.map((p, i) => {
                      const c = getNoteColor(p.color);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`flex items-center gap-3 rounded-2xl ${c.bg} ring-1 ${c.ring} p-3`}
                        >
                          <span className="text-2xl flex-shrink-0">{p.icon}</span>
                          <span className={`font-bold text-sm ${c.text}`}>{p.text}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mind map */}
              {note.mindMap?.central && (
                <div>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-wide mb-2">Mind Map</p>
                  <NoteMindMap mindMap={note.mindMap} />
                </div>
              )}

              {/* Fun fact */}
              {note.funFact && (
                <div className="rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-100 ring-1 ring-yellow-200 p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-700 font-black text-xs uppercase">Tahukah Anda?</p>
                    <p className="text-orange-800 font-bold text-sm mt-0.5">{note.funFact}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}