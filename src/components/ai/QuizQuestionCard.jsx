import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, Sparkles } from 'lucide-react';

export default function QuizQuestionCard({ quiz, onAnswered }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset when new quiz arrives
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setShowHint(false);
  }, [quiz?.question]);

  const handleClick = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === quiz.correctIndex;
    onAnswered?.({ isCorrect, selectedIndex: idx });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-2xl"
    >
      <div className="flex items-start gap-3 mb-4">
        {quiz.emoji && <div className="text-4xl flex-shrink-0">{quiz.emoji}</div>}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Soalan</p>
          </div>
          <h2 className="text-gray-900 font-black text-lg md:text-xl leading-snug">{quiz.question}</h2>
        </div>
      </div>

      <div className="grid gap-2.5 mb-4">
        {quiz.choices.map((choice, idx) => {
          const isCorrect = idx === quiz.correctIndex;
          const isSelected = idx === selected;
          let stateClass = 'bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 text-gray-800';
          let icon = null;

          if (revealed) {
            if (isCorrect) {
              stateClass = 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-700 text-white shadow-lg';
              icon = <Check className="w-5 h-5" />;
            } else if (isSelected) {
              stateClass = 'bg-gradient-to-br from-red-500 to-rose-600 border-red-700 text-white shadow-lg';
              icon = <X className="w-5 h-5" />;
            } else {
              stateClass = 'bg-gray-100 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: revealed ? 1 : 0.97 }}
              whileHover={{ scale: revealed ? 1 : 1.01 }}
              onClick={() => handleClick(idx)}
              disabled={revealed}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-sm md:text-base text-left transition-all ${stateClass}`}
            >
              <div className="flex items-center gap-2.5 flex-1">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${revealed && isCorrect ? 'bg-white/30 text-white' : revealed && isSelected ? 'bg-white/30 text-white' : 'bg-white text-amber-600'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{choice}</span>
              </div>
              {icon}
            </motion.button>
          );
        })}
      </div>

      {!revealed && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {showHint ? 'Sembunyikan petua' : 'Beri saya petua'}
        </button>
      )}

      <AnimatePresence>
        {showHint && !revealed && quiz.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200"
          >
            <p className="text-xs font-semibold text-amber-900">💡 {quiz.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-2xl border-2 ${selected === quiz.correctIndex ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <p className={`font-black text-sm mb-1 ${selected === quiz.correctIndex ? 'text-green-700' : 'text-blue-700'}`}>
              {selected === quiz.correctIndex ? `🎉 ${quiz.encouragement || 'Hebat! Betul!'}` : '📚 Belajar tak apa, cuba lagi!'}
            </p>
            <p className="text-xs md:text-sm text-gray-700 font-semibold leading-relaxed">
              <span className="font-black">Penerangan:</span> {quiz.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}