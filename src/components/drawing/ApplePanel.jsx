import React from 'react';

// Clean Apple-style panel — white frosted glass surface, soft shadow, gentle radius.
// Replaces the busy sticky-note / wood / parchment frames with a single calm container.
export function ApplePanel({ children, className = '', tight = false }) {
  return (
    <div
      className={`relative rounded-3xl bg-white/80 backdrop-blur-xl ring-1 ring-black/5 ${tight ? 'p-4' : 'p-5'} ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 28px rgba(15,23,42,0.06)' }}
    >
      {children}
    </div>
  );
}

export function AppleSectionLabel({ children, accent }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {accent && <span className="text-base">{accent}</span>}
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{children}</p>
    </div>
  );
}

// Pill-shaped primary action button (Apple HIG style)
export function AppleButton({ children, onClick, disabled, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    accent: 'bg-blue-500 text-white hover:bg-blue-600',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      style={{ boxShadow: variant === 'primary' ? '0 1px 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.08)' : undefined }}
      {...props}
    >
      {children}
    </button>
  );
}