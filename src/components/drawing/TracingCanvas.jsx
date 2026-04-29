import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { isStrokeValid, calculateStrokeAccuracy, tracingPaths } from '@/lib/tracingHelper';

export default function TracingCanvas({ 
  targetShape,
  onComplete,
  width = 320, 
  height = 320,
  emoji = '✏️'
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef([]);
  const [strokes, setStrokes] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [completed, setCompleted] = useState(false);

  const referencePath = tracingPaths[targetShape] || [];

  const getScaledPath = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    return referencePath.map(p => ({
      x: p.x * canvas.width,
      y: p.y * canvas.height,
    }));
  }, [referencePath]);

  const redraw = useCallback((strokesToRender) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scaledPath = getScaledPath();

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f9f5ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dashed ghost reference path
    if (scaledPath.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 160, 220, 0.6)';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([24, 16]);
      scaledPath.forEach(seg => {
        if (!Array.isArray(seg)) return;
        ctx.beginPath();
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          ctx.lineTo(seg[i].x, seg[i].y);
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    // Draw user strokes
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    strokesToRender.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  }, [getScaledPath]);

  // Init canvas on mount and when shape changes
  useEffect(() => {
    setStrokes([]);
    setAccuracy(0);
    setCompleted(false);
    isDrawingRef.current = false;
    currentStrokeRef.current = [];

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual pixel size (handle device pixel ratio for sharp rendering)
    const dpr = window.devicePixelRatio || 1;
    const displayW = width;
    const displayH = height;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = displayW + 'px';
    canvas.style.height = displayH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    redraw([]);
  }, [targetShape, width, height]);

  useEffect(() => {
    redraw(strokes);
  }, [strokes, redraw]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale to actual canvas coordinates (accounting for DPR and any CSS scaling)
    const scaleX = (canvas.width / dpr) / rect.width;
    const scaleY = (canvas.height / dpr) / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const onStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pt = getPoint(e);
    currentStrokeRef.current = [pt];
  };

  const onMove = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const pt = getPoint(e);
    currentStrokeRef.current = [...currentStrokeRef.current, pt];

    // Live draw current stroke on top
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prev = currentStrokeRef.current;
    if (prev.length < 2) return;
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(prev[prev.length - 2].x, prev[prev.length - 2].y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const onEnd = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = [];

    if (stroke.length < 5) return;

    const scaledPath = getScaledPath();
    const flatPath = scaledPath.flat ? scaledPath.flat() : [].concat(...scaledPath);
    const acc = calculateStrokeAccuracy(stroke, flatPath);
    setAccuracy(acc);
    const newStrokes = [...strokes, stroke];
    setStrokes(newStrokes);

    if (acc >= 60) {
      setCompleted(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#3b82f6'] });
      setTimeout(() => {
        onComplete?.({ accuracy: acc, completedAt: new Date().toISOString() });
      }, 1000);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setAccuracy(0);
    setCompleted(false);
    isDrawingRef.current = false;
    currentStrokeRef.current = [];
    redraw([]);
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
        <p className="text-sm text-gray-600">Ikuti garis ungu dengan jari atau pensil ✏️</p>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          // Touch events
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
          onTouchCancel={onEnd}
          // Mouse/Pointer events (desktop)
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          className="border-4 border-game-purple rounded-2xl shadow-lg bg-purple-50"
          style={{ 
            touchAction: 'none',
            cursor: 'crosshair',
            maxWidth: '100%',
          }}
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
          {accuracy >= 60 ? (
            <p className="text-green-600 font-bold">✅ Bagus sekali!</p>
          ) : (
            <p className="text-orange-500 font-bold">💪 Cuba lagi, hampir dah!</p>
          )}
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
          className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-bold"
        >
          🔄 Ulang
        </motion.button>
      </div>
    </motion.div>
  );
}