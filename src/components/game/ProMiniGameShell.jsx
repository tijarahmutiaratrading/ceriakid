import React from 'react';

export default function ProMiniGameShell({ data = {}, mode, children }) {
  const instruction = data.instruction || data.question || data.prompt || data.title || '';
  const modeLabel = String(mode || '').replaceAll('_', ' ');
  const [roundKey, setRoundKey] = React.useState(0);

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
        <div key={roundKey}>{children}</div>
      </div>

      {/* Round restart — supaya boleh main banyak kali */}
      <button
        type="button"
        onClick={() => setRoundKey((k) => k + 1)}
        className="relative mt-3 w-full py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #FDF6E3 0%, #F5E6CC 100%)',
          border: '2px solid #C8A878',
          color: '#4A2E14',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.6), 0 4px 10px rgba(74,46,20,0.25)',
        }}
      >
        🔄 Main Sekali Lagi
      </button>
    </div>
  );
}