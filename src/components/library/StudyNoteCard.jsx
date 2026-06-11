import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Sparkles, Network } from 'lucide-react';
import { getSubjectMeta, getLevelMeta, getNoteColor } from '@/lib/libraryConfig';

// Kad nota dalam senarai Library Hub — reka bentuk padat & moden.
export default function StudyNoteCard({ note, locked, onOpen }) {
  const subject = getSubjectMeta(note.subject);
  const level = getLevelMeta(note.level);
  const branchCount = note.mindMap?.branches?.length || 0;
  const points = (note.keyPoints || []).slice(0, 3);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(note)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="text-left bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-white/70 overflow-hidden group relative flex flex-col transition-shadow"
    >
      {/* Header gradient — lebih ringkas & kemas */}
      <div className={`relative bg-gradient-to-br ${subject?.gradient || 'from-purple-400 to-pink-500'} px-4 pt-4 pb-7`}>
        {/* Corak halus */}
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.7) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.3) 0%, transparent 40%)'
        }} />

        <div className="relative flex items-start justify-between">
          {/* Emoji dalam bulatan glass */}
          <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md ring-1 ring-white/50 flex items-center justify-center text-2xl shadow-sm">
            {note.emoji || subject?.emoji || '📘'}
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-700 text-[10px] font-black shadow-sm">
            {level?.short}
          </span>
        </div>

        {locked && (
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 ring-1 ring-white/40 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Body — naik atas header (overlap) untuk rupa kad bertindih */}
      <div className="relative -mt-4 mx-2.5 mb-2.5 flex-1 bg-white rounded-2xl p-3.5 ring-1 ring-slate-100 shadow-sm flex flex-col">
        <p className="font-black text-slate-900 text-sm leading-snug line-clamp-2">{note.title}</p>
        <p className="text-slate-500 text-xs font-semibold mt-1 line-clamp-2 leading-snug">{note.summary}</p>

        {/* Preview key points sebagai chip kecil berwarna */}
        {points.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {points.map((p, i) => {
              const c = getNoteColor(p.color);
              return (
                <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${c.bg} ${c.text} text-[10px] font-black max-w-full`}>
                  <span>{p.icon || '•'}</span>
                  <span className="truncate">{p.text}</span>
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          {branchCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wide">
              <Network className="h-3 w-3" /> {branchCount} cabang
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wide">
              <Sparkles className="h-3 w-3" /> Mind map
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-black ${locked ? 'text-slate-400' : 'text-purple-600 group-hover:gap-1.5 transition-all'}`}>
            {locked ? 'Kunci' : 'Buka'} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}