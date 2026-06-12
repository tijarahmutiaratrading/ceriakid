import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';

// Shell skrin penuh untuk arcade games — header skor + lives + canvas area
export default function ArcadeShell({ title, emoji, score, lives, tokenCount, children }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 select-none" style={{ touchAction: 'none' }}>
      {/* Glow ambient gaya PS5 di belakang HUD */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(70% 100% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2.5" style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}>
        <Link
          to="/arcade"
          className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 px-3.5 py-2 text-sm font-black text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Keluar
        </Link>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 px-3.5 py-2 text-sm font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]">
            {emoji} {score}
          </div>
          {tokenCount !== undefined && (
            <div className="rounded-full bg-emerald-500/20 backdrop-blur-md ring-1 ring-emerald-300/20 px-3 py-2 text-sm font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              ⭐ {tokenCount}
            </div>
          )}
          {lives !== undefined && (
            <div className="flex items-center gap-0.5 rounded-full bg-red-500/20 backdrop-blur-md ring-1 ring-red-300/20 px-3 py-2">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-3.5 h-3.5 ${i < lives ? 'text-red-400 fill-red-400' : 'text-white/20'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Game area */}
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}