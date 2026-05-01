import React from 'react';
import { motion } from 'framer-motion';

export default function SubjectBreakdown({ progress }) {
  const subjects = [
    { name: 'Bahasa Melayu', emoji: '🇲🇾', color: 'from-green-400 to-emerald-500' },
    { name: 'English', emoji: '🇬🇧', color: 'from-blue-400 to-cyan-500' },
    { name: 'Matematik', emoji: '🔢', color: 'from-orange-400 to-red-500' },
    { name: 'Sains', emoji: '🧪', color: 'from-purple-400 to-pink-500' },
  ];

  const getSubjectData = (subject) => {
    const games = progress.filter(p => p.category === subject);
    if (games.length === 0) return { avg: 0, count: 0 };

    const avgStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0) / games.length;
    return { avg: Math.round(avgStars * 100) / 100, count: games.length };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black mb-4">Prestasi Mengikut Mata Pelajaran</h3>
      {subjects.map((subject, i) => {
        const data = getSubjectData(subject.name.toLowerCase().replace(' ', '_'));
        const percentage = (data.avg / 3) * 100 || 0;

        return (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4 bg-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{subject.emoji}</span>
                <div>
                  <p className="font-bold">{subject.name}</p>
                  <p className="text-xs text-gray-600">{data.count} permainan</p>
                </div>
              </div>
              <span className="font-black text-2xl text-game-purple">
                {data.avg.toFixed(1)}/3
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`h-full bg-gradient-to-r ${subject.color}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}