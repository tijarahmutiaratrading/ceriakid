import React from 'react';
import { useGameTheme } from '@/lib/GameThemeContext';

// Latar belakang yang tukar ikut tema main game.
// Gelap = glow sinematik PS5. Cerah = putih dengan corak garis halus.
export default function GameThemeBackground() {
  const { isDark } = useGameTheme();

  if (isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-violet-600/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 -left-28 w-[250px] h-[250px] md:w-[440px] md:h-[440px] bg-cyan-500/12 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[280px] h-[280px] md:w-[440px] md:h-[440px] bg-fuchsia-500/12 rounded-full filter blur-3xl" />
      </div>
    );
  }

  // Tema cerah — background putih dengan grid garis halus
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(100,116,139,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,116,139,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-40 -right-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-violet-300/20 rounded-full filter blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 w-[280px] h-[280px] md:w-[440px] md:h-[440px] bg-pink-300/20 rounded-full filter blur-3xl" />
    </div>
  );
}