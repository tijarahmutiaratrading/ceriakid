import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library, Sparkles, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NOTE_SUBJECTS, NOTE_LEVELS, getSubjectMeta, getLevelMeta } from '@/lib/libraryConfig';

// Panel admin untuk jana & topup nota Library Hub guna AI.
export default function LibraryGeneratorPanel() {
  const [subject, setSubject] = useState('science');
  const [level, setLevel] = useState('darjah_1');
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    const list = await base44.entities.StudyNote.list('-created_date', 200).catch(() => []);
    setNotes(list || []);
    setLoading(false);
  };

  useEffect(() => { loadNotes(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const res = await base44.functions.invoke('generateStudyNote', { subject, level, topic: topic.trim() });
      if (res?.data?.success) {
        setMessage({ type: 'ok', text: `Nota "${res.data.note.title}" berjaya dijana!` });
        setTopic('');
        loadNotes();
      } else {
        setMessage({ type: 'err', text: res?.data?.error || 'Gagal jana nota.' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: e.message || 'Ralat berlaku.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.StudyNote.delete(id);
    loadNotes();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Generator card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Library className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Library Hub — Jana Nota</h2>
            <p className="text-xs text-slate-500 font-medium">Jana nota ringkas + mind map ikut silibus KSSR</p>
          </div>
        </div>

        {/* Subjek */}
        <p className="text-[11px] font-black text-slate-500 uppercase mb-2">Subjek</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {NOTE_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubject(s.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${subject === s.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Tahap */}
        <p className="text-[11px] font-black text-slate-500 uppercase mb-2">Tahap</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {NOTE_LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${level === l.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Topik opsyenal */}
        <p className="text-[11px] font-black text-slate-500 uppercase mb-2">Topik (opsyenal)</p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Kosongkan untuk biar AI pilih topik silibus"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium mb-4 focus:ring-2 focus:ring-purple-300 outline-none"
        />

        {message && (
          <div className={`mb-4 rounded-xl p-3 text-xs font-bold flex items-center gap-2 ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'ok' && <CheckCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-sm transition-colors disabled:opacity-60"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Menjana nota...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Jana Nota Sekarang</>
          )}
        </button>
      </div>

      {/* Senarai nota sedia ada */}
      <div className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900">Nota dalam Library ({notes.length})</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-slate-400 animate-spin" /></div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-400 font-bold text-center py-6">Belum ada nota. Jana yang pertama!</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notes.map((n) => (
              <div key={n.id} className="flex items-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                <span className="text-2xl">{n.emoji || '📘'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{n.title}</p>
                  <p className="text-[11px] text-slate-500 font-bold">{getSubjectMeta(n.subject)?.label} · {getLevelMeta(n.level)?.label}</p>
                </div>
                <button onClick={() => handleDelete(n.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}