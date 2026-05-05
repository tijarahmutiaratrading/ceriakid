import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function QuestionRenderer({ question, onAnswer, disabled, selectedIdx, isCorrect, showFeedback }) {
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
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {question.options?.map((option, i) => (
          <motion.button
            key={`opt-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            onClick={() => !disabled && onAnswer(i)}
            disabled={disabled}
            className={`clay-button min-h-14 rounded-2xl py-4 px-3 font-bold text-center transition-all text-sm sm:text-base break-words ${
              showFeedback && selectedIdx === i
                ? isCorrect
                  ? 'bg-green-200 ring-2 ring-green-500'
                  : 'bg-red-200 ring-2 ring-red-500'
                : showFeedback && i === question.answer
                  ? 'bg-green-100 ring-2 ring-green-400' // highlight correct answer when wrong
                  : ''
            }`}
          >
            {typeof option === 'string' ? option : option?.label ?? String(option)}
          </motion.button>
        ))}
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
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-300 focus:border-game-purple outline-none text-center font-bold"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTextSubmit}
          disabled={disabled || !textInput.trim()}
          className="px-6 py-3 bg-game-purple text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50"
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