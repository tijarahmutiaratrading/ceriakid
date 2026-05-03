import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GAME_HUB = [
  { id: 'memory', title: 'Memory Game' },
  { id: 'dragdrop', title: 'Drag & Drop' },
  { id: 'wordbuilder', title: 'Word Builder' },
  { id: 'sorting', title: 'Sorting Game' },
  { id: 'tilematch', title: 'Tile Match' },
  { id: 'story', title: 'Story Adventure' },
  { id: 'physics', title: 'Physics Game' },
  { id: 'tracing', title: 'Tracing Game' },
];

export default function MiniGamesGenerator({ onToast }) {
  const [miniGameConfig, setMiniGameConfig] = useState({ questions: 20 });
  const [selectedMiniGames, setSelectedMiniGames] = useState(new Set());
  const [miniGameSubmitting, setMiniGameSubmitting] = useState(false);

  const toggleMiniGame = (id) => {
    const next = new Set(selectedMiniGames);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedMiniGames(next);
  };

  const handleQueueMiniGames = async () => {
    if (selectedMiniGames.size === 0) {
      onToast('Pilih sekurang-kurangnya satu mini game', false);
      return;
    }
    setMiniGameSubmitting(true);
    try {
      for (const gameId of Array.from(selectedMiniGames)) {
        const gameData = GAME_HUB.find(g => g.id === gameId);
        await base44.entities.GameTask.create({
          taskName: `Mini Game: ${gameData?.title || gameId}`,
          ageGroup: 'sekolah_rendah',
          subject: gameId,
          gamesCount: 1,
          questionsPerGame: miniGameConfig.questions,
          status: 'pending',
        });
      }
      onToast(`✅ ${selectedMiniGames.size} mini game tasks dihantar ke queue!`);
      setSelectedMiniGames(new Set());
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
    setMiniGameSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-6 rounded-3xl mb-5" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <h2 className="font-black text-white mb-4">⚙️ Mini Games Configuration</h2>
        <div className="mb-5">
          <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">📝 Soalan per Game</label>
          <input
            type="number"
            min="1"
            max="50"
            value={miniGameConfig.questions}
            onChange={e => setMiniGameConfig(c => ({ ...c, questions: parseInt(e.target.value) || 1 }))}
            className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl text-center"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-xs font-black uppercase tracking-wider">Pilih Mini Games</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => setSelectedMiniGames(new Set(GAME_HUB.map(g => g.id)))} className="text-xs font-bold text-yellow-300 hover:underline">
              Semua
            </button>
            <span className="text-white/30">|</span>
            <button onClick={() => setSelectedMiniGames(new Set())} className="text-xs font-bold text-white/50 hover:underline">
              Kosong
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {GAME_HUB.map(game => {
            const sel = selectedMiniGames.has(game.id);
            return (
              <button
                key={game.id}
                onClick={() => toggleMiniGame(game.id)}
                className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-white/30'}`}>
                  {sel && <span className="text-white text-xs">✓</span>}
                </div>
                <p className="truncate">{game.title}</p>
              </button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleQueueMiniGames}
          disabled={miniGameSubmitting || selectedMiniGames.size === 0}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-xl disabled:opacity-50"
        >
          {miniGameSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Menghantar ke queue...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" /> Queue Mini Games ({selectedMiniGames.size})
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}