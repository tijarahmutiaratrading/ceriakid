import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Gamepad2, RefreshCw, CheckCircle2 } from 'lucide-react';

// Paparan ringkas progress content: X/Y games siap + bar keseluruhan
export default function ContentProgressBar() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('launchGetProgress', {});
      if (res?.data?.success) setProgress(res.data);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading && !progress) {
    return (
      <div className="pro-glass rounded-3xl p-5 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-600">Mengira progress content...</p>
      </div>
    );
  }

  if (!progress) return null;

  const done = progress.overallPercent >= 100;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${done ? 'bg-emerald-400' : 'brand-gradient-br'}`}>
            {done ? <CheckCircle2 className="w-5 h-5 text-emerald-950" /> : <Gamepad2 className="w-5 h-5 text-white" />}
          </div>
          <div>
            <p className="text-slate-900 font-black text-sm">Progress Content Games</p>
            <p className="text-slate-600 text-xs font-semibold">
              {progress.totalExisting.toLocaleString()} / {progress.totalTarget.toLocaleString()} games siap
              {' · '}{progress.completeBuckets}/{progress.totalBuckets} subjek lengkap
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black ${done ? 'text-emerald-600' : 'text-violet-700'}`}>
            {progress.overallPercent}%
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-600 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.overallPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'brand-gradient'}`}
        />
      </div>
    </motion.div>
  );
}