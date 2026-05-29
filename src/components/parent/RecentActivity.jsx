import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

const categoryEmojis = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🧪',
  jawi: '🕌',
};

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
};

export default function RecentActivity({ games }) {
  const recent = [...games]
    .filter(g => g.lastPlayedDate)
    .sort((a, b) => new Date(b.lastPlayedDate) - new Date(a.lastPlayedDate))
    .slice(0, 5);

  if (recent.length === 0) return null;

  const timeAgo = (d) => {
    try {
      return formatDistanceToNow(new Date(d), { addSuffix: true });
    } catch {
      return 'baru-baru ini';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-5 space-y-3"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%)', boxShadow: '0 3px 0 #38bdf8' }}
        >
          ⏰
        </motion.div>
        <div>
          <p className="text-slate-800 text-base font-black leading-none">Aktiviti Terkini</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">5 game terakhir</p>
        </div>
      </div>
      <div className="space-y-2">
        {recent.map((game, i) => (
          <motion.div
            key={`${game.gameType}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl p-2.5"
            style={{ background: '#fef9f3', boxShadow: '0 2px 0 #fde68a' }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
            >
              {categoryEmojis[game.category] || '🎮'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-black text-sm truncate">{categoryLabels[game.category] || game.category}</p>
              <p className="text-slate-500 text-[10px] font-semibold">{timeAgo(game.lastPlayedDate)}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(s => (
                  <span key={s} className="text-xs" style={{ color: (game.bestStars || 0) >= s ? '#facc15' : '#e2e8f0' }}>★</span>
                ))}
              </div>
              <p className="text-slate-500 text-[10px] font-bold">{game.timesPlayed || 0}×</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}