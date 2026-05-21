import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MINI_GAME_SUBJECTS = ['abc_phonics', 'math_counting', 'bahasa_melayu', 'english_vocabulary', 'sains_awal', 'jawi_iqra', 'memory_logic', 'islamic_learning'];

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  running: { color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

function getTaskGroup(task) {
  const name = task.taskName?.toLowerCase() || '';
  if (task.subject === 'storykid') return { label: 'Story Kid', color: 'bg-pink-400/20 text-pink-100' };
  if (MINI_GAME_SUBJECTS.includes(task.subject)) return { label: 'Mini Games', color: 'bg-purple-400/20 text-purple-100' };
  return { label: 'Games', color: 'bg-yellow-400/20 text-yellow-100' };
}

export default function MasterTaskQueue({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, running: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const lastLoadRef = useRef(0);

  const loadTasks = async () => {
    const now = Date.now();
    if (loading || now - lastLoadRef.current < 5000) {
      onToast?.('Tunggu sekejap sebelum refresh lagi', false);
      return;
    }
    lastLoadRef.current = now;
    setLoading(true);
    try {
      // List recent 120 tasks for display + true DB counts via summary function
      const [data, summaryRes] = await Promise.all([
        base44.entities.GameTask.list('-created_date', 120),
        base44.functions.invoke('getTaskQueueSummary', {}),
      ]);
      setTasks(data);
      const s = summaryRes?.data?.statuses || {};
      setSummary({
        pending: s.pending || 0,
        running: s.running || 0,
        completed: s.completed || 0,
        failed: s.failed || 0,
      });
    } catch (error) {
      onToast?.('Refresh terlalu kerap. Cuba lagi sebentar.', false);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const deleteTask = async (task) => {
    await base44.entities.GameTask.delete(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
    onToast?.('✅ Task dipadam');
  };

  const clearByStatus = async (status) => {
    const selected = tasks.filter(t => t.status === status);
    if (selected.length === 0) return onToast?.(`Tiada task ${status}`, false);
    if (!window.confirm(`Padam ${selected.length} task ${status}?`)) return;
    setLoading(true);
    let ok = 0;
    let failed = 0;
    // Delete dalam batch kecil (5 serentak) + delay 250ms antara batch → elak rate limit
    for (let i = 0; i < selected.length; i += 5) {
      const batch = selected.slice(i, i + 5);
      const results = await Promise.allSettled(batch.map(t => base44.entities.GameTask.delete(t.id)));
      results.forEach(r => r.status === 'fulfilled' ? ok++ : failed++);
      if (i + 5 < selected.length) await new Promise(r => setTimeout(r, 250));
    }
    setTasks(prev => prev.filter(t => t.status !== status));
    setLoading(false);
    if (failed > 0) onToast?.(`⚠️ ${ok} dipadam, ${failed} gagal (rate limit). Cuba lagi.`, false);
    else onToast?.(`✅ ${ok} task ${status} dipadam`);
  };

  return (
    <div className="p-5 md:p-7 rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-black text-white text-lg">📋 Master Task Queue</h2>
          <p className="text-white/50 text-xs">Semua queue Games, Mini Games dan Story Kid dalam satu tempat.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {summary.completed > 0 && <button onClick={() => clearByStatus('completed')} className="text-xs font-bold text-green-300 hover:underline whitespace-nowrap">Clear Done</button>}
          {summary.pending > 0 && <button onClick={() => clearByStatus('pending')} className="text-xs font-bold text-red-300 hover:underline whitespace-nowrap">Clear Pending</button>}
          <button onClick={loadTasks} disabled={loading} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Pending', value: summary.pending, color: 'text-yellow-300' },
          { label: 'Running', value: summary.running, color: 'text-blue-300' },
          { label: 'Done', value: summary.completed, color: 'text-green-300' },
          { label: 'Failed', value: summary.failed, color: 'text-red-300' },
        ].map(item => (
          <div key={item.label} className="bg-white/10 rounded-2xl p-3 text-center border border-white/10">
            <p className={`font-black text-lg ${item.color}`}>{item.value}</p>
            <p className="text-xs text-white/60 font-semibold">{item.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-white/40"><p className="text-3xl mb-2">📭</p><p className="text-sm font-semibold">Tiada task dalam queue</p></div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.map(task => {
            const config = statusConfig[task.status] || statusConfig.pending;
            const Icon = config.icon;
            const group = getTaskGroup(task);
            return (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl px-3 sm:px-4 py-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className={`hidden sm:inline-flex px-2 py-1 rounded-full text-[11px] font-black ${group.color}`}>{group.label}</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
                  <Icon className={`w-3 h-3 ${task.status === 'running' ? 'animate-spin' : ''}`} /> {task.status}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{task.taskName}</p>
                  <p className="text-xs text-white/45">{task.createdGames || 0}/{task.gamesCount || 0} item · {task.questionsPerGame || 0} soalan</p>
                </div>
                {task.status === 'pending' && (
                  <button onClick={() => deleteTask(task)} className="p-1 text-red-300 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}