import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const panel = 'rounded-3xl p-5 bg-white/15 border border-white/25 shadow-xl';
const action = 'rounded-2xl bg-white text-purple-700 font-black shadow-lg active:scale-95 transition-all';
const chip = 'px-4 py-3 rounded-2xl bg-white text-purple-700 font-black shadow-lg active:scale-95 transition-all';

export default function MiniGameModeRenderer({ game }) {
  const data = game?.gameData || {};
  const mode = data.mode || game?.category;

  if (mode === 'memory') return <MemoryMode data={data} />;
  if (mode === 'dragdrop') return <DragDropMode data={data} />;
  if (mode === 'wordbuilder') return <WordBuilderMode data={data} />;
  if (mode === 'sorting') return <SortingMode data={data} />;
  if (mode === 'tilematch') return <TileMatchMode data={data} />;
  if (mode === 'story') return <StoryMode data={data} />;
  if (mode === 'physics' || mode === 'true_false') return <TrueFalseMode data={data} />;
  if (mode === 'tracing') return <TracingMode data={data} />;
  if (mode === 'balloon_pop') return <BalloonPopMode data={data} />;
  if (mode === 'falling_catch') return <FallingCatchMode data={data} />;
  if (mode === 'stacking') return <StackingMode data={data} />;
  if (mode === 'sequence') return <SequenceMode data={data} />;
  if (mode === 'swipe_select') return <SwipeSelectMode data={data} />;
  if (mode === 'spin_wheel') return <SpinWheelMode data={data} />;
  if (mode === 'picture_hunt' || mode === 'hidden_object') return <PictureHuntMode data={data} />;
  if (mode === 'typing_challenge') return <TypingMode data={data} />;
  if (mode === 'mini_simulation') return <MiniSimulationMode data={data} />;
  if (mode === 'rhythm_tap') return <RhythmTapMode data={data} />;
  if (mode === 'connect_dots') return <ConnectDotsMode data={data} />;
  if (mode === 'maze') return <MazeMode data={data} />;
  if (mode === 'reaction_speed') return <ReactionSpeedMode data={data} />;
  if (mode === 'coloring') return <ColoringMode data={data} />;

  return <div className={panel}><p className="text-white font-bold">Mini game belum tersedia.</p></div>;
}

function MiniScore({ score, total = 3 }) {
  return <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/15 border border-white/20 px-4 py-2"><span className="text-white font-black text-xs">Score: {score}</span><span className="text-yellow-300 text-sm">{'★'.repeat(Math.min(3, Math.ceil((score / Math.max(1, total)) * 3)))}{'☆'.repeat(3 - Math.min(3, Math.ceil((score / Math.max(1, total)) * 3)))}</span></div>;
}

function MemoryMode({ data }) {
  const cards = useMemo(() => shuffle((data.pairs || []).flatMap((pair, pairId) => pair.map((text) => ({ pairId, text })))), [data]);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const tap = (idx) => {
    if (open.includes(idx) || matched.includes(cards[idx]?.pairId) || open.length === 2) return;
    const next = [...open, idx]; setOpen(next);
    if (next.length === 2) setTimeout(() => { if (cards[next[0]].pairId === cards[next[1]].pairId) setMatched(prev => [...prev, cards[next[0]].pairId]); setOpen([]); }, 600);
  };
  return <><MiniScore score={matched.length} total={(data.pairs || []).length} /><div className="grid grid-cols-2 gap-3">{cards.map((card, idx) => <button key={idx} onClick={() => tap(idx)} className={`min-h-24 ${panel} text-center ${open.includes(idx) || matched.includes(card.pairId) ? 'bg-white text-purple-700' : 'text-white'}`}><p className="font-black text-lg">{open.includes(idx) || matched.includes(card.pairId) ? card.text : '?'}</p></button>)}</div></>;
}

function DragDropMode({ data }) {
  const [placed, setPlaced] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const dragText = useRef(null);
  const items = data.items || [];
  const targets = data.targets || [];
  const placeItem = (target) => { const item = dragText.current || selectedItem; if (!item) return; setPlaced(prev => ({ ...prev, [target]: item })); setSelectedItem(null); dragText.current = null; };
  return <div className="space-y-4"><MiniScore score={Object.keys(placed).length} total={targets.length} /><div className={panel}><p className="text-white/70 text-xs font-black mb-3 uppercase">Pilih atau seret item</p><div className="flex flex-wrap gap-2">{items.filter(item => !Object.values(placed).includes(item)).map(item => <button key={item} type="button" draggable onClick={() => setSelectedItem(item)} onDragStart={() => { dragText.current = item; }} className={`px-4 py-3 rounded-2xl font-black cursor-grab transition-all ${selectedItem === item ? 'bg-yellow-300 text-purple-900 ring-4 ring-white/50' : 'bg-white text-purple-700'}`}>{item}</button>)}</div></div><div className="grid grid-cols-2 gap-3">{targets.map(target => <button key={target} type="button" onClick={() => placeItem(target)} onDragOver={e => e.preventDefault()} onDrop={() => placeItem(target)} className={`${panel} min-h-28 text-center transition-all ${selectedItem ? 'ring-4 ring-yellow-300/50' : ''}`}><p className="text-white/60 text-xs font-black">{target}</p><p className="text-white text-lg font-black mt-4">{placed[target] || (selectedItem ? 'Klik untuk letak' : 'Drop sini')}</p></button>)}</div></div>;
}

function WordBuilderMode({ data }) {
  const [wordIndex, setWordIndex] = useState(0); const [built, setBuilt] = useState('');
  const words = data.words || []; const target = words[wordIndex] || ''; const chunks = data.letters || target.split(''); const correct = normalize(built) === normalize(target);
  return <div className="space-y-4"><MiniScore score={wordIndex} total={words.length} /><div className={`${panel} text-center`}><p className="text-white/60 text-xs font-black uppercase">Bina perkataan</p><p className="text-4xl font-black text-white my-3">{built || '...'}</p><p className="text-white/80 font-bold">Sasaran: {target}</p></div><div className="grid grid-cols-4 gap-2">{chunks.map((chunk, idx) => <button key={idx} onClick={() => setBuilt(v => v + chunk)} className={`py-3 ${action}`}>{chunk}</button>)}</div><div className="flex gap-2"><button onClick={() => setBuilt('')} className="flex-1 py-3 rounded-2xl bg-white/20 text-white font-black">Padam</button><button onClick={() => { setBuilt(''); setWordIndex((wordIndex + 1) % Math.max(1, words.length)); }} className={`flex-1 py-3 ${action}`}>{correct ? 'Betul! Next' : 'Skip'}</button></div></div>;
}

function SortingMode({ data }) {
  const [sorted, setSorted] = useState({}); const [selected, setSelected] = useState(null); const dragItem = useRef(null);
  const groups = data.groups || []; const items = data.items || []; const used = Object.values(sorted).flat().map(x => x.text);
  const place = (group) => { const item = dragItem.current || selected; if (item?.group === group) setSorted(prev => ({ ...prev, [group]: [...(prev[group] || []), item] })); setSelected(null); dragItem.current = null; };
  return <div className="space-y-4"><MiniScore score={used.length} total={items.length} /><div className={panel}><p className="text-white/70 text-xs font-black mb-3 uppercase">Pilih item</p><div className="flex flex-wrap gap-2">{items.filter(item => !used.includes(item.text)).map(item => <button key={item.text} draggable onClick={() => setSelected(item)} onDragStart={() => { dragItem.current = item; }} className={`px-4 py-3 rounded-2xl font-black ${selected?.text === item.text ? 'bg-yellow-300 text-purple-900' : 'bg-white text-purple-700'}`}>{item.text}</button>)}</div></div><div className="grid grid-cols-2 gap-3">{groups.map(group => <button key={group} onClick={() => place(group)} onDragOver={e => e.preventDefault()} onDrop={() => place(group)} className={`${panel} min-h-40 text-left`}><p className="text-white font-black mb-3">{group}</p>{(sorted[group] || []).map(item => <div key={item.text} className="mb-2 px-3 py-2 rounded-xl bg-white/25 text-white font-bold">{item.text}</div>)}</button>)}</div></div>;
}

function TileMatchMode({ data }) {
  const tiles = data.tiles || []; const [selected, setSelected] = useState([]); const [gone, setGone] = useState([]); const pairKey = (idx) => Math.floor(idx / 2);
  const tap = (idx) => { if (gone.includes(pairKey(idx)) || selected.includes(idx)) return; const next = [...selected, idx]; setSelected(next); if (next.length === 2) setTimeout(() => { if (pairKey(next[0]) === pairKey(next[1])) setGone(prev => [...prev, pairKey(idx)]); setSelected([]); }, 500); };
  return <><MiniScore score={gone.length} total={Math.ceil(tiles.length / 2)} /><div className="grid grid-cols-2 gap-3">{tiles.map((tile, idx) => <button key={idx} onClick={() => tap(idx)} className={`min-h-20 ${action} ${selected.includes(idx) ? 'ring-4 ring-yellow-300' : ''} ${gone.includes(pairKey(idx)) ? 'opacity-30' : ''}`}>{tile}</button>)}</div></>;
}

function StoryMode({ data }) {
  const scenes = data.scenes || []; const [idx, setIdx] = useState(0); const scene = scenes[idx] || {};
  return <div className="space-y-4"><MiniScore score={idx} total={scenes.length} /><div className={panel}><p className="text-6xl text-center mb-4">📖</p><p className="text-white text-xl font-black text-center leading-relaxed">{scene.text}</p></div><div className="space-y-3">{(scene.choices || []).map(choice => <button key={choice} onClick={() => setIdx(Math.min(idx + 1, Math.max(0, scenes.length - 1)))} className={`w-full p-4 ${action}`}>{choice}</button>)}</div><p className="text-white/60 text-center text-xs font-bold">Bab {idx + 1}/{scenes.length}</p></div>;
}

function TrueFalseMode({ data }) {
  const statements = data.statements || (data.challenges || []).map(x => ({ text: x.question, answer: true })); const [idx, setIdx] = useState(0); const [score, setScore] = useState(0); const current = statements[idx] || {};
  const pick = (value) => { if (value === current.answer) setScore(s => s + 1); setIdx((idx + 1) % Math.max(1, statements.length)); };
  return <div className="space-y-4"><MiniScore score={score} total={statements.length} /><div className={`${panel} text-center`}><p className="text-6xl mb-3">🌦️</p><p className="text-white text-xl font-black">{current.text}</p></div><div className="grid grid-cols-2 gap-3"><button onClick={() => pick(true)} className="py-5 rounded-3xl bg-green-400 text-white font-black text-xl">Betul</button><button onClick={() => pick(false)} className="py-5 rounded-3xl bg-red-400 text-white font-black text-xl">Salah</button></div></div>;
}

function TracingMode({ data }) {
  const [idx, setIdx] = useState(0); const [marks, setMarks] = useState([]); const letters = data.letters || []; const letter = letters[idx] || '';
  return <div className="space-y-4"><MiniScore score={marks.length} total={15} /><div className={`${panel} text-center`}><p className="text-white/70 text-xs font-black uppercase mb-2">Surih ini</p><div className="rounded-3xl bg-white text-purple-700 text-8xl font-black py-10">{letter}</div></div><div className="grid grid-cols-5 gap-2">{Array.from({ length: 15 }).map((_, i) => <button key={i} onClick={() => setMarks(prev => prev.includes(i) ? prev : [...prev, i])} className={`aspect-square rounded-xl ${marks.includes(i) ? 'bg-yellow-300' : 'bg-white/20'}`} />)}</div><button onClick={() => { setMarks([]); setIdx((idx + 1) % Math.max(1, letters.length)); }} className={`w-full py-3 ${action}`}>Huruf Seterusnya</button></div>;
}

function BalloonPopMode({ data }) {
  const [popped, setPopped] = useState([]);
  const items = data.items || [];
  const target = data.target;
  const total = items.filter(item => isSame(getItemText(item), target)).length || 1;
  const pop = (item, index) => {
    if (!isSame(getItemText(item), target) || popped.includes(index)) return;
    setPopped(prev => [...prev, index]);
  };

  return <div className="space-y-4"><MiniScore score={popped.length} total={total} /><div className={`${panel} text-center`}><p className="text-white font-black">Pop huruf: <span className="text-yellow-300 text-3xl">{target}</span></p></div><div className="relative h-80 rounded-3xl bg-sky-300/25 border border-white/20 overflow-hidden">{items.map((item, i) => !popped.includes(i) && <motion.button key={i} type="button" initial={{ y: 230, scale: 1 }} animate={{ y: [230, 20, 230], x: [0, i % 2 ? 30 : -20, 0] }} whileTap={{ scale: 0.2, rotate: 20 }} transition={{ repeat: Infinity, duration: 3 + i * 0.4 }} onClick={() => pop(item, i)} className="absolute top-0 text-5xl touch-manipulation cursor-pointer" style={{ left: `${12 + (i * 17) % 72}%` }}>🎈<span className="absolute inset-0 flex items-center justify-center text-base font-black text-white pb-2 pointer-events-none">{getItemText(item)}</span></motion.button>)}</div></div>;
}

function FallingCatchMode({ data }) { const [caught, setCaught] = useState([]); const items = data.items || []; const total = items.filter(item => isSame(getItemText(item), data.target)).length || 1; return <div className="space-y-4"><MiniScore score={caught.length} total={total} /><div className={`${panel} text-center`}><p className="text-white font-black">Tangkap nombor {data.target}</p></div><div className="h-80 rounded-3xl bg-blue-300/20 relative overflow-hidden border border-white/20">{items.map((item, i) => !caught.includes(i) && <motion.button key={i} type="button" initial={{ y: -40 }} animate={{ y: 270 }} whileTap={{ scale: 0.2 }} transition={{ repeat: Infinity, duration: 2.5 + i * 0.25, delay: i * 0.3 }} onClick={() => isSame(getItemText(item), data.target) && setCaught(prev => [...prev, i])} className="absolute w-14 h-14 rounded-full bg-white text-purple-700 font-black text-xl touch-manipulation" style={{ left: `${10 + i * 16}%` }}>{getItemText(item)}</motion.button>)}<div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-5xl">🧺</div></div></div>; }

function StackingMode({ data }) { const [count, setCount] = useState(0); const target = Number(data.target || 5); return <div className="space-y-4"><MiniScore score={count} total={target} /><div className={`${panel} text-center`}><p className="text-white font-black mb-4">Bina menara {target} blok</p><div className="flex flex-col-reverse items-center gap-1 min-h-56">{Array.from({ length: count }).map((_, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-8 rounded-xl bg-yellow-300 border-2 border-white/50" />)}</div></div><button onClick={() => setCount(c => Math.min(target, c + 1))} className={`w-full py-4 ${action}`}>Tambah Blok</button></div>; }

function SequenceMode({ data }) { const [picked, setPicked] = useState([]); const answer = data.answer || []; const items = data.items || []; const good = picked.every((x, i) => x === answer[i]); return <div className="space-y-4"><MiniScore score={picked.length} total={items.length} /><div className={panel}><p className="text-white font-black text-center mb-3">Susun turutan</p><div className="min-h-14 rounded-2xl bg-white/15 p-3 text-white font-black text-center">{picked.join(' → ') || '...'}</div></div><div className="grid grid-cols-2 gap-2">{items.filter(x => !picked.includes(x)).map(item => <button key={item} onClick={() => setPicked(p => [...p, item])} className={chip}>{item}</button>)}</div><p className={`text-center font-black ${good ? 'text-green-300' : 'text-red-300'}`}>{picked.length ? (good ? 'Bagus!' : 'Cuba semula') : ''}</p></div>; }

function SwipeSelectMode({ data }) { const [idx, setIdx] = useState(0); const [score, setScore] = useState(0); const item = (data.items || [])[idx] || {}; const pick = (group) => { if (item.group === group) setScore(s => s + 1); setIdx((idx + 1) % Math.max(1, (data.items || []).length)); }; return <div className="space-y-4"><MiniScore score={score} total={(data.items || []).length} /><div className={`${panel} text-center`}><p className="text-5xl mb-3">👆</p><p className="text-white text-3xl font-black">{item.text}</p></div><div className="grid grid-cols-2 gap-3"><button onClick={() => pick('Kata Nama')} className="py-5 rounded-3xl bg-blue-400 text-white font-black">Kata Nama</button><button onClick={() => pick('Kata Kerja')} className="py-5 rounded-3xl bg-pink-400 text-white font-black">Kata Kerja</button></div></div>; }

function SpinWheelMode({ data }) { const [spin, setSpin] = useState(0); const [choice, setChoice] = useState(''); const items = data.items || []; return <div className="space-y-4"><div className={`${panel} text-center`}><motion.div animate={{ rotate: spin }} className="mx-auto w-52 h-52 rounded-full bg-conic-gradient flex items-center justify-center text-5xl border-8 border-white/40 shadow-2xl">🎡</motion.div><p className="text-white font-black mt-4">{choice || `Padankan rima dengan ${data.target}`}</p></div><button onClick={() => { const next = items[Math.floor(Math.random() * items.length)]; setChoice(next); setSpin(s => s + 720 + Math.random() * 360); }} className={`w-full py-4 ${action}`}>Putar Roda</button></div>; }

function PictureHuntMode({ data }) { const [score, setScore] = useState(0); const items = data.items || []; return <div className="space-y-4"><MiniScore score={score} total={1} /><div className={panel}><p className="text-white font-black text-center">Cari: <span className="text-yellow-300">{data.target}</span></p></div><div className="grid grid-cols-2 gap-3">{items.map(item => <button key={item} onClick={() => String(item) === String(data.target) && setScore(1)} className="aspect-square rounded-3xl bg-white/20 border border-white/30 text-4xl font-black text-white">{item}</button>)}</div></div>; }

function TypingMode({ data }) { const [value, setValue] = useState(''); const ok = normalize(value) === normalize(data.target); return <div className="space-y-4"><MiniScore score={ok ? 1 : 0} total={1} /><div className={`${panel} text-center`}><p className="text-white/70 text-xs font-black">Taip perkataan</p><p className="text-5xl font-black text-yellow-300 my-3">{data.target}</p><input value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-2xl p-4 text-center font-black text-2xl text-purple-700" autoFocus /></div><p className="text-center text-white font-black">{ok ? 'Hebat! 🚗💨' : 'Terus cuba!'}</p></div>; }

function MiniSimulationMode({ data }) { const [picked, setPicked] = useState([]); const items = data.items || []; const total = items.filter(item => isSame(getItemGroup(item), data.target)).length || 1; return <div className="space-y-4"><MiniScore score={picked.length} total={total} /><div className={`${panel} text-center`}><p className="text-6xl mb-2">🧲</p><p className="text-white font-black">Tap objek yang tertarik kepada magnet</p></div><div className="grid grid-cols-3 gap-2">{items.map((item, i) => <button key={`${getItemText(item)}-${i}`} type="button" onClick={() => isSame(getItemGroup(item), data.target) && !picked.includes(i) && setPicked(prev => [...prev, i])} className={`${chip} ${picked.includes(i) ? 'opacity-40' : ''}`}>{getItemText(item)}</button>)}</div></div>; }

function RhythmTapMode({ data }) { const [beat, setBeat] = useState(0); const items = data.items || []; return <div className="space-y-4"><MiniScore score={beat} total={items.length} /><div className={`${panel} text-center`}><motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-7xl mb-3">🥁</motion.div><p className="text-white text-4xl font-black">{items[beat % Math.max(1, items.length)]}</p></div><button onClick={() => setBeat(b => b + 1)} className={`w-full py-5 ${action}`}>Tap Rentak</button></div>; }

function ConnectDotsMode({ data }) { const [dots, setDots] = useState([]); const items = data.items || ['1', '2', '3', '4']; return <div className="space-y-4"><MiniScore score={dots.length} total={items.length} /><div className="grid grid-cols-2 gap-6 p-8 rounded-3xl bg-white/15 border border-white/20">{items.map((dot, i) => <button key={dot} onClick={() => setDots(p => p.includes(dot) ? p : [...p, dot])} className={`aspect-square rounded-full text-2xl font-black ${dots.includes(dot) ? 'bg-yellow-300 text-purple-900' : 'bg-white text-purple-700'}`}>{dot}</button>)}</div></div>; }

function MazeMode() { const [pos, setPos] = useState(0); const cells = Array.from({ length: 9 }); return <div className="space-y-4"><MiniScore score={pos === 8 ? 3 : pos} total={8} /><div className="grid grid-cols-3 gap-2 p-3 rounded-3xl bg-white/15">{cells.map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-white/20 flex items-center justify-center text-3xl">{i === pos ? '🐰' : i === 8 ? '⭐' : ''}</div>)}</div><div className="grid grid-cols-3 gap-2"><span /><button onClick={() => setPos(p => Math.max(0, p - 3))} className={chip}>↑</button><span /><button onClick={() => setPos(p => Math.max(0, p - 1))} className={chip}>←</button><button onClick={() => setPos(0)} className={chip}>⟲</button><button onClick={() => setPos(p => Math.min(8, p + 1))} className={chip}>→</button><span /><button onClick={() => setPos(p => Math.min(8, p + 3))} className={chip}>↓</button><span /></div></div>; }

function ReactionSpeedMode() { const [ready, setReady] = useState(false); const [score, setScore] = useState(0); return <div className="space-y-4"><MiniScore score={score} total={3} /><button onClick={() => ready && setScore(s => s + 1)} className={`w-full h-72 rounded-3xl font-black text-3xl ${ready ? 'bg-green-400 text-white' : 'bg-red-400 text-white'}`}>{ready ? 'TAP!' : 'Tunggu...'}</button><button onClick={() => { setReady(false); setTimeout(() => setReady(true), 900); }} className={`w-full py-3 ${action}`}>Mula</button></div>; }

function ColoringMode({ data }) { const [colored, setColored] = useState([]); const items = data.items || []; return <div className="space-y-4"><MiniScore score={colored.length} total={items.length} /><div className="grid grid-cols-2 gap-3">{items.map((item, i) => <button key={i} onClick={() => setColored(p => p.includes(i) ? p : [...p, i])} className={`aspect-square rounded-3xl text-5xl border border-white/25 ${colored.includes(i) ? 'bg-yellow-300' : 'bg-white/15 grayscale'}`}>{item}</button>)}</div></div>; }

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function normalize(text) { return String(text || '').replace(/\s/g, '').toLowerCase(); }
function getItemText(item) { return typeof item === 'object' && item !== null ? (item.text ?? item.label ?? item.value ?? '') : item; }
function getItemGroup(item) { return typeof item === 'object' && item !== null ? (item.group ?? item.category ?? item.type ?? '') : ''; }
function isSame(a, b) { return normalize(a) === normalize(b); }