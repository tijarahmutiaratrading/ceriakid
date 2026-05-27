import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Download, Undo2, Maximize2, Minimize2, ArrowLeft, Volume2, VolumeX, Images } from 'lucide-react';
import confetti from 'canvas-confetti';
import AppHeader from '@/components/AppHeader';
import SparkleTrail from '@/components/drawing/SparkleTrail';
import TracingCelebration from '@/components/drawing/TracingCelebration';
import MyArtGallery from '@/components/drawing/MyArtGallery';
import { StickyNotePanel, DoodleLabel, WoodFrame, ParchmentScroll, WoodButton } from '@/components/drawing/SketchbookFrames';
import { saveArtwork } from '@/lib/drawingGallery';
import {
  playDrawTick,
  playStamp,
  playUndo,
  playClear,
  playSaved,
  playTadaa,
  playButtonTap,
  setDrawingSoundEnabled,
  isDrawingSoundEnabled,
} from '@/lib/drawingAudio';

const COLORS = [
  '#1a1a1a', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f5a8c4', '#78350f', '#ffffff',
];

// Tool presets — lineWidth is "default", users boleh adjust via BRUSH_SIZES
const TOOLS = [
  { id: 'pencil', emoji: '✏️', label: 'Pensel', lineWidth: 4, opacity: 1, hint: 'Garis nipis & tajam' },
  { id: 'brush', emoji: '🖌️', label: 'Berus', lineWidth: 18, opacity: 0.75, hint: 'Sapuan lembut' },
  { id: 'marker', emoji: '🖊️', label: 'Marker', lineWidth: 10, opacity: 1, hint: 'Garis tebal jelas' },
  { id: 'crayon', emoji: '🖍️', label: 'Krayon', lineWidth: 14, opacity: 0.85, hint: 'Macam krayon sebenar' },
  { id: 'eraser', emoji: '🧽', label: 'Pemadam', lineWidth: 28, opacity: 1, hint: 'Padam silap' },
];

const BRUSH_SIZES = [
  { id: 'sm', label: 'Kecil', mult: 0.5, dot: 6 },
  { id: 'md', label: 'Sederhana', mult: 1, dot: 12 },
  { id: 'lg', label: 'Besar', mult: 1.8, dot: 18 },
  { id: 'xl', label: 'Sangat Besar', mult: 2.8, dot: 24 },
];

const STICKERS = ['⭐', '❤️', '🌸', '🌈', '☀️', '🦋', '🐱', '🎈', '🍎', '🌟', '🦄', '🌻'];

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

const numberStrokes = {
  1: [[[0.35,0.25],[0.5,0.1],[0.5,0.9]],[[0.35,0.9],[0.65,0.9]]],
  2: [[[0.25,0.25],[0.4,0.12],[0.65,0.12],[0.75,0.3],[0.65,0.5],[0.25,0.88],[0.75,0.88]]],
  3: [[[0.28,0.18],[0.6,0.12],[0.72,0.3],[0.5,0.48],[0.72,0.6],[0.7,0.82],[0.4,0.9],[0.22,0.78]]],
  4: [[[0.62,0.1],[0.22,0.6],[0.78,0.6]],[[0.62,0.1],[0.62,0.9]]],
  5: [[[0.72,0.12],[0.32,0.12],[0.3,0.45],[0.55,0.42],[0.72,0.55],[0.7,0.8],[0.4,0.9],[0.22,0.8]]],
  6: [[[0.7,0.18],[0.45,0.12],[0.28,0.32],[0.22,0.58],[0.28,0.82],[0.5,0.9],[0.72,0.78],[0.7,0.6],[0.5,0.5],[0.28,0.58]]],
  7: [[[0.22,0.12],[0.78,0.12],[0.42,0.9]]],
  8: [[[0.5,0.1],[0.3,0.22],[0.32,0.4],[0.5,0.5],[0.7,0.4],[0.72,0.22],[0.5,0.1]],[[0.5,0.5],[0.28,0.62],[0.25,0.82],[0.5,0.9],[0.75,0.82],[0.72,0.62],[0.5,0.5]]],
  9: [[[0.72,0.42],[0.5,0.5],[0.3,0.42],[0.28,0.22],[0.5,0.1],[0.72,0.22],[0.72,0.42],[0.65,0.7],[0.5,0.9]]],
};

const createNumberShape = (number) => ({
  label: `Nombor ${number}`,
  letter: String(number),
  strokes: numberStrokes[number] || [[[0.5,0.1],[0.5,0.9]]],
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

const makeOval = (cx, cy, rx, ry, steps = 36, start = 0, end = Math.PI * 2) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const angle = start + ((end - start) * i) / steps;
    return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
  });

const COLORING_PAGES = [
  { id: 'cat', label: 'Kucing Kartun 🐱', emoji: '🐱', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71d0614d5_generated_image.png' },
  { id: 'rabbit', label: 'Arnab Kartun 🐰', emoji: '🐰', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8918cface_generated_image.png' },
  { id: 'fish', label: 'Ikan Kartun 🐟', emoji: '🐟', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/9e2772b41_generated_image.png' },
  { id: 'house', label: 'Rumah Kartun 🏠', emoji: '🏠', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0b504e10f_generated_image.png' },
  { id: 'tree', label: 'Pokok Kartun 🌳', emoji: '🌳', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fed3eb4d4_generated_image.png' },
  { id: 'flower', label: 'Bunga Kartun 🌸', emoji: '🌸', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/21247ecda_generated_image.png' },
  { id: 'car', label: 'Kereta Kartun 🚗', emoji: '🚗', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f2c68a554_generated_image.png' },
  { id: 'robot', label: 'Robot Kartun 🤖', emoji: '🤖', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6f6dfac8f_generated_image.png' },
  { id: 'person', label: 'Kanak-kanak Kartun 🙂', emoji: '🙂', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2f4927547_generated_image.png' },
  { id: 'sun', label: 'Matahari Kartun ☀️', emoji: '☀️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a3e7ca7f2_generated_image.png' },
];

// Cache loaded coloring images so they don't reload every redraw
const coloringImageCache = {};
const loadColoringImage = (url) => {
  if (coloringImageCache[url]) return Promise.resolve(coloringImageCache[url]);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { coloringImageCache[url] = img; resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
};

const MODES = [
  { id: 'draw', label: '🎨 Lukis Bebas' },
  { id: 'trace', label: '✏️ Tracing' },
  { id: 'color', label: '🖍️ Mewarna' },
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
  const [selectedColoringPage, setSelectedColoringPage] = useState(COLORING_PAGES[0]);
  const [tracingAccuracy, setTracingAccuracy] = useState(null);
  const [tracingDone, setTracingDone] = useState(false);
  const [userStrokes, setUserStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [stickerMode, setStickerMode] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [soundOn, setSoundOn] = useState(isDrawingSoundEnabled());
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [celebration, setCelebration] = useState({ open: false, accuracy: 0 });

  // Velocity tracking for organic line width (pencil/brush feel)
  const lastPointTime = useRef(0);
  const smoothWidth = useRef(0);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setDrawingSoundEnabled(next);
    if (next) playButtonTap();
  };

  // Active canvas ref — points to whichever canvas is currently active
  const activeCanvasRef = isFullscreen ? fsCanvasRef : canvasRef;
  const getCanvas = () => activeCanvasRef.current;
  const getCtx = () => activeCanvasRef.current?.getContext('2d');
  const tracingShapes = TRACING_CATEGORIES.find(category => category.id === selectedTracingCategory)?.shapes || TRACING_CATEGORIES[0].shapes;

  // Setup high-DPI canvas — sharp on retina/4K screens.
  // We set canvas.width = cssWidth * DPR (actual bitmap), keep CSS size the same,
  // then scale the context so drawing code uses logical CSS coordinates.
  const setupHiDPICanvas = useCallback((canvas, cssW, cssH) => {
    if (!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // cap at 3 for perf
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    // Use 100% width + fixed height so the canvas never overflows its container.
    // Some browsers ignore inline width:Xpx when parent flex/grid shrinks — using
    // 100% guarantees the canvas tracks the actual container width.
    canvas.style.width = '100%';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    // reset & scale so all coordinates are in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // store logical (css) size for drawing helpers
    canvas._cssW = cssW;
    canvas._cssH = cssH;
    canvas._dpr = dpr;
    return ctx;
  }, []);

  // Helpers: get logical (CSS) dimensions for drawing
  const getLogicalSize = (canvas) => ({
    w: canvas?._cssW || canvas?.width || 0,
    h: canvas?._cssH || canvas?.height || 0,
  });

  const drawColoringGuide = (ctx, w, h, page) => {
    // New version: render the AI-generated coloring book line art image as the guide.
    // The image already contains clean black outlines on white — we just composite it
    // on top of whatever the user has colored so outlines stay crisp.
    if (page?.imageUrl) {
      const cached = coloringImageCache[page.imageUrl];
      const drawIt = (img) => {
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = Math.min(w / iw, h / ih) * 0.92;
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.save();
        // Multiply so user's coloring shows through behind the lines
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      };
      if (cached) {
        drawIt(cached);
      } else {
        loadColoringImage(page.imageUrl).then(drawIt).catch(() => {});
      }
      return;
    }
    // Fallback (legacy stroke-based guide) — kept for safety only
    const sx = (x) => x * w;
    const sy = (y) => y * h;
    const line = (points) => {
      ctx.beginPath();
      ctx.moveTo(sx(points[0][0]), sy(points[0][1]));
      points.slice(1).forEach(([x, y]) => ctx.lineTo(sx(x), sy(y)));
      ctx.stroke();
    };
    const oval = (cx, cy, rx, ry) => {
      ctx.beginPath();
      ctx.ellipse(sx(cx), sy(cy), rx * w, ry * h, 0, 0, Math.PI * 2);
      ctx.stroke();
    };
    const curve = (start, c1, c2, end) => {
      ctx.beginPath();
      ctx.moveTo(sx(start[0]), sy(start[1]));
      ctx.bezierCurveTo(sx(c1[0]), sy(c1[1]), sx(c2[0]), sy(c2[1]), sx(end[0]), sy(end[1]));
      ctx.stroke();
    };
    const petalFlower = (cx, cy, scale = 1) => {
      oval(cx, cy, 0.025 * scale, 0.025 * scale);
      oval(cx, cy - 0.06 * scale, 0.035 * scale, 0.06 * scale);
      oval(cx + 0.06 * scale, cy, 0.055 * scale, 0.035 * scale);
      oval(cx, cy + 0.06 * scale, 0.035 * scale, 0.055 * scale);
      oval(cx - 0.06 * scale, cy, 0.055 * scale, 0.035 * scale);
    };

    ctx.save();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#111827';

    if (page.id === 'cat') {
      oval(0.46, 0.38, 0.28, 0.22);
      line([[0.22,0.3],[0.26,0.02],[0.42,0.22]]);
      line([[0.54,0.22],[0.76,0.02],[0.72,0.31]]);
      line([[0.28,0.2],[0.34,0.13],[0.39,0.23]]);
      line([[0.6,0.23],[0.68,0.13],[0.68,0.22]]);
      curve([0.2,0.37],[0.14,0.45],[0.2,0.52],[0.33,0.51]);
      curve([0.62,0.5],[0.73,0.5],[0.78,0.44],[0.76,0.37]);
      oval(0.37,0.36,0.055,0.075); oval(0.56,0.36,0.055,0.075);
      oval(0.385,0.335,0.015,0.02); oval(0.575,0.335,0.015,0.02);
      oval(0.47,0.45,0.025,0.018); curve([0.47,0.47],[0.43,0.52],[0.39,0.51],[0.37,0.47]); curve([0.47,0.47],[0.51,0.52],[0.55,0.51],[0.57,0.47]);
      curve([0.35,0.25],[0.38,0.22],[0.42,0.22],[0.45,0.25]); curve([0.53,0.25],[0.57,0.2],[0.61,0.21],[0.64,0.25]);
      curve([0.32,0.55],[0.24,0.7],[0.25,0.91],[0.46,0.88]); curve([0.59,0.53],[0.77,0.6],[0.72,0.91],[0.49,0.88]);
      curve([0.65,0.73],[0.8,0.53],[0.96,0.68],[0.78,0.84]); curve([0.72,0.73],[0.84,0.61],[0.91,0.72],[0.78,0.8]);
      oval(0.34,0.88,0.055,0.045); oval(0.45,0.89,0.055,0.045); oval(0.58,0.88,0.06,0.045);
      curve([0.38,0.64],[0.44,0.72],[0.36,0.78],[0.43,0.84]); curve([0.61,0.67],[0.54,0.74],[0.61,0.79],[0.55,0.85]);
      petalFlower(0.87,0.26,0.8); petalFlower(0.12,0.78,0.75); curve([0.06,0.9],[0.28,0.86],[0.72,0.92],[0.95,0.86]);
      curve([0.08,0.72],[0.05,0.52],[0.14,0.38],[0.18,0.24]); curve([0.12,0.64],[0.17,0.58],[0.23,0.57],[0.28,0.6]); curve([0.11,0.78],[0.2,0.69],[0.28,0.73],[0.33,0.8]);
      line([[0.12,0.1],[0.15,0.08],[0.18,0.1]]); line([[0.78,0.13],[0.8,0.12],[0.82,0.13]]);
    } else if (page.id === 'person') {
      oval(0.5,0.22,0.13,0.13); curve([0.37,0.18],[0.43,0.05],[0.58,0.06],[0.64,0.19]); curve([0.39,0.15],[0.45,0.11],[0.52,0.1],[0.61,0.14]);
      oval(0.45,0.22,0.025,0.03); oval(0.55,0.22,0.025,0.03); oval(0.5,0.28,0.05,0.025);
      line([[0.4,0.36],[0.6,0.36],[0.69,0.66],[0.31,0.66],[0.4,0.36]]);
      curve([0.38,0.4],[0.25,0.45],[0.2,0.56],[0.25,0.66]); curve([0.62,0.4],[0.76,0.45],[0.81,0.56],[0.75,0.66]); oval(0.25,0.68,0.035,0.035); oval(0.75,0.68,0.035,0.035);
      line([[0.42,0.66],[0.37,0.9]]); line([[0.58,0.66],[0.63,0.9]]); oval(0.35,0.92,0.075,0.035); oval(0.65,0.92,0.075,0.035);
      line([[0.36,0.48],[0.64,0.48]]); line([[0.38,0.56],[0.62,0.56]]); petalFlower(0.17,0.24,0.55); petalFlower(0.84,0.24,0.55);
    } else if (page.id === 'tree') {
      line([[0.43,0.88],[0.43,0.55],[0.57,0.55],[0.57,0.88],[0.43,0.88]]); curve([0.5,0.57],[0.42,0.68],[0.44,0.78],[0.38,0.87]); curve([0.5,0.58],[0.58,0.67],[0.57,0.77],[0.64,0.87]);
      oval(0.5,0.27,0.21,0.16); oval(0.32,0.42,0.19,0.16); oval(0.68,0.42,0.19,0.16); oval(0.5,0.53,0.24,0.17);
      oval(0.38,0.35,0.035,0.04); oval(0.62,0.32,0.035,0.04); oval(0.52,0.5,0.035,0.04); curve([0.08,0.9],[0.28,0.84],[0.72,0.86],[0.92,0.9]); petalFlower(0.2,0.78,0.55); petalFlower(0.82,0.78,0.55);
    } else if (page.id === 'rabbit') {
      oval(0.42,0.2,0.065,0.18); oval(0.58,0.2,0.065,0.18); oval(0.5,0.47,0.24,0.2); oval(0.42,0.45,0.045,0.055); oval(0.58,0.45,0.045,0.055); oval(0.5,0.55,0.025,0.02); curve([0.5,0.57],[0.45,0.63],[0.4,0.61],[0.38,0.57]); curve([0.5,0.57],[0.55,0.63],[0.6,0.61],[0.62,0.57]); oval(0.5,0.77,0.2,0.12); oval(0.32,0.88,0.085,0.04); oval(0.68,0.88,0.085,0.04); oval(0.76,0.68,0.055,0.055); petalFlower(0.15,0.7,0.55);
    } else if (page.id === 'fish') {
      oval(0.43,0.5,0.28,0.18); line([[0.68,0.5],[0.9,0.32],[0.84,0.5],[0.9,0.68],[0.68,0.5]]); oval(0.32,0.43,0.035,0.035); curve([0.25,0.58],[0.38,0.67],[0.52,0.61],[0.6,0.53]); line([[0.5,0.35],[0.6,0.18],[0.66,0.36]]); line([[0.5,0.65],[0.6,0.82],[0.66,0.64]]); curve([0.18,0.42],[0.1,0.48],[0.1,0.55],[0.18,0.6]); oval(0.77,0.23,0.025,0.025); oval(0.85,0.18,0.018,0.018);
    } else if (page.id === 'house') {
      line([[0.14,0.48],[0.5,0.14],[0.86,0.48]]); line([[0.22,0.45],[0.22,0.86],[0.78,0.86],[0.78,0.45]]); line([[0.4,0.86],[0.4,0.62],[0.6,0.62],[0.6,0.86]]); oval(0.55,0.74,0.015,0.015); line([[0.3,0.54],[0.44,0.54],[0.44,0.68],[0.3,0.68],[0.3,0.54]]); line([[0.58,0.54],[0.72,0.54],[0.72,0.68],[0.58,0.68],[0.58,0.54]]); line([[0.62,0.25],[0.62,0.13],[0.73,0.13],[0.73,0.36]]); petalFlower(0.13,0.78,0.55); petalFlower(0.87,0.78,0.55); curve([0.06,0.9],[0.32,0.86],[0.68,0.86],[0.94,0.9]);
    } else if (page.id === 'flower') {
      line([[0.5,0.55],[0.5,0.9]]); petalFlower(0.5,0.38,1.8); oval(0.5,0.38,0.055,0.055); curve([0.49,0.68],[0.32,0.58],[0.22,0.72],[0.42,0.74]); curve([0.51,0.72],[0.68,0.6],[0.78,0.74],[0.58,0.78]); curve([0.14,0.92],[0.34,0.88],[0.66,0.88],[0.86,0.92]); petalFlower(0.18,0.72,0.55); petalFlower(0.82,0.7,0.55);
    } else if (page.id === 'car') {
      line([[0.1,0.63],[0.25,0.42],[0.38,0.33],[0.64,0.33],[0.78,0.42],[0.9,0.63],[0.84,0.77],[0.18,0.77],[0.1,0.63]]); line([[0.34,0.42],[0.43,0.3],[0.57,0.3],[0.68,0.42]]); line([[0.27,0.52],[0.45,0.52]]); line([[0.56,0.52],[0.76,0.52]]); oval(0.3,0.78,0.085,0.085); oval(0.7,0.78,0.085,0.085); oval(0.3,0.78,0.035,0.035); oval(0.7,0.78,0.035,0.035); line([[0.17,0.61],[0.24,0.58]]); line([[0.83,0.61],[0.76,0.58]]); curve([0.08,0.9],[0.33,0.86],[0.66,0.86],[0.92,0.9]);
    } else if (page.id === 'robot') {
      line([[0.28,0.25],[0.72,0.25],[0.72,0.6],[0.28,0.6],[0.28,0.25]]); line([[0.5,0.25],[0.5,0.12]]); oval(0.5,0.11,0.035,0.035); oval(0.4,0.4,0.05,0.05); oval(0.6,0.4,0.05,0.05); line([[0.4,0.52],[0.6,0.52]]); line([[0.28,0.42],[0.16,0.56],[0.22,0.64]]); line([[0.72,0.42],[0.84,0.56],[0.78,0.64]]); line([[0.34,0.6],[0.34,0.84],[0.66,0.84],[0.66,0.6]]); line([[0.42,0.84],[0.38,0.94]]); line([[0.58,0.84],[0.62,0.94]]); line([[0.39,0.7],[0.61,0.7]]); line([[0.43,0.76],[0.57,0.76]]);
    } else if (page.id === 'sun') {
      oval(0.5,0.5,0.18,0.18); oval(0.43,0.45,0.025,0.03); oval(0.57,0.45,0.025,0.03); curve([0.43,0.57],[0.47,0.63],[0.54,0.63],[0.58,0.57]); [[0.5,0.08,0.5,0.23],[0.5,0.77,0.5,0.92],[0.08,0.5,0.23,0.5],[0.77,0.5,0.92,0.5],[0.2,0.2,0.31,0.31],[0.69,0.69,0.8,0.8],[0.8,0.2,0.69,0.31],[0.2,0.8,0.31,0.69]].forEach(([a,b,c,d]) => line([[a,b],[c,d]])); petalFlower(0.16,0.18,0.5); petalFlower(0.84,0.82,0.5);
    } else {
      page.strokes.forEach(line);
    }

    ctx.restore();
  };

  const clearCanvas = useCallback((ctx, w, h) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // clear in device pixels
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.fillStyle = '#fff9f0';
    ctx.fillRect(0, 0, w, h);
    if (mode === 'trace' && selectedShape) drawTracingGuide(ctx, w, h, selectedShape);
    if (mode === 'color' && selectedColoringPage) drawColoringGuide(ctx, w, h, selectedColoringPage);
  }, [mode, selectedShape, selectedColoringPage]);

  const drawTracingGuide = (ctx, w, h, shape) => {
    ctx.save();

    // 1) Soft background hint — large faded letter/shape behind everything
    ctx.fillStyle = 'rgba(139,92,246,0.10)';
    ctx.font = `900 ${Math.min(w, h) * 0.62}px "Nunito", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shape.letter, w / 2, h / 2);

    // 2) Outlined letter stroke (subtle) for extra guidance
    ctx.strokeStyle = 'rgba(139,92,246,0.22)';
    ctx.lineWidth = 3;
    ctx.strokeText(shape.letter, w / 2, h / 2);

    // 3) Chunky dashed path strokes — clear, kid-friendly
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    shape.strokes.forEach((stroke, strokeIdx) => {
      // Outer halo for visibility
      ctx.strokeStyle = 'rgba(196,181,253,0.45)';
      ctx.lineWidth = 24;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(stroke[0][0] * w, stroke[0][1] * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0] * w, stroke[i][1] * h);
      }
      ctx.stroke();

      // Dashed inner guide
      ctx.strokeStyle = 'rgba(124,58,237,0.75)';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(stroke[0][0] * w, stroke[0][1] * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i][0] * w, stroke[i][1] * h);
      }
      ctx.stroke();

      // Start point — green circle with number
      ctx.setLineDash([]);
      const sx = stroke[0][0] * w;
      const sy = stroke[0][1] * h;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(sx, sy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 18px "Nunito", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(strokeIdx + 1), sx, sy);

      // End point — red dot
      const last = stroke[stroke.length - 1];
      const ex = last[0] * w;
      const ey = last[1] * h;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(ex, ey, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    ctx.restore();
  };

  const initCanvas = useCallback(() => {
    [canvasRef.current, fsCanvasRef.current].forEach((canvas) => {
      if (!canvas) return;
      const { w, h } = getLogicalSize(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx && w && h) {
        clearCanvas(ctx, w, h);
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
  }, [mode, selectedShape, selectedColoringPage, initCanvas]);

  // Preload all coloring page images on mount, and re-init canvas once the current one loads
  useEffect(() => {
    COLORING_PAGES.forEach((p) => {
      if (p.imageUrl) loadColoringImage(p.imageUrl).then(() => {
        // If user is currently viewing this coloring page, redraw with the now-loaded image
        if (mode === 'color' && selectedColoringPage.id === p.id) {
          const ctx = getCtx();
          const canvas = getCanvas();
          if (ctx && canvas) {
            const { w, h } = getLogicalSize(canvas);
            clearCanvas(ctx, w, h);
          }
        }
      }).catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColoringPage.id, mode]);

  // Setup HiDPI for normal canvas on mount + on container resize.
  // We use ResizeObserver so canvas always matches its real visible size,
  // preventing pointer-to-pixel offset bugs when layout changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupNormal = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(320, Math.round(rect.width || 720));
      // maintain 4:3 aspect ratio
      const cssH = Math.round(cssW * (3 / 4));
      // Skip if size unchanged (avoid wiping the drawing on every micro-resize)
      if (canvas._cssW === cssW && canvas._cssH === cssH) return;
      // Snapshot existing content (if any) so we can restore after resize
      let snapshot = null;
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          snapshot = document.createElement('canvas');
          snapshot.width = canvas.width;
          snapshot.height = canvas.height;
          snapshot.getContext('2d').drawImage(canvas, 0, 0);
        } catch { snapshot = null; }
      }
      // Lock the CSS height explicitly so the canvas matches the logical size
      // we set internally. Without this, the parent's flex/grid layout can
      // stretch the canvas a few px and offset pointer coordinates.
      canvas.style.height = cssH + 'px';
      setupHiDPICanvas(canvas, cssW, cssH);
      const ctx = canvas.getContext('2d');
      if (snapshot) {
        ctx.drawImage(snapshot, 0, 0, cssW, cssH);
      } else {
        clearCanvas(ctx, cssW, cssH);
      }
    };

    setupNormal();
    const ro = new ResizeObserver(() => setupNormal());
    ro.observe(canvas);
    window.addEventListener('resize', setupNormal);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setupNormal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fullscreen setup + sync drawings between normal ↔ fullscreen
  useEffect(() => {
    if (isFullscreen) {
      requestAnimationFrame(() => {
        const src = canvasRef.current;
        const dst = fsCanvasRef.current;
        if (!src || !dst) return;
        // Size fullscreen canvas to its parent (the flex container)
        const parent = dst.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const cssW = Math.round(parentRect.width);
        const cssH = Math.round(parentRect.height);
        setupHiDPICanvas(dst, cssW, cssH);
        const ctx = dst.getContext('2d');
        const srcSize = getLogicalSize(src);
        // Paint base + copy normal canvas content scaled to fullscreen logical size
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, cssW, cssH);
        if (srcSize.w && srcSize.h) {
          ctx.drawImage(src, 0, 0, cssW, cssH);
        }
      });
    } else {
      requestAnimationFrame(() => {
        const src = fsCanvasRef.current;
        const dst = canvasRef.current;
        if (!src || !dst) return;
        const dstSize = getLogicalSize(dst);
        const ctx = dst.getContext('2d');
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, dstSize.w, dstSize.h);
        ctx.drawImage(src, 0, 0, dstSize.w, dstSize.h);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  const saveToHistory = () => {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    // Save raw device-pixel image data — putImageData ignores transform
    setHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas || history.length === 0) return;
    const prev = history[history.length - 1];
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(prev, 0, 0);
    ctx.restore();
    setHistory(h => h.slice(0, -1));
    playUndo();
  };

  const handleClear = () => {
    initCanvas();
    playClear();
  };

  const getPoint = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Map screen coords to canvas LOGICAL (CSS) pixel coords.
    // Because the visible canvas size may not equal the logical size we set
    // (e.g. when CSS scales it due to container resize), we must scale.
    const logicalW = canvas._cssW || rect.width;
    const logicalH = canvas._cssH || rect.height;
    const scaleX = logicalW / rect.width;
    const scaleY = logicalH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const effectiveLineWidth = () => Math.max(2, Math.round(tool.lineWidth * brushSize.mult));

  const stampSticker = (pt, emoji) => {
    const ctx = getCtx();
    if (!ctx) return;
    saveToHistory();
    const size = Math.max(36, effectiveLineWidth() * 2.5);
    ctx.save();
    ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, pt.x, pt.y);
    ctx.restore();
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    const pt = getPoint(e, canvas);

    // Sticker stamping mode — single tap drops emoji
    if (stickerMode && mode !== 'trace') {
      stampSticker(pt, stickerMode);
      playStamp();
      return;
    }

    saveToHistory();
    setIsDrawing(true);
    setLastPoint(pt);
    lastPointTime.current = performance.now();
    smoothWidth.current = effectiveLineWidth();
    if (mode === 'trace') setCurrentStroke([pt]);

    const lw = effectiveLineWidth();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, lw / 2, 0, Math.PI * 2);
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
    if (!lastPoint) { setLastPoint(pt); return; }

    // Velocity-aware width — slower stroke = thicker line (pencil/brush feel).
    // Eraser & marker keep flat width for predictability.
    const baseLw = effectiveLineWidth();
    let lw = baseLw;
    if (tool.id === 'pencil' || tool.id === 'brush' || tool.id === 'crayon') {
      const now = performance.now();
      const dt = Math.max(1, now - lastPointTime.current);
      const dist = Math.hypot(pt.x - lastPoint.x, pt.y - lastPoint.y);
      const velocity = dist / dt; // px/ms
      // map velocity → width factor (slow≈1.15, fast≈0.65)
      const factor = Math.max(0.6, Math.min(1.2, 1.2 - velocity * 0.4));
      const targetLw = baseLw * factor;
      // smooth so width doesn't jitter frame to frame
      smoothWidth.current = smoothWidth.current * 0.7 + targetLw * 0.3;
      lw = smoothWidth.current;
      lastPointTime.current = now;
    }

    // Quadratic smoothing — draw to the midpoint with a curve through lastPoint
    const midX = (lastPoint.x + pt.x) / 2;
    const midY = (lastPoint.y + pt.y) / 2;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.strokeStyle = tool.id === 'eraser' ? '#fff9f0' : color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = tool.opacity;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Crayon texture — tiny offset specks for a more tactile feel
    if (tool.id === 'crayon') {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = color;
      for (let i = 0; i < 3; i++) {
        const ox = (Math.random() - 0.5) * lw * 0.9;
        const oy = (Math.random() - 0.5) * lw * 0.9;
        ctx.beginPath();
        ctx.arc(midX + ox, midY + oy, lw * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    setLastPoint(pt);
    if (mode === 'trace') setCurrentStroke(prev => [...prev, pt]);

    // Satisfying soft tone while drawing — throttled inside playDrawTick
    if (tool.id !== 'eraser') {
      const canvasH = getLogicalSize(canvas).h || 1;
      playDrawTick(pt.y / canvasH, color);
    }
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
        setCelebration({ open: true, accuracy: acc });
        if (acc >= 70) {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'] });
          playTadaa();
        }
      }
    }

    if (mode === 'color') {
      const ctx = getCtx();
      const canvas = getCanvas();
      if (ctx && canvas) {
        const { w, h } = getLogicalSize(canvas);
        drawColoringGuide(ctx, w, h, selectedColoringPage);
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    // Save to localStorage gallery so the child can revisit their work
    const titleByMode = mode === 'trace'
      ? `Tracing ${selectedShape.label}`
      : mode === 'color'
      ? `Mewarna ${selectedColoringPage.label}`
      : 'Lukisan bebas';
    try { saveArtwork({ dataUrl, title: titleByMode, mode }); } catch { /* gallery is best-effort */ }
    // Also offer device download
    const link = document.createElement('a');
    link.download = `lukisan-saya-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setShowSavedToast(true);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 }, colors: ['#fbbf24', '#ec4899', '#8b5cf6', '#22c55e', '#3b82f6'] });
    playSaved();
    setTimeout(() => setShowSavedToast(false), 2200);
  };

  const resetTracing = () => {
    setUserStrokes([]);
    setCurrentStroke([]);
    setTracingAccuracy(null);
    setTracingDone(false);
    const ctx = getCtx();
    const canvas = getCanvas();
    if (ctx && canvas) {
      const { w, h } = getLogicalSize(canvas);
      clearCanvas(ctx, w, h);
    }
  };

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative"
      style={{
        backgroundColor: '#fef3c7',
        backgroundImage: `radial-gradient(at 12% 18%, rgba(251, 191, 36, 0.18) 0px, transparent 50%), radial-gradient(at 88% 82%, rgba(249, 115, 22, 0.12) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(253, 230, 138, 0.4) 0px, transparent 70%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.42 0 0 0 0 0.25 0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }}
    >
      {/* Floating doodle decorations — sparse, organic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full text-amber-700/30">
        <div className="absolute top-32 left-4 text-2xl rotate-12 animate-float">✨</div>
        <div className="absolute top-44 right-8 text-xl -rotate-12 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>
        <div className="absolute top-1/2 left-2 text-2xl rotate-6 animate-float" style={{ animationDelay: '3s' }}>✏️</div>
        <div className="absolute bottom-40 right-4 text-2xl -rotate-12 animate-float" style={{ animationDelay: '2s' }}>🖍️</div>
        <div className="absolute bottom-20 left-6 text-xl rotate-12 animate-float" style={{ animationDelay: '4s' }}>🎨</div>
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-full bg-green-500 text-white font-black text-sm shadow-2xl flex items-center gap-2"
          >
            <span className="text-xl">✅</span> Lukisan disimpan ke peranti!
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-28 pt-28">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full font-black text-sm transition-all"
          style={{ color: '#78350f', fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </motion.button>

        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 relative"
                style={{
                  background: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)',
                  boxShadow: '0 6px 14px rgba(120, 60, 20, 0.35), inset 0 2px 4px rgba(255,220,180,0.25), inset 0 -3px 6px rgba(0,0,0,0.3)',
                  border: '3px solid #5c3a1e',
                }}
              >
                <span className="drop-shadow-md">🎨</span>
              </div>
              <div className="min-w-0">
                <p className="text-amber-700 text-xs font-black uppercase tracking-[0.22em] mb-1">✨ Creative Studio</p>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: '#5c3a1e' }}>Studio Lukisan</h1>
                <p className="text-amber-800/80 text-sm font-semibold mt-1 max-w-md">Lukis bebas, surih huruf, atau warnakan gambar comel — semua dalam satu tempat.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { top: mode === 'draw' ? 'Lukis Bebas' : mode === 'trace' ? 'Tracing' : 'Mewarna', bottom: 'MODE AKTIF', bg: '#fef3c7', border: '#f59e0b' },
                { top: stickerMode ? `${stickerMode} Sticker` : tool.label, bottom: 'ALAT', bg: '#fce7f3', border: '#ec4899' },
                { top: `${history.length} langkah`, bottom: 'BOLEH UNDO', bg: '#e5e7eb', border: '#9ca3af' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-full text-center min-w-[80px]"
                  style={{
                    backgroundColor: badge.bg,
                    border: `2.5px solid ${badge.border}`,
                    boxShadow: '0 3px 8px rgba(120, 80, 40, 0.18), inset 0 1px 2px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="font-black text-xs leading-tight" style={{ color: '#5c3a1e' }}>{badge.top}</p>
                  <p className="text-[9px] font-black uppercase tracking-wider mt-0.5" style={{ color: badge.border }}>{badge.bottom}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="space-y-5">
          {/* CANVAS — wood frame */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WoodFrame
              title={
                <div>
                  <p className="text-amber-100/70 text-[10px] font-black uppercase tracking-[0.22em]">Kanvas Aktif</p>
                  <p className="text-amber-50 font-black text-base truncate" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {mode === 'draw' ? `${tool.emoji} ${tool.label}` : mode === 'trace' ? `✏️ ${selectedShape.label}` : `🖍️ ${selectedColoringPage.label}`}
                  </p>
                </div>
              }
              headerActions={
                <>
                  <button onClick={toggleSound} className="p-2 rounded-full bg-amber-100/15 hover:bg-amber-100/30 text-amber-50 transition-all" title={soundOn ? 'Matikan bunyi' : 'Hidupkan bunyi'}>
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setGalleryOpen(true); playButtonTap(); }} className="p-2 rounded-full bg-amber-100/15 hover:bg-amber-100/30 text-amber-50 transition-all" title="Kerja Saya">
                    <Images className="w-4 h-4" />
                  </button>
                  <button onClick={undo} disabled={history.length === 0} className="p-2 rounded-full bg-amber-100/15 hover:bg-amber-100/30 text-amber-50 disabled:opacity-40 transition-all" title="Undo">
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleClear} className="p-2 rounded-full bg-red-500/40 hover:bg-red-500/60 text-amber-50 transition-all" title="Kosongkan">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsFullscreen(true)} className="p-2 rounded-full bg-amber-900/40 hover:bg-amber-900/60 text-amber-50 transition-all" title="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              }
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: '4px solid #f97316',
                  boxShadow: 'inset 0 0 0 2px #fef3c7, 0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div className="absolute left-3 top-3 z-10 flex items-center gap-2 flex-wrap pointer-events-none">
                  <div className="px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5"
                       style={{ backgroundColor: '#fef9e7', color: '#5c3a1e', border: '2px solid #d4a574', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {stickerMode ? <span>Sticker {stickerMode}</span> : (
                      <>
                        <span className="inline-block rounded-full" style={{ width: 12, height: 12, backgroundColor: tool.id === 'eraser' ? '#fff9f0' : color, border: tool.id === 'eraser' ? '2px dashed #cbd5e1' : '2px solid rgba(0,0,0,0.2)' }} />
                        <span>{brushSize.label}</span>
                      </>
                    )}
                  </div>
                  {mode === 'trace' && (
                    <>
                      <div className="px-3 py-1.5 rounded-full text-xs font-black" style={{ backgroundColor: '#92400e', color: '#fef3c7' }}>{userStrokes.length}/{selectedShape.strokes.length} strok</div>
                      <div className="px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5" style={{ backgroundColor: '#fef9e7', color: '#5c3a1e', border: '2px solid #d4a574' }}>
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 ring-2 ring-white" /> Mula
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white ml-1" /> Akhir
                      </div>
                    </>
                  )}
                </div>
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                  className="w-full touch-none block"
                  style={{ backgroundColor: '#fff9f0', cursor: stickerMode ? 'pointer' : 'crosshair' }}
                />
              </div>

              {/* Crayon tool decorations below canvas */}
              <div className="flex items-end justify-center gap-3 sm:gap-5 px-4 pt-3 pb-1 text-3xl sm:text-4xl pointer-events-none select-none">
                <span className="rotate-[-12deg]">✏️</span>
                <span className="rotate-[8deg]">🖌️</span>
                <span className="rotate-[-6deg]">🖍️</span>
                <span className="rotate-[14deg]">🖍️</span>
                <span className="rotate-[-4deg]">🧽</span>
              </div>
            </WoodFrame>

            {/* Mobile actions row */}
            <div className="grid grid-cols-3 gap-2 mt-3 sm:hidden">
              <button onClick={undo} disabled={history.length === 0} className="flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm disabled:opacity-40"
                style={{ backgroundColor: '#fef9e7', color: '#5c3a1e', border: '2px solid #d4a574', boxShadow: '0 2px 4px rgba(120,80,40,0.2)' }}>
                <Undo2 className="w-4 h-4" /> Undo
              </button>
              <button onClick={handleClear} className="flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm"
                style={{ backgroundColor: '#fecaca', color: '#7f1d1d', border: '2px solid #ef4444', boxShadow: '0 2px 4px rgba(120,80,40,0.2)' }}>
                <Trash2 className="w-4 h-4" /> Kosong
              </button>
              <WoodButton onClick={downloadCanvas} className="!py-3 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Simpan
              </WoodButton>
            </div>
          </motion.section>

          {/* AKTIVITI KREATIF — sticky-note panel */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <StickyNotePanel>
              <DoodleLabel accent="#92400e">AKTIVITI KREATIF — Pilih aktiviti</DoodleLabel>
              <div className="grid grid-cols-3 gap-3">
                {MODES.map((m, i) => {
                  const icons = { draw: '🎨', trace: '✏️', color: '🖍️' };
                  const labelMap = { draw: 'Lukis Bebas', trace: 'Tracing', color: 'Mewarna' };
                  const labelText = labelMap[m.id] || m.label;
                  const rotations = ['-1.5deg', '0.8deg', '-0.5deg'];
                  return (
                    <motion.button
                      key={m.id}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setMode(m.id)}
                      className="relative p-3 transition-all"
                      style={{
                        transform: `rotate(${rotations[i]})`,
                        backgroundColor: '#fefce8',
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='nn'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.65 0 0 0 0 0.5 0 0 0 0 0.25 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nn)'/></svg>")`,
                        border: mode === m.id ? '3px solid #f97316' : '2px solid #d4a574',
                        borderRadius: '8px',
                        boxShadow: mode === m.id
                          ? '0 6px 14px rgba(249, 115, 22, 0.3), inset 0 0 0 2px rgba(254, 215, 170, 0.4)'
                          : '0 3px 8px rgba(120, 80, 40, 0.2)',
                      }}
                    >
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#dc2626', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
                      <div className="text-4xl mb-1 leading-none">{icons[m.id]}</div>
                      <p className="font-black text-sm" style={{ color: '#5c3a1e', fontFamily: 'cursive, var(--font-nunito)' }}>{labelText}</p>
                    </motion.button>
                  );
                })}
              </div>
            </StickyNotePanel>
          </motion.section>

          <AnimatePresence mode="wait">
              {mode === 'trace' ? (
                <motion.section
                  key="trace-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                <StickyNotePanel>
                  <DoodleLabel accent="#92400e">TRACING — {selectedShape.label}</DoodleLabel>

                  <p className="text-amber-800 text-xs font-black uppercase tracking-wider mb-2">Kategori</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {TRACING_CATEGORIES.map(category => (
                      <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => {
                          setSelectedTracingCategory(category.id);
                          setSelectedShape(category.shapes[0]);
                        }}
                        className="px-3 py-2.5 rounded-xl font-black text-xs transition-all"
                        style={{
                          backgroundColor: selectedTracingCategory === category.id ? '#fef3c7' : '#fffbeb',
                          color: '#5c3a1e',
                          border: selectedTracingCategory === category.id ? '2.5px solid #f97316' : '2px solid #d4a574',
                          boxShadow: selectedTracingCategory === category.id ? '0 3px 6px rgba(249,115,22,0.25)' : '0 2px 3px rgba(120,80,40,0.15)',
                        }}
                      >
                        {category.label}
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-amber-800 text-xs font-black uppercase tracking-wider mb-2">Item latihan</p>
                  <div className="max-h-52 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                    {tracingShapes.map(s => (
                      <motion.button
                        key={s.label}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setSelectedShape(s)}
                        className="px-3 py-2.5 rounded-xl font-bold text-xs transition-all"
                        style={{
                          backgroundColor: selectedShape.label === s.label ? '#fef3c7' : '#fffbeb',
                          color: '#5c3a1e',
                          border: selectedShape.label === s.label ? '2.5px solid #f97316' : '2px solid #d4a574',
                        }}
                      >
                        {s.label}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: '#fffbeb', border: '2px dashed #d4a574' }}>
                    {tracingDone ? (
                      <div className="text-center">
                        <p className="font-black text-base" style={{ color: '#5c3a1e' }}>{tracingAccuracy >= 70 ? `🌟 Hebat! ${tracingAccuracy}%` : `💪 Cuba lagi! ${tracingAccuracy}%`}</p>
                        <button onClick={resetTracing} className="mt-2 px-4 py-2 rounded-full text-xs font-black" style={{ backgroundColor: '#f97316', color: 'white' }}>Reset Tracing</button>
                      </div>
                    ) : (
                      <p className="text-xs font-bold" style={{ color: '#78350f' }}>📝 Ikuti laluan putus-putus. Progress: {userStrokes.length}/{selectedShape.strokes.length} strok.</p>
                    )}
                  </div>
                </StickyNotePanel>
                </motion.section>
              ) : (
                <motion.section
                  key="draw-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {mode === 'color' && (
                    <StickyNotePanel>
                      <DoodleLabel accent="#92400e">AKTIVITI MEWARNA — {selectedColoringPage.label}</DoodleLabel>
                      <div className="max-h-52 overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                        {COLORING_PAGES.map(page => (
                          <motion.button
                            key={page.id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedColoringPage(page)}
                            className="px-3 py-2.5 rounded-xl font-bold text-xs transition-all"
                            style={{
                              backgroundColor: selectedColoringPage.id === page.id ? '#fef3c7' : '#fffbeb',
                              color: '#5c3a1e',
                              border: selectedColoringPage.id === page.id ? '2.5px solid #f97316' : '2px solid #d4a574',
                            }}
                          >
                            {page.label}
                          </motion.button>
                        ))}
                      </div>
                    </StickyNotePanel>
                  )}

                  {/* TOOLS + BRUSH SIZE + SAVE in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                    {/* ALAT LUKISAN */}
                    <StickyNotePanel rotate={-0.5}>
                      <DoodleLabel accent="#92400e">{mode === 'color' ? 'ALAT MEWARNA' : 'ALAT LUKISAN'}</DoodleLabel>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                        {TOOLS.map(t => (
                          <motion.button
                            key={t.id}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => { setTool(t); setStickerMode(null); }}
                            className="aspect-square rounded-xl flex items-center justify-center text-2xl transition-all relative"
                            style={{
                              backgroundColor: tool.id === t.id && !stickerMode ? '#fef3c7' : 'transparent',
                              border: tool.id === t.id && !stickerMode ? '2.5px solid #f97316' : '2px dashed transparent',
                            }}
                            title={t.label}
                          >
                            {t.emoji}
                          </motion.button>
                        ))}
                      </div>
                    </StickyNotePanel>

                    {/* SAIZ BRUSH */}
                    <StickyNotePanel rotate={0.5}>
                      <DoodleLabel accent="#92400e">SAIZ BRUSH</DoodleLabel>
                      <div className="grid grid-cols-4 gap-1">
                        {BRUSH_SIZES.map(s => (
                          <motion.button
                            key={s.id}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => setBrushSize(s)}
                            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all"
                            style={{
                              backgroundColor: brushSize.id === s.id ? '#fef3c7' : 'transparent',
                              border: brushSize.id === s.id ? '2.5px solid #f97316' : '2px solid transparent',
                            }}
                          >
                            <span className="rounded-full border-2 border-amber-900" style={{ width: s.dot, height: s.dot, backgroundColor: brushSize.id === s.id ? '#f97316' : 'transparent' }} />
                            <span className="text-[9px] font-black" style={{ color: '#5c3a1e' }}>{s.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </StickyNotePanel>

                    {/* SAVE BUTTON */}
                    <div className="hidden sm:flex items-center justify-center">
                      <WoodButton onClick={downloadCanvas} className="!px-6 !py-4 text-base">
                        <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Simpan</span>
                      </WoodButton>
                    </div>
                  </div>

                  {tool.id !== 'eraser' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PALET WARNA */}
                      <StickyNotePanel rotate={-0.5}>
                        <DoodleLabel accent="#92400e">PALET WARNA</DoodleLabel>
                        <div className="grid grid-cols-6 gap-2">
                          {COLORS.map(c => (
                            <motion.button
                              key={c}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => { setColor(c); setStickerMode(null); }}
                              className="aspect-square rounded-full transition-all"
                              style={{
                                backgroundColor: c,
                                border: color === c ? '3px solid #f97316' : '2px solid #78350f',
                                boxShadow: color === c
                                  ? '0 0 0 2px #fef3c7, 0 3px 8px rgba(249,115,22,0.4)'
                                  : '0 2px 4px rgba(120,80,40,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)',
                              }}
                              aria-label={`Warna ${c}`}
                            />
                          ))}
                        </div>
                        <div
                          className="flex items-center gap-2 mt-3 rounded-lg p-2"
                          style={{
                            backgroundColor: '#fef9e7',
                            border: '2px solid #d4a574',
                            boxShadow: 'inset 0 1px 2px rgba(120,80,40,0.1)',
                          }}
                        >
                          <input type="color" value={color} onChange={e => { setColor(e.target.value); setStickerMode(null); }} className="w-8 h-8 rounded-lg cursor-pointer border-2" style={{ borderColor: '#78350f' }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xs" style={{ color: '#5c3a1e' }}>Warna custom</p>
                            <p className="text-[10px] font-bold" style={{ color: '#92400e' }}>Pilih warna lain ikut kreativiti anak</p>
                          </div>
                          <div className="w-7 h-7 rounded-full border-2" style={{ backgroundColor: color, borderColor: '#78350f' }} />
                        </div>
                      </StickyNotePanel>

                      {/* TAMPAL STICKER */}
                      <StickyNotePanel rotate={0.5}>
                        <DoodleLabel accent="#92400e">TAMPAL STICKER</DoodleLabel>
                        <p className="text-[10px] font-bold mb-2" style={{ color: '#92400e' }}>Tekan satu sticker, kemudian tap canvas untuk tampal!</p>
                        <div className="grid grid-cols-6 gap-2">
                          {STICKERS.map(s => (
                            <motion.button
                              key={s}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => setStickerMode(stickerMode === s ? null : s)}
                              className="aspect-square rounded-xl text-2xl transition-all flex items-center justify-center"
                              style={{
                                backgroundColor: stickerMode === s ? '#fef3c7' : 'transparent',
                                border: stickerMode === s ? '2.5px solid #f97316' : '2px dashed #d4a574',
                                boxShadow: stickerMode === s ? '0 3px 6px rgba(249,115,22,0.3)' : 'none',
                              }}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </StickyNotePanel>
                    </div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* PANDUAN UNTUK ANAK — parchment scroll */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <ParchmentScroll>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base mb-1 uppercase tracking-wider" style={{ color: '#5c3a1e' }}>Panduan Untuk Anak</h3>
                    <p className="text-sm font-bold leading-relaxed" style={{ color: '#78350f' }}>
                      {mode === 'draw' ? '😊 Pilih warna, pilih saiz brush, kemudian lukis di atas kanvas putih. Cuba tampal sticker untuk hiasan!' : mode === 'trace' ? '✏️ Ikuti garisan putus-putus dari awal ke hujung. Selesaikan semua strok untuk dapat bintang!' : '🖍️ Pilih gambar, pilih warna, dan warnakan ruang kosong. Tiada salah — bebas berkreatif!'}
                    </p>
                    <p className="text-[11px] font-bold mt-2 pt-2" style={{ color: '#92400e', borderTop: '1px dashed #c89968' }}>
                      Untuk ibu bapa: aktiviti ini melatih kawalan motor halus &amp; kreativiti.
                    </p>
                  </div>
                  <div className="text-3xl flex-shrink-0">💡</div>
                </div>
              </ParchmentScroll>
            </motion.section>
        </div>

        <SparkleTrail enabled={isDrawing && !stickerMode && mode !== 'trace'} />

        <TracingCelebration
          open={celebration.open}
          accuracy={celebration.accuracy}
          shapeLabel={selectedShape.label}
          onReplay={() => { setCelebration({ open: false, accuracy: 0 }); resetTracing(); playButtonTap(); }}
          onNext={() => {
            const list = tracingShapes;
            const idx = list.findIndex(s => s.label === selectedShape.label);
            const nextShape = list[(idx + 1) % list.length];
            setSelectedShape(nextShape);
            setCelebration({ open: false, accuracy: 0 });
            playButtonTap();
          }}
          onClose={() => setCelebration({ open: false, accuracy: 0 })}
        />

        <MyArtGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />

        {isFullscreen && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg, #312e81 0%, #581c87 50%, #831843 100%)', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.25)' }}>
              <div className="flex gap-2 overflow-x-auto flex-1 min-w-0">
                {(mode === 'draw' || mode === 'color') && (
                  <>
                    {TOOLS.map(t => (
                      <button key={t.id} onClick={() => setTool(t)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${tool.id === t.id ? 'bg-white text-purple-600 shadow' : 'bg-white/20 text-white'}`}>
                        <span>{t.emoji}</span><span className="hidden sm:inline">{t.label}</span>
                      </button>
                    ))}
                    {tool.id !== 'eraser' && (
                      <div className="flex gap-1.5 items-center ml-2 pl-2 border-l border-white/30">
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all" style={{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }} />
                        ))}
                        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-2 border-white/30 flex-shrink-0" />
                      </div>
                    )}
                  </>
                )}
                {mode === 'color' && (
                  <>
                    {COLORING_PAGES.map(page => (
                      <button key={page.id} onClick={() => setSelectedColoringPage(page)} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedColoringPage.id === page.id ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                        {page.label}
                      </button>
                    ))}
                  </>
                )}
                {mode === 'trace' && (
                  <>
                    {TRACING_CATEGORIES.map(category => (
                      <button key={category.id} onClick={() => { setSelectedTracingCategory(category.id); setSelectedShape(category.shapes[0]); }} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedTracingCategory === category.id ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                        {category.label}
                      </button>
                    ))}
                    <span className="w-px bg-white/30 mx-1 flex-shrink-0" />
                    {tracingShapes.map(s => (
                      <button key={s.label} onClick={() => setSelectedShape(s)} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedShape.label === s.label ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                        {s.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={undo} disabled={history.length === 0} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all"><Undo2 className="w-4 h-4" /></button>
                <button onClick={handleClear} className="p-2 rounded-xl bg-red-500/40 hover:bg-red-500/60 text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                <button onClick={downloadCanvas} className="p-2 rounded-xl bg-white text-purple-600 shadow transition-all"><Download className="w-4 h-4" /></button>
                <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"><Minimize2 className="w-4 h-4" /></button>
              </div>
            </div>
            <canvas
              ref={fsCanvasRef}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              style={{ flex: 1, width: '100%', touchAction: 'none', cursor: stickerMode ? 'pointer' : 'crosshair', display: 'block', backgroundColor: '#fff9f0' }}
            />
          </div>,
          document.body
        )}
      </main>
    </div>
  );
}