import React from 'react';

// Sticky-note panel — yellow-beige paper with masking tape on top, slight rotation
export function StickyNotePanel({ children, className = '', rotate = 0, tapeColor = '#fde68a', noTape = false }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Masking tape strip */}
      {!noTape && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-2deg] z-10 opacity-90"
          style={{
            backgroundColor: tapeColor,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 6px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        />
      )}
      <div
        className="relative rounded-[1.5rem] p-4"
        style={{
          backgroundColor: '#fef9e7',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.45 0 0 0 0 0.2 0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
          boxShadow: '0 4px 12px rgba(120, 80, 40, 0.18), 0 1px 2px rgba(120, 80, 40, 0.1), inset 0 0 0 2px rgba(180, 130, 60, 0.15)',
          border: '2px solid #d4a574',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Doodle-style label header — uppercase, sketch underline
export function DoodleLabel({ children, accent = '#d97706' }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-amber-600 text-lg leading-none">✨</span>
      <h3
        className="font-black text-sm uppercase tracking-wider"
        style={{ color: accent, fontFamily: 'var(--font-nunito)' }}
      >
        {children}
      </h3>
      <svg className="flex-1 h-2 text-amber-600/40" viewBox="0 0 100 8" preserveAspectRatio="none">
        <path d="M0,4 Q25,1 50,4 T100,4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Wooden frame wrapping — for the main canvas, evokes a chalkboard/picture frame feel
export function WoodFrame({ children, title, headerActions }) {
  return (
    <div className="relative">
      <div
        className="rounded-[1.75rem] p-3 sm:p-4 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #8b5e34 0%, #6b4423 35%, #5c3a1e 65%, #7a4f2e 100%)',
          backgroundImage: `linear-gradient(135deg, #8b5e34 0%, #6b4423 35%, #5c3a1e 65%, #7a4f2e 100%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.7' numOctaves='3'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23w)'/></svg>")`,
          backgroundBlendMode: 'overlay',
          boxShadow: '0 12px 40px rgba(60, 30, 10, 0.35), inset 0 2px 4px rgba(255, 220, 180, 0.15), inset 0 -3px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Brass corner screws */}
        {[
          'top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2',
        ].map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-3 h-3 rounded-full z-10`}
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fbbf24, #b45309 70%, #78350f)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(0,0,0,0.3)',
            }}
          />
        ))}

        {/* Title bar inside frame */}
        {(title || headerActions) && (
          <div className="flex items-center justify-between gap-2 px-3 pt-1 pb-2 mb-2">
            <div className="min-w-0 flex-1 text-center">
              {title}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {headerActions}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

// Parchment scroll — for the guidance panel at the bottom
export function ParchmentScroll({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Rolled ends */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-[90%] rounded-l-full" style={{ background: 'linear-gradient(90deg, #a07444, #c89968)', boxShadow: '2px 0 6px rgba(0,0,0,0.15)' }} />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-[90%] rounded-r-full" style={{ background: 'linear-gradient(270deg, #a07444, #c89968)', boxShadow: '-2px 0 6px rgba(0,0,0,0.15)' }} />

      <div
        className="relative rounded-lg px-6 py-4"
        style={{
          backgroundColor: '#f5e6c8',
          backgroundImage: `linear-gradient(180deg, rgba(180, 130, 70, 0.08), rgba(180, 130, 70, 0.02) 20%, rgba(180, 130, 70, 0.02) 80%, rgba(180, 130, 70, 0.08)), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.15 0 0 0 0.1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>")`,
          boxShadow: 'inset 0 0 25px rgba(160, 110, 50, 0.18), 0 4px 12px rgba(120, 80, 40, 0.2)',
          borderTop: '1px solid #c89968',
          borderBottom: '1px solid #c89968',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Wooden button — for the Save action
export function WoodButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-xl font-black text-amber-50 text-sm transition-all active:scale-95 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #92400e 0%, #78350f 50%, #92400e 100%)',
        backgroundImage: `linear-gradient(135deg, #92400e 0%, #78350f 50%, #92400e 100%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='wb'><feTurbulence type='fractalNoise' baseFrequency='0.03 0.6' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23wb)'/></svg>")`,
        backgroundBlendMode: 'overlay',
        boxShadow: '0 4px 10px rgba(60, 30, 10, 0.35), inset 0 1px 2px rgba(255, 220, 180, 0.2), inset 0 -2px 3px rgba(0, 0, 0, 0.25)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}