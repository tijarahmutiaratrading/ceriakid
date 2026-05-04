import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'monthlyGenSettings';

export default function MonthlyGenSettings({ onToast }) {
  const [games, setGames] = useState(20);
  const [questions, setQuestions] = useState(20);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGames(parsed.games || 20);
      setQuestions(parsed.questions || 20);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ games, questions }));
    onToast('✅ Tetapan disimpan! Akan digunakan bulan depan.');
  };

  const handleTestRun = async () => {
    if (!window.confirm(`Ini akan PADAM games lama dan QUEUE ${games} games baru untuk semua subjek. Teruskan?`)) return;
    setTesting(true);
    try {
      const res = await base44.functions.invoke('generateMonthlyFreshQuestions', {});
      const d = res.data;
      onToast(`✅ Done! Deleted: ${d.deleted} | Queued: ${d.queued} subjek`);
    } catch (err) {
      onToast('❌ ' + err.message, false);
    }
    setTesting(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-6 rounded-3xl mb-5" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <h2 className="font-black text-white mb-1">⚙️ Tetapan Auto-Generate Bulanan</h2>
        <p className="text-white/50 text-xs mb-5">Dijalankan automatik pada 1hb setiap bulan</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">🎮 Games per Subjek</label>
            <input
              type="number" min="1" max="50" value={games}
              onChange={e => setGames(parseInt(e.target.value) || 1)}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-2xl text-center"
            />
          </div>
          <div>
            <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">📝 Soalan per Game</label>
            <input
              type="number" min="5" max="50" value={questions}
              onChange={e => setQuestions(parseInt(e.target.value) || 5)}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-2xl text-center"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <p className="text-white/60 text-xs font-semibold mb-3 text-center">📊 Anggaran setiap bulan</p>

          <div className="space-y-2 text-xs mb-3">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-white/60">🌱 Asas — Prasekolah sahaja</span>
              <span className="text-green-300 font-black">6 subjek × {games} games</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-white/60">⭐ Standard — Sekolah Rendah sahaja</span>
              <span className="text-blue-300 font-black">7 subjek × {games} games</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="text-white/60">👑 Keluarga — Semua peringkat</span>
              <span className="text-yellow-300 font-black">Akses semua 13 subjek</span>
            </div>
          </div>

          <div className="text-center border-t border-white/10 pt-3">
            <p className="text-white font-black text-base">13 subjek × {games} games × {questions} soalan</p>
            <p className="text-yellow-300 font-black text-xl mt-0.5">= {(13 * games * questions).toLocaleString()} soalan total</p>
            <p className="text-white/30 text-xs mt-1">Games dikunci ikut pakej user — tapi digenerate untuk semua</p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
          >
            <Save className="w-4 h-4" /> Simpan Tetapan
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
            onClick={handleTestRun}
            disabled={testing}
            className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Sekarang
          </motion.button>
        </div>

        <p className="text-white/30 text-xs text-center mt-3">
          ⚠️ "Run Sekarang" akan padam games lama dan queue games baru
        </p>
      </div>

      {/* Info box */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/70 text-xs font-black mb-2">📅 Rotation Policy</p>
        <div className="space-y-1 text-xs text-white/50">
          <p>• <span className="text-green-300 font-bold">Bulan semasa</span> — games baru digenerate</p>
          <p>• <span className="text-blue-300 font-bold">Bulan lepas</span> — masih ada (user boleh main)</p>
          <p>• <span className="text-red-300 font-bold">2 bulan ke belakang</span> — didelete automatik</p>
          <p>• <span className="text-white/40">Games manual (tiada tag)</span> — tidak didelete</p>
        </div>
      </div>
    </motion.div>
  );
}