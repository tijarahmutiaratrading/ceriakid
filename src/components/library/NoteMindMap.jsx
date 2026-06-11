import React from 'react';
import { motion } from 'framer-motion';
import { getNoteColor } from '@/lib/libraryConfig';

// Mind map visual berwarna-warni: topik tengah + cabang bersusun.
export default function NoteMindMap({ mindMap }) {
  if (!mindMap?.central) return null;
  const branches = mindMap.branches || [];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-purple-50 ring-1 ring-purple-100 p-4 sm:p-6">
      {/* Topik tengah */}
      <div className="flex justify-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-6 py-3 rounded-full brand-gradient text-white font-black text-lg sm:text-xl shadow-lg ring-4 ring-white text-center"
        >
          🧠 {mindMap.central}
        </motion.div>
      </div>

      {/* Cabang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {branches.map((branch, i) => {
          const c = getNoteColor(branch.color);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${c.grad} px-3 py-2 flex items-center gap-2`}>
                <span className="text-xl">{branch.emoji}</span>
                <span className="font-black text-white text-sm">{branch.label}</span>
              </div>
              <ul className="p-3 space-y-1.5">
                {(branch.children || []).map((child, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${c.solid}`} />
                    <span className="text-slate-700 font-bold text-sm leading-snug">{child}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}