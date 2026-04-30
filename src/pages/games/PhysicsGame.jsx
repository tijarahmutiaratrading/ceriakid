import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function PhysicsGame() {
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(45);
  const [ballFired, setBallFired] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 20, y: 80 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');

  const targets = [
    { x: 70, y: 20, label: '🎯', hit: false },
    { x: 85, y: 40, label: '🎪', hit: false },
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
      
      // Simple hit detection
      const hitTarget = targets.some(t => 
        Math.abs(newX - t.x) < 8 && Math.abs(newY - t.y) < 8
      );

      if (hitTarget) {
        setMessage('✅ Kena sasaran!');
        setScore(score + 20);
      } else {
        setMessage('❌ Terlepas!');
      }

      setTimeout(() => {
        setBallFired(false);
        setBallPos({ x: 20, y: 80 });
        setMessage('');
        setPower(0);
        setAngle(45);
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">🎯 Lontarkan Bola</h1>
          <div className="text-2xl font-black text-blue-600">{score} ⭐</div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* Game Arena */}
          <div className="relative w-full h-80 bg-gradient-to-b from-sky-200 to-sky-50 rounded-2xl mb-8 overflow-hidden border-2 border-blue-300">
            {/* Targets */}
            {targets.map((target, idx) => (
              <motion.div
                key={idx}
                className="absolute text-4xl"
                style={{ left: `${target.x}%`, top: `${target.y}%` }}
              >
                {target.label}
              </motion.div>
            ))}

            {/* Ball */}
            <motion.div
              animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              transition={{ duration: 0.6 }}
              className="absolute text-3xl"
            >
              ⚪
            </motion.div>

            {/* Launcher */}
            <div className="absolute bottom-4 left-4">
              <motion.div
                animate={{ rotate: angle }}
                style={{ transformOrigin: 'center' }}
                className="w-12 h-2 bg-gray-800 rounded-full"
              />
              <div className="text-3xl mt-2">🎪</div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <motion.div className="text-center text-lg font-black mb-4">
              {message}
            </motion.div>
          )}

          {/* Controls */}
          <div className="space-y-6">
            {/* Power */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-2">Kuasa: {power}%</p>
              <input
                type="range"
                min="0"
                max="100"
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                disabled={ballFired}
                className="w-full"
              />
            </div>

            {/* Angle */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-2">Sudut: {angle}°</p>
              <input
                type="range"
                min="0"
                max="90"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                disabled={ballFired}
                className="w-full"
              />
            </div>

            {/* Fire Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFire}
              disabled={ballFired}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-lg disabled:opacity-50"
            >
              🔥 LONTARKAN
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}