import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  try {
    const location = useLocation();
  } catch {
    return null;
  }

  const isLanding = typeof window !== 'undefined' && window.location.pathname === '/';

  // Only render footer on Landing page
  if (!isLanding) {
    return null;
  }

  return (
    <footer className="text-white py-4 text-center md:py-5 relative w-full" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #6b21a8 100%)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-black text-lg mb-1">🎓 CeriaKid © 2026</p>
      <p className="text-white/80 text-sm mb-5">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
      <div className="flex justify-center gap-6 text-xs text-white/60">
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Terma Penggunaan</a>
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Dasar Privasi</a>
        <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Hubungi Kami</a>
      </div>
    </footer>
  );
}