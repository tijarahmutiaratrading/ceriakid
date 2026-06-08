import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { collectUniqueEmojis } from '@/lib/emojiImageMap';

export default function EmojiImageGeneratorPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ total: 0, done: 0 });
  const uniqueEmojis = React.useMemo(() => collectUniqueEmojis(), []);

  const loadStats = async () => {
    try {
      const records = await base44.entities.EmojiImage.filter({ status: 'done' }, '-created_date', 2000);
      setStats({ total: uniqueEmojis.length, done: records.length });
    } catch {
      setStats({ total: uniqueEmojis.length, done: 0 });
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleGenerate = async (overwrite = false) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('generateEmojiImages', { emojis: uniqueEmojis, overwrite });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err?.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-slate-200 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-black text-slate-900 text-base">Gambar AI Mini Game</h2>
          <p className="text-xs text-slate-500 font-medium">Tukar emoji jadi gambar betul untuk semua mini game</p>
        </div>
        <button onClick={loadStats} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-3">
        Jana gambar AI untuk setiap emoji unik (cth: 🚗→gambar kereta). Disimpan kekal &
        digunakan semula di semua mini game — jadi <strong>jana sekali sahaja</strong> jimat kredit.
      </p>

      <div className="mb-4 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">Emoji unik dijumpai</span>
          <span className="font-black text-slate-900">{stats.total}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="font-bold text-slate-700">Sudah ada gambar</span>
          <span className="font-black text-emerald-600">{stats.done} / {stats.total}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500" style={{ width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%` }} />
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleGenerate(false)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {loading ? 'Menjana...' : 'Jana Gambar (Baru Sahaja)'}
        </button>
        <button
          onClick={() => handleGenerate(true)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all disabled:opacity-60"
        >
          Jana Semula Semua
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-3 bg-pink-50 rounded-xl text-sm text-pink-800 font-medium">
          ⏳ Penjanaan berjalan di latar belakang. Tutup browser pun okay — semak semula nanti.
        </div>
      )}

      {result && !result.error && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl ring-1 ring-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-sm font-bold text-green-700">{result.message}</p>
        </div>
      )}

      {result?.error && (
        <div className="mt-4 p-4 bg-red-50 rounded-xl ring-1 ring-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{result.error}</p>
        </div>
      )}
    </motion.div>
  );
}