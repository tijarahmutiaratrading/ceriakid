import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';

export default function ArcadeGameOver({ score, best, tokens = [], onRestart }) {
  const navigate = useNavigate();
  const isNewBest = score >= best && score > 0;

  // Mesej nilai murni — dari token terakhir dikutip, atau mesej default
  const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <div className="text-5xl mb-2">{isNewBest ? '🏆' : '🎮'}</div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {isNewBest ? 'Rekod Baru!' : 'Permainan Tamat!'}
        </h2>

        <div className="flex justify-center gap-3 my-4">
          <div className="flex-1 rounded-2xl bg-purple-50 border border-purple-100 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Skor</p>
            <p className="text-2xl font-black text-purple-700">{score}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-amber-50 border border-amber-100 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Terbaik</p>
            <p className="text-2xl font-black text-amber-600">{best}</p>
          </div>
        </div>

        {tokens.length > 0 && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1.5">
              Nilai Murni Dikutip ({tokens.length})
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              {tokens.slice(-8).map((t, i) => (
                <span key={i} className="text-xl">{t.emoji}</span>
              ))}
            </div>
            {lastToken && (
              <p className="text-xs font-bold text-emerald-700 leading-snug">
                {lastToken.emoji} {lastToken.name}: "{lastToken.message}"
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/arcade')}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 font-black text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Home className="w-4 h-4" /> Keluar
          </button>
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-black text-white shadow-lg hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" /> Main Lagi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}