import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function SyllabusTopicCard({ subject, mode }) {
  const [expanded, setExpanded] = useState(false);
  const summary = mode === 'teacher' ? subject.teacherSummary : subject.parentSummary;

  return (
    <motion.div
      layout
      className="rounded-2xl bg-white/95 shadow-md shadow-purple-950/10 border border-white/60 overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`w-full bg-gradient-to-br ${subject.color} p-4 text-left flex items-center gap-3 text-white`}
      >
        <div className="w-11 h-11 rounded-xl bg-white/30 backdrop-blur flex items-center justify-center text-2xl flex-shrink-0">
          {subject.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-base leading-tight truncate">{subject.name}</p>
          <p className="text-white/90 text-[11px] font-bold">{subject.topics.length} topik utama</p>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className="p-4">
        <p className="text-slate-700 text-sm leading-relaxed mb-3">{summary}</p>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  {mode === 'teacher' ? 'Standard Kandungan' : 'Apa yang anak belajar'}
                </p>
                <ul className="space-y-2">
                  {subject.topics.map((t, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-600 leading-snug">{t.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-purple-600 font-black text-xs hover:underline"
          >
            Lihat {subject.topics.length} topik →
          </button>
        )}
      </div>
    </motion.div>
  );
}