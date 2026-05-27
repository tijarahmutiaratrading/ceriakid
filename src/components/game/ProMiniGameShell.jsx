import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScorePop, StreakBadge, fireRoundConfetti, fireFinalCelebration, triggerHaptic } from './SatisfyingEffects';
import { playSound } from '@/lib/soundManager';

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
  tracing: 'Tap titik bernombor (1, 2, 3...) mengikut turutan untuk bentuk huruf.',
  balloon_pop: 'Pop hanya yang sama dengan sasaran.',
  falling_catch: 'Tangkap hanya yang sama dengan sasaran.',
  stacking: 'Tekan untuk tambah blok sampai cukup sasaran.',
  sequence: 'Pilih item mengikut turutan yang betul.',
  swipe_select: 'Pilih kategori yang betul untuk setiap item.',
  spin_wheel: 'Tekan butang untuk putar roda dan baca pilihan yang keluar.',
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

export default function ProMiniGameShell({ data = {}, mode, children, onComplete }) {
  const roundsArr = Array.isArray(data.rounds) && data.rounds.length > 0 && typeof data.rounds[0] === 'object'
    ? data.rounds
    : null;
  const totalRounds = roundsArr ? roundsArr.length : 1;

  const [roundIdx, setRoundIdx] = React.useState(0);
  const [roundKey, setRoundKey] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [scorePopTrigger, setScorePopTrigger] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  // Per-round progress (reported by mode component)
  const [progress, setProgress] = React.useState({ current: 0, total: 1, isComplete: false });
  const completedRef = React.useRef(false);

  const currentRound = roundsArr ? roundsArr[roundIdx] : null;
  const modeInstruction = MODE_INSTRUCTIONS[mode] || data.objective || '';
  const roundLabel = currentRound?.label || '';
  const isLastRound = roundIdx >= totalRounds - 1;
  const progressPct = Math.round(((roundIdx + (progress.isComplete ? 1 : 0)) / Math.max(1, totalRounds)) * 100);

  // Ref-based versions so auto-advance timer can access fresh values
  const roundIdxRef = React.useRef(0);
  const scoreRef = React.useRef(0);
  const isLastRoundRef = React.useRef(false);
  React.useEffect(() => { roundIdxRef.current = roundIdx; }, [roundIdx]);
  React.useEffect(() => { scoreRef.current = score; }, [score]);
  React.useEffect(() => { isLastRoundRef.current = isLastRound; }, [isLastRound]);

  const advanceToNext = React.useCallback(() => {
    const newScore = scoreRef.current + 1;
    setScore(newScore);
    if (isLastRoundRef.current) {
      setFinished(true);
      fireFinalCelebration();
      triggerHaptic([50, 100, 50, 100, 200]);
      playSound('complete');
      if (typeof onComplete === 'function') onComplete({ score: newScore, total: totalRounds });
    } else {
      triggerHaptic(20);
      playSound('click');
      setRoundIdx((i) => i + 1);
      setRoundKey((k) => k + 1);
      setProgress({ current: 0, total: 1, isComplete: false });
      completedRef.current = false;
    }
  }, [onComplete, totalRounds]);

  // Callback for mode components to report progress
  const handleProgress = React.useCallback((next) => {
    setProgress(next);
    if (next.isComplete && !completedRef.current) {
      completedRef.current = true;
      fireRoundConfetti();
      triggerHaptic([30, 60, 30]);
      playSound('correct');
      setScorePopTrigger(t => t + 1);
      setStreak(s => s + 1);
      // Auto-advance ke pusingan seterusnya selepas 1.6s (cukup untuk confetti + reaksi)
      setTimeout(() => {
        if (completedRef.current) advanceToNext();
      }, 1600);
    }
  }, [advanceToNext]);

  const nextRound = () => {
    if (!progress.isComplete) return; // safety guard
    advanceToNext();
  };

  const restartRound = () => {
    triggerHaptic(15);
    setRoundKey((k) => k + 1);
    setProgress({ current: 0, total: 1, isComplete: false });
    completedRef.current = false;
    setStreak(0);
  };

  const playAgain = () => {
    triggerHaptic(20);
    setRoundIdx(0);
    setRoundKey((k) => k + 1);
    setScore(0);
    setStreak(0);
    setFinished(false);
    setProgress({ current: 0, total: 1, isComplete: false });
    completedRef.current = false;
  };

  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : score >= totalRounds * 0.4 ? 1 : 0;

  return (
    <RoundContext.Provider value={{ roundData: currentRound, roundIdx, totalRounds, onProgress: handleProgress }}>
      {/* Floating score pop — outside game area for max visibility */}
      <ScorePop trigger={scorePopTrigger} />

      <div
        className="relative overflow-hidden rounded-[2rem] p-3 sm:p-4"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 18px 50px rgba(15,23,42,0.10)',
        }}
      >
        {/* Top bar — Apple-clean with streak badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 ring-1 ring-black/5">
            <span className="text-lg">{data.emoji || '🎮'}</span>
            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Pusingan</p>
              <p className="text-xs font-black text-slate-900">{roundIdx + 1}/{totalRounds}</p>
            </div>
            <StreakBadge streak={streak} />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Skor</span>
              <motion.span
                key={score}
                initial={{ scale: 1.4, color: '#FBBF24' }}
                animate={{ scale: 1, color: '#0F172A' }}
                transition={{ duration: 0.4 }}
                className="text-xs font-black"
              >
                {score}/{totalRounds} ⭐
              </motion.span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F472B6 0%, #A855F7 50%, #22D3EE 100%)' }}
              />
            </div>
          </div>
        </div>

        {/* Instruction — Apple-style soft card */}
        <motion.div
          key={`inst-${roundIdx}-${roundKey}`}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-3 rounded-2xl px-4 py-2.5 text-center bg-slate-50 ring-1 ring-black/5"
        >
          {roundLabel && (
            <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-purple-500 mb-0.5">
              {roundLabel}
            </span>
          )}
          <p className="text-sm sm:text-base font-bold leading-snug text-slate-800">
            {modeInstruction}
          </p>
        </motion.div>

        {/* Game area — clean white with soft inner */}
        <div className="relative rounded-3xl p-3 sm:p-4 bg-white ring-1 ring-black/5 min-h-[260px]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6)' }}>
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
                  style={{ filter: 'drop-shadow(0 8px 24px rgba(251,191,36,0.4))' }}
                >
                  🏆
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black mb-1 text-slate-900 tracking-tight"
                >
                  Yeay! Tahniah!
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-bold mb-4 text-slate-500"
                >
                  Lengkap {score}/{totalRounds} pusingan
                </motion.p>
                <div className="flex justify-center gap-1.5 mb-3">
                  {[0, 1, 2].map((i) => {
                    const earned = i < Math.max(stars, 1);
                    return (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.15, type: 'spring', damping: 10, stiffness: 200 }}
                        className="text-4xl"
                        style={earned ? { filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.5))' } : { opacity: 0.25 }}
                      >
                        {earned ? '⭐' : '☆'}
                      </motion.span>
                    );
                  })}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 ring-1 ring-emerald-100"
                >
                  ✓ Progress disimpan
                </motion.p>
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

          {/* Round complete badge — bigger, more satisfying */}
          <AnimatePresence>
            {progress.isComplete && !finished && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 280 }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-white text-[11px] font-black shadow-lg flex items-center gap-1"
                style={{
                  background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.4), 0 0 0 2px white',
                }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.6 }}
                >
                  ✓
                </motion.span>
                Selesai!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons — Apple pill style */}
        <div className="mt-3 flex gap-2">
          {finished ? (
            <motion.button
              type="button"
              onClick={playAgain}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                boxShadow: '0 8px 20px rgba(168,85,247,0.35)',
              }}
            >
              🔄 Main Sekali Lagi
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                onClick={restartRound}
                whileTap={{ scale: 0.96 }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                🔄 Ulang
              </motion.button>
              {totalRounds > 1 && (
                <motion.button
                  type="button"
                  onClick={nextRound}
                  disabled={!progress.isComplete}
                  whileTap={progress.isComplete ? { scale: 0.96 } : {}}
                  whileHover={progress.isComplete ? { y: -2 } : {}}
                  animate={progress.isComplete ? { scale: [1, 1.02, 1] } : {}}
                  transition={progress.isComplete ? { duration: 1.2, repeat: Infinity } : {}}
                  className={`flex-[2] py-3 rounded-2xl font-bold text-sm text-white transition-all ${progress.isComplete ? '' : 'opacity-40 cursor-not-allowed'}`}
                  style={{
                    background: !progress.isComplete
                      ? '#94A3B8'
                      : isLastRound
                        ? 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)'
                        : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                    boxShadow: progress.isComplete
                      ? isLastRound
                        ? '0 8px 20px rgba(251,191,36,0.4)'
                        : '0 8px 20px rgba(15,23,42,0.25)'
                      : 'none',
                  }}
                >
                  {!progress.isComplete ? '⏳ Siapkan dulu' : isLastRound ? '🏆 Habiskan' : '⚡ Seterusnya...'}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </RoundContext.Provider>
  );
}