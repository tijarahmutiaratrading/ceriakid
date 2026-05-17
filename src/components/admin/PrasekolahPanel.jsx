import React from 'react';

export default function PrasekolahPanel({
  prasekolahMaster,
  setPrasekolahMaster,
  applyPrasekolahMaster,
  SUBJECT_CONFIG,
  selectedSubjects,
  toggleSubject,
  currentCounts,
  categoryGameConfig,
  setCategoryGameConfig,
  categoryQuestionConfig,
  setCategoryQuestionConfig,
}) {
  return (
    <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-3 md:rounded-[1.5rem] md:p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-black text-sm">🧒 Prasekolah</p>
      </div>
      <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/20 p-3">
        <p className="text-white/60 text-[10px] font-black uppercase mb-2">Master Prasekolah</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" min="0" max="100" value={prasekolahMaster.games} onChange={e => setPrasekolahMaster(m => ({ ...m, games: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Games" />
          <input type="number" min="1" max="50" value={prasekolahMaster.questions} onChange={e => setPrasekolahMaster(m => ({ ...m, questions: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Soalan" />
        </div>
        <button onClick={applyPrasekolahMaster} className="w-full py-2 rounded-xl bg-yellow-300 text-yellow-950 text-xs font-black">Apply ke semua Prasekolah</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUBJECT_CONFIG.filter(s => s.ageGroup === 'prasekolah').map(sc => {
          const key = `${sc.ageGroup}-${sc.subject}`;
          const sel = selectedSubjects.has(key);
          const curr = currentCounts[key] || { games: 0, avgQuestions: 0 };
          const targetGames = categoryGameConfig[key] || 0;
          const gameDiff = targetGames - curr.games;
          return (
            <div key={key} className={`p-3 rounded-2xl border transition-all ${sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/[0.045] text-white border-white/10 hover:bg-white/[0.075]'}`}>
              <button onClick={() => toggleSubject(key)} className="w-full flex items-center gap-2 text-left">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black ${sel ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>{sel ? '✓' : '+'}</span>
                <span className="font-black text-xs truncate">{sc.label.replace('Prasekolah - ', '')}</span>
              </button>
              <p className={`mt-2 text-[11px] font-bold ${sel ? 'text-indigo-500' : 'text-white/55'}`}>{curr.games} games ada · avg {curr.avgQuestions} soalan {gameDiff > 0 ? `· perlu +${gameDiff}` : gameDiff < 0 ? `· ✓ cukup (QC handle ${Math.abs(gameDiff)} lebih)` : '· ✓ cukup'}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Games</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetGames}
                    onChange={e => setCategoryGameConfig(c => ({ ...c, [key]: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-2 py-2 rounded-xl border font-black text-center outline-none ${sel ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Soalan</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={categoryQuestionConfig[key] || 0}
                    onChange={e => setCategoryQuestionConfig(c => ({ ...c, [key]: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-2 py-2 rounded-xl border font-black text-center outline-none ${sel ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}