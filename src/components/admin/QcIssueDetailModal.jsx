import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info } from 'lucide-react';

// Friendly labels untuk issue codes
const ISSUE_LABELS = {
  weak_question: '❓ Soalan kosong/terlalu pendek',
  banned_text: '🚫 Frasa larangan (placeholder/generic)',
  bad_options_count: '🔢 Pilihan jawapan bukan 4',
  bad_answer_index: '🎯 Index jawapan tak sah',
  duplicate_options: '🔁 Pilihan jawapan berulang',
  repeat_inside_game: '♻️ Soalan repeat dalam game yang sama',
  repeat_across_darjah: '🔄 Soalan repeat antara darjah',
  missing_darjah: '🏷️ Tiada tag darjah',
  too_few_questions: '📉 Soalan kurang daripada target',
  math_level_too_high: '🧮 Nombor Math melebihi tahap darjah',
  missing_metadata: '📋 Metadata tidak lengkap',
  weak_mini_content: '🎮 Mini game kurang content',
  target_not_playable: '🎯 Target mini game tak playable',
  missing_title: '📝 Tiada title',
  missing_moral: '💭 Tiada moral / description',
  too_few_story_slides: '📖 Slide story kurang 3',
};

const labelize = (code) => ISSUE_LABELS[code] || code;

export default function QcIssueDetailModal({ open, onClose, sampleIssues = [], lastRunAt, score, message }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3 bg-gradient-to-r from-red-500/20 to-orange-500/20">
              <div className="min-w-0">
                <h3 className="text-white font-black text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0" /> Detail QC Issues
                </h3>
                <p className="text-white/60 text-xs font-semibold mt-0.5">
                  {lastRunAt ? `Audit terakhir: ${new Date(lastRunAt).toLocaleString('ms-MY')}` : 'Belum dijalankan'}
                  {typeof score === 'number' ? ` · Score ${score}%` : ''}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl flex-shrink-0">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {message && (
                <div className="rounded-2xl bg-blue-400/10 border border-blue-300/20 p-3 text-xs text-blue-100 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {sampleIssues.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="text-white font-black text-sm">Tiada issue dikesan</p>
                  <p className="text-white/50 text-xs mt-1">Semua games lulus QC audit terakhir.</p>
                </div>
              ) : (
                <>
                  <p className="text-white/65 text-xs font-bold uppercase tracking-wider">
                    {sampleIssues.length} games gagal audit (sample teratas)
                  </p>
                  {sampleIssues.map((item, idx) => (
                    <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-red-400/20 text-red-300 flex items-center justify-center text-xs font-black flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-sm leading-tight break-words">{item.title || '(Tiada title)'}</p>
                          <p className="text-white/45 text-[11px] font-semibold mt-0.5">
                            {item.category || '-'}{item.darjah ? ` · ${item.darjah.replace('_', ' ')}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-8">
                        {(item.issues || []).map((code, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-red-400/15 border border-red-300/20 text-red-100 text-[11px] font-bold">
                            {labelize(code)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-white/5">
              <button onClick={onClose} className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-sm">
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}