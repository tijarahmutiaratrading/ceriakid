import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Play, Star } from 'lucide-react';

export default function ArcadeCategoryCard({ category, index, count, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.035, y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="h-full"
    >
      <Link to={`/mini-games/${category.id}`} className="group block h-full">
        <div className="relative h-full min-h-56 overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/50 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_80%_100%,rgba(0,0,0,0.35),transparent_34%)]" />
          <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black text-white ring-1 ring-white/25">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : `${count} games`}
          </div>

          <div className="relative flex h-full flex-col justify-between rounded-[1.55rem] bg-white/10 p-4 shadow-inner shadow-white/10 ring-1 ring-white/20">
            <div>
              <motion.div
                animate={{ y: [0, -7, 0], rotate: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 4 + index * 0.2 }}
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/25 text-5xl shadow-xl shadow-black/20"
              >
                {category.emoji}
              </motion.div>
              <div className="mb-2 flex items-center gap-1 text-yellow-200 drop-shadow">
                {[0, 1, 2, 3, 4].map(item => <Star key={item} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <h3 className="text-xl font-black leading-tight text-white drop-shadow">{category.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-snug text-white/82">{category.objective}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/18 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white ring-1 ring-white/20">Arcade</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-purple-700 shadow-xl transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}