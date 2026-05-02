import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Users, Edit3, Layers } from 'lucide-react';

export default function SubjectSection({ idx, label, ageGroup, subject, color, games, isExpanded, onToggle, onBulkEdit, onEditGame }) {
  const avgQ = games.length > 0
    ? Math.round(games.reduce((a, g) => a + (g.totalQuestions || 0), 0) / games.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${color.border} mb-3 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 text-left">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
          <div>
            <p className="font-black text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-400">{games.length} games · avg {avgQ} soalan</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color.badge}`}>{games.length}</span>

          {/* Bulk Edit */}
          <button
            onClick={onBulkEdit}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 transition-all flex items-center gap-1"
            title="Bulk edit semua games"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-xs font-bold hidden sm:inline">Bulk</span>
          </button>

          <button onClick={onToggle} className="p-1">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Games list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Nama Game</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2 text-center">Soalan</span>
              <span className="col-span-2 text-center">Edit</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {games.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Tiada games dalam database</div>
              ) : (
                games.map((g, i) => (
                  <div key={g.id} className="grid grid-cols-12 gap-1 items-center px-4 py-2.5 hover:bg-gray-50 transition-all">
                    <span className="col-span-1 text-xs font-bold text-gray-300">{i + 1}</span>
                    <span className="col-span-5 text-xs font-semibold text-gray-800 truncate">{g.title}</span>
                    <span className="col-span-2 text-xs text-gray-400 truncate">{g.type}</span>
                    <div className="col-span-2 flex justify-center">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        (g.totalQuestions || 0) >= 20 ? 'bg-green-100 text-green-700' :
                        (g.totalQuestions || 0) >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>{g.totalQuestions || 0}</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => onEditGame(g)}
                        className="p-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 rounded-lg transition-all"
                        title="Edit game ini"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}