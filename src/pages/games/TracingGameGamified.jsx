import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function TracingGameGamified() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentLetter, setCurrentLetter] = useState('A');

  const letters = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.font = 'bold 120px Arial';
    ctx.strokeText(currentLetter, 40, 140);
  }, [currentLetter]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const acc = Math.floor(Math.random() * 40) + 60;
    setAccuracy(acc);
    setScore(s => {
      if (s + acc >= 400) setCompleted(true);
      return s + acc;
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.font = 'bold 120px Arial';
    ctx.strokeText(currentLetter, 40, 140);
    setAccuracy(0);
  };

  const nextLetter = () => {
    const idx = letters.indexOf(currentLetter);
    if (idx < letters.length - 1) { setCurrentLetter(letters[idx + 1]); clearCanvas(); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">✏️</div>
            <div>
              <h1 className="text-xl font-black text-white">Seni Menulis</h1>
              <p className="text-white/70 text-xs">Lukis huruf mengikut panduan</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        {!completed ? (
          <div className="space-y-4">
            {/* Canvas */}
            <div className="rounded-3xl p-5 text-center" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">Huruf: {currentLetter}</p>
              <canvas ref={canvasRef} width={300} height={200}
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                className="rounded-2xl cursor-crosshair mx-auto border-2 border-white/30 bg-gray-50" />
            </div>

            {/* Accuracy */}
            {accuracy > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4" style={glassCard}>
                <p className="text-white/70 text-xs font-bold mb-2">Ketepatan:</p>
                <div className="w-full rounded-full h-3 mb-2" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }}
                    className="bg-white h-3 rounded-full" />
                </div>
                <p className="text-white font-black text-center">{accuracy}% ⭐</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={clearCanvas}
                className="flex-1 py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <RotateCcw className="w-4 h-4" /> Ulang
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextLetter}
                disabled={accuracy === 0 || currentLetter === letters[letters.length - 1]}
                className="flex-1 py-3 bg-white text-purple-600 rounded-2xl font-black shadow-lg disabled:opacity-40">
                Seterusnya →
              </motion.button>
            </div>

            {/* Progress */}
            <div className="rounded-2xl p-4" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Kemajuan:</p>
              <div className="flex gap-2">
                {letters.map((letter, idx) => (
                  <div key={letter} className={`flex-1 py-2 rounded-xl text-center font-black text-sm ${
                    letter === currentLetter ? 'bg-white text-purple-600' :
                    idx < letters.indexOf(currentLetter) ? 'bg-green-400/80 text-white' : 'bg-white/20 text-white/50'
                  }`}>{letter}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-2">Cemerlang!</h2>
            <p className="text-white/70 mb-4">Latihan menulis selesai!</p>
            <p className="text-3xl font-black text-yellow-300 mb-6">Total: {score} ⭐</p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Ulang Permainan</motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}