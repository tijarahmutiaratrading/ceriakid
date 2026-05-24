import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Context — RoundContext carries roundData AND onProgress callback (set by shell)
export const RoundContext = React.createContext({ roundData: null, roundIdx: 0, totalRounds: 1, onProgress: () => {} });

// Specific instruction per mode — diwariskan dari category.objective kalau ada
const MODE_INSTRUCTIONS = {
  memory: 'Buka 2 kad dan cari pasangan yang sepadan.',
  dragdrop: 'Pilih item, kemudian tap kotak jawapan yang betul.',
  wordbuilder: 'Tekan huruf mengikut susunan untuk bina perkataan sasaran.',
  sorting: 'Pilih item, kemudian masukkan ke kumpulan yang betul.',
  tilematch: 'Cari 2 jubin yang menjadi pasangan.',
  story: 'Baca situasi dan pilih tindakan paling bijak.',
  true_false: 'Baca ayat, kemudian pilih Betul atau Salah.',
  physics: 'Baca ayat, kemudian pilih Betul atau Salah.',
  tracing: 'Tap setiap titik untuk surih bentuk.',
  balloon_pop: 'Pop hanya yang sama dengan sasaran.',
  falling_catch: 'Tangkap hanya yang sama dengan sasaran.',
  stacking: 'Tekan untuk tambah blok sampai cukup sasaran.',
  sequence: 'Pilih item mengikut turutan yang betul.',
  swipe_select: 'Pilih kategori yang betul untuk setiap item.',
  spin_wheel: 'Putar roda dan padankan rima.',
  picture_hunt: 'Cari gambar yang sepadan dengan sasaran.',
  hidden_object: 'Cari objek yang sepadan dengan sasaran.',
  typing_challenge: 'Taip jawapan yang betul.',
  mini_simulation: 'Pilih item dari kumpulan yang disebut.',
  rhythm_tap: 'Tekan butang ikut bilangan corak yang dipaparkan.',
  connect_dots: 'Tap nombor/huruf mengikut turutan.',
  maze: 'Gerakkan watak sampai ke destinasi.',
  reaction_speed: 'Tekan Mula, tunggu hijau, tap secepat mungkin.',
  coloring: 'Tap setiap gambar untuk warnakannya.',
};

function fireConfetti() {
  try {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#F472B6', '#A855F7', '#FBBF24', '#22D3EE'] });
  } catch (e) { /* ignore */ }
}

export default function ProMiniGameShell({ data = {}, mode, children, onComplete }) {
  const roundsArr = Array.isArray(data.rounds) && data.rounds.length > 0 && typeof data.rounds[0] === 'object'
    ? data.rounds
    : null;
  const totalRounds = roundsArr ? roundsArr.length : 1;

  const [roundIdx, setRoundIdx] = React.useState(0);
  const [roundKey, setRoundKey] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  // Per-round progress (reported by mode component)
  const [progress, setProgress] = React.useState({ current: 0, total: 1, isComplete: false });
  const completedRef = React.useRef(false);

  const currentRound = roundsArr ? roundsArr[roundIdx] : null;
  const modeInstruction = MODE_INSTRUCTIONS[mode] || data.objective || '';
  const roundLabel = currentRound?.label || '';
  const isLastRound = roundIdx >= totalRounds - 1;
  const progressPct = Math.round(((roundIdx + (progress.isComplete ? 1 : 0)) / Math.max(1, totalRounds)) * 100);

  // Callback for mode components to report progress
  const handleProgress = React.useCallback((next) => {
    setProgress(next);
    if (next.isComplete && !completedRef.current) {
      completedRef.current = true;
      fireConfetti();
    }
  }, []);

  const nextRound = () => {
    if (!progress.isComplete) return; // safety guard
    const newScore = score + 1;
    setScore(newScore);
    if (isLastRound) {
      setFinished(true);
      if (typeof onComplete === 'function') onComplete({ score: newScore, total: totalRounds });
    } else {
      setRoundIdx((i) => i + 1);
      setRoundKey((k) => k + 1);
      setProgress({ current: 0, total: 1, isComplete: false });
      completedRef.current = false;
    }
  };

  const restartRound = () => {
    setRoundKey((k) => k + 1);
    setProgress({ current: 0, total: 1, isComplete: false });
    completedRef.current = false;
  };

  const playAgain = () => {
    setRoundIdx(0);
    setRoundKey((k) => k + 1);
    setScore(0);
    setFinished(false);
    setProgress({ current: 0, total: 1, isComplete: false });
    completedRef.current = false;
  };

  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : score >= totalRounds * 0.4 ? 1 : 0;

  return (
    <RoundContext.Provider value={{ roundData: currentRound, roundIdx, totalRounds, onProgress: handleProgress }}>
      <div
        className="relative overflow-hidden rounded-[2rem] p-3 sm:p-4 shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #FFE0EC 0%, #E5DCFF 50%, #D6F0FF 100%)',
          border: '3px solid rgba(255,255,255,0.85)',
          boxShadow: '0 18px 45px rgba(168, 85, 247, 0.18)',
        }}
      >
        {/* Top bar — compact, focus on progress */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow ring-2 ring-white">
            <span className="text-lg">{data.emoji || '🎮'}</span>
            <div className="leading-tight">
              <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">Pusingan</p>
              <p className="text-xs font-black text-purple-900">{roundIdx + 1}/{totalRounds}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Skor</span>
              <span className="text-xs font-black text-purple-700">{score}/{totalRounds} ⭐</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/60 overflow-hidden ring-1 ring-white shadow-inner">
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className="h-full rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Instruction — specific & helpful */}
        <motion.div
          key={`inst-${roundIdx}-${roundKey}`}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-3 rounded-2xl px-4 py-2.5 text-center bg-white/95 shadow-md ring-1 ring-purple-100"
        >
          {roundLabel && (
            <span className="inline-block text-[9px] font-black uppercase tracking-widest text-pink-500 mb-0.5">
              {roundLabel}
            </span>
          )}
          <p className="text-sm sm:text-base font-black leading-snug text-purple-900">
            {modeInstruction}
          </p>
        </motion.div>

        {/* Game area — light, harmonic with shell */}
        <div className="relative rounded-3xl p-3 sm:p-4 bg-white/85 ring-2 ring-white shadow-inner min-h-[260px]">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="finish"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 px-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-7xl mb-3"
                >
                  🏆
                </motion.div>
                <p className="text-2xl font-black mb-1 text-purple-900">Yeay! Tahniah!</p>
                <p className="font-bold mb-3 text-purple-600">
                  Lengkap {score}/{totalRounds} pusingan
                </p>
                <div className="text-3xl mb-2 tracking-wider">
                  {'⭐'.repeat(Math.max(stars, 1))}{'☆'.repeat(3 - Math.max(stars, 1))}
                </div>
                <p className="text-xs font-bold text-purple-500">Progress disimpan ✅</p>
              </motion.div>
            ) : (
              // KEY trick: roundIdx + roundKey gives full unmount/remount per round
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

          {/* Round complete badge */}
          <AnimatePresence>
            {progress.isComplete && !finished && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-2 right-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] font-black shadow-lg ring-2 ring-white"
              >
                ✓ Selesai!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          {finished ? (
            <motion.button
              type="button"
              onClick={playAgain}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 rounded-2xl font-black text-sm text-white shadow-xl ring-2 ring-white/80"
              style={{ background: 'linear-gradient(135deg, #F472B6 0%, #A855F7 100%)' }}
            >
              🔄 Main Sekali Lagi
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={restartRound}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-2xl font-black text-sm bg-white text-purple-700 shadow-md ring-2 ring-purple-100"
              >
                🔄 Ulang
              </motion.button>
              {totalRounds > 1 && (
                <motion.button
                  type="button"
                  onClick={nextRound}
                  disabled={!progress.isComplete}
                  whileTap={progress.isComplete ? { scale: 0.95 } : {}}
                  className={`flex-[2] py-3 rounded-2xl font-black text-sm text-white shadow-xl ring-2 ring-white/80 transition-all ${progress.isComplete ? '' : 'opacity-40 cursor-not-allowed'}`}
                  style={{
                    background: !progress.isComplete
                      ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                      : isLastRound
                        ? 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)'
                        : 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)',
                  }}
                >
                  {!progress.isComplete ? '⏳ Siapkan dulu' : isLastRound ? '🏆 Habiskan' : `➡️ Pusingan ${roundIdx + 2}`}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </RoundContext.Provider>
  );
}