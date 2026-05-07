import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wand2, RefreshCw, Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
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
  const [miniGameConfig, setMiniGameConfig] = useState({ gamesCount: 15, roundsPerGame: 4 });
  const [selectedMiniGames, setSelectedMiniGames] = useState(new Set());
  const [miniGameSubmitting, setMiniGameSubmitting] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [currentCounts, setCurrentCounts] = useState({});

  const toggleMiniGame = (id) => {
    const next = new Set(selectedMiniGames);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedMiniGames(next);
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const miniGameSubjects = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
      const data = await base44.entities.GameTask.list('-created_date', 100);
      const miniGameTasks = data.filter(t => miniGameSubjects.includes(t.subject));
      setTasks(miniGameTasks);
    } catch {}
    setLoadingTasks(false);
  };

  const loadCurrentCounts = async () => {
    try {
      const res = await base44.functions.invoke('getGameManagerCounts', {});
      const counts = {};
      Object.entries(res.data?.miniCounts || {}).forEach(([id, value]) => {
        counts[id] = value.count || 0;
      });
      setCurrentCounts(counts);
    } catch {}
  };

  useEffect(() => {
    loadTasks();
    loadCurrentCounts();
    const interval = setInterval(() => { loadTasks(); loadCurrentCounts(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteTask = async (id) => {
    try {
      await base44.entities.GameTask.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      onToast('✅ Task dihapus', true);
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
  };

  const handleDeleteAllPending = async () => {
    if (!window.confirm('Padam semua pending mini game tasks?')) return;
    const pending = tasks.filter(t => t.status === 'pending');
    try {
      for (const t of pending) await base44.entities.GameTask.delete(t.id);
      setTasks(prev => prev.filter(t => t.status !== 'pending'));
      onToast(`✅ ${pending.length} tasks dipadam`);
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
  };

  const handleDeleteAllCompleted = async () => {
    if (!window.confirm('Padam semua completed mini game tasks?')) return;
    const completed = tasks.filter(t => t.status === 'completed');
    try {
      for (const t of completed) await base44.entities.GameTask.delete(t.id);
      setTasks(prev => prev.filter(t => t.status !== 'completed'));
      onToast(`✅ ${completed.length} completed tasks dipadam`);
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
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
        const curr = currentCounts[gameId] || 0;
        const targetTotal = miniGameConfig.gamesCount;
        const gamesToAdd = Math.max(0, targetTotal - curr);
        
        if (gamesToAdd > 0) {
          await base44.entities.GameTask.create({
            taskName: `Mini Game: ${gameData?.title || gameId} · ${miniGameConfig.gamesCount} games x ${miniGameConfig.roundsPerGame} round`,
            ageGroup: 'sekolah_rendah',
            subject: gameId,
            gamesCount: gamesToAdd,
            questionsPerGame: miniGameConfig.roundsPerGame,
            status: 'pending',
            errorMessage: JSON.stringify({ sets: miniGameConfig.gamesCount, levels: 1, itemsPerSet: miniGameConfig.roundsPerGame, theme: 'KSSR asas Malaysia' }),
          });
        }
      }
      onToast(`✅ ${selectedMiniGames.size} mini game tasks dihantar ke queue ikut set & level!`);
      setSelectedMiniGames(new Set());
      loadCurrentCounts();
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
    setMiniGameSubmitting(false);
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    running: { color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'running');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-6 rounded-3xl mb-5" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <h2 className="font-black text-white mb-4">⚙️ Mini Games Sets & Levels</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div>
            <label className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-wider block mb-2">🎮 Games</label>
            <input
              type="number"
              min="1"
              max="100"
              value={miniGameConfig.gamesCount}
              onChange={e => setMiniGameConfig(c => ({ ...c, gamesCount: parseInt(e.target.value) || 1 }))}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl text-center"
            />
          </div>
          <div>
            <label className="text-white/70 text-[10px] sm:text-xs font-black uppercase tracking-wider block mb-2">🔁 Round/Game</label>
            <input
              type="number"
              min="1"
              max="10"
              value={miniGameConfig.roundsPerGame}
              onChange={e => setMiniGameConfig(c => ({ ...c, roundsPerGame: parseInt(e.target.value) || 1 }))}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl text-center"
            />
          </div>
        </div>
        <div className="mb-5 rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
          <p className="text-white/60 text-xs font-semibold">Target setiap mini game</p>
          <p className="text-white font-black text-lg">{miniGameConfig.gamesCount} games</p>
          <p className="text-white/40 text-xs">{miniGameConfig.roundsPerGame} round dalam setiap game</p>
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
            const curr = currentCounts[game.id] || 0;
            const targetTotal = miniGameConfig.gamesCount;
            const gameDiff = targetTotal - curr;
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
                <div className="flex-1 min-w-0">
                  <p className="truncate">{game.title}</p>
                  <p className={`text-xs mt-0.5 ${sel ? 'text-indigo-500' : 'text-white/40'}`}>
                    {curr} ada · {gameDiff > 0 ? `+${gameDiff} perlu` : gameDiff < 0 ? `${gameDiff}` : '✓'}
                  </p>
                </div>
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