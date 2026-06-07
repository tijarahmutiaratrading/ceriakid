import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';

const categoryEmojis = {
  bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢', science: '🧪', jawi: '🕌',
};
const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English',
  mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi',
};

export default function RecentActivity({ games }) {
  const recent = [...games]
    .filter(g => g.lastPlayedDate)
    .sort((a, b) => new Date(b.lastPlayedDate) - new Date(a.lastPlayedDate))
    .slice(0, 5);

  if (recent.length === 0) return null;

  const timeAgo = (d) => {
    try { return formatDistanceToNow(new Date(d), { addSuffix: true }); }
    catch { return 'baru-baru ini'; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-slate-900 text-sm font-black leading-none">Aktiviti Terkini</p>
          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">5 game terakhir</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {recent.map((game, i) => (
          <motion.div
            key={`${game.gameType}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-5 py-3"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
              {categoryEmojis[game.category] || '🎮'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-bold text-sm truncate">{categoryLabels[game.category] || game.category}</p>
              <p className="text-slate-400 text-[11px] font-medium">{timeAgo(game.lastPlayedDate)}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-sm ${(game.bestStars || 0) >= s ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                ))}
              </div>
              <p className="text-slate-400 text-[10px] font-semibold">{game.timesPlayed || 0}×</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}