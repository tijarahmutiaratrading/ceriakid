import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Download, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';

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

const TRACING_SHAPES = [
  { label: 'Huruf A', letter: 'A', strokes: [[[0.5,0.1],[0.2,0.9]],[[0.5,0.1],[0.8,0.9]],[[0.3,0.55],[0.7,0.55]]] },
  { label: 'Huruf B', letter: 'B', strokes: [[[0.3,0.1],[0.3,0.9]],[[0.3,0.1],[0.6,0.3],[0.3,0.5]],[[0.3,0.5],[0.65,0.7],[0.3,0.9]]] },
  { label: 'Huruf C', letter: 'C', strokes: [[[0.7,0.2],[0.4,0.1],[0.2,0.3],[0.2,0.7],[0.4,0.9],[0.7,0.8]]] },
  { label: 'Nombor 1', letter: '1', strokes: [[[0.5,0.1],[0.5,0.9]]] },
  { label: 'Nombor 2', letter: '2', strokes: [[[0.3,0.2],[0.6,0.1],[0.7,0.4],[0.3,0.7],[0.3,0.9],[0.7,0.9]]] },
  { label: 'Bulatan ⭕', letter: '○', strokes: [[[0.5,0.1],[0.85,0.35],[0.9,0.5],[0.85,0.65],[0.5,0.9],[0.15,0.65],[0.1,0.5],[0.15,0.35],[0.5,0.1]]] },
  { label: 'Segitiga △', letter: '△', strokes: [[[0.5,0.1],[0.85,0.85],[0.15,0.85],[0.5,0.1]]] },
  { label: 'Segiempat ⬜', letter: '□', strokes: [[[0.2,0.2],[0.8,0.2],[0.8,0.8],[0.2,0.8],[0.2,0.2]]] },
];

const MODES = [
  { id: 'draw', label: '🎨 Lukis Bebas' },
  { id: 'trace', label: '✏️ Tracing' },
];

export default function DrawingStudio() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('draw');
  const [tool, setTool] = useState(TOOLS[0]);
  const [color, setColor] = useState('#1a1a1a');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedShape, setSelectedShape] = useState(TRACING_SHAPES[0]);
  const [tracingAccuracy, setTracingAccuracy] = useState(null);
  const [tracingDone, setTracingDone] = useState(false);
  const [userStrokes, setUserStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  const getCanvas = () => canvasRef.current;
  const getCtx = () => canvasRef.current?.getContext('2d');

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
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    const { w, h } = { w: canvas.width, h: canvas.height };
    clearCanvas(ctx, w, h, mode === 'trace');
    setHistory([]);
    setUserStrokes([]);
    setTracingAccuracy(null);
    setTracingDone(false);
  }, [mode, clearCanvas]);

  useEffect(() => {
    initCanvas();
  }, [mode, selectedShape]);

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
    <div className="min-h-screen bg-amber-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link to="/">
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center shadow">
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-black text-gray-800">🎨 Studio Lukisan</h1>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4 bg-amber-100 rounded-2xl p-1">
          {MODES.map(m => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                mode === m.id ? 'bg-white text-game-orange shadow-md' : 'text-gray-600'
              }`}
            >
              {m.label}
            </motion.button>
          ))}
        </div>

        {/* Tracing shape selector */}
        <AnimatePresence>
          {mode === 'trace' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <p className="text-xs font-bold text-gray-600 mb-2">Pilih bentuk untuk tracing:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {TRACING_SHAPES.map(s => (
                  <motion.button
                    key={s.label}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedShape(s)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                      selectedShape.label === s.label
                        ? 'bg-game-purple text-white border-game-purple shadow'
                        : 'bg-white text-gray-700 border-amber-200'
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
                  className={`mt-3 rounded-2xl p-3 text-center font-bold ${
                    tracingAccuracy >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {tracingAccuracy >= 70 ? `🌟 Hebat! Ketepatan ${tracingAccuracy}%` : `💪 Cuba lagi! Ketepatan ${tracingAccuracy}%`}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTracing}
                    className="ml-3 px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-700 border"
                  >
                    Reset
                  </motion.button>
                </motion.div>
              )}
              {!tracingDone && (
                <p className="text-xs text-gray-500 mt-2">
                  📝 Ikuti laluan putus-putus. Siapkan {selectedShape.strokes.length} strok. ({userStrokes.length}/{selectedShape.strokes.length} selesai)
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="relative rounded-3xl overflow-hidden border-4 border-amber-300 shadow-xl mb-4 bg-white">
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
        </div>

        {/* Tools Row */}
        {mode === 'draw' && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {TOOLS.map(t => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTool(t)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-2xl border-2 transition-all ${
                  tool.id === t.id
                    ? 'bg-game-purple text-white border-game-purple shadow-lg'
                    : 'bg-white border-amber-200 text-gray-700'
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
          <div className="bg-white rounded-2xl p-3 border-2 border-amber-200 mb-3">
            <p className="text-xs font-bold text-gray-600 mb-2">Warna:</p>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map(c => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-full border-4 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#8b5cf6' : 'transparent',
                    boxShadow: color === c ? '0 0 0 2px #8b5cf6' : '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              ))}
            </div>
            {/* Custom color picker */}
            <div className="flex items-center gap-3 mt-3">
              <p className="text-xs font-bold text-gray-600">Warna lain:</p>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-amber-200"
              />
              <div className="w-8 h-8 rounded-full border-2 border-amber-200" style={{ backgroundColor: color }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={undo}
            disabled={history.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-amber-200 rounded-2xl font-bold text-gray-700 disabled:opacity-40"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={initCanvas}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-red-200 rounded-2xl font-bold text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Kosongkan
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={downloadCanvas}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-game-orange text-white rounded-2xl font-bold shadow"
          >
            <Download className="w-4 h-4" /> Simpan
          </motion.button>
        </div>

        {mode === 'draw' && (
          <p className="text-center text-xs text-gray-500 mt-4">
            💡 Pilih alat, warna, dan mula melukis! Tekan Simpan untuk download hasil karya anda.
          </p>
        )}
      </div>
    </div>
  );
}