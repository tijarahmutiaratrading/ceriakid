import React from 'react';

// Latar sinematik gaya PS5 — gelap, glow ambient, starfield halus & vignette
export default function CinematicBackdrop({ accent = '#8b5cf6', accent2 = '#ec4899' }) {
  return (
    <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-slate-950" />
      {/* Glow ambient utama (atas kanan) */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(55% 45% at 78% 8%, ${accent}3d 0%, transparent 70%)` }}
      />
      {/* Glow sekunder (bawah kiri) */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(50% 42% at 12% 90%, ${accent2}2e 0%, transparent 70%)` }}
      />
      {/* Starfield halus */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1.5px)',
          backgroundSize: '110px 110px',
        }}
      />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)',
          backgroundSize: '70px 70px',
          backgroundPosition: '35px 35px',
        }}
      />
      {/* Vignette sinematik */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(2,6,23,0.6) 100%)' }}
      />
    </div>
  );
}