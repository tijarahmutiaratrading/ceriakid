import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameTheme } from '@/lib/GameThemeContext';

export default function QuestionRenderer({ question, onAnswer, disabled, selectedIdx, isCorrect, showFeedback }) {
  const { isDark } = useGameTheme();
  const type = question?.type || 'multiple_choice';

  // Reset all input state whenever the question changes
  const [textInput, setTextInput] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [arranged, setArranged] = useState([]);

  useEffect(() => {
    setTextInput('');
    setMatchingAnswers({});
    setSelectedOrder([]);
    setArranged([]);
  }, [question]);

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onAnswer(textInput);
      setTextInput('');
    }
  };

  // Multiple Choice & True/False
  if (['multiple_choice', 'true_false', 'yes_no'].includes(type)) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const badgeGradients = ['#a855f7', '#0ea5e9', '#f59e0b', '#ec4899', '#10b981', '#6366f1'];

    return (
      <div className="grid grid-cols-2 gap-3">
        {question.options?.map((option, i) => {
          const isSelected = showFeedback && selectedIdx === i;
          const isCorrectAnswer = showFeedback && i === question.answer;

          let bg = isDark ? 'rgba(255,255,255,0.08)' : '#ffffff';
          let border = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(148,163,184,0.25)';
          let shadow = isDark ? '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 4px 12px rgba(148,163,184,0.18)';
          let textColor = isDark ? '#ffffff' : '#0f172a';
          let badgeBg = badgeGradients[i % badgeGradients.length];
          let badgeText = '#ffffff';
          let badgeIcon = letters[i];
          let dimmed = false;

          if (isSelected && isCorrect) {
            bg = 'rgba(220,252,231,0.6)';
            border = '1.5px solid rgba(74,222,128,0.8)';
            shadow = '0 4px 16px rgba(34,197,94,0.18)';
            textColor = '#166534';
            badgeBg = '#16a34a';
            badgeText = '#ffffff';
            badgeIcon = '✓';
          } else if (isSelected && !isCorrect) {
            bg = 'rgba(254,226,226,0.6)';
            border = '1.5px solid rgba(248,113,113,0.8)';
            shadow = '0 4px 16px rgba(239,68,68,0.18)';
            textColor = '#991b1b';
            badgeBg = '#dc2626';
            badgeText = '#ffffff';
            badgeIcon = '✗';
          } else if (isCorrectAnswer) {
            bg = 'rgba(220,252,231,0.55)';
            border = '1.5px solid rgba(134,239,172,0.8)';
            shadow = '0 4px 16px rgba(34,197,94,0.12)';
            textColor = '#166534';
            badgeBg = '#16a34a';
            badgeText = '#ffffff';
            badgeIcon = '✓';
          } else if (showFeedback) {
            dimmed = true;
          }

          return (
            <motion.button
              key={`opt-${i}`}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: dimmed ? 0.45 : 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: disabled ? 1 : 1.04, y: disabled ? 0 : -2 }}
              onClick={(e) => !disabled && onAnswer(i, e)}
              disabled={disabled}
              className="min-h-16 rounded-3xl py-3.5 pl-3 pr-3.5 font-bold text-left transition-all text-sm sm:text-base break-words flex items-center gap-3"
              style={{
                background: bg,
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                border,
                boxShadow: shadow,
                color: textColor,
              }}
            >
              <span
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base flex-shrink-0 font-black"
                style={{
                  background: badgeBg,
                  color: badgeText,
                }}
              >
                {badgeIcon}
              </span>
              <span className="flex-1 text-left">
                {typeof option === 'string' ? option : option?.label ?? String(option)}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Short Answer / Fill in the Blank
  if (['short_answer', 'fill_blank'].includes(type)) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !disabled && handleTextSubmit()}
          placeholder="Taip jawapan..."
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-2xl outline-none text-center font-black text-white placeholder:text-white/40"
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTextSubmit}
          disabled={disabled || !textInput.trim()}
          className="px-6 py-3 rounded-2xl font-black text-white disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #ec4899)',
            boxShadow: '0 6px 20px rgba(236,72,153,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
          }}
        >
          ✓
        </motion.button>
      </div>
    );
  }

  // Matching — left column fixed, right column shuffled; click left then right to pair
  if (type === 'matching') {
    const pairs = question.pairs || [];

    const handleSelect = (side, idx) => {
      if (disabled) return;
      setMatchingAnswers(prev => {
        const next = { ...prev };
        if (side === 'left') {
          // toggle selection of left item
          next._selectedLeft = prev._selectedLeft === idx ? null : idx;
        } else {
          // pair selected left with this right
          if (prev._selectedLeft != null) {
            next[prev._selectedLeft] = pairs[idx].right;
            next._selectedLeft = null;
            // Auto-submit when all pairs matched
            const answered = Object.entries(next).filter(([k]) => k !== '_selectedLeft');
            if (answered.length === pairs.length) {
              const result = answered.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
              setTimeout(() => onAnswer(result), 300);
            }
          }
        }
        return next;
      });
    };

    const selectedLeft = matchingAnswers._selectedLeft;

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500 text-center font-semibold">Klik kiri → klik kanan untuk padankan</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Left column */}
          <div className="space-y-2">
            {pairs.map((pair, i) => {
              const isPaired = matchingAnswers[i] != null;
              return (
                <motion.button key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect('left', i)}
                  className={`w-full p-3 rounded-xl font-bold text-sm transition-all ${
                    isPaired ? 'bg-green-200 ring-2 ring-green-400' :
                    selectedLeft === i ? 'bg-game-purple text-white ring-2 ring-purple-500' :
                    'bg-blue-100'
                  }`}>
                  {pair.left}
                </motion.button>
              );
            })}
          </div>
          {/* Right column */}
          <div className="space-y-2">
            {pairs.map((pair, i) => {
              const isPaired = Object.values(matchingAnswers).includes(pair.right);
              return (
                <motion.button key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect('right', i)}
                  disabled={isPaired}
                  className={`w-full p-3 rounded-xl font-bold text-sm transition-all ${
                    isPaired ? 'bg-green-200 opacity-60' :
                    selectedLeft != null ? 'bg-orange-100 ring-2 ring-orange-300 cursor-pointer' :
                    'bg-gray-200'
                  }`}>
                  {pair.right}
                </motion.button>
              );
            })}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const result = Object.entries(matchingAnswers)
              .filter(([k]) => k !== '_selectedLeft')
              .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
            onAnswer(result);
          }}
          disabled={disabled || Object.keys(matchingAnswers).filter(k => k !== '_selectedLeft').length === 0}
          className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50"
        >
          Hantar
        </motion.button>
      </div>
    );
  }

  // Ordering
  if (type === 'ordering') {
    const items = question.items || [];
    const handleOrderClick = (item) => {
      if (disabled) return;
      setSelectedOrder(prev =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 text-center">Klik untuk susun urutan yang betul</p>
        {selectedOrder.length > 0 && (
          <div className="p-3 bg-game-purple/10 rounded-2xl">
            <p className="text-xs text-game-purple font-bold mb-1">Urutan anda:</p>
            <p className="font-bold text-game-purple">{selectedOrder.join(' → ')}</p>
          </div>
        )}
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleOrderClick(item)}
              className={`w-full p-3 rounded-xl font-bold text-sm transition-all ${
                selectedOrder.includes(item) ? 'bg-game-purple text-white' : 'bg-gray-200 text-gray-800'
              }`}>
              {selectedOrder.indexOf(item) >= 0 ? `${selectedOrder.indexOf(item) + 1}. ` : ''}{item}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onAnswer(selectedOrder)}
          disabled={disabled || selectedOrder.length === 0}
          className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50">
          Hantar Urutan
        </motion.button>
      </div>
    );
  }

  // Word Builder (letters to arrange)
  if (type === 'word_builder') {
    const letters = question.letters || [];
    const remaining = letters.filter((l) => !arranged.includes(l));

    return (
      <div className="space-y-4">
        <div className="p-4 bg-game-purple/10 rounded-2xl min-h-12 flex flex-wrap gap-2 items-center justify-center">
          {arranged.length > 0 ? (
            arranged.map((l, i) => (
              <motion.button key={i} whileTap={{ scale: 0.9 }}
                onClick={() => setArranged(arranged.filter((_, idx) => idx !== i))}
                className="px-4 py-2 bg-game-purple text-white rounded-lg font-bold text-lg">
                {l}
              </motion.button>
            ))
          ) : (
            <p className="text-gray-400 text-sm">Susun huruf di sini</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {remaining.map((l, i) => (
            <motion.button key={i} whileTap={{ scale: 0.9 }}
              onClick={() => setArranged([...arranged, l])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold text-lg hover:bg-gray-300">
              {l}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onAnswer(arranged.join(''))}
          disabled={disabled || arranged.length === 0}
          className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50">
          Hantar
        </motion.button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center text-gray-500 py-4">
      <p className="text-sm">Jenis soalan: <span className="font-bold">{type}</span></p>
    </div>
  );
}