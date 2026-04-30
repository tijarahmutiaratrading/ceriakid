import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Volume2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

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
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw letter outline (guide)
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
    calculateAccuracy();
  };

  const calculateAccuracy = () => {
    const randomAccuracy = Math.floor(Math.random() * 40) + 60; // 60-100%
    setAccuracy(randomAccuracy);
    setScore(score + randomAccuracy);
    
    if (score + randomAccuracy >= 400) {
      setCompleted(true);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.font = 'bold 120px Arial';
    ctx.strokeText(currentLetter, 40, 140);
  };

  const nextLetter = () => {
    const currentIdx = letters.indexOf(currentLetter);
    if (currentIdx < letters.length - 1) {
      setCurrentLetter(letters[currentIdx + 1]);
      clearCanvas();
      setAccuracy(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-purple-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">✏️ Seni Menulis</h1>
          <div className="text-2xl font-black text-purple-600">{score} ⭐</div>
        </div>

        {!completed ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
            {/* Letter to Trace */}
            <div className="text-center">
              <p className="text-sm font-bold text-gray-600 mb-2">Huruf: {currentLetter}</p>
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border-2 border-purple-300 rounded-xl cursor-crosshair mx-auto bg-gray-50"
              />
            </div>

            {/* Accuracy */}
            {accuracy > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 rounded-xl p-4 text-center"
              >
                <p className="text-sm text-gray-600 font-bold mb-2">Ketepatan:</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    className="bg-purple-500 h-3 rounded-full"
                  />
                </div>
                <p className="text-lg font-black text-purple-600">{accuracy}% ⭐</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearCanvas}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-black"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Ulang
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextLetter}
                disabled={accuracy === 0 || currentLetter === letters[letters.length - 1]}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black disabled:opacity-50"
              >
                Seterusnya →
              </motion.button>
            </div>

            {/* Progress */}
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-600 mb-2">Kemajuan:</p>
              <div className="flex gap-2">
                {letters.map((letter, idx) => (
                  <div
                    key={letter}
                    className={`flex-1 py-2 rounded-lg text-center font-black ${
                      letter === currentLetter
                        ? 'bg-purple-600 text-white'
                        : idx < letters.indexOf(currentLetter)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Cemerlang!</h2>
            <p className="text-gray-600 mb-6">Anda telah menyelesaikan latihan menulis!</p>
            <p className="text-3xl font-black text-purple-600 mb-6">Total Skor: {score} ⭐</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-black"
            >
              Ulang Permainan
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}