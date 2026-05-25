import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';

export default function QuizChoiceCard({ quiz, onAnswered, disabled }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleClick = (idx) => {
    if (revealed || disabled) return;
    setSelected(idx);
    setRevealed(true);
    const isCorrect = idx === quiz.correctIndex;
    // Auto-send feedback to chat after short delay
    setTimeout(() => {
      onAnswered?.({
        selectedIndex: idx,
        selectedText: quiz.choices[idx],
        correctIndex: quiz.correctIndex,
        correctText: quiz.choices[quiz.correctIndex],
        isCorrect,
        question: quiz.question,
        explanation: quiz.explanation,
      });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-3 shadow-md"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <p className="text-amber-700 text-[10px] font-black uppercase tracking-widest">Kuiz</p>
      </div>
      <p className="text-gray-900 font-bold text-sm leading-snug mb-3">{quiz.question}</p>
      <div className="grid gap-2">
        {quiz.choices.map((choice, idx) => {
          const isCorrect = idx === quiz.correctIndex;
          const isSelected = idx === selected;
          let stateClass = 'bg-white hover:bg-amber-50 border-amber-200 text-gray-800';
          let icon = null;

          if (revealed) {
            if (isCorrect) {
              stateClass = 'bg-green-500 border-green-600 text-white';
              icon = <Check className="w-4 h-4" />;
            } else if (isSelected) {
              stateClass = 'bg-red-500 border-red-600 text-white';
              icon = <X className="w-4 h-4" />;
            } else {
              stateClass = 'bg-gray-100 border-gray-200 text-gray-500 opacity-60';
            }
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: revealed ? 1 : 0.97 }}
              onClick={() => handleClick(idx)}
              disabled={revealed || disabled}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 font-bold text-sm text-left transition-all ${stateClass}`}
            >
              <span className="flex-1">{choice}</span>
              {icon}
            </motion.button>
          );
        })}
      </div>
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-2 rounded-xl bg-white/80 border border-amber-200"
        >
          <p className="text-xs font-semibold text-gray-700">
            <span className="font-black text-amber-700">💡 Penerangan:</span> {quiz.explanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}