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
  const [miniGameConfig, setMiniGameConfig] = useState({ games: 5 });
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
        const gamesToAdd = Math.max(0, miniGameConfig.games - curr);
        
        if (gamesToAdd > 0) {
          await base44.entities.GameTask.create({
            taskName: `Mini Game: ${gameData?.title || gameId}`,
            ageGroup: 'sekolah_rendah',
            subject: gameId,
            gamesCount: gamesToAdd,
            questionsPerGame: 1,
            status: 'pending',
          });
        }
      }
      onToast(`✅ ${selectedMiniGames.size} mini game tasks dihantar ke queue (smart target)!`);
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
        <h2 className="font-black text-white mb-4">⚙️ Mini Games Configuration</h2>
        <div className="mb-5">
          <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">🎮 Jumlah Games per Tipe</label>
          <input
            type="number"
            min="1"
            max="20"
            value={miniGameConfig.games}
            onChange={e => setMiniGameConfig(c => ({ ...c, games: parseInt(e.target.value) || 1 }))}
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
            const curr = currentCounts[game.id] || 0;
            const gameDiff = miniGameConfig.games - curr;
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

      {/* Task Queue */}
      <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-black text-white">📋 Task Queue</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {completedTasks.length > 0 && (
              <button onClick={handleDeleteAllCompleted} className="text-xs font-bold text-green-300 hover:underline whitespace-nowrap">
                Clear Completed
              </button>
            )}
            <button onClick={loadTasks} disabled={loadingTasks} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
              <RefreshCw className={`w-4 h-4 text-white/70 ${loadingTasks ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Pending', value: pendingTasks.length, color: 'text-yellow-300' },
            { label: 'Running', value: runningTasks.length, color: 'text-blue-300' },
            { label: 'Done', value: completedTasks.length, color: 'text-green-300' },
            { label: 'Failed', value: failedTasks.length, color: 'text-red-300' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
              <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/50 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {loadingTasks ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm font-semibold">Tiada mini game tasks</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.map(task => {
              const sc = statusConfig[task.status] || statusConfig.pending;
              return (
                <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                    {sc.icon} {task.status}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{task.taskName}</p>
                    <p className="text-xs text-white/40">
                      {task.gamesCount} games perlu
                      {task.createdGames > 0 && <span className="text-green-300 font-bold"> · {task.createdGames} dibuat</span>}
                    </p>
                  </div>
                  {task.status === 'pending' && (
                    <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-300 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(completedTasks.length > 0 || pendingTasks.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-3 flex-wrap">
            {completedTasks.length > 0 && (
              <button onClick={handleDeleteAllCompleted} className="text-xs font-bold text-green-300 hover:underline">
                Clear Completed
              </button>
            )}
            {pendingTasks.length > 0 && (
              <button onClick={handleDeleteAllPending} className="text-xs font-bold text-red-300 hover:underline">
                Padam Semua Pending
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}