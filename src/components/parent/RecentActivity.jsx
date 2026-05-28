import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

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
      className="rounded-3xl p-4 relative overflow-hidden isolate"
      style={{
        backgroundImage: "url('https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2612f0ef9_generated_image.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 20px 50px -15px rgba(126, 34, 206, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset',
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, rgba(67,56,202,0.82) 0%, rgba(126,34,206,0.72) 50%, rgba(190,24,93,0.8) 100%)' }} />
      <p className="text-white text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
        🕒 Aktiviti Terkini
      </p>
      <div className="space-y-2">
        {recent.map((game, i) => (
          <motion.div
            key={`${game.gameType}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl p-2.5 bg-white/12 border border-white/20"
          >
            <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center text-xl flex-shrink-0">
              {categoryEmojis[game.category] || '🎮'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm truncate">{categoryLabels[game.category] || game.category}</p>
              <p className="text-white/70 text-[10px] font-semibold">{timeAgo(game.lastPlayedDate)}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex gap-0.5">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-xs ${(game.bestStars || 0) >= s ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                ))}
              </div>
              <p className="text-white/70 text-[10px] font-bold">{game.timesPlayed || 0}×</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}