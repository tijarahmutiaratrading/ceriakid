import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GameIconGeneratorPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (overwrite = false) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('generateGameIcons', { overwrite });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.message });
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
        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-base">AI Game Icons Generator</h2>
          <p className="text-xs text-slate-500 font-medium">Generate icon cantik untuk setiap game card</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Generate AI icon (Pixar-style) untuk semua games yang <strong>belum ada icon</strong>. 
        Icon disimpan terus dalam database dan akan dipaparkan pada game card.
      </p>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleGenerate(false)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate Icons (Baru Sahaja)'}
        </button>
        <button
          onClick={() => handleGenerate(true)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all disabled:opacity-60"
        >
          Regenerate Semua (Overwrite)
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800 font-medium">
          ⏳ Sedang generate icons... Ini mungkin ambil beberapa minit bergantung jumlah games.
        </div>
      )}

      {result && !result.error && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl ring-1 ring-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm font-bold text-green-700">{result.message}</p>
          </div>
          {result.errors?.length > 0 && (
            <p className="text-xs text-red-600 mt-1">{result.errors.join(', ')}</p>
          )}
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