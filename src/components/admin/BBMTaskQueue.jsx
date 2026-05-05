import React from 'react';
import { Loader2, RefreshCw, Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function BBMTaskQueue({ tasks, loadingTasks, onRefresh, onDeleteTask, onClearCompleted, onClearPending }) {
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
    <div className="p-5 md:p-6 rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-black text-white">📋 BBM Task Queue</h2>
          <p className="text-xs text-white/55 font-semibold">Senarai tugasan BBM background seperti Games Generator.</p>
        </div>
        <button onClick={onRefresh} disabled={loadingTasks} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
          <RefreshCw className={`w-4 h-4 text-white/70 ${loadingTasks ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Pending', value: pendingTasks.length, color: 'text-yellow-300' },
          { label: 'Running', value: runningTasks.length, color: 'text-blue-300' },
          { label: 'Done', value: completedTasks.length, color: 'text-green-300' },
          { label: 'Failed', value: failedTasks.length, color: 'text-red-300' },
        ].map(s => (
          <div key={s.label} className="bg-white/10 rounded-2xl p-2 text-center">
            <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {loadingTasks ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-white/45">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-semibold">Belum ada BBM tasks dalam queue</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {tasks.map(task => {
            const sc = statusConfig[task.status] || statusConfig.pending;
            return (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                  {sc.icon} {task.status}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{task.taskName}</p>
                  <p className="text-xs text-white/45">
                    {task.gamesCount || 0} items
                    {task.createdGames > 0 && <span className="text-green-300 font-bold"> · {task.createdGames} siap</span>}
                  </p>
                </div>
                {task.status === 'pending' && (
                  <button onClick={() => onDeleteTask(task.id)} className="p-1 text-red-300 hover:text-red-400 transition-all">
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
          {completedTasks.length > 0 && <button onClick={onClearCompleted} className="text-xs font-bold text-green-300 hover:underline">Clear Completed</button>}
          {pendingTasks.length > 0 && <button onClick={onClearPending} className="text-xs font-bold text-red-300 hover:underline">Padam Semua Pending</button>}
        </div>
      )}
    </div>
  );
}