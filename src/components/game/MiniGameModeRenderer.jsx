import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const panel = 'rounded-3xl p-5 bg-white/15 border border-white/25 shadow-xl';
const action = 'rounded-2xl bg-white text-purple-700 font-black shadow-lg active:scale-95 transition-all';

export default function MiniGameModeRenderer({ game }) {
  const data = game?.gameData || {};
  const mode = data.mode || game?.category;

  if (mode === 'memory') return <MemoryMode data={data} />;
  if (mode === 'dragdrop') return <DragDropMode data={data} />;
  if (mode === 'wordbuilder') return <WordBuilderMode data={data} />;
  if (mode === 'sorting') return <SortingMode data={data} />;
  if (mode === 'tilematch') return <TileMatchMode data={data} />;
  if (mode === 'story') return <StoryMode data={data} />;
  if (mode === 'physics') return <PhysicsMode data={data} />;
  if (mode === 'tracing') return <TracingMode data={data} />;

  return <div className={panel}><p className="text-white font-bold">Mini game belum tersedia.</p></div>;
}

function MemoryMode({ data }) {
  const cards = useMemo(() => shuffle((data.pairs || []).flatMap((pair, pairId) => pair.map((text, side) => ({ pairId, side, text })))), [data]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);

  const tap = (idx) => {
    if (open.includes(idx) || matched.includes(cards[idx]?.pairId) || open.length === 2) return;
    const next = [...open, idx];
    setOpen(next);
    if (next.length === 2) {
      const ok = cards[next[0]].pairId === cards[next[1]].pairId;
      setTimeout(() => {
        if (ok) setMatched(prev => [...prev, cards[next[0]].pairId]);
        setOpen([]);
      }, 600);
    }
  };

  return <div className="grid grid-cols-2 gap-3">{cards.map((card, idx) => {
    const show = open.includes(idx) || matched.includes(card.pairId);
    return <button key={idx} onClick={() => tap(idx)} className={`min-h-24 ${panel} text-center ${show ? 'bg-white text-purple-700' : 'text-white'}`}>
      <p className="font-black text-lg">{show ? card.text : '?'}</p>
    </button>;
  })}</div>;
}

function DragDropMode({ data }) {
  const [placed, setPlaced] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const dragText = useRef(null);
  const items = data.items || [];
  const targets = data.targets || [];

  const placeItem = (target) => {
    const item = dragText.current || selectedItem;
    if (!item) return;
    setPlaced(prev => ({ ...prev, [target]: item }));
    setSelectedItem(null);
    dragText.current = null;
  };

  return <div className="space-y-4">
    <div className={panel}><p className="text-white/70 text-xs font-black mb-3 uppercase">Pilih atau seret item</p><div className="flex flex-wrap gap-2">{items.filter(item => !Object.values(placed).includes(item)).map(item => <button key={item} type="button" draggable onClick={() => setSelectedItem(item)} onDragStart={() => { dragText.current = item; }} className={`px-4 py-3 rounded-2xl font-black cursor-grab transition-all ${selectedItem === item ? 'bg-yellow-300 text-purple-900 ring-4 ring-white/50' : 'bg-white text-purple-700'}`}>{item}</button>)}</div></div>
    <div className="grid grid-cols-2 gap-3">{targets.map((target) => <button key={target} type="button" onClick={() => placeItem(target)} onDragOver={e => e.preventDefault()} onDrop={() => placeItem(target)} className={`${panel} min-h-28 text-center transition-all ${selectedItem ? 'ring-4 ring-yellow-300/50' : ''}`}>
      <p className="text-white/60 text-xs font-black">{target}</p><p className="text-white text-lg font-black mt-4">{placed[target] || (selectedItem ? 'Klik untuk letak' : 'Drop sini')}</p>
    </button>)}</div>
  </div>;
}

function WordBuilderMode({ data }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [built, setBuilt] = useState('');
  const words = data.words || [];
  const target = words[wordIndex] || '';
  const chunks = data.letters || target.split('');
  const correct = normalize(built) === normalize(target);

  return <div className="space-y-4">
    <div className={`${panel} text-center`}><p className="text-white/60 text-xs font-black uppercase">Bina perkataan</p><p className="text-4xl font-black text-white my-3">{built || '...'}</p><p className="text-white/80 font-bold">Sasaran: {target}</p></div>
    <div className="grid grid-cols-4 gap-2">{chunks.map((chunk, idx) => <button key={idx} onClick={() => setBuilt(v => v + chunk)} className={`py-3 ${action}`}>{chunk}</button>)}</div>
    <div className="flex gap-2"><button onClick={() => setBuilt('')} className="flex-1 py-3 rounded-2xl bg-white/20 text-white font-black">Padam</button><button onClick={() => { setBuilt(''); setWordIndex((wordIndex + 1) % words.length); }} className={`flex-1 py-3 ${action}`}>{correct ? 'Betul! Next' : 'Skip'}</button></div>
  </div>;
}

function SortingMode({ data }) {
  const [sorted, setSorted] = useState({});
  const dragItem = useRef(null);
  const groups = data.groups || [];
  const items = data.items || [];
  const used = Object.values(sorted).flat().map(x => x.text);

  return <div className="space-y-4">
    <div className={panel}><p className="text-white/70 text-xs font-black mb-3 uppercase">Item untuk diisih</p><div className="flex flex-wrap gap-2">{items.filter(item => !used.includes(item.text)).map(item => <div key={item.text} draggable onDragStart={() => { dragItem.current = item; }} className="px-4 py-3 rounded-2xl bg-white text-purple-700 font-black cursor-grab">{item.text}</div>)}</div></div>
    <div className="grid grid-cols-2 gap-3">{groups.map(group => <div key={group} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragItem.current?.group === group) setSorted(prev => ({ ...prev, [group]: [...(prev[group] || []), dragItem.current] })); }} className={`${panel} min-h-40`}>
      <p className="text-white font-black mb-3">{group}</p>{(sorted[group] || []).map(item => <div key={item.text} className="mb-2 px-3 py-2 rounded-xl bg-white/25 text-white font-bold">{item.text}</div>)}
    </div>)}</div>
  </div>;
}

function TileMatchMode({ data }) {
  const tiles = data.tiles || [];
  const [selected, setSelected] = useState([]);
  const [gone, setGone] = useState([]);
  const pairKey = (idx) => Math.floor(idx / 2);
  const tap = (idx) => {
    if (gone.includes(pairKey(idx)) || selected.includes(idx)) return;
    const next = [...selected, idx];
    setSelected(next);
    if (next.length === 2) setTimeout(() => { if (pairKey(next[0]) === pairKey(next[1])) setGone(prev => [...prev, pairKey(idx)]); setSelected([]); }, 500);
  };
  return <div className="grid grid-cols-2 gap-3">{tiles.map((tile, idx) => <button key={idx} onClick={() => tap(idx)} className={`min-h-20 ${action} ${selected.includes(idx) ? 'ring-4 ring-yellow-300' : ''} ${gone.includes(pairKey(idx)) ? 'opacity-30' : ''}`}>{tile}</button>)}</div>;
}

function StoryMode({ data }) {
  const scenes = data.scenes || [];
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx] || {};
  return <div className="space-y-4"><div className={panel}><p className="text-6xl text-center mb-4">📖</p><p className="text-white text-xl font-black text-center leading-relaxed">{scene.text}</p></div><div className="space-y-3">{(scene.choices || []).map((choice, i) => <button key={choice} onClick={() => setIdx(Math.min(idx + 1, scenes.length - 1))} className={`w-full p-4 ${action}`}>{choice}</button>)}</div><p className="text-white/60 text-center text-xs font-bold">Bab {idx + 1}/{scenes.length}</p></div>;
}

function PhysicsMode({ data }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const challenge = (data.challenges || [])[idx] || {};
  return <div className="space-y-4"><div className={`${panel} text-center`}><p className="text-6xl mb-3">🚀</p><p className="text-white text-xl font-black">{challenge.question}</p></div><div className="grid grid-cols-1 gap-3">{(challenge.options || []).map((option, i) => <button key={option} onClick={() => setPicked(i)} className={`p-4 rounded-2xl font-black ${picked === i ? (i === challenge.answer ? 'bg-green-400 text-white' : 'bg-red-400 text-white') : 'bg-white text-purple-700'}`}>{option}</button>)}</div><button onClick={() => { setPicked(null); setIdx((idx + 1) % (data.challenges || []).length); }} className={`w-full py-3 ${action}`}>Soalan Seterusnya</button></div>;
}

function TracingMode({ data }) {
  const [idx, setIdx] = useState(0);
  const [marks, setMarks] = useState([]);
  const letters = data.letters || [];
  const letter = letters[idx] || '';
  return <div className="space-y-4"><div className={`${panel} text-center`}><p className="text-white/70 text-xs font-black uppercase mb-2">Surih ini</p><div className="rounded-3xl bg-white text-purple-700 text-8xl font-black py-10">{letter}</div></div><div className="grid grid-cols-5 gap-2">{Array.from({ length: 15 }).map((_, i) => <button key={i} onClick={() => setMarks(prev => prev.includes(i) ? prev : [...prev, i])} className={`aspect-square rounded-xl ${marks.includes(i) ? 'bg-yellow-300' : 'bg-white/20'}`} />)}</div><button onClick={() => { setMarks([]); setIdx((idx + 1) % letters.length); }} className={`w-full py-3 ${action}`}>Huruf Seterusnya</button></div>;
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function normalize(text) { return String(text || '').replace(/\s/g, '').toLowerCase(); }