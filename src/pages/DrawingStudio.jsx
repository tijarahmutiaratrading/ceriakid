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
import { ApplePanel, AppleSectionLabel, AppleButton } from '@/components/drawing/ApplePanel';
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
  B: [[[0.3,0.1],[0.3,0.9]],[[0.3,0.1],[0.55,0.12],[0.7,0.22],[0.7,0.36],[0.55,0.48],[0.3,0.5]],[[0.3,0.5],[0.6,0.52],[0.75,0.64],[0.75,0.78],[0.6,0.88],[0.3,0.9]]],
  C: [[[0.78,0.25],[0.7,0.15],[0.55,0.1],[0.4,0.12],[0.25,0.22],[0.18,0.4],[0.18,0.6],[0.25,0.78],[0.4,0.88],[0.55,0.9],[0.7,0.85],[0.78,0.75]]],
  D: [[[0.28,0.1],[0.28,0.9]],[[0.28,0.1],[0.55,0.12],[0.72,0.28],[0.78,0.5],[0.72,0.72],[0.55,0.88],[0.28,0.9]]],
  E: [[[0.72,0.12],[0.28,0.12],[0.28,0.9],[0.72,0.9]],[[0.28,0.5],[0.64,0.5]]],
  F: [[[0.28,0.1],[0.28,0.9]],[[0.28,0.1],[0.72,0.1]],[[0.28,0.5],[0.64,0.5]]],
  G: [[[0.78,0.25],[0.7,0.15],[0.55,0.1],[0.4,0.12],[0.25,0.22],[0.18,0.4],[0.18,0.6],[0.25,0.78],[0.4,0.88],[0.55,0.9],[0.7,0.85],[0.78,0.7],[0.78,0.55],[0.6,0.55]]],
  H: [[[0.25,0.1],[0.25,0.9]],[[0.75,0.1],[0.75,0.9]],[[0.25,0.5],[0.75,0.5]]],
  I: [[[0.35,0.1],[0.65,0.1]],[[0.5,0.1],[0.5,0.9]],[[0.35,0.9],[0.65,0.9]]],
  J: [[[0.65,0.1],[0.65,0.6],[0.62,0.78],[0.5,0.88],[0.35,0.86],[0.25,0.75]],[[0.48,0.1],[0.78,0.1]]],
  K: [[[0.25,0.1],[0.25,0.9]],[[0.75,0.1],[0.25,0.52]],[[0.25,0.52],[0.75,0.9]]],
  L: [[[0.28,0.1],[0.28,0.9],[0.72,0.9]]],
  M: [[[0.2,0.9],[0.2,0.1],[0.5,0.55],[0.8,0.1],[0.8,0.9]]],
  N: [[[0.22,0.9],[0.22,0.1],[0.78,0.9],[0.78,0.1]]],
  O: [[[0.5,0.1],[0.7,0.14],[0.82,0.3],[0.85,0.5],[0.82,0.7],[0.7,0.86],[0.5,0.9],[0.3,0.86],[0.18,0.7],[0.15,0.5],[0.18,0.3],[0.3,0.14],[0.5,0.1]]],
  P: [[[0.28,0.9],[0.28,0.1]],[[0.28,0.1],[0.55,0.12],[0.7,0.2],[0.72,0.32],[0.7,0.44],[0.55,0.5],[0.28,0.52]]],
  Q: [[[0.5,0.1],[0.7,0.14],[0.82,0.3],[0.85,0.5],[0.82,0.7],[0.7,0.86],[0.5,0.9],[0.3,0.86],[0.18,0.7],[0.15,0.5],[0.18,0.3],[0.3,0.14],[0.5,0.1]],[[0.58,0.66],[0.82,0.92]]],
  R: [[[0.28,0.9],[0.28,0.1]],[[0.28,0.1],[0.55,0.12],[0.7,0.2],[0.72,0.32],[0.7,0.44],[0.55,0.5],[0.28,0.52]],[[0.5,0.52],[0.72,0.9]]],
  S: [[[0.78,0.2],[0.68,0.12],[0.5,0.1],[0.32,0.12],[0.22,0.22],[0.22,0.36],[0.35,0.46],[0.6,0.52],[0.75,0.6],[0.78,0.74],[0.7,0.86],[0.5,0.9],[0.32,0.88],[0.22,0.78]]],
  T: [[[0.2,0.1],[0.8,0.1]],[[0.5,0.1],[0.5,0.9]]],
  U: [[[0.22,0.12],[0.22,0.55],[0.25,0.75],[0.38,0.88],[0.5,0.9],[0.62,0.88],[0.75,0.75],[0.78,0.55],[0.78,0.12]]],
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
  2: [[[0.22,0.28],[0.3,0.16],[0.45,0.1],[0.62,0.12],[0.75,0.22],[0.78,0.36],[0.7,0.5],[0.25,0.88],[0.78,0.88]]],
  3: [[[0.25,0.2],[0.38,0.12],[0.55,0.1],[0.7,0.16],[0.75,0.3],[0.65,0.42],[0.5,0.48]],[[0.45,0.48],[0.65,0.52],[0.78,0.66],[0.72,0.82],[0.55,0.9],[0.35,0.88],[0.22,0.78]]],
  4: [[[0.62,0.1],[0.22,0.6],[0.78,0.6]],[[0.62,0.1],[0.62,0.9]]],
  5: [[[0.72,0.12],[0.32,0.12],[0.3,0.42],[0.42,0.4],[0.6,0.42],[0.74,0.55],[0.75,0.72],[0.65,0.85],[0.45,0.9],[0.25,0.85]]],
  6: [[[0.7,0.18],[0.55,0.12],[0.4,0.14],[0.28,0.28],[0.22,0.48],[0.2,0.65],[0.25,0.8],[0.38,0.9],[0.55,0.9],[0.7,0.82],[0.75,0.68],[0.7,0.55],[0.55,0.5],[0.38,0.52],[0.25,0.62]]],
  7: [[[0.22,0.12],[0.78,0.12],[0.42,0.9]]],
  8: [[[0.5,0.1],[0.35,0.14],[0.28,0.24],[0.3,0.36],[0.42,0.46],[0.5,0.5],[0.58,0.46],[0.7,0.36],[0.72,0.24],[0.65,0.14],[0.5,0.1]],[[0.5,0.5],[0.35,0.55],[0.25,0.66],[0.22,0.78],[0.32,0.88],[0.5,0.9],[0.68,0.88],[0.78,0.78],[0.75,0.66],[0.65,0.55],[0.5,0.5]]],
  9: [[[0.55,0.5],[0.4,0.48],[0.28,0.4],[0.25,0.26],[0.32,0.14],[0.5,0.1],[0.68,0.14],[0.75,0.26],[0.72,0.4],[0.65,0.5],[0.6,0.7],[0.5,0.88]]],
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
      { label: 'Bulatan ⭕', letter: '○', strokes: [[[0.5,0.1],[0.7,0.14],[0.85,0.3],[0.9,0.5],[0.85,0.7],[0.7,0.86],[0.5,0.9],[0.3,0.86],[0.15,0.7],[0.1,0.5],[0.15,0.3],[0.3,0.14],[0.5,0.1]]] },
      { label: 'Segitiga △', letter: '△', strokes: [[[0.5,0.1],[0.85,0.85],[0.15,0.85],[0.5,0.1]]] },
      { label: 'Segiempat ⬜', letter: '□', strokes: [[[0.2,0.2],[0.8,0.2],[0.8,0.8],[0.2,0.8],[0.2,0.2]]] },
      { label: 'Bintang ⭐', letter: '★', strokes: [[[0.5,0.1],[0.62,0.38],[0.9,0.38],[0.68,0.58],[0.76,0.88],[0.5,0.7],[0.24,0.88],[0.32,0.58],[0.1,0.38],[0.38,0.38],[0.5,0.1]]] },
      { label: 'Hati ❤️', letter: '♡', strokes: [[[0.5,0.88],[0.35,0.78],[0.2,0.62],[0.12,0.45],[0.15,0.3],[0.28,0.18],[0.42,0.2],[0.5,0.35],[0.58,0.2],[0.72,0.18],[0.85,0.3],[0.88,0.45],[0.8,0.62],[0.65,0.78],[0.5,0.88]]] },
    ],
  },
];

const TRACING_SHAPES = TRACING_CATEGORIES.flatMap(category => category.shapes);

// Workbook-style tracing: 1 row × 5 letters per screen (macam buku latihan sekolah)
const LETTERS_PER_ROW = 5;
const MASTERY_KEY = 'tracing-mastery-v1';

const loadMastery = () => {
  try { return JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}'); } catch { return {}; }
};
const saveMasteryRow = (shapeLabel) => {
  try {
    const m = loadMastery();
    m[shapeLabel] = Math.min(LETTERS_PER_ROW, (m[shapeLabel] || 0) + 1);
    localStorage.setItem(MASTERY_KEY, JSON.stringify(m));
    return m[shapeLabel];
  } catch { return 0; }
};

const makeOval = (cx, cy, rx, ry, steps = 36, start = 0, end = Math.PI * 2) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const angle = start + ((end - start) * i) / steps;
    return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
  });

const COLORING_PAGES = [
  // Original 10
  { id: 'cat', label: 'Kucing 🐱', emoji: '🐱', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71d0614d5_generated_image.png' },
  { id: 'rabbit', label: 'Arnab 🐰', emoji: '🐰', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8918cface_generated_image.png' },
  { id: 'fish', label: 'Ikan 🐟', emoji: '🐟', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/9e2772b41_generated_image.png' },
  { id: 'house', label: 'Rumah 🏠', emoji: '🏠', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0b504e10f_generated_image.png' },
  { id: 'tree', label: 'Pokok 🌳', emoji: '🌳', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fed3eb4d4_generated_image.png' },
  { id: 'flower', label: 'Bunga 🌸', emoji: '🌸', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/21247ecda_generated_image.png' },
  { id: 'car', label: 'Kereta 🚗', emoji: '🚗', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f2c68a554_generated_image.png' },
  { id: 'robot', label: 'Robot 🤖', emoji: '🤖', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6f6dfac8f_generated_image.png' },
  { id: 'person', label: 'Kanak-kanak 🙂', emoji: '🙂', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2f4927547_generated_image.png' },
  { id: 'sun', label: 'Matahari ☀️', emoji: '☀️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a3e7ca7f2_generated_image.png' },
  // Binatang
  { id: 'elephant', label: 'Gajah 🐘', emoji: '🐘', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/153f05037_generated_image.png' },
  { id: 'lion', label: 'Singa 🦁', emoji: '🦁', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f97d92276_generated_image.png' },
  { id: 'dog', label: 'Anjing 🐶', emoji: '🐶', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/10150a965_generated_image.png' },
  { id: 'bear', label: 'Beruang 🐻', emoji: '🐻', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3be36fbd7_generated_image.png' },
  { id: 'butterfly', label: 'Rama-rama 🦋', emoji: '🦋', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1c6ba8f75_generated_image.png' },
  { id: 'ladybug', label: 'Kumbang 🐞', emoji: '🐞', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/89cb91842_generated_image.png' },
  { id: 'bee', label: 'Lebah 🐝', emoji: '🐝', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/bf3800f62_generated_image.png' },
  { id: 'turtle', label: 'Penyu 🐢', emoji: '🐢', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a4fa51232_generated_image.png' },
  { id: 'penguin', label: 'Penguin 🐧', emoji: '🐧', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4af21c4f6_generated_image.png' },
  { id: 'owl', label: 'Burung Hantu 🦉', emoji: '🦉', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/856e621c8_generated_image.png' },
  { id: 'dinosaur', label: 'Dinosaur 🦖', emoji: '🦖', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/faaf5144c_generated_image.png' },
  { id: 'unicorn', label: 'Unicorn 🦄', emoji: '🦄', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5a8f8e37b_generated_image.png' },
  { id: 'dragon', label: 'Naga 🐲', emoji: '🐲', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/bd6e29435_generated_image.png' },
  { id: 'frog', label: 'Katak 🐸', emoji: '🐸', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3dd83e525_generated_image.png' },
  { id: 'monkey', label: 'Monyet 🐵', emoji: '🐵', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/38ab73a20_generated_image.png' },
  { id: 'giraffe', label: 'Zirafah 🦒', emoji: '🦒', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/46b4fa919_generated_image.png' },
  { id: 'panda', label: 'Panda 🐼', emoji: '🐼', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/22ba98a2b_generated_image.png' },
  { id: 'koala', label: 'Koala 🐨', emoji: '🐨', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/32294b043_generated_image.png' },
  { id: 'hippo', label: 'Badak Air 🦛', emoji: '🦛', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7f955bad5_generated_image.png' },
  { id: 'zebra', label: 'Zebra 🦓', emoji: '🦓', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1266187ef_generated_image.png' },
  // Buah & Makanan
  { id: 'apple', label: 'Epal 🍎', emoji: '🍎', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ebcc17e09_generated_image.png' },
  { id: 'banana', label: 'Pisang 🍌', emoji: '🍌', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6b7962d0d_generated_image.png' },
  { id: 'watermelon', label: 'Tembikai 🍉', emoji: '🍉', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7e18ac459_generated_image.png' },
  { id: 'strawberry', label: 'Strawberi 🍓', emoji: '🍓', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e7f63dfec_generated_image.png' },
  { id: 'icecream', label: 'Ais Krim 🍦', emoji: '🍦', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/97e7e55df_generated_image.png' },
  { id: 'cake', label: 'Kek 🎂', emoji: '🎂', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/70b74a878_generated_image.png' },
  { id: 'donut', label: 'Donut 🍩', emoji: '🍩', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/51662ab89_generated_image.png' },
  { id: 'pizza', label: 'Pizza 🍕', emoji: '🍕', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a4715631d_generated_image.png' },
  { id: 'burger', label: 'Burger 🍔', emoji: '🍔', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dc7505de8_generated_image.png' },
  { id: 'cupcake', label: 'Cupcake 🧁', emoji: '🧁', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/eaf8edb2d_generated_image.png' },
  // Kenderaan & Objek
  { id: 'airplane', label: 'Kapal Terbang ✈️', emoji: '✈️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/85b292a1f_generated_image.png' },
  { id: 'train', label: 'Kereta Api 🚂', emoji: '🚂', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5d3defc30_generated_image.png' },
  { id: 'boat', label: 'Bot ⛵', emoji: '⛵', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/29bfb9574_generated_image.png' },
  { id: 'rocket', label: 'Roket 🚀', emoji: '🚀', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3a428e3a6_generated_image.png' },
  { id: 'bicycle', label: 'Basikal 🚲', emoji: '🚲', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/25b036758_generated_image.png' },
  { id: 'bus', label: 'Bas Sekolah 🚌', emoji: '🚌', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/bb86073df_generated_image.png' },
  { id: 'firetruck', label: 'Bomba 🚒', emoji: '🚒', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a291d63ff_generated_image.png' },
  { id: 'helicopter', label: 'Helikopter 🚁', emoji: '🚁', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/31a060219_generated_image.png' },
  { id: 'castle', label: 'Istana 🏰', emoji: '🏰', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/972dc060b_generated_image.png' },
  { id: 'balloons', label: 'Belon 🎈', emoji: '🎈', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5ca1645af_generated_image.png' },
  // Alam & Profesion
  { id: 'rainbow', label: 'Pelangi 🌈', emoji: '🌈', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dccf48d75_generated_image.png' },
  { id: 'moon', label: 'Bulan 🌙', emoji: '🌙', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5628fb053_generated_image.png' },
  { id: 'cloud', label: 'Awan ☁️', emoji: '☁️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/72f8d0b7c_generated_image.png' },
  { id: 'mountain', label: 'Gunung ⛰️', emoji: '⛰️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4c56db3a8_generated_image.png' },
  { id: 'mushroom', label: 'Cendawan 🍄', emoji: '🍄', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ab1eece0d_generated_image.png' },
  { id: 'cactus', label: 'Kaktus 🌵', emoji: '🌵', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c3698e14f_generated_image.png' },
  { id: 'doctor', label: 'Doktor 👨‍⚕️', emoji: '👨‍⚕️', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ed66dc485_generated_image.png' },
  { id: 'teacher', label: 'Cikgu 👩‍🏫', emoji: '👩‍🏫', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/db10b4ed3_generated_image.png' },
  { id: 'astronaut', label: 'Angkasawan 🧑‍🚀', emoji: '🧑‍🚀', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4e8f6a485_generated_image.png' },
  { id: 'princess', label: 'Puteri 👸', emoji: '👸', imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f6e015505_generated_image.png' },
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
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0); // 0..LETTERS_PER_ROW-1 — current letter in the row
  const [letterStrokeCounts, setLetterStrokeCounts] = useState(Array(LETTERS_PER_ROW).fill(0)); // strokes done per letter slot
  const [mastery, setMastery] = useState(() => loadMastery()); // { shapeLabel: lettersCompleted }

  // Velocity tracking for organic line width (pencil/brush feel)
  const lastPointTime = useRef(0);
  const smoothWidth = useRef(0);

  // Snapshot of drawing taken just before entering/exiting fullscreen so we can
  // reliably restore it after the layout/canvas remount finishes. This survives
  // ResizeObserver firing on the normal canvas (which would otherwise wipe it).
  const transitionSnapshotRef = useRef(null);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setDrawingSoundEnabled(next);
    if (next) playButtonTap();
  };

  // Capture fullscreen canvas BEFORE React unmounts the portal, then exit.
  // This is critical: by the time the useEffect for isFullscreen runs,
  // fsCanvasRef.current is already null because the portal has unmounted.
  const exitFullscreen = () => {
    const fs = fsCanvasRef.current;
    if (fs && fs.width > 0 && fs.height > 0) {
      try {
        const snap = document.createElement('canvas');
        snap.width = fs.width;
        snap.height = fs.height;
        snap.getContext('2d').drawImage(fs, 0, 0);
        transitionSnapshotRef.current = snap;
      } catch { /* keep existing snapshot */ }
    }
    setIsFullscreen(false);
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
        // 'darken' keeps black outlines on top but doesn't darken white/empty areas
        // (unlike 'multiply' which can tint transparent regions when image has off-white pixels)
        ctx.globalCompositeOperation = 'darken';
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
    if (mode === 'trace' && selectedShape) drawTracingGuide(ctx, w, h, selectedShape, currentLetterIndex);
    // NOTE: Line art coloring TIDAK dilukis pada canvas. Ia rendered sebagai
    // <img> overlay (pointer-events:none) di atas canvas — supaya pemadam
    // hanya buang warna user, tak terjejas line art.
  }, [mode, selectedShape, currentLetterIndex]);

  // Workbook-style: render 1 row × LETTERS_PER_ROW letters dengan baseline guides
  // Slot 0 = solid example (contoh), slots 1..N = dotted for tracing
  // activeIndex = letter slot anak tengah trace sekarang (highlighted)
  const drawTracingGuide = (ctx, w, h, shape, activeIndex = 1) => {
    ctx.save();

    // Layout — 1 row of letters with workbook-style 4-line ruling
    const sideMargin = w * 0.04;
    const topMargin = h * 0.18;
    const bottomMargin = h * 0.18;
    const rowH = h - topMargin - bottomMargin;
    const slotW = (w - sideMargin * 2) / LETTERS_PER_ROW;

    // 4-line workbook ruling (top → ascender → baseline → descender)
    const topY = topMargin;
    const midY = topMargin + rowH * 0.3;       // ascender line (dotted)
    const baseY = topMargin + rowH * 0.85;     // baseline (solid red)
    const bottomY = topMargin + rowH;          // descender line

    // Draw the 4 horizontal lines across the full row
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';

    // Top boundary
    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(sideMargin, topY);
    ctx.lineTo(w - sideMargin, topY);
    ctx.stroke();

    // Middle dotted (x-height guide)
    ctx.strokeStyle = 'rgba(148,163,184,0.7)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(sideMargin, midY);
    ctx.lineTo(w - sideMargin, midY);
    ctx.stroke();

    // Baseline (solid red — paling penting, anak letak huruf duduk atas garis ni)
    ctx.strokeStyle = 'rgba(239,68,68,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(sideMargin, baseY);
    ctx.lineTo(w - sideMargin, baseY);
    ctx.stroke();

    // Bottom boundary
    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sideMargin, bottomY);
    ctx.lineTo(w - sideMargin, bottomY);
    ctx.stroke();

    // Vertical light separators between letter slots
    ctx.strokeStyle = 'rgba(203,213,225,0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    for (let i = 1; i < LETTERS_PER_ROW; i++) {
      const x = sideMargin + slotW * i;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Letter cell box: top = topY, bottom = baseY, x-height between midY and baseY
    // We render the letter so it sits ON the baseline. Letter height ≈ baseY - topY.
    const letterH = baseY - topY;
    const letterW = slotW * 0.78; // a bit of horizontal padding per cell

    // Draw each letter slot
    for (let i = 0; i < LETTERS_PER_ROW; i++) {
      const cx = sideMargin + slotW * i + slotW / 2;
      const cellLeft = cx - letterW / 2;
      const cellTop = topY + letterH * 0.05;

      const isExample = i === 0;
      const isActive = i === activeIndex;
      const isDone = i < activeIndex && !isExample;

      // Slot number badge (top-right corner)
      ctx.save();
      ctx.fillStyle = isExample ? 'rgba(34,197,94,0.9)' : isActive ? 'rgba(59,130,246,0.95)' : isDone ? 'rgba(148,163,184,0.7)' : 'rgba(203,213,225,0.7)';
      ctx.beginPath();
      ctx.arc(cx + slotW * 0.36, topY - 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Nunito", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isExample ? '★' : isDone ? '✓' : String(i), cx + slotW * 0.36, topY - 8);
      ctx.restore();

      // Highlight active slot with soft background
      if (isActive) {
        ctx.fillStyle = 'rgba(59,130,246,0.06)';
        ctx.fillRect(sideMargin + slotW * i, topY, slotW, letterH);
      }

      // Render the letter/number using canvas fillText — guna font Nunito bold
      // supaya huruf nampak sempurna macam buku latihan sebenar.
      // Untuk shape (bulatan, hati, dll) yang bukan huruf, fallback ke stroke paths.
      ctx.save();
      ctx.translate(cellLeft, cellTop);

      const char = shape.letter || '';
      const isTextChar = /^[A-Za-z0-9]$/.test(char);

      if (isTextChar) {
        // Font-based rendering — single line, font biasa (tak bold)
        const fontSize = letterH * 0.78;
        ctx.font = `400 ${fontSize}px "Nunito", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const x = letterW / 2;
        const y = letterH * 0.88;

        if (isExample) {
          ctx.fillStyle = '#7c3aed';
          ctx.fillText(char, x, y);
        } else if (isDone) {
          ctx.fillStyle = 'rgba(124,58,237,0.22)';
          ctx.fillText(char, x, y);
        } else {
          // Tracing slot — dashed outline supaya anak ikut garisan putus-putus
          ctx.strokeStyle = isActive ? 'rgba(124,58,237,0.75)' : 'rgba(124,58,237,0.35)';
          ctx.lineWidth = isActive ? 2.5 : 2;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.setLineDash([6, 5]);
          ctx.strokeText(char, x, y);
          ctx.setLineDash([]);
        }
      } else {
        // Non-text shapes (bulatan, segitiga, hati, dll) — guna stroke paths
        const scaleX = letterW;
        const scaleY = letterH * 0.9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Shape detection: kalau ada sudut tajam (segitiga, segiempat, bintang)
        // guna straight lineTo. Hanya shape rounded (bulatan, hati) guna smoothing.
        const isAngularShape = ['△', '□', '★'].includes(shape.letter);
        const tracePath = (stroke) => {
          ctx.beginPath();
          const p0 = stroke[0];
          ctx.moveTo(p0[0] * scaleX, p0[1] * scaleY);
          if (isAngularShape || stroke.length <= 2) {
            // Straight lines untuk sudut tajam
            for (let j = 1; j < stroke.length; j++) {
              ctx.lineTo(stroke[j][0] * scaleX, stroke[j][1] * scaleY);
            }
          } else {
            // Smooth curves untuk bulatan/hati
            for (let j = 1; j < stroke.length - 1; j++) {
              const cx = stroke[j][0] * scaleX;
              const cy = stroke[j][1] * scaleY;
              const nx = (stroke[j][0] + stroke[j + 1][0]) / 2 * scaleX;
              const ny = (stroke[j][1] + stroke[j + 1][1]) / 2 * scaleY;
              ctx.quadraticCurveTo(cx, cy, nx, ny);
            }
            const last = stroke[stroke.length - 1];
            ctx.lineTo(last[0] * scaleX, last[1] * scaleY);
          }
        };

        if (isExample) {
          shape.strokes.forEach((stroke) => {
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 7;
            ctx.setLineDash([]);
            tracePath(stroke);
            ctx.stroke();
          });
        } else if (isDone) {
          shape.strokes.forEach((stroke) => {
            ctx.strokeStyle = 'rgba(124,58,237,0.25)';
            ctx.lineWidth = 4;
            ctx.setLineDash([]);
            tracePath(stroke);
            ctx.stroke();
          });
        } else {
          const alpha = isActive ? 0.65 : 0.28;
          const lw = isActive ? 5 : 4;
          shape.strokes.forEach((stroke) => {
            if (isActive) {
              ctx.strokeStyle = 'rgba(196,181,253,0.4)';
              ctx.lineWidth = 14;
              ctx.setLineDash([]);
              tracePath(stroke);
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
            ctx.lineWidth = lw;
            ctx.setLineDash([8, 6]);
            tracePath(stroke);
            ctx.stroke();
          });
          ctx.setLineDash([]);
        }
      }

      ctx.restore();
    }

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

  // Reset workbook row whenever user picks a different letter
  useEffect(() => {
    setCurrentLetterIndex(1); // start at slot 1 (slot 0 is the solid example)
    setLetterStrokeCounts(Array(LETTERS_PER_ROW).fill(0));
  }, [selectedShape.label]);

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
      // Mobile: lebih tinggi (4:5) supaya kanvas panjang ke bawah & senang lukis.
      // Desktop: kekal 4:3 untuk landscape feel.
      const isMobile = window.innerWidth < 640;
      const cssH = Math.round(cssW * (isMobile ? (5 / 4) : (3 / 4)));
      // Skip if size unchanged (avoid wiping the drawing on every micro-resize)
      if (canvas._cssW === cssW && canvas._cssH === cssH) return;
      // Prefer a freshly-captured transition snapshot (when exiting fullscreen)
      // over the current canvas pixels, since this observer may fire BEFORE the
      // fullscreen sync effect copies the drawing back.
      let snapshot = null;
      if (transitionSnapshotRef.current) {
        snapshot = transitionSnapshotRef.current;
      } else if (canvas.width > 0 && canvas.height > 0) {
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
      // Paint base background first so transparent drawings don't show through
      ctx.fillStyle = '#fff9f0';
      ctx.fillRect(0, 0, cssW, cssH);
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

  // Fullscreen setup + sync drawings between normal ↔ fullscreen.
  // Critical: we capture a snapshot of the SOURCE canvas BEFORE the fullscreen
  // element mounts/unmounts, because by the time the rAF callback runs the
  // source canvas may already be remounted or wiped by a ResizeObserver.
  useEffect(() => {
    if (isFullscreen) {
      // Snapshot the normal canvas right now (its bitmap is still intact)
      const src = canvasRef.current;
      if (src && src.width > 0 && src.height > 0) {
        try {
          const snap = document.createElement('canvas');
          snap.width = src.width;
          snap.height = src.height;
          snap.getContext('2d').drawImage(src, 0, 0);
          transitionSnapshotRef.current = snap;
        } catch { transitionSnapshotRef.current = null; }
      }
      requestAnimationFrame(() => {
        const dst = fsCanvasRef.current;
        if (!dst) return;
        const parent = dst.parentElement;
        const parentRect = parent.getBoundingClientRect();
        const cssW = Math.round(parentRect.width);
        const cssH = Math.round(parentRect.height);
        setupHiDPICanvas(dst, cssW, cssH);
        const ctx = dst.getContext('2d');
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, cssW, cssH);
        const snap = transitionSnapshotRef.current;
        if (snap) ctx.drawImage(snap, 0, 0, cssW, cssH);
        // Keep snapshot until we exit fullscreen so it can be re-used
      });
    } else {
      // Note: snapshot was already captured synchronously in the close button's
      // onClick handler (see exitFullscreen()) — by the time this effect runs,
      // the portal has already unmounted and fsCanvasRef.current is null.
      // Restore to normal canvas across multiple frames to outlast the
      // ResizeObserver call that fires when the normal canvas becomes visible.
      const restore = () => {
        const dst = canvasRef.current;
        const snap = transitionSnapshotRef.current;
        if (!dst || !snap) return;
        const dstSize = getLogicalSize(dst);
        if (!dstSize.w || !dstSize.h) return;
        const ctx = dst.getContext('2d');
        ctx.fillStyle = '#fff9f0';
        ctx.fillRect(0, 0, dstSize.w, dstSize.h);
        ctx.drawImage(snap, 0, 0, dstSize.w, dstSize.h);
      };
      requestAnimationFrame(() => {
        restore();
        // Second pass after layout settles — ResizeObserver may have wiped the
        // first restore. setupNormal also reads transitionSnapshotRef.current.
        requestAnimationFrame(() => {
          restore();
          // Free the snapshot a bit later so any late ResizeObserver still finds it
          setTimeout(() => { transitionSnapshotRef.current = null; }, 400);
        });
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
    ctx.save();
    if (tool.id === 'eraser') {
      // Padam pixel sahaja (bukan tindih warna) — supaya line art coloring kekal
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, lw / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, lw / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
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
    ctx.save();
    if (tool.id === 'eraser') {
      // destination-out = buang pixel sahaja, tak tindih warna background.
      // Ini bermaksud line art coloring tak akan terpadam.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = tool.opacity;
    }
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

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

      // Detect which letter slot this stroke was drawn in (majority of points, not avg)
      // This is more reliable kalau anak strok melintasi sempadan slot
      if (canvas) {
        const { w } = getLogicalSize(canvas);
        const sideMargin = w * 0.04;
        const slotW = (w - sideMargin * 2) / LETTERS_PER_ROW;

        // Count points per slot — majority wins
        const slotVotes = Array(LETTERS_PER_ROW).fill(0);
        currentStroke.forEach((p) => {
          const idx = Math.max(0, Math.min(LETTERS_PER_ROW - 1, Math.floor((p.x - sideMargin) / slotW)));
          slotVotes[idx]++;
        });
        const slotIdx = slotVotes.indexOf(Math.max(...slotVotes));

        // GUARD: slot 0 = contoh (jangan ambil kira)
        if (slotIdx === 0) return;

        // GUARD: stroke kena dalam slot aktif sahaja (tak boleh skip slot)
        if (slotIdx !== currentLetterIndex) return;

        // 1 strok cukup untuk complete satu slot — sama untuk huruf, nombor, dan shape.
        // Ini lebih natural untuk anak-anak: satu cubaan = satu kemajuan.
        const requiredStrokes = 1;

        // Increment stroke count for active slot
        const newCounts = [...letterStrokeCounts];
        newCounts[slotIdx] = (newCounts[slotIdx] || 0) + 1;
        setLetterStrokeCounts(newCounts);

        if (newCounts[slotIdx] >= requiredStrokes) {
          saveMasteryRow(selectedShape.label);
          setMastery(loadMastery());
          playStamp();
          confetti({ particleCount: 40, spread: 40, origin: { y: 0.55, x: (sideMargin + slotW * slotIdx + slotW / 2) / w }, colors: ['#fbbf24', '#22c55e'] });

          const isLastSlot = currentLetterIndex >= LETTERS_PER_ROW - 1;
          if (isLastSlot) {
            // Whole row done — calculate real accuracy from total strokes vs ideal
            const totalStrokes = newCounts.reduce((s, n) => s + n, 0);
            const idealStrokes = requiredStrokes * (LETTERS_PER_ROW - 1); // slot 1..N
            const ratio = Math.min(1, idealStrokes / Math.max(totalStrokes, 1));
            const acc = Math.max(75, Math.min(99, Math.round(ratio * 99)));
            setTracingAccuracy(acc);
            setTracingDone(true);
            setCelebration({ open: true, accuracy: acc });
            confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ['#fbbf24', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'] });
            playTadaa();
          } else {
            // Advance to next slot after short delay
            setTimeout(() => {
              setCurrentLetterIndex(idx => idx + 1);
            }, 700);
          }
        }
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
    setCurrentLetterIndex(1);
    setLetterStrokeCounts(Array(LETTERS_PER_ROW).fill(0));
    const ctx = getCtx();
    const canvas = getCanvas();
    if (ctx && canvas) {
      const { w, h } = getLogicalSize(canvas);
      clearCanvas(ctx, w, h);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative text-slate-900" style={{ background: 'linear-gradient(180deg, #fde68a 0%, #fbbf24 30%, #f59e0b 60%, #d97706 100%)' }}>
      {/* Dashboard background image layer — fixed supaya kekal bila scroll */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -10,
          pointerEvents: 'none',
          backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Floating orbs to match dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
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

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-28 pt-20 md:pt-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full font-bold text-sm text-slate-700 bg-white/90 backdrop-blur-md ring-1 ring-black/5 shadow-md hover:bg-white hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </motion.button>

        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Creative Studio</p>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-slate-900">Studio Lukisan</h1>
              <p className="text-slate-500 text-base font-medium mt-2 max-w-lg">Lukis bebas, surih huruf, atau warnakan gambar — semua dalam satu tempat.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { top: mode === 'draw' ? 'Lukis Bebas' : mode === 'trace' ? 'Tracing' : 'Mewarna', bottom: 'Mode' },
                { top: stickerMode ? `Sticker ${stickerMode}` : tool.label, bottom: 'Alat' },
                { top: `${history.length}`, bottom: 'Undo' },
              ].map((badge, i) => (
                <div key={i} className="px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5 text-center min-w-[78px]" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <p className="font-bold text-sm leading-tight text-slate-900">{badge.top}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-slate-400">{badge.bottom}</p>
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
            <ApplePanel tight className="!p-3 sm:!p-4">
              {/* Canvas header bar */}
              <div className="flex items-center justify-between gap-2 px-1 sm:px-2 pb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Kanvas Aktif</p>
                  <p className="text-slate-900 font-bold text-sm sm:text-base truncate">
                    {mode === 'draw' ? `${tool.emoji} ${tool.label}` : mode === 'trace' ? `✏️ ${selectedShape.label}` : `🖍️ ${selectedColoringPage.label}`}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <button onClick={toggleSound} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-all" title={soundOn ? 'Matikan bunyi' : 'Hidupkan bunyi'}>
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setGalleryOpen(true); playButtonTap(); }} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-all" title="Kerja Saya">
                    <Images className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsFullscreen(true)} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-all" title="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/5" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="absolute left-2 top-2 right-2 z-10 flex items-center gap-1.5 flex-wrap pointer-events-none">
                  <div className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-700 ring-1 ring-black/5 shadow-sm">
                    {stickerMode ? <span>Sticker {stickerMode}</span> : (
                      <>
                        <span className="inline-block rounded-full" style={{ width: 10, height: 10, backgroundColor: tool.id === 'eraser' ? '#fff9f0' : color, border: tool.id === 'eraser' ? '1.5px dashed #cbd5e1' : '1.5px solid rgba(0,0,0,0.15)' }} />
                        <span>{brushSize.label}</span>
                      </>
                    )}
                  </div>
                  {mode === 'trace' && (
                    <>
                      <div className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-900/85 backdrop-blur-md text-white shadow-sm">
                        {currentLetterIndex}/{LETTERS_PER_ROW - 1}
                      </div>
                      <div className="hidden sm:flex px-3 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-700 ring-1 ring-black/5 shadow-sm">
                        <span className="text-yellow-500">★</span> Contoh
                        <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] font-black">▶</span> Latih
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
                {/* Line art overlay untuk mode mewarna — pointer-events:none supaya canvas
                    di bawah masih boleh terima input. mix-blend:darken kekalkan outline
                    hitam crisp dan biar warna user kelihatan. */}
                {mode === 'color' && selectedColoringPage?.imageUrl && (
                  <img
                    src={selectedColoringPage.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none select-none"
                    style={{ objectFit: 'contain', mixBlendMode: 'darken' }}
                    draggable={false}
                  />
                )}
              </div>
            </ApplePanel>

            {/* Mobile actions row */}
            <div className="grid grid-cols-3 gap-2 mt-3 sm:hidden">
              <button onClick={undo} disabled={history.length === 0} className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-slate-700 bg-white ring-1 ring-black/5 shadow-sm disabled:opacity-40">
                <Undo2 className="w-4 h-4" /> Undo
              </button>
              <button onClick={handleClear} className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-red-600 bg-red-50 ring-1 ring-red-100">
                <Trash2 className="w-4 h-4" /> Kosong
              </button>
              <AppleButton onClick={downloadCanvas} className="!py-3">
                <Download className="w-4 h-4" /> Simpan
              </AppleButton>
            </div>
          </motion.section>

          {/* AKTIVITI KREATIF — sticky-note panel */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ApplePanel>
              <AppleSectionLabel>Aktiviti Kreatif</AppleSectionLabel>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map((m) => {
                  const icons = { draw: '🎨', trace: '✏️', color: '🖍️' };
                  const labelMap = { draw: 'Lukis Bebas', trace: 'Tracing', color: 'Mewarna' };
                  const isActive = mode === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setMode(m.id)}
                      className={`relative py-4 px-3 rounded-2xl transition-all flex flex-col items-center gap-1 ${isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <div className="text-3xl leading-none">{icons[m.id]}</div>
                      <p className="font-semibold text-sm">{labelMap[m.id]}</p>
                    </motion.button>
                  );
                })}
              </div>
            </ApplePanel>
          </motion.section>

          <AnimatePresence mode="wait">
              {mode === 'trace' ? (
                <motion.section
                  key="trace-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                <ApplePanel>
                  <AppleSectionLabel>Tracing — {selectedShape.label}</AppleSectionLabel>

                  {/* Kategori — pill row */}
                  <p className="text-xs font-semibold text-slate-500 mb-2">Kategori</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {TRACING_CATEGORIES.map(category => {
                      const active = selectedTracingCategory === category.id;
                      return (
                        <motion.button
                          key={category.id}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            setSelectedTracingCategory(category.id);
                            setSelectedShape(category.shapes[0]);
                          }}
                          className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        >
                          {category.label}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Item latihan — grid kotak besar dengan karakter di tengah */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-500">Item latihan <span className="text-slate-400 font-normal">— ⭐ = mahir</span></p>
                    <span className="text-[10px] font-bold text-slate-400">{tracingShapes.length} pilihan</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 pr-1">
                    {tracingShapes.map(s => {
                      const active = selectedShape.label === s.label;
                      const stars = mastery[s.label] || 0;
                      return (
                        <motion.button
                          key={s.label}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setSelectedShape(s)}
                          className={`relative flex items-center justify-center aspect-square rounded-2xl font-black text-xl sm:text-2xl transition-all ${active ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
                          title={s.label}
                        >
                          <span>{s.letter}</span>
                          {stars > 0 && (
                            <span className={`absolute -top-1 -right-1 px-1 rounded-full text-[9px] font-bold ${active ? 'bg-yellow-300 text-yellow-900' : 'bg-yellow-400 text-yellow-900'} shadow`}>
                              {stars}⭐
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Workbook row progress — anak trace 4 huruf (slot 1-4), slot 0 = contoh */}
                  <div className="mt-4 rounded-2xl p-3 bg-gradient-to-br from-purple-50 to-blue-50 ring-1 ring-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-purple-900">📖 Buku Latihan</p>
                      <p className="text-xs font-black text-purple-700">{Math.max(0, currentLetterIndex - 1)}/{LETTERS_PER_ROW - 1} siap</p>
                    </div>
                    <div className="flex gap-1.5">
                      {Array.from({ length: LETTERS_PER_ROW }).map((_, i) => {
                        const isExample = i === 0;
                        const isDone = !isExample && i < currentLetterIndex;
                        const isActive = !isExample && i === currentLetterIndex;
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-7 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                              isExample ? 'bg-green-500 text-white' :
                              isDone ? 'bg-green-400 text-white' :
                              isActive ? 'bg-blue-500 text-white animate-pulse' :
                              'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isExample ? '★' : isDone ? '✓' : i}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] font-medium text-slate-600 mt-2">
                      ★ = contoh (jangan trace) &nbsp;•&nbsp; Trace huruf bertanda 🔵 dari kiri ke kanan
                    </p>
                  </div>

                  <div className="mt-3 rounded-2xl p-3 bg-slate-50 ring-1 ring-black/5">
                    {tracingDone ? (
                      <div className="text-center">
                        <p className="font-bold text-base text-slate-900">🌟 Satu baris siap! Ketepatan {tracingAccuracy}%</p>
                        <AppleButton onClick={resetTracing} variant="accent" className="mt-2 !px-4 !py-1.5 !text-xs">Latih Sekali Lagi</AppleButton>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-600">📝 Trace huruf <span className="font-black text-blue-600">#{currentLetterIndex}</span> sekarang. Tinggal {LETTERS_PER_ROW - currentLetterIndex} huruf lagi!</p>
                    )}
                  </div>
                </ApplePanel>
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
                    <ApplePanel>
                      <div className="flex items-center justify-between mb-3">
                        <AppleSectionLabel>Pilih Gambar</AppleSectionLabel>
                        <span className="text-[10px] font-bold text-slate-400">{COLORING_PAGES.length} pilihan</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pr-1">
                        {COLORING_PAGES.map(page => {
                          const active = selectedColoringPage.id === page.id;
                          // Buang emoji dari label supaya nama bersih
                          const cleanLabel = page.label.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
                          return (
                            <motion.button
                              key={page.id}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => setSelectedColoringPage(page)}
                              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${active ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                            >
                              <span className="text-3xl leading-none">{page.emoji}</span>
                              <span className="text-[10px] font-semibold truncate w-full text-center">{cleanLabel}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </ApplePanel>
                  )}

                  {/* TOOLS + BRUSH SIZE + SAVE in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                    {/* ALAT */}
                    <ApplePanel>
                      <AppleSectionLabel>{mode === 'color' ? 'Alat Mewarna' : 'Alat Lukisan'}</AppleSectionLabel>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TOOLS.map(t => {
                          const active = tool.id === t.id && !stickerMode;
                          return (
                            <motion.button
                              key={t.id}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => { setTool(t); setStickerMode(null); }}
                              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${active ? 'bg-slate-900 shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                              title={t.label}
                            >
                              <span className={active ? 'grayscale-0' : ''}>{t.emoji}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </ApplePanel>

                    {/* SAIZ BRUSH */}
                    <ApplePanel>
                      <AppleSectionLabel>Saiz Brush</AppleSectionLabel>
                      <div className="grid grid-cols-4 gap-1.5">
                        {BRUSH_SIZES.map(s => {
                          const active = brushSize.id === s.id;
                          return (
                            <motion.button
                              key={s.id}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => setBrushSize(s)}
                              className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                            >
                              <span className="rounded-full" style={{ width: s.dot, height: s.dot, backgroundColor: active ? '#ffffff' : '#94a3b8' }} />
                              <span className="text-[10px] font-semibold">{s.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </ApplePanel>

                    {/* SAVE BUTTON */}
                    <div className="hidden sm:flex items-center justify-center">
                      <AppleButton onClick={downloadCanvas} className="!px-6 !py-4 !text-base">
                        <Download className="w-4 h-4" /> Simpan
                      </AppleButton>
                    </div>
                  </div>

                  {tool.id !== 'eraser' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PALET WARNA */}
                      <ApplePanel>
                        <AppleSectionLabel>Palet Warna</AppleSectionLabel>
                        <div className="grid grid-cols-6 gap-2">
                          {COLORS.map(c => {
                            const active = color === c;
                            return (
                              <motion.button
                                key={c}
                                whileTap={{ scale: 0.88 }}
                                onClick={() => { setColor(c); setStickerMode(null); }}
                                className="aspect-square rounded-full transition-all"
                                style={{
                                  backgroundColor: c,
                                  boxShadow: active
                                    ? '0 0 0 2.5px #ffffff, 0 0 0 5px #0f172a, 0 4px 12px rgba(15,23,42,0.18)'
                                    : '0 1px 2px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(0,0,0,0.08)',
                                }}
                                aria-label={`Warna ${c}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-3 rounded-2xl p-2.5 bg-slate-50 ring-1 ring-black/5">
                          <input type="color" value={color} onChange={e => { setColor(e.target.value); setStickerMode(null); }} className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-900">Warna custom</p>
                            <p className="text-[10px] text-slate-500">Pilih mana-mana warna kegemaran</p>
                          </div>
                          <div className="w-7 h-7 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
                        </div>
                      </ApplePanel>

                      {/* TAMPAL STICKER */}
                      <ApplePanel>
                        <AppleSectionLabel>Tampal Sticker</AppleSectionLabel>
                        <p className="text-[11px] text-slate-500 mb-2">Tekan satu sticker, kemudian tap canvas untuk tampal.</p>
                        <div className="grid grid-cols-6 gap-2">
                          {STICKERS.map(s => {
                            const active = stickerMode === s;
                            return (
                              <motion.button
                                key={s}
                                whileTap={{ scale: 0.88 }}
                                onClick={() => setStickerMode(stickerMode === s ? null : s)}
                                className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${active ? 'bg-slate-900 shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                              >
                                {s}
                              </motion.button>
                            );
                          })}
                        </div>
                      </ApplePanel>
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
              <ApplePanel>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <AppleSectionLabel accent="💡">Panduan Untuk Anak</AppleSectionLabel>
                    <p className="text-sm font-medium leading-relaxed text-slate-700">
                      {mode === 'draw' ? '😊 Pilih warna, pilih saiz brush, kemudian lukis di atas kanvas putih. Cuba tampal sticker untuk hiasan!' : mode === 'trace' ? '✏️ Ikuti garisan putus-putus dari awal ke hujung. Selesaikan semua strok untuk dapat bintang!' : '🖍️ Pilih gambar, pilih warna, dan warnakan ruang kosong. Tiada salah — bebas berkreatif!'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      Untuk ibu bapa: aktiviti ini melatih kawalan motor halus &amp; kreativiti.
                    </p>
                  </div>
                </div>
              </ApplePanel>
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
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(180deg, #f5f5f7 0%, #fafafa 40%, #ffffff 100%)', display: 'flex', flexDirection: 'column' }}>
            {/* Ambient color blobs — match main page aesthetic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)' }} />
              <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)' }} />
              <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #bae6fd 0%, transparent 70%)' }} />
            </div>

            {/* Premium glass toolbar */}
            <div
              className="relative flex items-center gap-3 px-4 sm:px-6 py-3 flex-shrink-0 border-b border-black/[0.04]"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(15,23,42,0.04)',
              }}
            >
              <div className="flex gap-2 overflow-x-auto flex-1 min-w-0 items-center scrollbar-thin">
                {(mode === 'draw' || mode === 'color') && (
                  <>
                    {TOOLS.map(t => {
                      const active = tool.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTool(t)}
                          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50'}`}
                        >
                          <span className="text-base leading-none">{t.emoji}</span>
                          <span className="hidden sm:inline">{t.label}</span>
                        </button>
                      );
                    })}
                    {tool.id !== 'eraser' && (
                      <div className="flex gap-1.5 items-center ml-2 pl-3 border-l border-black/10">
                        {COLORS.map(c => {
                          const active = color === c;
                          return (
                            <button
                              key={c}
                              onClick={() => setColor(c)}
                              className="w-7 h-7 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                              style={{
                                backgroundColor: c,
                                boxShadow: active
                                  ? '0 0 0 2px #ffffff, 0 0 0 4px #0f172a'
                                  : '0 1px 2px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(0,0,0,0.08)',
                              }}
                            />
                          );
                        })}
                        <input
                          type="color"
                          value={color}
                          onChange={e => setColor(e.target.value)}
                          className="w-7 h-7 rounded-full cursor-pointer border border-black/10 flex-shrink-0 bg-transparent"
                          title="Warna custom"
                        />
                      </div>
                    )}
                  </>
                )}
                {mode === 'color' && (
                  <div className="flex gap-1.5 ml-2 pl-3 border-l border-black/10">
                    {COLORING_PAGES.map(page => {
                      const active = selectedColoringPage.id === page.id;
                      return (
                        <button
                          key={page.id}
                          onClick={() => setSelectedColoringPage(page)}
                          className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all ${active ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        >
                          {page.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {mode === 'trace' && (
                  <>
                    {TRACING_CATEGORIES.map(category => {
                      const active = selectedTracingCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => { setSelectedTracingCategory(category.id); setSelectedShape(category.shapes[0]); }}
                          className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50'}`}
                        >
                          {category.label}
                        </button>
                      );
                    })}
                    <span className="w-px h-6 bg-black/10 mx-1 flex-shrink-0" />
                    {tracingShapes.map(s => {
                      const active = selectedShape.label === s.label;
                      return (
                        <button
                          key={s.label}
                          onClick={() => setSelectedShape(s)}
                          className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all ${active ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pl-2 border-l border-black/10">
                <button
                  onClick={undo}
                  disabled={history.length === 0}
                  className="p-2 rounded-full bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 rounded-full bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100 transition-all"
                  title="Kosongkan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-md hover:bg-slate-800 transition-all"
                  title="Simpan"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Simpan</span>
                </button>
                <button
                  onClick={exitFullscreen}
                  className="p-2 rounded-full bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50 transition-all"
                  title="Keluar fullscreen"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
              <canvas
                ref={fsCanvasRef}
                onPointerDown={startDraw}
                onPointerMove={draw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
                style={{ width: '100%', height: '100%', touchAction: 'none', cursor: stickerMode ? 'pointer' : 'crosshair', display: 'block', backgroundColor: '#fff9f0', position: 'absolute', inset: 0, zIndex: 1 }}
              />
              {/* Fullscreen line art overlay — sama macam normal canvas */}
              {mode === 'color' && selectedColoringPage?.imageUrl && (
                <img
                  src={selectedColoringPage.imageUrl}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none', mixBlendMode: 'darken', zIndex: 2 }}
                />
              )}
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
}