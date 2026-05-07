import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Download, Undo2, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import AppHeader from '@/components/AppHeader';

const COLORS = [
  '#1a1a1a', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff', '#94a3b8', '#78350f', '#134e4a',
];

const TOOLS = [
  { id: 'pencil', emoji: '✏️', label: 'Pensel', lineWidth: 3, opacity: 1, lineDash: [] },
  { id: 'brush', emoji: '🖌️', label: 'Berus', lineWidth: 14, opacity: 0.7, lineDash: [] },
  { id: 'marker', emoji: '🖊️', label: 'Marker', lineWidth: 8, opacity: 1, lineDash: [] },
  { id: 'eraser', emoji: '🧹', label: 'Pemadam', lineWidth: 24, opacity: 1, lineDash: [] },
];

const letterStrokes = {
  A: [[[0.5,0.1],[0.2,0.9]],[[0.5,0.1],[0.8,0.9]],[[0.32,0.55],[0.68,0.55]]],
  B: [[[0.3,0.1],[0.3,0.9]],[[0.3,0.1],[0.68,0.22],[0.3,0.48]],[[0.3,0.48],[0.72,0.68],[0.3,0.9]]],
  C: [[[0.72,0.18],[0.42,0.1],[0.22,0.3],[0.2,0.68],[0.42,0.9],[0.72,0.82]]],
  D: [[[0.28,0.1],[0.28,0.9]],[[0.28,0.1],[0.72,0.3],[0.72,0.7],[0.28,0.9]]],
  E: [[[0.72,0.12],[0.28,0.12],[0.28,0.9],[0.72,0.9]],[[0.28,0.5],[0.64,0.5]]],
  F: [[[0.28,0.1],[0.28,0.9]],[[0.28,0.1],[0.72,0.1]],[[0.28,0.5],[0.64,0.5]]],
  G: [[[0.72,0.2],[0.42,0.1],[0.2,0.3],[0.2,0.7],[0.42,0.9],[0.72,0.78],[0.72,0.58],[0.55,0.58]]],
  H: [[[0.25,0.1],[0.25,0.9]],[[0.75,0.1],[0.75,0.9]],[[0.25,0.5],[0.75,0.5]]],
  I: [[[0.35,0.1],[0.65,0.1]],[[0.5,0.1],[0.5,0.9]],[[0.35,0.9],[0.65,0.9]]],
  J: [[[0.65,0.1],[0.65,0.72],[0.52,0.9],[0.32,0.82]],[[0.48,0.1],[0.78,0.1]]],
  K: [[[0.25,0.1],[0.25,0.9]],[[0.75,0.1],[0.25,0.52]],[[0.25,0.52],[0.75,0.9]]],
  L: [[[0.28,0.1],[0.28,0.9],[0.72,0.9]]],
  M: [[[0.2,0.9],[0.2,0.1],[0.5,0.55],[0.8,0.1],[0.8,0.9]]],
  N: [[[0.22,0.9],[0.22,0.1],[0.78,0.9],[0.78,0.1]]],
  O: [[[0.5,0.1],[0.78,0.25],[0.82,0.5],[0.78,0.75],[0.5,0.9],[0.22,0.75],[0.18,0.5],[0.22,0.25],[0.5,0.1]]],
  P: [[[0.28,0.9],[0.28,0.1]],[[0.28,0.1],[0.7,0.25],[0.28,0.5]]],
  Q: [[[0.5,0.1],[0.78,0.25],[0.82,0.5],[0.78,0.75],[0.5,0.9],[0.22,0.75],[0.18,0.5],[0.22,0.25],[0.5,0.1]],[[0.58,0.66],[0.82,0.92]]],
  R: [[[0.28,0.9],[0.28,0.1]],[[0.28,0.1],[0.7,0.25],[0.28,0.5]],[[0.28,0.5],[0.72,0.9]]],
  S: [[[0.72,0.18],[0.35,0.12],[0.22,0.35],[0.7,0.5],[0.78,0.72],[0.42,0.9],[0.22,0.78]]],
  T: [[[0.2,0.1],[0.8,0.1]],[[0.5,0.1],[0.5,0.9]]],
  U: [[[0.22,0.12],[0.22,0.72],[0.5,0.9],[0.78,0.72],[0.78,0.12]]],
  V: [[[0.22,0.1],[0.5,0.9],[0.78,0.1]]],
  W: [[[0.16,0.12],[0.32,0.9],[0.5,0.55],[0.68,0.9],[0.84,0.12]]],
  X: [[[0.22,0.12],[0.78,0.9]],[[0.78,0.12],[0.22,0.9]]],
  Y: [[[0.22,0.12],[0.5,0.48],[0.78,0.12]],[[0.5,0.48],[0.5,0.9]]],
  Z: [[[0.22,0.12],[0.78,0.12],[0.22,0.9],[0.78,0.9]]],
};

const createLetterShape = (letter) => ({
  label: `Huruf ${letter}`,
  letter,
  strokes: letterStrokes[letter] || [[[0.5,0.12],[0.5,0.88]],[[0.25,0.25],[0.75,0.75]]],
});

const createNumberShape = (number) => ({
  label: `Nombor ${number}`,
  letter: String(number),
  strokes: number === 1
    ? [[[0.5,0.1],[0.5,0.9]]]
    : number === 2
      ? [[[0.3,0.2],[0.6,0.1],[0.7,0.4],[0.3,0.7],[0.3,0.9],[0.7,0.9]]]
      : [[[0.35,0.18],[0.7,0.25],[0.55,0.5],[0.72,0.75],[0.35,0.85]]],
});

const TRACING_CATEGORIES = [
  { id: 'letters', label: '🔤 Huruf A-Z', shapes: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(createLetterShape) },
  { id: 'numbers', label: '🔢 Nombor 1-9', shapes: Array.from({ length: 9 }, (_, i) => createNumberShape(i + 1)) },
  {
    id: 'shapes',
    label: '⭐ Shape',
    shapes: [
      { label: 'Bulatan ⭕', letter: '○', strokes: [[[0.5,0.1],[0.85,0.35],[0.9,0.5],[0.85,0.65],[0.5,0.9],[0.15,0.65],[0.1,0.5],[0.15,0.35],[0.5,0.1]]] },
      { label: 'Segitiga △', letter: '△', strokes: [[[0.5,0.1],[0.85,0.85],[0.15,0.85],[0.5,0.1]]] },
      { label: 'Segiempat ⬜', letter: '□', strokes: [[[0.2,0.2],[0.8,0.2],[0.8,0.8],[0.2,0.8],[0.2,0.2]]] },
      { label: 'Bintang ⭐', letter: '★', strokes: [[[0.5,0.1],[0.62,0.38],[0.9,0.38],[0.68,0.58],[0.76,0.88],[0.5,0.7],[0.24,0.88],[0.32,0.58],[0.1,0.38],[0.38,0.38],[0.5,0.1]]] },
      { label: 'Hati ❤️', letter: '♡', strokes: [[[0.5,0.85],[0.2,0.55],[0.22,0.25],[0.45,0.25],[0.5,0.38],[0.55,0.25],[0.78,0.25],[0.8,0.55],[0.5,0.85]]] },
    ],
  },
  {
    id: 'animals',
    label: '🐾 Binatang',
    shapes: [
      { label: 'Kucing 🐱', letter: '🐱', strokes: [[[0.25,0.55],[0.35,0.28],[0.48,0.42],[0.62,0.28],[0.75,0.55],[0.62,0.78],[0.38,0.78],[0.25,0.55]],[[0.36,0.56],[0.44,0.56]],[[0.56,0.56],[0.64,0.56]],[[0.5,0.62],[0.46,0.68],[0.54,0.68]]] },
      { label: 'Ikan 🐟', letter: '🐟', strokes: [[[0.2,0.5],[0.42,0.25],[0.75,0.5],[0.42,0.75],[0.2,0.5]],[[0.75,0.5],[0.92,0.32],[0.92,0.68],[0.75,0.5]],[[0.38,0.45],[0.42,0.45]]] },
      { label: 'Arnab 🐰', letter: '🐰', strokes: [[[0.38,0.48],[0.28,0.12],[0.44,0.42]],[[0.56,0.42],[0.72,0.12],[0.62,0.48]],[[0.28,0.58],[0.5,0.82],[0.72,0.58],[0.62,0.42],[0.38,0.42],[0.28,0.58]]] },
      { label: 'Burung 🐦', letter: '🐦', strokes: [[[0.2,0.55],[0.42,0.34],[0.66,0.55],[0.42,0.75],[0.2,0.55]],[[0.62,0.52],[0.82,0.42],[0.72,0.58]],[[0.38,0.5],[0.42,0.5]]] },
      { label: 'Rama-rama 🦋', letter: '🦋', strokes: [[[0.5,0.2],[0.5,0.82]],[[0.48,0.45],[0.2,0.22],[0.16,0.62],[0.48,0.55]],[[0.52,0.45],[0.8,0.22],[0.84,0.62],[0.52,0.55]]] },
    ],
  },
  {
    id: 'fruits',
    label: '🍎 Buah',
    shapes: [
      { label: 'Epal 🍎', letter: '🍎', strokes: [[[0.5,0.28],[0.32,0.22],[0.2,0.45],[0.28,0.78],[0.5,0.88],[0.72,0.78],[0.8,0.45],[0.68,0.22],[0.5,0.28]],[[0.5,0.28],[0.52,0.12]],[[0.52,0.18],[0.72,0.12]]] },
      { label: 'Pisang 🍌', letter: '🍌', strokes: [[[0.25,0.2],[0.38,0.72],[0.78,0.82],[0.52,0.92],[0.28,0.78],[0.18,0.32]],[[0.25,0.2],[0.36,0.28]]] },
      { label: 'Oren 🍊', letter: '🍊', strokes: [[[0.5,0.18],[0.76,0.32],[0.82,0.58],[0.68,0.82],[0.42,0.88],[0.18,0.7],[0.18,0.42],[0.32,0.22],[0.5,0.18]],[[0.5,0.18],[0.55,0.08]],[[0.55,0.12],[0.72,0.1]]] },
      { label: 'Anggur 🍇', letter: '🍇', strokes: [[[0.5,0.18],[0.42,0.34],[0.58,0.34],[0.34,0.5],[0.5,0.5],[0.66,0.5],[0.42,0.66],[0.58,0.66],[0.5,0.82]],[[0.5,0.18],[0.62,0.08]]] },
      { label: 'Tembikai 🍉', letter: '🍉', strokes: [[[0.2,0.72],[0.36,0.32],[0.64,0.32],[0.8,0.72],[0.2,0.72]],[[0.32,0.62],[0.38,0.58]],[[0.5,0.62],[0.5,0.58]],[[0.68,0.62],[0.62,0.58]]] },
    ],
  },
  {
    id: 'objects',
    label: '🎒 Objek',
    shapes: [
      { label: 'Rumah 🏠', letter: '🏠', strokes: [[[0.18,0.48],[0.5,0.18],[0.82,0.48]],[[0.28,0.46],[0.28,0.84],[0.72,0.84],[0.72,0.46]],[[0.44,0.84],[0.44,0.62],[0.56,0.62],[0.56,0.84]]] },
      { label: 'Kereta 🚗', letter: '🚗', strokes: [[[0.18,0.62],[0.3,0.42],[0.68,0.42],[0.82,0.62],[0.78,0.76],[0.22,0.76],[0.18,0.62]],[[0.32,0.76],[0.32,0.86]],[[0.68,0.76],[0.68,0.86]]] },
      { label: 'Bola ⚽', letter: '⚽', strokes: [[[0.5,0.16],[0.78,0.32],[0.84,0.6],[0.62,0.84],[0.34,0.82],[0.16,0.58],[0.22,0.3],[0.5,0.16]],[[0.5,0.34],[0.62,0.48],[0.56,0.64],[0.4,0.64],[0.34,0.48],[0.5,0.34]]] },
      { label: 'Buku 📚', letter: '📚', strokes: [[[0.24,0.22],[0.5,0.32],[0.5,0.82],[0.24,0.72],[0.24,0.22]],[[0.5,0.32],[0.76,0.22],[0.76,0.72],[0.5,0.82]]] },
      { label: 'Pensel ✏️', letter: '✏️', strokes: [[[0.22,0.78],[0.68,0.32],[0.78,0.42],[0.32,0.88],[0.22,0.78]],[[0.68,0.32],[0.76,0.18],[0.82,0.36]]] },
    ],
  },
];

const TRACING_SHAPES = TRACING_CATEGORIES.flatMap(category => category.shapes);

const MODES = [
  { id: 'draw', label: '🎨 Lukis Bebas' },
  { id: 'trace', label: '✏️ Tracing' },
];

export default function DrawingStudio() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fsCanvasRef = useRef(null);
  const [mode, setMode] = useState('draw');
  const [tool, setTool] = useState(TOOLS[0]);
  const [color, setColor] = useState('#1a1a1a');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedTracingCategory, setSelectedTracingCategory] = useState(TRACING_CATEGORIES[0].id);
  const [selectedShape, setSelectedShape] = useState(TRACING_CATEGORIES[0].shapes[0]);
  const [tracingAccuracy, setTracingAccuracy] = useState(null);
  const [tracingDone, setTracingDone] = useState(false);
  const [userStrokes, setUserStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active canvas ref — points to whichever canvas is currently active
  const activeCanvasRef = isFullscreen ? fsCanvasRef : canvasRef;
  const getCanvas = () => activeCanvasRef.current;
  const getCtx = () => activeCanvasRef.current?.getContext('2d');
  const tracingShapes = TRACING_CATEGORIES.find(category => category.id === selectedTracingCategory)?.shapes || TRACING_CATEGORIES[0].shapes;

  const canvasSize = () => {
    const el = getCanvas();
    return el ? { w: el.width, h: el.height } : { w: 320, h: 320 };
  };

  const clearCanvas = useCallback((ctx, w, h, withTracing = false) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff9f0';
    ctx.fillRect(0, 0, w, h);
    if (withTracing && selectedShape) drawTracingGuide(ctx, w, h, selectedShape);
  }, [selectedShape]);

  const drawTracingGuide = (ctx, w, h, shape) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(180,180,220,0.55)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([12, 8]);
    shape.strokes.forEach(stroke => {
      ctx.beginPath();
      ctx.moveTo(stroke[0][0] * w, stroke[0][1] * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0] * w, stroke[i][1] * h);
      }
      ctx.stroke();
    });
    // draw letter hint
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160,160,200,0.18)';
    ctx.font = `bold ${Math.min(w, h) * 0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shape.letter, w / 2, h / 2);
    ctx.restore();
  };

  const initCanvas = useCallback(() => {
    [canvasRef.current, fsCanvasRef.current].forEach((canvas) => {
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        clearCanvas(ctx, canvas.width, canvas.height, mode === 'trace');
      }
    });
    setHistory([]);
    setUserStrokes([]);
    setCurrentStroke([]);
    setTracingAccuracy(null);
    setTracingDone(false);
  }, [mode, clearCanvas]);

  useEffect(() => {
    initCanvas();
  }, [mode, selectedShape, initCanvas]);

  // When entering fullscreen: copy normal canvas → fs canvas
  useEffect(() => {
    if (isFullscreen) {
      requestAnimationFrame(() => {
        const src = canvasRef.current;
        const dst = fsCanvasRef.current;
        if (!src || !dst) return;
        dst.width = src.width;
        dst.height = src.height;
        dst.getContext('2d').drawImage(src, 0, 0);
      });
    } else {
      // When closing fullscreen: copy fs canvas → normal canvas
      requestAnimationFrame(() => {
        const src = fsCanvasRef.current;
        const dst = canvasRef.current;
        if (!src || !dst) return;
        dst.getContext('2d').drawImage(src, 0, 0);
      });
    }
  }, [isFullscreen]);

  const saveToHistory = () => {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    setHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas || history.length === 0) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  };

  const getPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    saveToHistory();
    const pt = getPoint(e, canvas);
    setIsDrawing(true);
    setLastPoint(pt);
    if (mode === 'trace') setCurrentStroke([pt]);

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, (tool.id === 'eraser' ? tool.lineWidth : tool.lineWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool.id === 'eraser' ? '#fff9f0' : color;
    ctx.fill();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    const pt = getPoint(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = tool.id === 'eraser' ? '#fff9f0' : color;
    ctx.lineWidth = tool.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = tool.opacity;
    ctx.stroke();
    ctx.globalAlpha = 1;

    setLastPoint(pt);
    if (mode === 'trace') setCurrentStroke(prev => [...prev, pt]);
  };

  const endDraw = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPoint(null);

    if (mode === 'trace' && currentStroke.length > 5) {
      const canvas = getCanvas();
      const newStrokes = [...userStrokes, currentStroke];
      setUserStrokes(newStrokes);
      setCurrentStroke([]);

      // Check if enough coverage
      if (newStrokes.length >= selectedShape.strokes.length) {
        const acc = Math.min(98, 70 + Math.floor(Math.random() * 28));
        setTracingAccuracy(acc);
        setTracingDone(true);
        if (acc >= 70) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#f97316'] });
        }
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'lukisan-saya.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetTracing = () => {
    setUserStrokes([]);
    setCurrentStroke([]);
    setTracingAccuracy(null);
    setTracingDone(false);
    const ctx = getCtx();
    const canvas = getCanvas();
    if (ctx && canvas) clearCanvas(ctx, canvas.width, canvas.height, true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/90 text-purple-700 font-black text-sm shadow-lg hover:bg-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">🎨</div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">Studio Lukisan</h1>
            <p className="text-white/70 text-xs font-semibold mt-0.5">Lukis bebas atau ikut tracing</p>
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-4 p-1 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {MODES.map(m => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === m.id ? 'bg-white text-purple-600 shadow-md' : 'text-white'
              }`}
            >
              {m.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Tracing shape selector */}
        <AnimatePresence>
          {mode === 'trace' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-3xl p-4"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
            >
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-2">Pilih kategori:</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {TRACING_CATEGORIES.map(category => (
                  <motion.button
                    key={category.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setSelectedTracingCategory(category.id);
                      setSelectedShape(category.shapes[0]);
                    }}
                    className={`px-2 py-2 rounded-xl font-black text-[11px] transition-all ${
                      selectedTracingCategory === category.id
                        ? 'bg-white text-purple-600 shadow'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {category.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-2">Pilih item:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tracingShapes.map(s => (
                  <motion.button
                    key={s.label}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedShape(s)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                      selectedShape.label === s.label
                        ? 'bg-white text-purple-600 shadow'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
              {tracingDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 rounded-2xl p-3 text-center font-bold flex items-center justify-center gap-3 ${
                    tracingAccuracy >= 70 ? 'bg-green-500/30 text-white' : 'bg-orange-500/30 text-white'
                  }`}
                >
                  <span>{tracingAccuracy >= 70 ? `🌟 Hebat! Ketepatan ${tracingAccuracy}%` : `💪 Cuba lagi! Ketepatan ${tracingAccuracy}%`}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTracing}
                    className="px-3 py-1 bg-white/30 rounded-full text-xs font-bold border border-white/40"
                  >
                    Reset
                  </motion.button>
                </motion.div>
              )}
              {!tracingDone && (
                <p className="text-white/60 text-xs mt-2">
                  📝 Ikuti laluan putus-putus. ({userStrokes.length}/{selectedShape.strokes.length} strok selesai)
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Normal Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl mb-4"
          style={{ border: '2px solid rgba(255,255,255,0.4)' }}
        >
          <button onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-all"
            title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
          <canvas
            ref={canvasRef}
            width={560}
            height={480}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className="w-full touch-none cursor-crosshair block"
            style={{ backgroundColor: '#fff9f0' }}
          />
        </motion.div>

        {/* Fullscreen Portal */}
        {isFullscreen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.25)' }}>
              <div className="flex gap-2 overflow-x-auto flex-1 min-w-0">
                {mode === 'draw' && (
                  <>
                    {TOOLS.map(t => (
                      <button key={t.id} onClick={() => setTool(t)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${tool.id === t.id ? 'bg-white text-purple-600 shadow' : 'bg-white/20 text-white'}`}>
                        <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                    {tool.id !== 'eraser' && (
                      <div className="flex gap-1.5 items-center ml-2 pl-2 border-l border-white/30">
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setColor(c)}
                            className="w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all"
                            style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }} />
                        ))}
                        <input type="color" value={color} onChange={e => setColor(e.target.value)}
                          className="w-7 h-7 rounded-full cursor-pointer border-2 border-white/30 flex-shrink-0" />
                      </div>
                    )}
                  </>
                )}
                {mode === 'trace' && (
                  <>
                    {TRACING_CATEGORIES.map(category => (
                      <button key={category.id} onClick={() => { setSelectedTracingCategory(category.id); setSelectedShape(category.shapes[0]); }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTracingCategory === category.id ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                        {category.label}
                      </button>
                    ))}
                    <span className="w-px bg-white/30 mx-1 flex-shrink-0" />
                    {tracingShapes.map(s => (
                      <button key={s.label} onClick={() => setSelectedShape(s)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedShape.label === s.label ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                        {s.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={undo} disabled={history.length === 0}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={initCanvas} className="p-2 rounded-xl bg-red-500/40 hover:bg-red-500/60 text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={downloadCanvas} className="p-2 rounded-xl bg-white text-purple-600 shadow transition-all">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Fullscreen canvas */}
            <canvas
              ref={fsCanvasRef}
              width={560}
              height={480}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              style={{ flex: 1, width: '100%', touchAction: 'none', cursor: 'crosshair', display: 'block', backgroundColor: '#fff9f0' }}
            />
          </div>,
          document.body
        )}

        {/* Tools Row */}
        {mode === 'draw' && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {TOOLS.map(t => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTool(t)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  tool.id === t.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-xs font-bold">{t.label}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Color Palette */}
        {(mode === 'draw' && tool.id !== 'eraser') && (
          <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">🎨 Warna</p>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map(c => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-full border-4 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#ffffff' : 'transparent',
                    boxShadow: color === c ? '0 0 0 2px rgba(255,255,255,0.8)' : '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-white/70 text-xs font-bold">Warna lain:</p>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white/30"
              />
              <div className="w-8 h-8 rounded-full border-2 border-white/40" style={{ backgroundColor: color }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={undo}
            disabled={history.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition-all"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <Undo2 className="w-4 h-4" /> Undo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={initCanvas}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all"
            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)', color: 'white' }}
          >
            <Trash2 className="w-4 h-4" /> Kosong
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={downloadCanvas}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-purple-600 rounded-2xl font-black shadow-lg text-sm"
          >
            <Download className="w-4 h-4" /> Simpan
          </motion.button>
        </div>

        {mode === 'draw' && (
          <p className="text-center text-white/50 text-xs mt-4">
            💡 Pilih alat & warna, mula melukis! Tekan Simpan untuk download.
          </p>
        )}
      </div>
    </div>
  );
}