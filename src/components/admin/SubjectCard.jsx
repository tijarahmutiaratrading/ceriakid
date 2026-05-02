import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronRight, Users, Edit3, CheckCircle2 } from 'lucide-react';

const QUESTION_THRESHOLD = 20;

export default function SubjectCard({
  subject,
  isExpanded,
  onExpandToggle,
  actionLoading,
  onBulkEdit,
  onEditSubjectConfig,
  showToast,
  dbGamesCache,
  onVerify,
  onEditGame,
  onGenerateSubject,
  idx
}) {
  const { shortLabel, avgQ, totalPlayers } = useMemo(() => {
    const short = subject.label.replace('Prasekolah - ', '').replace('Sekolah Rendah - ', '');
    const avg = subject.games.length > 0 ? Math.round(subject.games.reduce((a, g) => a + g.questionCount, 0) / subject.games.length) : 0;
    const players = subject.games.reduce((a, g) => a + g.players, 0);
    return { shortLabel: short, avgQ: avg, totalPlayers: players };
  }, [subject]);

  return (
    <motion.div
      key={subject.file}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/30 border-l-4 ${subject.color.border} mb-3 overflow-hidden`}>
      
      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 gap-2">
        <button
          onClick={() => onExpandToggle(subject.file)}
          className="flex items-center gap-2 md:gap-3 flex-1 text-left min-w-0">
          
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${subject.color.dot}`} />
          <div className="min-w-0">
            <p className="font-black text-gray-900 text-xs md:text-sm truncate">{shortLabel}</p>
            <p className="text-xs text-gray-500 truncate">{subject.totalGames} games · {avgQ}q</p>
          </div>
        </button>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 flex-wrap justify-end">
          <span className={`text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-full ${subject.color.badge}`}>{subject.totalGames}</span>
          {totalPlayers > 0 &&
          <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center gap-1">
              <Users className="w-3 h-3" aria-label="Players" />{totalPlayers}
            </span>
          }
          
          <div className="hidden md:flex items-center gap-1">
          <button
          onClick={() => onEditSubjectConfig?.(subject.file, subject.label, subject.totalGames, avgQ, subject.ageGroup, subject.subject)}
          disabled={!!actionLoading || !onEditSubjectConfig}
          title="Edit games & questions count"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg border border-amber-200 text-xs font-bold disabled:opacity-50 transition-all">

          {actionLoading === `config-${subject.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
          Config
          </button>

          <button
          onClick={() => {
            const games = dbGamesCache[`${subject.ageGroup}-${subject.subject}`] || [];
            if (games.length === 0) {
              showToast('Import ke DB dulu', false);
              return;
            }
            onBulkEdit(games, subject.label, subject.ageGroup, subject.subject);
          }}
          disabled={!!actionLoading}
          title="Bulk edit all games"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 text-xs font-bold disabled:opacity-50 transition-all">

          {actionLoading === subject.file ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
          Manage
          </button>

          <button
          onClick={() => onGenerateSubject?.(subject.label, subject.ageGroup, subject.subject)}
          disabled={!!actionLoading}
          title="Generate games for this subject"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-200 text-xs font-bold disabled:opacity-50 transition-all">


          {actionLoading === `gen-${subject.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🎮'}
          Generate
          </button>

          <button
          onClick={() => onVerify(subject.file, subject.label, subject.ageGroup, subject.subject, dbGamesCache)}
          disabled={!!actionLoading}
          title="Verify questions" className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 text-xs font-bold disabled:opacity-50 transition-all hidden">


          {actionLoading === `verify-${subject.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Check
          </button>
          </div>

          <button onClick={() => onExpandToggle(isExpanded ? null : subject.file)} className="p-0.5 md:p-1 hover:bg-gray-100 rounded-lg transition-all">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded &&
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/30">
            <div className="hidden md:grid grid-cols-12 gap-1 px-4 py-2 bg-amber-50/50 text-xs font-bold text-gray-400 uppercase tracking-wide">
              <span className="col-span-1">#</span>
              <span className="col-span-3">Nama Game</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2 text-center">Soalan</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-1"></span>
            </div>
            <div className="max-h-52 md:max-h-64 overflow-y-auto">
              {subject.games.map((g) =>
            <div key={g.index} className="hidden md:grid grid-cols-12 gap-1 items-center px-4 py-2.5 border-b border-amber-100/50 hover:bg-white/30 transition-all">
                  <span className="col-span-1 text-xs font-bold text-gray-300">{g.index + 1}</span>
                  <span className="col-span-3 text-xs font-semibold text-gray-800 truncate">{g.title}</span>
                  <span className="col-span-2 text-xs text-gray-400 truncate">{g.type}</span>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${g.questionCount >= QUESTION_THRESHOLD ? 'bg-green-100 text-green-700' : g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{g.questionCount}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                g._raw?.status === 'ready' ? 'bg-green-100 text-green-700' :
                g._raw?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                g._raw?.status === 'not_ready' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'}`
                }>
                      {g._raw?.status === 'ready' ? '✅ Ready' :
                  g._raw?.status === 'in_progress' ? '⏳ In Progress' :
                  g._raw?.status === 'not_ready' ? '❌ Not Ready' :
                  '—'}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end pr-1">
                    {g._raw && <button onClick={() => onEditGame(g._raw)} className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all" title="Edit game ini"><Edit3 className="w-3 h-3" /></button>}
                  </div>
                </div>
            )}
              <div className="md:hidden space-y-2 p-3">
                {subject.games.map((g) =>
              <div key={g.index} className="bg-white/40 rounded-lg p-2.5 border border-amber-100/50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-800">{g.index + 1}. {g.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{g.type}</p>
                      </div>
                      {g._raw &&
                  <button onClick={() => onEditGame(g._raw)} className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all" title="Edit game ini">
                          <Edit3 className="w-3 h-3" />
                        </button>
                  }
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs font-black px-1.5 py-0.5 rounded-full text-xs ${g.questionCount >= QUESTION_THRESHOLD ? 'bg-green-100 text-green-700' : g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{g.questionCount}Q</span>
                      {g.players > 0 &&
                  <span className="text-xs font-bold text-pink-500 flex items-center gap-0.5">
                          <Users className="w-3 h-3" />{g.players}
                        </span>
                  }
                    </div>
                  </div>
              )}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>);

}