import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { isStrokeValid, calculateStrokeAccuracy, tracingPaths } from '@/lib/tracingHelper';

export default function TracingCanvas({ 
  targetShape, // 'A', '1', 'circle', etc
  onComplete, // callback when tracing is done
  width = 400, 
  height = 400,
  emoji = '✏️'
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [completed, setCompleted] = useState(false);

  const referencePath = tracingPaths[targetShape] || [];
  const canvasCtx = canvasRef.current?.getContext('2d');

  // Scale reference path to canvas size
  const scaledReferencePath = referencePath.map(p => ({
    x: p.x * width,
    y: p.y * height,
  }));

  // Draw reference path as light ghost
  useEffect(() => {
    if (!canvasCtx) return;
    
    canvasCtx.fillStyle = '#f5f5f5';
    canvasCtx.fillRect(0, 0, width, height);

    // Draw reference path lightly
    canvasCtx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
    canvasCtx.lineWidth = 3;
    canvasCtx.lineCap = 'round';
    canvasCtx.lineJoin = 'round';
    
    if (scaledReferencePath.length > 0) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(scaledReferencePath[0].x, scaledReferencePath[0].y);
      for (let i = 1; i < scaledReferencePath.length; i++) {
        canvasCtx.lineTo(scaledReferencePath[i].x, scaledReferencePath[i].y);
      }
      canvasCtx.stroke();
    }

    // Draw existing strokes
    canvasCtx.strokeStyle = '#8b5cf6';
    canvasCtx.lineWidth = 4;
    strokes.forEach(stroke => {
      canvasCtx.beginPath();
      canvasCtx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        canvasCtx.lineTo(stroke[i].x, stroke[i].y);
      }
      canvasCtx.stroke();
    });
  }, [canvasCtx, width, height, strokes, scaledReferencePath]);

  const handlePointerDown = (e) => {
    setIsDrawing(true);
    setCurrentStroke([]);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setCurrentStroke(prev => {
      const newStroke = [...prev, point];

      if (!canvasCtx) return newStroke;

      canvasCtx.strokeStyle = '#8b5cf6';
      canvasCtx.lineWidth = 4;
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';
      canvasCtx.beginPath();
      canvasCtx.moveTo(prev[prev.length - 1].x, prev[prev.length - 1].y);
      canvasCtx.lineTo(point.x, point.y);
      canvasCtx.stroke();

      return newStroke;
    });
  };

  const handlePointerUp = () => {
    if (isDrawing && currentStroke.length > 5) {
      const isValid = isStrokeValid(currentStroke, scaledReferencePath);
      
      if (isValid) {
        const acc = calculateStrokeAccuracy(currentStroke, scaledReferencePath);
        setAccuracy(acc);
        setStrokes(prev => [...prev, currentStroke]);
        
        if (acc >= 70) {
          setCompleted(true);
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#ec4899', '#3b82f6'],
          });
          
          setTimeout(() => {
            onComplete?.({
              accuracy: acc,
              completedAt: new Date().toISOString(),
            });
          }, 1000);
        }
      }
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setAccuracy(0);
    setCompleted(false);
    if (canvasCtx) {
      canvasCtx.fillStyle = '#f5f5f5';
      canvasCtx.fillRect(0, 0, width, height);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="text-center">
        <div className="text-5xl mb-2">{emoji}</div>
        <p className="text-lg font-bold text-gray-800">Telusuri "{targetShape}"</p>
        <p className="text-sm text-gray-600">Ikuti garis abu-abu dengan jari atau pensil</p>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="border-4 border-game-purple rounded-2xl cursor-crosshair touch-none shadow-lg"
          style={{ backgroundColor: '#f5f5f5' }}
        />
      </div>

      {accuracy > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay rounded-2xl p-4 text-center"
        >
          <p className="text-sm text-gray-600">Ketepatan Tracing</p>
          <p className="text-3xl font-black text-game-purple">{accuracy}%</p>
        </motion.div>
      )}

      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="clay rounded-2xl p-4 bg-green-100 text-center"
        >
          <p className="text-lg font-bold text-green-700">✅ Sempurna! Bagus sangat!</p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        {!completed && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-bold"
          >
            🔄 Ulang
          </motion.button>
        )}
        {completed && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleClear();
              setCompleted(false);
            }}
            className="px-6 py-3 bg-game-blue text-white rounded-xl font-bold"
          >
            🎯 Cuba Lagi
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}