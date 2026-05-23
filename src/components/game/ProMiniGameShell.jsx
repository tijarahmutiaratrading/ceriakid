import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Context untuk current round data
export const RoundContext = React.createContext({ roundData: null, roundIdx: 0, totalRounds: 1 });

// Mascot kecil — bouncing buddy
function Mascot({ mood = 'happy' }) {
  const face = mood === 'cheer' ? '🥳' : mood === 'wow' ? '🤩' : '🐯';
  return (
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      className="text-4xl drop-shadow-lg select-none"
      aria-hidden
    >
      {face}
    </motion.div>
  );
}

// Decorative floating shapes
function FloatingBits() {
  const bits = ['⭐', '✨', '🎈', '🌈', '☁️', '🎉'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((bit, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-60"
          style={{ left: `${(i * 17 + 5) % 90}%`, top: `${(i * 23 + 8) % 70}%` }}
          animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.4, ease: 'easeInOut', delay: i * 0.3 }}
        >
          {bit}
        </motion.span>
      ))}
    </div>
  );
}

export default function ProMiniGameShell({ data = {}, mode, children, onComplete }) {
  const roundsArr = Array.isArray(data.rounds) && data.rounds.length > 0 && typeof data.rounds[0] === 'object'
    ? data.rounds
    : null;
  const totalRounds = roundsArr ? roundsArr.length : 1;
  const [roundIdx, setRoundIdx] = React.useState(0);
  const [roundKey, setRoundKey] = React.useState(0);
  const [completedRounds, setCompletedRounds] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const savedRef = React.useRef(false);

  const currentRound = roundsArr ? roundsArr[roundIdx] : null;
  const roundLabel = currentRound?.label || (typeof data.rounds?.[roundIdx] === 'string' ? data.rounds[roundIdx] : '');
  const instruction = roundLabel || data.instruction || data.question || data.prompt || data.title || '';
  const modeLabel = String(mode || '').replaceAll('_', ' ');
  const isLastRound = roundIdx >= totalRounds - 1;
  const progressPct = Math.round(((roundIdx + (finished ? 1 : 0)) / Math.max(1, totalRounds)) * 100);

  const nextRound = () => {
    const newCompleted = completedRounds + 1;
    setCompletedRounds(newCompleted);
    if (isLastRound) {
      if (!savedRef.current) {
        savedRef.current = true;
        setFinished(true);
        if (typeof onComplete === 'function') onComplete({ score: newCompleted, total: totalRounds });
      }
    } else {
      setRoundIdx((i) => i + 1);
      setRoundKey((k) => k + 1);
    }
  };

  const restartRound = () => setRoundKey((k) => k + 1);

  const playAgain = () => {
    setRoundIdx(0);
    setRoundKey((k) => k + 1);
    setCompletedRounds(0);
    setFinished(false);
    savedRef.current = false;
  };

  return (
    <RoundContext.Provider value={{ roundData: currentRound, roundIdx, totalRounds }}>
      <div
        className="relative overflow-hidden rounded-[2.25rem] p-3 sm:p-4 shadow-2xl"
        style={{
          background:
            'linear-gradient(135deg, #FF7AB6 0%, #A78BFA 35%, #6FC3F7 70%, #5EEAD4 100%)',
          border: '4px solid rgba(255,255,255,0.65)',
          boxShadow:
            '0 20px 50px rgba(124, 58, 237, 0.35), inset 0 2px 10px rgba(255,255,255,0.5)',
        }}
      >
        <FloatingBits />

        {/* Top bar — mascot + round chip + progress */}
        <div className="relative flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/85 backdrop-blur shadow-md ring-2 ring-white">
            <Mascot mood={finished ? 'cheer' : 'happy'} />
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Mini Game</p>
              <p className="text-sm font-black text-purple-900">Jom Main!</p>
            </div>
          </div>

          {totalRounds > 1 && (
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow">Pusingan</span>
                <span className="text-xs font-black text-white drop-shadow">
                  {roundIdx + 1} / {totalRounds}
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/30 overflow-hidden ring-2 ring-white/60 shadow-inner">
                <motion.div
                  animate={{ width: `${progressPct}%` }}
                  transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                  className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 shadow"
                />
              </div>
            </div>
          )}
        </div>

        {/* Instruction bubble */}
        {instruction && (
          <motion.div
            key={`inst-${roundIdx}-${roundKey}`}
            initial={{ scale: 0.9, opacity: 0, y: -6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative mb-3 rounded-3xl px-4 py-3 text-center bg-white/95 backdrop-blur shadow-xl ring-2 ring-white"
          >
            {modeLabel && (
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.18em] text-pink-500 mb-1">
                ✨ {modeLabel}
              </span>
            )}
            <p className="text-base sm:text-lg font-black leading-snug text-purple-900">
              {instruction}
            </p>
          </motion.div>
        )}

        {/* Game area */}
        <div
          className="relative rounded-[1.75rem] p-3 sm:p-4 bg-white/85 backdrop-blur ring-2 ring-white shadow-inner min-h-[240px]"
        >
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="finish"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="text-center py-10 px-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-7xl mb-3"
                >
                  🏆
                </motion.div>
                <p className="text-2xl font-black mb-1 text-purple-900">Yeay! Tahniah!</p>
                <p className="font-bold mb-4 text-purple-600">
                  Habis {completedRounds}/{totalRounds} pusingan
                </p>
                <div className="text-3xl mb-3">
                  {completedRounds === totalRounds ? '⭐⭐⭐' : completedRounds >= totalRounds * 0.7 ? '⭐⭐' : '⭐'}
                </div>
                <p className="text-xs font-bold text-purple-500">Progress disimpan ✅</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${roundIdx}-${roundKey}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="relative mt-3 flex gap-2">
          {finished ? (
            <motion.button
              type="button"
              onClick={playAgain}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white shadow-xl ring-2 ring-white/80"
              style={{
                background: 'linear-gradient(135deg, #F472B6 0%, #A855F7 100%)',
              }}
            >
              🔄 Main Sekali Lagi
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={restartRound}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-2xl font-black text-sm bg-white text-purple-700 shadow-lg ring-2 ring-white/80"
              >
                🔄 Ulang
              </motion.button>
              {totalRounds > 1 && (
                <motion.button
                  type="button"
                  onClick={nextRound}
                  whileTap={{ scale: 0.95 }}
                  className="flex-[2] py-3 rounded-2xl font-black text-sm text-white shadow-xl ring-2 ring-white/80"
                  style={{
                    background: isLastRound
                      ? 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)'
                      : 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)',
                  }}
                >
                  {isLastRound ? '🏆 Habiskan' : `➡️ Pusingan ${roundIdx + 2}`}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </RoundContext.Provider>
  );
}