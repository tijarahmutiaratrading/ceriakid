import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MiniGamesManager({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    running: { color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await base44.entities.GameTask.list('-created_date', 50);
      const miniGameTasks = data.filter(t => {
        const gameIds = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
        return gameIds.includes(t.subject);
      });
      setTasks(miniGameTasks);
    } catch {}
    setLoadingTasks(false);
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 30000);
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

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'running');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-white">📋 Mini Games Task Queue</h2>
          <button onClick={loadTasks} disabled={loadingTasks} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
            <RefreshCw className={`w-4 h-4 text-white/70 ${loadingTasks ? 'animate-spin' : ''}`} />
          </button>
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
                      {task.questionsPerGame} soalan
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

        {pendingTasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button onClick={handleDeleteAllPending} className="text-xs font-bold text-red-300 hover:underline">
              Padam Semua Pending
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}