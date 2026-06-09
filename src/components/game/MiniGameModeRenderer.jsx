import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MiniFeedback from '@/components/game/MiniFeedback';
import ProMiniGameShell from '@/components/game/ProMiniGameShell';
import useGameProgress from '@/hooks/useGameProgress';
import useMiniFeedback from '@/hooks/useMiniFeedback';

// Light pastel panel — match shell harmony
const panel = 'rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 ring-1 ring-purple-100 shadow-sm';
const action = 'rounded-2xl bg-white text-purple-700 font-black shadow-md ring-2 ring-purple-100 active:scale-95 hover:-translate-y-0.5 transition-all';
const chip = 'px-4 py-3.5 rounded-2xl bg-white text-purple-700 font-black text-xl shadow-md ring-2 ring-purple-100 active:scale-95 hover:-translate-y-0.5 transition-all';
const targetPill = 'px-3.5 py-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 font-black text-lg shadow-md ring-2 ring-white inline-block';

// STANDARD font sizes — kekalkan konsisten merentas semua mini game modes
const answerText = 'text-xl';      // teks jawapan utama (pilihan/chip/tile)
const answerLabel = 'text-base font-black uppercase tracking-wide'; // label ("Pilih item", target/group name)
const answerSlot = 'text-xl';      // teks dalam slot/target yang dah diisi

export default function MiniGameModeRenderer({ game, onComplete }) {
  const data = game?.gameData || {};
  const mode = data.mode || game?.category;

  const renderMode = () => {
    if (mode === 'memory') return <MemoryMode />;
    if (mode === 'dragdrop') return <DragDropMode />;
    if (mode === 'wordbuilder') return <WordBuilderMode />;
    if (mode === 'sorting') return <SortingMode />;
    if (mode === 'tilematch') return <TileMatchMode />;
    if (mode === 'story') return <StoryMode />;
    if (mode === 'physics' || mode === 'true_false') return <TrueFalseMode />;
    if (mode === 'tracing') return <TracingMode />;
    if (mode === 'balloon_pop') return <BalloonPopMode />;
    if (mode === 'falling_catch') return <FallingCatchMode />;
    if (mode === 'stacking') return <StackingMode />;
    if (mode === 'sequence') return <SequenceMode />;
    if (mode === 'swipe_select') return <SwipeSelectMode />;
    if (mode === 'spin_wheel') return <SpinWheelMode />;
    if (mode === 'picture_hunt' || mode === 'hidden_object') return <PictureHuntMode />;
    if (mode === 'typing_challenge') return <TypingMode />;
    if (mode === 'mini_simulation') return <MiniSimulationMode />;
    if (mode === 'rhythm_tap') return <RhythmTapMode />;
    if (mode === 'connect_dots') return <ConnectDotsMode />;
    if (mode === 'maze') return <MazeMode />;
    if (mode === 'reaction_speed') return <ReactionSpeedMode />;
    if (mode === 'coloring') return <ColoringMode />;
    return <div className={panel}><p className="text-purple-700 font-bold">Mini game belum tersedia.</p></div>;
  };

  return <ProMiniGameShell data={data} mode={mode} onComplete={onComplete}>{renderMode()}</ProMiniGameShell>;
}

function MiniProgress({ current, total }) {
  const percent = Math.min(100, Math.round((current / Math.max(1, total)) * 100));
  return (
    <div className="mb-3 rounded-xl bg-white/70 ring-1 ring-purple-100 px-3 py-2">
      <div className="flex items-center justify-between text-purple-700">
        <span className="font-black text-xs">Progress: {current}/{total}</span>
        <span className="font-black text-xs">{percent}%</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-purple-100 overflow-hidden">
        <motion.div animate={{ width: `${percent}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
      </div>
    </div>
  );
}

// ============ MODES ============

function MemoryMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const cards = useMemo(() => shuffle((roundData?.pairs || []).flatMap((pair, pairId) => pair.map((text) => ({ pairId, text })))), [roundData]);
  const totalPairs = roundData?.pairs?.length || 1;
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    reportProgress({ current: matched.length, total: totalPairs, isComplete: matched.length >= totalPairs });
  }, [matched, totalPairs]);

  const tap = (idx) => {
    if (open.includes(idx) || matched.includes(cards[idx]?.pairId) || open.length === 2) return;
    const next = [...open, idx]; setOpen(next);
    if (next.length === 2) setTimeout(() => {
      const ok = cards[next[0]].pairId === cards[next[1]].pairId;
      showFeedback(ok ? 'correct' : 'wrong', ok ? 'Padanan betul!' : 'Bukan pasangan itu.');
      if (ok) setMatched(prev => [...prev, cards[next[0]].pairId]);
      setOpen([]);
    }, 600);
  };

  const palettes = [
    { bg: 'linear-gradient(135deg,#FDE68A 0%,#FCA5A5 100%)', text: '#7C2D12' },
    { bg: 'linear-gradient(135deg,#A7F3D0 0%,#5EEAD4 100%)', text: '#064E3B' },
    { bg: 'linear-gradient(135deg,#C7D2FE 0%,#A78BFA 100%)', text: '#312E81' },
    { bg: 'linear-gradient(135deg,#FBCFE8 0%,#F9A8D4 100%)', text: '#831843' },
    { bg: 'linear-gradient(135deg,#BAE6FD 0%,#7DD3FC 100%)', text: '#0C4A6E' },
    { bg: 'linear-gradient(135deg,#FED7AA 0%,#FDBA74 100%)', text: '#7C2D12' },
  ];
  const backEmojis = ['🎁','🎈','⭐','🌈','✨','🎀'];

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={matched.length} total={totalPairs} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {cards.map((card, idx) => {
          const isOpen = open.includes(idx) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);
          const palette = palettes[card.pairId % palettes.length];
          const backEmoji = backEmojis[idx % backEmojis.length];
          return (
            <motion.button
              key={idx}
              type="button"
              onClick={() => tap(idx)}
              whileTap={{ scale: 0.94 }}
              animate={isMatched ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="relative aspect-square rounded-2xl overflow-hidden font-black shadow-md ring-2 ring-white"
              style={{ background: isOpen ? palette.bg : 'linear-gradient(135deg,#A78BFA 0%,#F472B6 100%)' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {isOpen ? (
                  <p className={`${answerText} text-center px-2 leading-tight`} style={{ color: palette.text }}>{card.text}</p>
                ) : (
                  <span className="text-3xl drop-shadow">{backEmoji}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function DragDropMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const [placed, setPlaced] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const items = roundData?.items || [];
  const targets = roundData?.targets || [];
  // Pairing: items[i] should go to targets[i] (positional)
  const correctMap = useMemo(() => Object.fromEntries(targets.map((t, i) => [t, items[i]])), [items, targets]);

  useEffect(() => {
    const ok = Object.keys(placed).length;
    reportProgress({ current: ok, total: targets.length, isComplete: ok >= targets.length });
  }, [placed, targets.length]);

  const placeItem = (target) => {
    if (!selectedItem || placed[target]) return;
    const correctItem = correctMap[target];
    const ok = selectedItem === correctItem;
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Tepat!' : 'Cuba sasaran lain.');
    if (ok) setPlaced(prev => ({ ...prev, [target]: selectedItem }));
    setSelectedItem(null);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={Object.keys(placed).length} total={targets.length} />
      <div className={panel}>
        <p className={`text-purple-500 mb-2 ${answerLabel}`}>Pilih item</p>
        <div className="grid grid-cols-2 gap-2.5">
          {items.filter(item => !Object.values(placed).includes(item)).map(item => (
            <button key={item} type="button" onClick={() => setSelectedItem(item)} className={`w-full px-4 py-5 rounded-2xl font-black ${answerText} transition-all ${selectedItem === item ? 'bg-yellow-300 text-orange-900 ring-4 ring-orange-400 scale-105' : 'bg-white text-purple-700 ring-2 ring-purple-100'}`}>{item}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {targets.map(target => (
          <button key={target} type="button" onClick={() => placeItem(target)} className={`min-h-16 rounded-2xl p-2 text-center transition-all ${placed[target] ? 'bg-green-100 ring-2 ring-green-400' : selectedItem ? 'bg-yellow-50 ring-2 ring-yellow-400 animate-pulse' : 'bg-white ring-2 ring-purple-100'}`}>
            <p className={`text-purple-400 ${answerLabel}`}>{target}</p>
            <p className={`text-purple-900 ${answerSlot} font-black mt-1`}>{placed[target] || (selectedItem ? '↓ Letak sini' : '—')}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function WordBuilderMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const [built, setBuilt] = useState('');
  const [complete, setComplete] = useState(false);
  const target = roundData?.target || '';
  const chunks = useMemo(() => shuffle(roundData?.letters || target.split('')), [roundData, target]);

  useEffect(() => {
    reportProgress({ current: complete ? 1 : 0, total: 1, isComplete: complete });
  }, [complete]);

  const check = () => {
    const ok = normalize(built) === normalize(target);
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Perkataan betul!' : 'Susunan belum tepat.');
    if (ok) setComplete(true);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-500 text-[10px] font-black uppercase">Sasaran</p>
        <p className={targetPill + ' mt-1 mb-3 text-base'}>{target}</p>
        <div className="rounded-xl bg-white py-3 px-2 ring-2 ring-purple-100">
          <p className="text-3xl font-black text-purple-900 tracking-wider">{built || '_'.repeat(target.length)}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {chunks.map((chunk, idx) => (
          <button key={idx} disabled={complete} onClick={() => setBuilt(v => v + chunk)} className={`py-4 text-2xl ${action} disabled:opacity-50`}>{chunk}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setBuilt('')} disabled={complete} className="flex-1 py-3 rounded-2xl bg-white text-purple-700 font-black shadow-md ring-2 ring-purple-100 disabled:opacity-50">Padam</button>
        <button onClick={check} disabled={complete || !built} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black shadow-md disabled:opacity-50">Semak</button>
      </div>
    </div>
  );
}

function SortingMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const [sorted, setSorted] = useState({});
  const [selected, setSelected] = useState(null);
  const groups = roundData?.groups || [];
  const items = roundData?.items || [];
  const used = Object.values(sorted).flat().map(x => x.text);

  useEffect(() => {
    reportProgress({ current: used.length, total: items.length, isComplete: used.length >= items.length });
  }, [used.length, items.length]);

  const place = (group) => {
    if (!selected) return;
    const ok = selected.group === group;
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Kumpulan betul!' : 'Cuba kumpulan lain.');
    if (ok) setSorted(prev => ({ ...prev, [group]: [...(prev[group] || []), selected] }));
    setSelected(null);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={used.length} total={items.length} />
      <div className={panel}>
        <p className={`text-purple-500 mb-2 ${answerLabel}`}>Pilih item</p>
        <div className="grid grid-cols-2 gap-2.5">
          {items.filter(item => !used.includes(item.text)).map(item => (
            <button key={item.text} onClick={() => setSelected(item)} className={`w-full px-4 py-5 rounded-2xl font-black ${answerText} transition-all ${selected?.text === item.text ? 'bg-yellow-300 text-orange-900 ring-4 ring-orange-400 scale-105' : 'bg-white text-purple-700 ring-2 ring-purple-100'}`}>{item.text}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {groups.map(group => (
          <button key={group} onClick={() => place(group)} className={`min-h-20 rounded-2xl p-2.5 text-center transition-all ${selected ? 'bg-yellow-50 ring-2 ring-yellow-400 animate-pulse' : 'bg-white ring-2 ring-purple-100'}`}>
            <p className={`text-purple-900 mb-1.5 ${answerLabel}`}>{group}</p>
            <div className="space-y-1">
              {(sorted[group] || []).map(item => (
                <div key={item.text} className={`px-2 py-1 rounded-lg bg-green-100 text-green-900 font-black ${answerSlot} text-center`}>{item.text}</div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TileMatchMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  // Shuffle jubin sekali sahaja supaya anak tak nampak pasangan bersebelahan
  const tiles = useMemo(() => {
    const raw = roundData?.tiles || [];
    const withPair = raw.map((tile, idx) => ({ tile, pairId: Math.floor(idx / 2) }));
    return [...withPair].sort(() => Math.random() - 0.5);
  }, [roundData]);
  const [selected, setSelected] = useState([]);
  const [gone, setGone] = useState([]);
  const totalPairs = Math.floor(tiles.length / 2);

  useEffect(() => {
    reportProgress({ current: gone.length, total: totalPairs, isComplete: gone.length >= totalPairs });
  }, [gone.length, totalPairs]);

  const tap = (idx) => {
    if (gone.includes(tiles[idx].pairId) || selected.includes(idx) || selected.length === 2) return;
    const next = [...selected, idx]; setSelected(next);
    if (next.length === 2) setTimeout(() => {
      const ok = tiles[next[0]].pairId === tiles[next[1]].pairId;
      showFeedback(ok ? 'correct' : 'wrong', ok ? 'Pasangan sepadan!' : 'Bukan pasangan.');
      if (ok) setGone(prev => [...prev, tiles[next[0]].pairId]);
      setSelected([]);
    }, 600);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={gone.length} total={totalPairs} />
      <div className="grid grid-cols-2 gap-2">
        {tiles.map((t, idx) => {
          const isSelected = selected.includes(idx);
          const isGone = gone.includes(t.pairId);
          return (
            <button
              key={idx}
              onClick={() => tap(idx)}
              disabled={isGone}
              className={`min-h-16 ${answerText} flex items-center justify-center p-2 ${action} ${isSelected ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-50' : ''} ${isGone ? 'opacity-25 line-through' : ''}`}
            >
              {t.tile}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StoryMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const scenes = roundData?.scenes || [];
  const [sceneIdx, setSceneIdx] = useState(0);
  const [done, setDone] = useState(false);
  const scene = scenes[sceneIdx] || {};

  useEffect(() => {
    reportProgress({ current: done ? scenes.length : sceneIdx, total: scenes.length, isComplete: done });
  }, [sceneIdx, done, scenes.length]);

  const pick = (idx) => {
    const ok = scene.answer === undefined || idx === scene.answer;
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Pilihan bijak!' : 'Cuba pilihan lain.');
    if (ok) {
      if (sceneIdx + 1 >= scenes.length) setDone(true);
      else setSceneIdx(i => i + 1);
    }
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={done ? scenes.length : sceneIdx} total={scenes.length} />
      <div className={`${panel} text-center`}>
        <p className="text-5xl mb-2">{scene.emoji || guessSceneEmoji(scene.text)}</p>
        <p className="text-purple-900 text-base font-black leading-relaxed">{scene.text}</p>
      </div>
      <div className="space-y-2">
        {(scene.choices || []).map((choice, idx) => (
          <button key={idx} onClick={() => pick(idx)} disabled={done} className={`w-full p-4 ${answerText} ${action} disabled:opacity-50 text-left`}>{choice}</button>
        ))}
      </div>
    </div>
  );
}

function TrueFalseMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const statements = roundData?.statements || (roundData?.challenges || []).map(x => ({ text: x.question, answer: true }));
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const current = statements[idx] || {};
  const isDone = idx >= statements.length;

  useEffect(() => {
    reportProgress({ current: correct, total: statements.length, isComplete: isDone && correct >= Math.ceil(statements.length * 0.6) });
  }, [correct, idx, statements.length, isDone]);

  const pick = (value) => {
    if (isDone) return;
    const ok = value === current.answer;
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Jawapan tepat!' : 'Fikir semula ya.');
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => setIdx(i => i + 1), 450);
  };

  if (isDone) {
    return (
      <div className={`${panel} text-center py-6`}>
        <p className="text-5xl mb-2">{correct >= Math.ceil(statements.length * 0.6) ? '🎉' : '💡'}</p>
        <p className="text-purple-900 font-black text-lg">{correct}/{statements.length} jawapan betul</p>
        <p className="text-purple-500 text-sm mt-1 font-bold">{correct >= Math.ceil(statements.length * 0.6) ? 'Bagus!' : 'Cuba lagi untuk maju.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={idx} total={statements.length} />
      <div className={`${panel} text-center min-h-32`}>
        <p className="text-4xl mb-2">💭</p>
        <p className="text-purple-900 text-lg font-black leading-snug">{current.text}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <button onClick={() => pick(true)} className="py-5 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white font-black text-xl shadow-md active:scale-95">✓ Betul</button>
        <button onClick={() => pick(false)} className="py-5 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white font-black text-xl shadow-md active:scale-95">✗ Salah</button>
      </div>
    </div>
  );
}

function TracingMode() {
  const { reportProgress, roundData } = useGameProgress();
  const letters = roundData?.letters || ['A'];
  const letter = letters[0];
  const totalDots = 12;
  const [marks, setMarks] = useState([]);
  const nextDot = marks.length;

  useEffect(() => {
    reportProgress({ current: marks.length, total: totalDots, isComplete: marks.length >= totalDots });
  }, [marks.length]);

  return (
    <div className="space-y-3">
      <MiniProgress current={marks.length} total={totalDots} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-500 text-[10px] font-black uppercase mb-1">Surih huruf ini</p>
        <div className="rounded-2xl bg-white py-6 text-8xl font-black text-purple-700 ring-2 ring-purple-100 relative">
          <span style={{ opacity: 0.25 }}>{letter}</span>
          <span className="absolute inset-0 flex items-center justify-center" style={{ opacity: Math.min(1, marks.length / totalDots) }}>
            <span className="text-purple-700">{letter}</span>
          </span>
        </div>
        <p className="text-purple-600 text-xs font-black mt-2">
          Tap titik bernombor mengikut turutan ({marks.length}/{totalDots})
        </p>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: totalDots }).map((_, i) => {
          const done = marks.includes(i);
          const isNext = i === nextDot;
          return (
            <button
              key={i}
              onClick={() => {
                if (i !== nextDot) return; // kena ikut turutan
                setMarks(prev => [...prev, i]);
              }}
              disabled={done || !isNext}
              className={`aspect-square rounded-xl ring-2 transition-all flex items-center justify-center font-black text-sm ${
                done
                  ? 'bg-gradient-to-br from-green-300 to-emerald-400 ring-green-400 text-white'
                  : isNext
                    ? 'bg-yellow-100 ring-yellow-400 text-orange-700 scale-110 animate-pulse'
                    : 'bg-white ring-purple-100 text-purple-300'
              }`}
            >
              {done ? '✓' : i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BalloonPopMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || [];
  const target = roundData?.target;
  const targetIndexes = useMemo(() => items.map((it, i) => isSame(getItemText(it), target) ? i : -1).filter(i => i >= 0), [items, target]);
  const totalTargets = targetIndexes.length || 1;
  const [popped, setPopped] = useState([]);

  useEffect(() => {
    reportProgress({ current: popped.length, total: totalTargets, isComplete: popped.length >= totalTargets });
  }, [popped.length, totalTargets]);

  const pop = (item, index) => {
    if (popped.includes(index)) return;
    const ok = isSame(getItemText(item), target);
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Pop tepat!' : 'Belon itu bukan sasaran.');
    if (ok) setPopped(prev => [...prev, index]);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={popped.length} total={totalTargets} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-700 font-black text-sm">Pop sasaran: <span className={targetPill + ' ml-1'}>{target}</span></p>
      </div>
      <div className="relative h-72 rounded-2xl bg-gradient-to-b from-sky-100 to-pink-100 overflow-hidden ring-2 ring-white">
        {items.map((item, i) => !popped.includes(i) && (
          <motion.button
            key={i}
            type="button"
            initial={{ y: 230 }}
            animate={{ y: [230, 20, 230] }}
            whileTap={{ scale: 0.2, rotate: 20 }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.4 }}
            onClick={() => pop(item, i)}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${8 + (i * 17) % 80}%` }}
          >
            <span className="text-6xl leading-none">🎈</span>
            <span className="-mt-8 px-2 py-1 rounded-full bg-white text-purple-900 text-lg font-black ring-2 ring-purple-200 shadow-sm pointer-events-none whitespace-nowrap flex items-center justify-center">
              {getItemText(item)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function FallingCatchMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || [];
  const target = roundData?.target;
  const targetIndexes = useMemo(() => items.map((it, i) => isSame(getItemText(it), target) ? i : -1).filter(i => i >= 0), [items, target]);
  const totalTargets = targetIndexes.length || 1;
  const [caught, setCaught] = useState([]);

  useEffect(() => {
    reportProgress({ current: caught.length, total: totalTargets, isComplete: caught.length >= totalTargets });
  }, [caught.length, totalTargets]);

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={caught.length} total={totalTargets} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-700 font-black text-sm">Tangkap: <span className={targetPill + ' ml-1'}>{target}</span></p>
      </div>
      <div className="h-72 rounded-2xl bg-gradient-to-b from-sky-100 to-blue-200 relative overflow-hidden ring-2 ring-white">
        {items.map((item, i) => !caught.includes(i) && (
          <motion.button
            key={i}
            type="button"
            initial={{ y: -40 }}
            animate={{ y: 250 }}
            whileTap={{ scale: 0.2 }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.25, delay: i * 0.3 }}
            onClick={() => {
              const ok = isSame(getItemText(item), target);
              showFeedback(ok ? 'correct' : 'wrong', ok ? 'Tangkap betul!' : 'Bukan sasaran.');
              if (ok && !caught.includes(i)) setCaught(prev => [...prev, i]);
            }}
            className="absolute w-16 h-16 rounded-full bg-white text-purple-700 font-black text-2xl shadow-md ring-2 ring-purple-200 flex items-center justify-center overflow-hidden"
            style={{ left: `${10 + (i * 13) % 80}%` }}
          >{getItemText(item)}</motion.button>
        ))}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-5xl">🧺</div>
      </div>
    </div>
  );
}

function StackingMode() {
  const { reportProgress, roundData } = useGameProgress();
  const target = Number(roundData?.target || 5);
  const [count, setCount] = useState(0);

  useEffect(() => {
    reportProgress({ current: count, total: target, isComplete: count >= target });
  }, [count, target]);

  const colors = ['#FCA5A5','#FDBA74','#FCD34D','#86EFAC','#7DD3FC','#A78BFA','#F472B6'];

  return (
    <div className="space-y-3">
      <MiniProgress current={count} total={target} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-700 font-black text-sm mb-3">Bina menara setinggi <span className={targetPill + ' ml-1'}>{target} blok</span></p>
        <div className="flex flex-col-reverse items-center gap-1 min-h-56 justify-end">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-32 h-7 rounded-lg ring-2 ring-white shadow-md"
              style={{ background: colors[i % colors.length] }}
            />
          ))}
        </div>
      </div>
      <button onClick={() => setCount(c => Math.min(target, c + 1))} disabled={count >= target} className={`w-full py-4 ${action} disabled:opacity-50`}>➕ Tambah Blok</button>
    </div>
  );
}

function SequenceMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const answer = roundData?.answer || [];
  const items = roundData?.items || [];
  const [picked, setPicked] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const complete = picked.length === answer.length && picked.every((x, i) => x === answer[i]);

  useEffect(() => {
    reportProgress({ current: picked.length, total: answer.length, isComplete: complete });
  }, [picked.length, complete, answer.length]);

  // Auto-hide corak selepas 4 saat — supaya anak kena ingat
  useEffect(() => {
    setShowHint(true);
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, [answer.join('|')]);

  const choose = (item) => {
    const ok = item === answer[picked.length];
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Turutan betul!' : 'Bukan giliran itu.');
    if (ok) setPicked(p => [...p, item]);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={picked.length} total={answer.length} />

      {/* CORAK SASARAN — ingat ini! */}
      <div className={panel}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-purple-500 text-[10px] font-black uppercase">
            {showHint ? '👀 Ingat corak ini' : '🧠 Pilih ikut ingatan'}
          </p>
          <button
            type="button"
            onClick={() => setShowHint(s => !s)}
            className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white text-purple-600 ring-1 ring-purple-200 active:scale-95"
          >
            {showHint ? '🙈 Sorok' : '👁️ Tengok'}
          </button>
        </div>
        <div className="min-h-14 rounded-xl bg-white ring-2 ring-purple-100 p-3 flex flex-wrap items-center justify-center gap-2">
          {showHint ? (
            answer.map((step, i) => (
              <React.Fragment key={i}>
                <motion.span
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl bg-gradient-to-br from-yellow-300 to-orange-300 text-orange-900 font-black text-lg ring-2 ring-white shadow-sm"
                >
                  {step}
                </motion.span>
                {i < answer.length - 1 && <span className="text-purple-400 font-black">→</span>}
              </React.Fragment>
            ))
          ) : (
            <div className="flex gap-2">
              {answer.map((_, i) => (
                <span key={i} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-400 font-black text-xl">?</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUSUNAN ANAK */}
      <div className={panel}>
        <p className="text-purple-500 text-[10px] font-black uppercase text-center mb-2">
          Susunan kamu ({picked.length}/{answer.length})
        </p>
        <div className="min-h-14 rounded-xl bg-white ring-2 ring-purple-100 p-3 flex flex-wrap items-center justify-center gap-2">
          {picked.length === 0 ? (
            <p className="text-purple-300 font-black text-sm">Tekan pilihan di bawah →</p>
          ) : (
            picked.map((step, i) => (
              <React.Fragment key={i}>
                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl bg-gradient-to-br from-green-300 to-emerald-400 text-green-900 font-black text-lg ring-2 ring-white shadow-sm">
                  {step}
                </span>
                {i < picked.length - 1 && <span className="text-purple-400 font-black">→</span>}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* PILIHAN */}
      <div>
        <p className="text-white/80 text-xs font-black uppercase tracking-wider text-center mb-2">
          Giliran {picked.length + 1} — pilih satu
        </p>
        <div className="grid grid-cols-2 gap-2">
          {items.filter(x => !picked.includes(x)).map(item => (
            <button key={item} onClick={() => choose(item)} className={chip + ' text-lg py-4'}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SwipeSelectMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || [];
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const item = items[idx] || {};
  const isDone = idx >= items.length;

  const groups = useMemo(() => {
    if (Array.isArray(roundData?.groups) && roundData.groups.length >= 2) return roundData.groups.slice(0, 4);
    const unique = [...new Set(items.map(it => it?.group).filter(Boolean))];
    return unique.length >= 2 ? unique.slice(0, 4) : ['Kumpulan A', 'Kumpulan B'];
  }, [items, roundData]);

  useEffect(() => {
    reportProgress({ current: correct, total: items.length, isComplete: isDone && correct >= Math.ceil(items.length * 0.6) });
  }, [correct, idx, items.length, isDone]);

  const pick = (group) => {
    if (isDone) return;
    const ok = isSame(item.group, group);
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Pilihan betul!' : 'Kategori salah.');
    if (ok) setCorrect(c => c + 1);
    setTimeout(() => setIdx(i => i + 1), 400);
  };

  if (isDone) {
    return (
      <div className={`${panel} text-center py-6`}>
        <p className="text-5xl mb-2">{correct >= Math.ceil(items.length * 0.6) ? '🎉' : '💡'}</p>
        <p className="text-purple-900 font-black text-lg">{correct}/{items.length} pilihan betul</p>
      </div>
    );
  }

  const colors = ['from-blue-400 to-cyan-400', 'from-pink-400 to-rose-400', 'from-yellow-400 to-orange-400', 'from-green-400 to-emerald-400'];

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={idx} total={items.length} />
      <div className={`${panel} text-center min-h-32 flex flex-col items-center justify-center`}>
        <p className="text-purple-500 text-[10px] font-black uppercase mb-2">Item</p>
        <p className="text-purple-900 text-4xl font-black">{item.text}</p>
      </div>
      <div className={`grid gap-2 ${groups.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {groups.map((g, i) => (
          <button key={g} onClick={() => pick(g)} className={`py-4 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} text-white font-black ${answerText} shadow-md active:scale-95`}>{g}</button>
        ))}
      </div>
    </div>
  );
}

function SpinWheelMode() {
  const { reportProgress, roundData } = useGameProgress();
  const [spin, setSpin] = useState(0);
  const [choice, setChoice] = useState('');
  const [spinCount, setSpinCount] = useState(0);
  const items = roundData?.items || [];
  const target = 3;

  useEffect(() => {
    reportProgress({ current: spinCount, total: target, isComplete: spinCount >= target });
  }, [spinCount]);

  return (
    <div className="space-y-3">
      <MiniProgress current={spinCount} total={target} />
      <div className={`${panel} text-center`}>
        <motion.div animate={{ rotate: spin }} transition={{ duration: 1.5 }} className="mx-auto w-44 h-44 rounded-full bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 flex items-center justify-center text-5xl ring-8 ring-white shadow-xl">🎡</motion.div>
        <p className="text-purple-900 font-black mt-3 text-lg">{choice || `Putar untuk pilih`}</p>
      </div>
      <button onClick={() => {
        const next = items[Math.floor(Math.random() * items.length)];
        setChoice(next);
        setSpin(s => s + 720 + Math.random() * 360);
        setSpinCount(c => c + 1);
      }} disabled={spinCount >= target} className={`w-full py-4 ${action} disabled:opacity-50`}>🎯 Putar Roda</button>
    </div>
  );
}

function PictureHuntMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || [];
  const target = roundData?.target;
  const [found, setFound] = useState(false);

  useEffect(() => {
    reportProgress({ current: found ? 1 : 0, total: 1, isComplete: found });
  }, [found]);

  const pick = (item) => {
    if (found) return;
    const ok = isSame(getItemValue(item), target) || isSame(getItemText(item), target);
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Jumpa sasaran!' : 'Cuba yang lain.');
    if (ok) setFound(true);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-700 font-black text-sm">Cari: <span className={targetPill + ' ml-1'}>{target}</span></p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <button key={i} onClick={() => pick(item)} disabled={found} className="aspect-square rounded-2xl bg-white ring-2 ring-purple-100 text-5xl shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center p-2 overflow-hidden">{getItemText(item)}</button>
        ))}
      </div>
    </div>
  );
}

function TypingMode() {
  const { reportProgress, roundData } = useGameProgress();
  const [value, setValue] = useState('');
  const target = roundData?.target || '';
  const prompt = roundData?.prompt;
  const ok = normalize(value) === normalize(target);

  useEffect(() => {
    reportProgress({ current: ok ? 1 : 0, total: 1, isComplete: ok });
  }, [ok]);

  return (
    <div className="space-y-3">
      <div className={`${panel} text-center`}>
        <p className="text-purple-500 text-[10px] font-black uppercase">{prompt ? 'Soalan' : 'Taip perkataan'}</p>
        <p className="text-2xl sm:text-3xl font-black text-purple-900 my-3">{prompt || target}</p>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className={`w-full rounded-2xl p-3 text-center font-black text-xl ring-2 ${ok ? 'ring-green-400 bg-green-50 text-green-700' : 'ring-purple-200 bg-white text-purple-900'}`}
          autoFocus
          placeholder="Taip jawapan..."
        />
      </div>
      {ok && <p className="text-center text-green-600 font-black text-lg">🎉 Hebat!</p>}
    </div>
  );
}

function MiniSimulationMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || [];
  const target = roundData?.target;
  const targetIndexes = useMemo(() => items.map((it, i) => isSame(getItemGroup(it), target) ? i : -1).filter(i => i >= 0), [items, target]);
  const totalTargets = targetIndexes.length || 1;
  const [picked, setPicked] = useState([]);

  useEffect(() => {
    reportProgress({ current: picked.length, total: totalTargets, isComplete: picked.length >= totalTargets });
  }, [picked.length, totalTargets]);

  const pick = (item, i) => {
    if (picked.includes(i)) return;
    const ok = isSame(getItemGroup(item), target);
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Objek betul!' : 'Tak sesuai.');
    if (ok) setPicked(prev => [...prev, i]);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={picked.length} total={totalTargets} />
      <div className={`${panel} text-center`}>
        <p className="text-5xl mb-1">🧲</p>
        <p className="text-purple-700 font-black text-sm">Cari: <span className={targetPill + ' ml-1'}>{target}</span></p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <button key={i} onClick={() => pick(item, i)} className={`${chip} flex items-center justify-center overflow-hidden ${picked.includes(i) ? 'opacity-30 bg-green-100' : ''}`}>{getItemText(item)}</button>
        ))}
      </div>
    </div>
  );
}

function RhythmTapMode() {
  const { reportProgress, roundData } = useGameProgress();
  const items = roundData?.items || [];
  const [beat, setBeat] = useState(0);
  const isDone = beat >= items.length;

  useEffect(() => {
    reportProgress({ current: beat, total: items.length, isComplete: isDone });
  }, [beat, items.length, isDone]);

  return (
    <div className="space-y-3">
      <MiniProgress current={beat} total={items.length} />
      <div className={`${panel} text-center`}>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-5xl mb-2">🥁</motion.div>
        <p className="text-purple-500 text-[10px] font-black uppercase mb-2">Baca & tap satu demi satu</p>

        {/* Tunjuk semua items dengan highlight pada beat semasa */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {items.map((it, i) => (
            <span
              key={i}
              className={`inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl font-black text-base ring-2 transition-all ${
                i < beat
                  ? 'bg-gradient-to-br from-green-300 to-emerald-400 text-white ring-green-400'
                  : i === beat
                    ? 'bg-gradient-to-br from-yellow-300 to-orange-300 text-orange-900 ring-orange-400 scale-110 animate-pulse'
                    : 'bg-white text-purple-400 ring-purple-100'
              }`}
            >
              {it}
            </span>
          ))}
        </div>

        {!isDone ? (
          <p className="text-purple-700 text-sm font-black">
            Sekarang sebut: <span className="text-orange-600">"{items[beat]}"</span>
          </p>
        ) : (
          <p className="text-green-600 text-sm font-black">🎉 Habis semua rentak!</p>
        )}
      </div>
      <button
        onClick={() => setBeat(b => Math.min(items.length, b + 1))}
        disabled={isDone}
        className={`w-full py-5 ${action} disabled:opacity-50 text-lg`}
      >
        {isDone ? '✓ Selesai' : `👆 Tap untuk "${items[beat]}"`}
      </button>
    </div>
  );
}

function ConnectDotsMode() {
  const { reportProgress, roundData } = useGameProgress();
  const { feedback, showFeedback } = useMiniFeedback();
  const items = roundData?.items || ['1','2','3','4'];
  const [dots, setDots] = useState([]);

  useEffect(() => {
    reportProgress({ current: dots.length, total: items.length, isComplete: dots.length >= items.length });
  }, [dots.length, items.length]);

  const tap = (dot, expectedIdx) => {
    if (dots.includes(dot)) return;
    const ok = dot === items[dots.length];
    showFeedback(ok ? 'correct' : 'wrong', ok ? 'Betul!' : `Patut: ${items[dots.length]}`);
    if (ok) setDots(p => [...p, dot]);
  };

  return (
    <div className="space-y-3">
      <MiniFeedback feedback={feedback} />
      <MiniProgress current={dots.length} total={items.length} />
      <div className={`${panel} text-center`}>
        <p className="text-purple-700 font-black text-sm">Tap mengikut turutan: <span className={targetPill + ' ml-1'}>{items.join(' → ')}</span></p>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3">
        {items.map((dot, i) => (
          <button key={dot} onClick={() => tap(dot, i)} className={`aspect-square rounded-full text-3xl font-black ring-4 transition-all ${dots.includes(dot) ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-green-200 scale-105' : 'bg-white text-purple-700 ring-purple-100'}`}>{dot}</button>
        ))}
      </div>
    </div>
  );
}

function MazeMode() {
  const { reportProgress, roundData } = useGameProgress();
  const goal = roundData?.goal || '⭐';
  const player = roundData?.player || '🐰';
  const [pos, setPos] = useState(0);
  const goalIdx = 8;
  const won = pos === goalIdx;

  useEffect(() => {
    reportProgress({ current: won ? 1 : 0, total: 1, isComplete: won });
  }, [won]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 ring-1 ring-purple-100">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-3xl ring-2 ${i === pos ? 'bg-yellow-100 ring-yellow-400' : i === goalIdx ? 'bg-green-100 ring-green-400' : 'bg-white ring-purple-100'}`}>
            {i === pos ? player : i === goalIdx ? goal : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <span />
        <button onClick={() => setPos(p => Math.max(0, p - 3))} className={chip}>⬆️</button>
        <span />
        <button onClick={() => setPos(p => p % 3 > 0 ? p - 1 : p)} className={chip}>⬅️</button>
        <button onClick={() => setPos(0)} className={chip}>⟲</button>
        <button onClick={() => setPos(p => p % 3 < 2 ? p + 1 : p)} className={chip}>➡️</button>
        <span />
        <button onClick={() => setPos(p => Math.min(8, p + 3))} className={chip}>⬇️</button>
        <span />
      </div>
    </div>
  );
}

function ReactionSpeedMode() {
  const { reportProgress } = useGameProgress();
  const [phase, setPhase] = useState('idle'); // idle | wait | go | done
  const [score, setScore] = useState(0);
  const target = 3;
  const timerRef = useRef(null);

  useEffect(() => {
    reportProgress({ current: score, total: target, isComplete: score >= target });
  }, [score]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const start = () => {
    if (phase === 'wait' || phase === 'go') return;
    setPhase('wait');
    timerRef.current = setTimeout(() => setPhase('go'), 800 + Math.random() * 1500);
  };

  const tap = () => {
    if (phase === 'go') {
      setScore(s => s + 1);
      setPhase('idle');
    } else if (phase === 'wait') {
      clearTimeout(timerRef.current);
      setPhase('idle');
    }
  };

  const bg = phase === 'go' ? 'from-green-400 to-emerald-500' : phase === 'wait' ? 'from-orange-400 to-rose-500' : 'from-slate-300 to-slate-400';
  const text = phase === 'go' ? 'TAP SEKARANG!' : phase === 'wait' ? 'Tunggu...' : 'Tekan Mula';

  return (
    <div className="space-y-3">
      <MiniProgress current={score} total={target} />
      <button onClick={tap} className={`w-full h-60 rounded-3xl font-black text-3xl text-white shadow-xl ring-4 ring-white bg-gradient-to-br ${bg} transition-colors`}>{text}</button>
      <button onClick={start} disabled={phase === 'wait' || phase === 'go' || score >= target} className={`w-full py-3 ${action} disabled:opacity-50`}>🚀 Mula Pusingan</button>
    </div>
  );
}

function ColoringMode() {
  const { reportProgress, roundData } = useGameProgress();
  const items = roundData?.items || [];
  const [colored, setColored] = useState([]);
  const colors = ['#FCA5A5','#FDBA74','#FCD34D','#86EFAC','#7DD3FC','#A78BFA','#F472B6','#FBBF24'];

  useEffect(() => {
    reportProgress({ current: colored.length, total: items.length, isComplete: colored.length >= items.length });
  }, [colored.length, items.length]);

  return (
    <div className="space-y-3">
      <MiniProgress current={colored.length} total={items.length} />
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setColored(p => p.includes(i) ? p : [...p, i])}
            className={`aspect-square rounded-2xl text-4xl ring-4 transition-all flex items-center justify-center p-2 overflow-hidden ${colored.includes(i) ? 'ring-white scale-105' : 'bg-white ring-purple-100 grayscale'}`}
            style={colored.includes(i) ? { background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})` } : {}}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ HELPERS ============
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function normalize(text) { return String(text || '').replace(/\s/g, '').toLowerCase(); }
function getItemText(item) { return typeof item === 'object' && item !== null ? (item.text ?? item.label ?? item.value ?? '') : item; }
function getItemGroup(item) { return typeof item === 'object' && item !== null ? (item.group ?? item.category ?? item.type ?? '') : ''; }
function getItemValue(item) { return typeof item === 'object' && item !== null ? (item.value ?? item.answer ?? item.target ?? item.text ?? item.label ?? '') : item; }
function isSame(a, b) { return normalize(a) === normalize(b); }

// Pilih emoji ikut keyword dalam ayat soalan story mode
function guessSceneEmoji(text = '') {
  const t = String(text).toLowerCase();
  const map = [
    [['protein', 'daging', 'ikan', 'ayam', 'telur'], '🍗'],
    [['makan', 'makanan', 'sarapan', 'tengah hari', 'malam'], '🍽️'],
    [['buah', 'sayur', 'vitamin'], '🥗'],
    [['air', 'minum'], '💧'],
    [['gigi', 'berus'], '🪥'],
    [['mandi', 'bersih', 'sabun'], '🧼'],
    [['tidur', 'rehat'], '😴'],
    [['sekolah', 'belajar', 'cikgu', 'kelas'], '🏫'],
    [['buku', 'baca'], '📚'],
    [['kawan', 'rakan', 'sahabat'], '🤝'],
    [['ibu', 'bapa', 'keluarga', 'mak', 'ayah'], '👨‍👩‍👧'],
    [['sampah', 'kitar'], '♻️'],
    [['solat', 'sembahyang', 'doa'], '🕌'],
    [['jalan', 'lintas', 'lampu'], '🚦'],
    [['duit', 'wang', 'beli', 'kedai'], '💰'],
    [['hewan', 'haiwan', 'kucing', 'anjing'], '🐾'],
    [['marah', 'sedih', 'gembira', 'perasaan'], '😊'],
    [['sukan', 'lari', 'main'], '⚽'],
    [['tangan', 'cuci'], '🧴'],
    [['hujan', 'cuaca', 'panas'], '🌦️'],
  ];
  for (const [keywords, emoji] of map) {
    if (keywords.some(k => t.includes(k))) return emoji;
  }
  return '🤔';
}