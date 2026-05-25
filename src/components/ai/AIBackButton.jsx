import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AIBackButton({ to = '/dashboard', label = 'Kembali' }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs backdrop-blur-md border border-white/20 shadow-lg transition-all print:hidden"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}