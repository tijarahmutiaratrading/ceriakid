import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function GeneratedMiniGamePlayer({ game, loading, backTo }) {
  const [done, setDone] = useState(false);
  const data = game?.gameData || {};
  const items = getDisplayItems(data);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to={backTo} className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-5 rounded-3xl" style={glassCard}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">{game?.emoji || '🎮'}</div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white leading-tight">{game?.title}</h1>
              <p className="text-white/70 text-xs font-bold mt-1">{data.playStyle || data.mode || game?.type}</p>
            </div>
          </div>
          {data.instruction && <p className="text-white/85 text-sm font-bold mt-4 leading-relaxed">{data.instruction}</p>}
        </motion.div>

        <div className="space-y-3 mb-5">
          {items.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="rounded-3xl p-4 bg-white/15 border border-white/25 shadow-xl">
              <p className="text-white/55 text-xs font-black uppercase tracking-wider mb-1">Aktiviti {index + 1}</p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-black text-base">{item.main}</p>
                  {item.sub && <p className="text-white/70 text-sm font-bold mt-1">{item.sub}</p>}
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">{item.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.96 }} onClick={() => setDone(true)} className="w-full py-4 rounded-2xl bg-white text-purple-700 font-black shadow-xl flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {done ? 'Selesai! Game ini memang variasi lain' : 'Tandakan Selesai'}
        </motion.button>
      </div>
    </div>
  );
}

function getDisplayItems(data) {
  if (Array.isArray(data.pairs)) return data.pairs.map(pair => ({ main: pair[0], sub: pair[1], icon: '🧠' }));
  if (Array.isArray(data.items) && Array.isArray(data.targets)) return data.items.map((item, i) => ({ main: item, sub: data.targets[i], icon: '🎯' }));
  if (Array.isArray(data.words)) return data.words.map(word => ({ main: word, sub: 'Bina perkataan', icon: '📝' }));
  if (Array.isArray(data.items)) return data.items.map(item => ({ main: item.text || item, sub: item.group || '', icon: '🗂️' }));
  if (Array.isArray(data.tiles)) {
    const rows = [];
    for (let i = 0; i < data.tiles.length; i += 2) rows.push({ main: data.tiles[i], sub: data.tiles[i + 1] || '', icon: '🔢' });
    return rows;
  }
  if (Array.isArray(data.scenes)) return data.scenes.map(scene => ({ main: scene.text, sub: (scene.choices || []).join(' / '), icon: '📖' }));
  if (Array.isArray(data.challenges)) return data.challenges.map(challenge => ({ main: challenge.question, sub: challenge.options?.[challenge.answer] || '', icon: '🚀' }));
  if (Array.isArray(data.letters)) return data.letters.map(letter => ({ main: letter, sub: data.playStyle || 'Surih', icon: '✏️' }));
  return [{ main: 'Aktiviti mini game', sub: data.instruction || '', icon: '🎮' }];
}