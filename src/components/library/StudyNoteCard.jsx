import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { getSubjectMeta, getLevelMeta } from '@/lib/libraryConfig';

// Kad nota dalam senarai Library Hub.
export default function StudyNoteCard({ note, locked, onOpen }) {
  const subject = getSubjectMeta(note.subject);
  const level = getLevelMeta(note.level);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(note)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="text-left bg-white rounded-3xl shadow-xl border border-white/60 overflow-hidden group relative"
    >
      <div className={`bg-gradient-to-br ${subject?.gradient || 'from-purple-400 to-pink-500'} p-4 relative`}>
        <div className="flex items-center justify-between">
          <span className="text-4xl drop-shadow">{note.emoji || subject?.emoji || '📘'}</span>
          <span className="px-2.5 py-1 rounded-full bg-white/30 text-white text-[11px] font-black backdrop-blur-sm">
            {level?.short}
          </span>
        </div>
        {locked && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
            <Lock className="h-7 w-7 text-white" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-black text-slate-900 text-base leading-tight line-clamp-2">{note.title}</p>
        <p className="text-slate-500 text-xs font-bold mt-1 line-clamp-2">{note.summary}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase">{subject?.label}</span>
          <span className="inline-flex items-center gap-1 text-xs font-black text-purple-600">
            {locked ? 'Kunci' : 'Buka'} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}