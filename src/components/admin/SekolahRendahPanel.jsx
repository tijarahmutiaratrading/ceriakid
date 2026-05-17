import React from 'react';

const DARJAH_LEVELS = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
const DARJAH_LABELS = { darjah_1: 'D1', darjah_2: 'D2', darjah_3: 'D3', darjah_4: 'D4', darjah_5: 'D5', darjah_6: 'D6' };

export default function SekolahRendahPanel({
  sekolahRendahMaster,
  setSekolahRendahMaster,
  applySekolahRendahMaster,
  SUBJECT_CONFIG,
  selectedSubjects,
  toggleSubject,
  currentCounts,
  darjahSubjectGameConfig,
  setDarjahSubjectGameConfig,
  darjahSubjectQuestionConfig,
  setDarjahSubjectQuestionConfig,
}) {
  return (
    <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-3 md:rounded-[1.5rem] md:p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-black text-sm">🎒 Sekolah Rendah</p>
      </div>
      <div className="mb-4 rounded-2xl border border-white/10 bg-slate-950/20 p-3">
        <p className="text-white/60 text-[10px] font-black uppercase mb-2">Master Sekolah Rendah</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="number" min="0" max="100" value={sekolahRendahMaster.games} onChange={e => setSekolahRendahMaster(m => ({ ...m, games: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Games" />
          <input type="number" min="1" max="50" value={sekolahRendahMaster.questions} onChange={e => setSekolahRendahMaster(m => ({ ...m, questions: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Soalan" />
        </div>
        <button onClick={applySekolahRendahMaster} className="w-full py-2 rounded-xl bg-cyan-300 text-cyan-950 text-xs font-black">Apply ke semua SR D1-D6</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUBJECT_CONFIG.filter(s => s.ageGroup === 'sekolah_rendah').map(sc => {
          const key = `${sc.ageGroup}-${sc.subject}`;
          const sel = selectedSubjects.has(key);
          return (
            <div key={key} className={`p-3 rounded-2xl border transition-all ${sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/[0.045] text-white border-white/10 hover:bg-white/[0.075]'}`}>
              <button onClick={() => toggleSubject(key)} className="w-full flex items-center gap-2 text-left">
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black ${sel ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>{sel ? '✓' : '+'}</span>
                <span className="font-black text-xs truncate">{sc.label.replace('Sekolah Rendah - ', '')}</span>
              </button>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {DARJAH_LEVELS.map(darjah => {
                  const currDarjah = currentCounts[key]?.darjah?.[darjah] || { games: 0, avgQuestions: 0 };
                  return (
                    <div key={darjah} className={`rounded-xl px-2 py-1.5 text-center ${sel ? 'bg-indigo-50' : 'bg-slate-950/20'}`}>
                      <p className={`text-[10px] font-black leading-none ${sel ? 'text-indigo-600' : 'text-white/55'}`}>{DARJAH_LABELS[darjah]}</p>
                      <p className={`mt-1 text-[10px] font-bold leading-none ${sel ? 'text-indigo-400' : 'text-white/35'}`}>{currDarjah.games}g · {currDarjah.avgQuestions}q</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Games / Darjah</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={darjahSubjectGameConfig[`${key}-darjah_1`] || 0}
                    onChange={e => {
                      const value = parseInt(e.target.value) || 0;
                      setDarjahSubjectGameConfig(c => ({ ...c, ...Object.fromEntries(DARJAH_LEVELS.map(darjah => [`${key}-${darjah}`, value])) }));
                    }}
                    className={`w-full px-2 py-2 rounded-xl border font-black text-center outline-none ${sel ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Soalan / Game</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={darjahSubjectQuestionConfig[`${key}-darjah_1`] || 0}
                    onChange={e => {
                      const value = parseInt(e.target.value) || 0;
                      setDarjahSubjectQuestionConfig(c => ({ ...c, ...Object.fromEntries(DARJAH_LEVELS.map(darjah => [`${key}-${darjah}`, value])) }));
                    }}
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