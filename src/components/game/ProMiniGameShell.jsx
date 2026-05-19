import React from 'react';

export default function ProMiniGameShell({ data = {}, mode, children }) {
  const rounds = Array.isArray(data.rounds) && data.rounds.length > 0 ? data.rounds : null;
  const totalRounds = rounds ? rounds.length : 1;
  const [roundIdx, setRoundIdx] = React.useState(0);
  const [roundKey, setRoundKey] = React.useState(0);

  const currentRoundLabel = rounds ? rounds[roundIdx] : '';
  const instruction = currentRoundLabel || data.instruction || data.question || data.prompt || data.title || '';
  const modeLabel = String(mode || '').replaceAll('_', ' ');
  const isLastRound = roundIdx >= totalRounds - 1;

  const nextRound = () => {
    if (isLastRound) {
      // Restart from round 1
      setRoundIdx(0);
    } else {
      setRoundIdx((i) => i + 1);
    }
    setRoundKey((k) => k + 1);
  };

  const restartRound = () => setRoundKey((k) => k + 1);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] p-3 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #8B5A3C 0%, #6B4423 50%, #5A3818 100%)',
        border: '4px solid #4A2E14',
        boxShadow: '0 12px 32px rgba(74, 46, 20, 0.4), inset 0 2px 8px rgba(255, 220, 180, 0.15)',
      }}
    >
      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none rounded-[2rem]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(74,46,20,0.15) 0px, rgba(74,46,20,0.15) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(180deg, rgba(255,220,180,0.04) 0px, transparent 2px)',
        }}
      />

      {/* Round counter badge */}
      {rounds && (
        <div className="relative mb-2 flex items-center justify-center gap-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black"
            style={{
              background: 'linear-gradient(135deg, #FDF6E3 0%, #F5E6CC 100%)',
              border: '2px solid #C8A878',
              color: '#4A2E14',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6)',
            }}
          >
            🎯 Pusingan {roundIdx + 1} / {totalRounds}
          </div>
        </div>
      )}

      {/* Instruction banner */}
      {instruction && (
        <div
          className="relative mb-3 rounded-[1.5rem] px-4 py-3 text-center"
          style={{
            background: 'linear-gradient(135deg, #FDF6E3 0%, #F5E6CC 100%)',
            border: '2px solid #C8A878',
            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.6), 0 4px 10px rgba(74,46,20,0.25)',
          }}
        >
          {modeLabel && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#8B5A3C' }}>
              {modeLabel}
            </p>
          )}
          <p className="text-base sm:text-lg font-black leading-snug" style={{ color: '#4A2E14' }}>
            {instruction}
          </p>
        </div>
      )}

      <div
        className="relative rounded-[1.75rem] p-3"
        style={{
          background: 'linear-gradient(135deg, #FDF6E3 0%, #F0E2C8 100%)',
          border: '3px solid #C8A878',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.5)',
        }}
      >
        <div key={`${roundIdx}-${roundKey}`}>{children}</div>
      </div>

      {/* Round controls */}
      <div className="relative mt-3 flex gap-2">
        <button
          type="button"
          onClick={restartRound}
          className="flex-1 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #FDF6E3 0%, #F5E6CC 100%)',
            border: '2px solid #C8A878',
            color: '#4A2E14',
            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.6), 0 4px 10px rgba(74,46,20,0.25)',
          }}
        >
          🔄 Ulang
        </button>
        {rounds && (
          <button
            type="button"
            onClick={nextRound}
            className="flex-[2] py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform text-white"
            style={{
              background: isLastRound
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, #8B5A3C 0%, #6B4423 100%)',
              border: '2px solid #4A2E14',
              boxShadow: '0 4px 10px rgba(74,46,20,0.4)',
            }}
          >
            {isLastRound ? '🏆 Mula Semula' : `➡️ Pusingan ${roundIdx + 2}`}
          </button>
        )}
      </div>
    </div>
  );
}