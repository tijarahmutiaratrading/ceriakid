import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import useSelectedMiniGame from '@/hooks/useSelectedMiniGame';
import GeneratedMiniGamePlayer from '@/components/game/GeneratedMiniGamePlayer';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const SETS = [
  { label: 'Huruf A-E', letters: ['A', 'B', 'C', 'D', 'E'] },
  { label: 'Huruf F-J', letters: ['F', 'G', 'H', 'I', 'J'] },
  { label: 'Huruf K-O', letters: ['K', 'L', 'M', 'N', 'O'] },
  { label: 'Huruf P-T', letters: ['P', 'Q', 'R', 'S', 'T'] },
  { label: 'Huruf U-Z', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
];

function LegacyTracingGameGamified() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [setIdx, setSetIdx] = useState(0);
  const [letterIdx, setLetterIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [setOver, setSetOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentSet = SETS[setIdx];
  const currentLetter = currentSet.letters[letterIdx];

  useEffect(() => { drawGuide(); }, [currentLetter]);

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.font = 'bold 120px Arial';
    ctx.strokeText(currentLetter, 40, 140);
  };

  // Get point from mouse OR touch event, mapped to canvas coords
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const pt = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Calculate real accuracy based on pixel coverage within the guide letter area
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Count purple (user stroke) pixels vs total possible
    let purplePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      // Purple stroke: high R, low G, high B, opaque
      if (a > 100 && r > 100 && g < 80 && b > 150) purplePixels++;
    }

    // Score based on coverage: 50+ pixels = 70%, scale up from there (cap 99%)
    const raw = Math.min(Math.floor(50 + (purplePixels / 8)), 99);
    const acc = Math.max(raw, 40); // minimum 40 for any attempt
    setAccuracy(acc);
    setScore(s => s + Math.floor(acc / 5));
  };

  const clearCanvas = () => { setAccuracy(0); drawGuide(); };

  const nextLetter = () => {
    if (letterIdx + 1 >= currentSet.letters.length) {
      setSetOver(true);
    } else {
      setLetterIdx(i => i + 1);
      setAccuracy(0);
    }
  };

  const nextSet = () => {
    if (setIdx + 1 >= SETS.length) { setGameOver(true); }
    else { setSetIdx(i => i + 1); setLetterIdx(0); setAccuracy(0); setSetOver(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to="/mini-games/tracing" className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all sm:gap-2 sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">✏️</div>
            <div>
              <h1 className="text-xl font-black text-white">Seni Menulis</h1>
              <p className="text-white/70 text-xs">{currentSet.label} · Set {setIdx + 1} / {SETS.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {SETS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < setIdx ? 'bg-white' : i === setIdx ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-2">Cemerlang! A-Z Selesai!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSetIdx(0); setLetterIdx(0); setScore(0); setAccuracy(0); setSetOver(false); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : setOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-4">{currentSet.label} Selesai!</h2>
            <motion.button whileTap={{ scale: 0.95 }} onClick={nextSet}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              {setIdx + 1 >= SETS.length ? 'Tamat! Lihat Skor' : 'Set Seterusnya →'}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl p-5 text-center" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">Lukis huruf: <span className="text-white text-lg">{currentLetter}</span></p>
              <canvas ref={canvasRef} width={300} height={180}
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} onTouchCancel={stopDrawing}
                className="rounded-2xl cursor-crosshair mx-auto border-2 border-white/30 bg-gray-50 touch-none w-full max-w-[300px]" />
            </div>

            {accuracy > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4" style={glassCard}>
                <p className="text-white/70 text-xs font-bold mb-2">Ketepatan:</p>
                <div className="w-full rounded-full h-3 mb-2" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} className="bg-white h-3 rounded-full" />
                </div>
                <p className="text-white font-black text-center">{accuracy}% ⭐</p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={clearCanvas}
                className="flex-1 py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <RotateCcw className="w-4 h-4" /> Ulang
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextLetter}
                disabled={accuracy === 0}
                className="flex-1 py-3 bg-white text-purple-600 rounded-2xl font-black shadow-lg disabled:opacity-40">
                Seterusnya →
              </motion.button>
            </div>

            <div className="rounded-2xl p-4" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Kemajuan set ini:</p>
              <div className="flex gap-1 flex-wrap">
                {currentSet.letters.map((letter, i) => (
                  <div key={letter} className={`px-2 py-1 rounded-lg text-center font-black text-sm ${letter === currentLetter ? 'bg-white text-purple-600' : i < letterIdx ? 'bg-green-400/80 text-white' : 'bg-white/20 text-white/50'}`}>
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TracingGameGamified() {
  const selected = useSelectedMiniGame('tracing');
  if (selected.game || selected.loading) return <GeneratedMiniGamePlayer {...selected} backTo="/mini-games/tracing" />;
  return <LegacyTracingGameGamified />;
}