import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function PhysicsGame() {
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(45);
  const [ballFired, setBallFired] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 20, y: 80 });
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  const targets = [
    { x: 70, y: 20, label: '🎯' },
    { x: 85, y: 40, label: '🎪' },
  ];

  const handleFire = () => {
    setBallFired(true);
    const powerFactor = power / 100;
    const angleRad = (angle * Math.PI) / 180;
    const distance = powerFactor * 60;
    const newX = 20 + distance * Math.cos(angleRad);
    const newY = 80 - distance * Math.sin(angleRad);

    setTimeout(() => {
      setBallPos({ x: newX, y: newY });
      const hitTarget = targets.some(t => Math.abs(newX - t.x) < 8 && Math.abs(newY - t.y) < 8);
      setMessage(hitTarget ? '✅ Kena sasaran!' : '❌ Terlepas!');
      if (hitTarget) setScore(s => s + 20);
      setTimeout(() => { setBallFired(false); setBallPos({ x: 20, y: 80 }); setMessage(''); setPower(0); setAngle(45); }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🚀</div>
            <div>
              <h1 className="text-xl font-black text-white">Lontarkan Bola</h1>
              <p className="text-white/70 text-xs">Atur kuasa & sudut untuk kena sasaran!</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="space-y-4">
          {/* Arena */}
          <div className="rounded-3xl overflow-hidden" style={glassCard}>
            <div className="relative w-full h-72 rounded-2xl overflow-hidden m-3" style={{ background: 'rgba(255,255,255,0.15)', width: 'calc(100% - 24px)' }}>
              {targets.map((target, idx) => (
                <div key={idx} className="absolute text-4xl" style={{ left: `${target.x}%`, top: `${target.y}%` }}>{target.label}</div>
              ))}
              <motion.div animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }} transition={{ duration: 0.6 }} className="absolute text-3xl">⚪</motion.div>
              <div className="absolute bottom-4 left-4">
                <motion.div animate={{ rotate: angle }} style={{ transformOrigin: 'center' }} className="w-12 h-2 bg-white rounded-full" />
                <div className="text-3xl mt-2">🎪</div>
              </div>
            </div>
            {message && (
              <motion.div className="text-center text-lg font-black text-white pb-3">{message}</motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="rounded-3xl p-5 space-y-5" style={glassCard}>
            <div>
              <p className="text-white/80 text-sm font-bold mb-2">⚡ Kuasa: {power}%</p>
              <input type="range" min="0" max="100" value={power} onChange={(e) => setPower(Number(e.target.value))}
                disabled={ballFired} className="w-full accent-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold mb-2">📐 Sudut: {angle}°</p>
              <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                disabled={ballFired} className="w-full accent-white" />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleFire}
              disabled={ballFired}
              className="w-full py-4 bg-white text-purple-600 rounded-2xl font-black text-lg shadow-lg disabled:opacity-50">
              🔥 LONTARKAN
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}