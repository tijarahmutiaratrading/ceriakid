import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  try {
    const location = useLocation();
  } catch {
    return null;
  }

  return (
    <footer className="text-white py-8 text-center md:py-10 relative w-full" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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