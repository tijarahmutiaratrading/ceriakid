import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const LEVELS = [
  { targets: [{ x: 70, y: 30, label: '🎯' }], maxShots: 3 },
  { targets: [{ x: 75, y: 20, label: '🎯' }, { x: 85, y: 50, label: '🎪' }], maxShots: 4 },
  { targets: [{ x: 65, y: 15, label: '🎯' }, { x: 80, y: 40, label: '🎪' }, { x: 90, y: 60, label: '🏆' }], maxShots: 5 },
  { targets: [{ x: 60, y: 20, label: '🎯' }, { x: 80, y: 35, label: '🎪' }], maxShots: 3 },
  { targets: [{ x: 70, y: 10, label: '🎯' }, { x: 85, y: 30, label: '🎪' }, { x: 75, y: 55, label: '🏆' }, { x: 90, y: 20, label: '⭐' }], maxShots: 6 },
];

export default function PhysicsGame() {
  const [level, setLevel] = useState(0);
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(45);
  const [ballFired, setBallFired] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 20, y: 80 });
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [hitTargets, setHitTargets] = useState([]);
  const [shotsLeft, setShotsLeft] = useState(LEVELS[0].maxShots);
  const [levelOver, setLevelOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentLevel = LEVELS[level];

  const handleFire = () => {
    if (ballFired || shotsLeft <= 0) return;
    setBallFired(true);
    const powerFactor = power / 100;
    const angleRad = (angle * Math.PI) / 180;
    const distance = powerFactor * 65;
    const newX = 20 + distance * Math.cos(angleRad);
    const newY = 80 - distance * Math.sin(angleRad);

    setTimeout(() => {
      setBallPos({ x: newX, y: newY });
      const hitIdx = currentLevel.targets.findIndex(t => !hitTargets.includes(t.label) && Math.abs(newX - t.x) < 10 && Math.abs(newY - t.y) < 10);
      let newHits = hitTargets;
      if (hitIdx !== -1) {
        newHits = [...hitTargets, currentLevel.targets[hitIdx].label];
        setHitTargets(newHits);
        setScore(s => s + 20);
        setMessage('✅ Kena sasaran!');
      } else {
        setMessage('❌ Terlepas!');
      }
      const newShots = shotsLeft - 1;
      setShotsLeft(newShots);

      setTimeout(() => {
        setBallFired(false);
        setBallPos({ x: 20, y: 80 });
        setMessage('');
        if (newHits.length >= currentLevel.targets.length) { setLevelOver(true); }
        else if (newShots <= 0) { setMessage('Kehabisan tembakan! Tamat.'); setLevelOver(true); }
      }, 800);
    }, 600);
  };

  const nextLevel = () => {
    if (level + 1 >= LEVELS.length) { setGameOver(true); }
    else {
      const next = level + 1;
      setLevel(next); setHitTargets([]); setShotsLeft(LEVELS[next].maxShots);
      setPower(50); setAngle(45); setLevelOver(false); setMessage('');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to="/mini-games/physics" className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all sm:gap-2 sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🚀</div>
            <div>
              <h1 className="text-xl font-black text-white">Lontarkan Bola</h1>
              <p className="text-white/70 text-xs">Level {level + 1} / {LEVELS.length} · {shotsLeft} tembakan lagi</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {LEVELS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < level ? 'bg-white' : i === level ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-4">Semua Level Selesai!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setLevel(0); setScore(0); setHitTargets([]); setShotsLeft(LEVELS[0].maxShots); setLevelOver(false); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : !levelOver ? (
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden" style={glassCard}>
              <div className="relative m-3 h-64 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                {currentLevel.targets.map((target, idx) => (
                  <div key={idx} className={`absolute text-3xl transition-all ${hitTargets.includes(target.label) ? 'opacity-20' : ''}`}
                    style={{ left: `${target.x}%`, top: `${target.y}%` }}>
                    {hitTargets.includes(target.label) ? '💥' : target.label}
                  </div>
                ))}
                <motion.div animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }} transition={{ duration: 0.6 }} className="absolute text-2xl">⚪</motion.div>
                <div className="absolute bottom-4 left-4">
                  <motion.div animate={{ rotate: -angle }} style={{ transformOrigin: 'left center' }} className="w-10 h-2 bg-white rounded-full" />
                  <div className="text-2xl mt-1">🎪</div>
                </div>
              </div>
              {message && <motion.div className="text-center text-lg font-black text-white pb-3">{message}</motion.div>}
            </div>

            <div className="rounded-3xl p-5 space-y-4" style={glassCard}>
              <div>
                <p className="text-white/80 text-sm font-bold mb-2">⚡ Kuasa: {power}%</p>
                <input type="range" min="0" max="100" value={power} onChange={(e) => setPower(Number(e.target.value))} disabled={ballFired} className="w-full accent-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-bold mb-2">📐 Sudut: {angle}°</p>
                <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} disabled={ballFired} className="w-full accent-white" />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleFire}
                disabled={ballFired || shotsLeft <= 0}
                className="w-full py-4 bg-white text-purple-600 rounded-2xl font-black text-lg shadow-lg disabled:opacity-50">
                🔥 LONTARKAN ({shotsLeft} lagi)
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">{hitTargets.length >= currentLevel.targets.length ? '🎉' : '😓'}</p>
            <h2 className="text-2xl font-black text-white mb-2">Level {level + 1} {hitTargets.length >= currentLevel.targets.length ? 'Berjaya!' : 'Tamat'}</h2>
            <p className="text-white/70 mb-6">Kena {hitTargets.length} / {currentLevel.targets.length} sasaran</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={nextLevel}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              {level + 1 >= LEVELS.length ? 'Tamat! Lihat Skor' : 'Level Seterusnya →'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}