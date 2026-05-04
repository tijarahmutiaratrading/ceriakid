import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  try {
    const location = useLocation();
  } catch {
    return null;
  }

  const isLanding = typeof window !== 'undefined' && window.location.pathname === '/';

  // Don't render footer on Landing page (it has its own)
  if (isLanding) {
    return null;
  }

  return (
    <footer className="text-white py-3 md:py-4 relative w-full" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #6b21a8 100%)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-black text-sm md:text-lg mb-0.5 md:mb-1">🎓 CeriaKid © 2026</p>
      <p className="text-white/80 text-xs md:text-sm mb-3 md:mb-4">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs text-white/60 px-3">
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white transition-colors">Terma Penggunaan</a>
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white transition-colors">Dasar Privasi</a>
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white transition-colors">Hubungi Kami</a>
      </div>
    </footer>
  );
}