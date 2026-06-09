import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryConfigs = {
  bahasa_melayu: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a82b01ff6_generated_image.png', label: 'Bahasa Melayu', color: 'from-amber-300 to-yellow-400', accentBg: 'bg-amber-100/30' },
  english: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8ffcc1bb9_generated_image.png', label: 'English', color: 'from-sky-300 to-blue-400', accentBg: 'bg-sky-100/30' },
  mathematics: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b948e01dd_generated_image.png', label: 'Matematik', color: 'from-pink-300 to-rose-400', accentBg: 'bg-pink-100/30' },
  science: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6f0853b3a_generated_image.png', label: 'Sains', color: 'from-emerald-300 to-green-400', accentBg: 'bg-emerald-100/30' },
  jawi: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/110e1698a_generated_image.png', label: 'Aksara Jawi', color: 'from-purple-300 to-indigo-400', accentBg: 'bg-purple-100/30' },
  pendidikan_islam: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/36da49399_generated_image.png', label: 'Pendidikan Islam', color: 'from-emerald-400 via-teal-500 to-green-600', accentBg: 'bg-emerald-100/30' },
  pendidikan_moral: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d8ef5568b_generated_image.png', label: 'Pendidikan Moral', color: 'from-rose-300 via-pink-400 to-fuchsia-500', accentBg: 'bg-rose-100/30' },
  sejarah: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/277b4c5c5_generated_image.png', label: 'Sejarah', color: 'from-amber-400 via-orange-500 to-red-500', accentBg: 'bg-amber-100/30' },
  rbt: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/007f4d767_generated_image.png', label: 'Reka Bentuk & Teknologi', color: 'from-slate-400 via-cyan-500 to-blue-600', accentBg: 'bg-cyan-100/30' },
  pjk: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d87962ebb_generated_image.png', label: 'PJ & Kesihatan', color: 'from-lime-400 via-green-500 to-emerald-600', accentBg: 'bg-lime-100/30' },
  seni: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1712fcc91_generated_image.png', label: 'Seni Visual', color: 'from-fuchsia-400 via-purple-500 to-indigo-600', accentBg: 'bg-fuchsia-100/30' },
  worksheet: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/5e14e4531_generated_image.png', label: 'Worksheet', color: 'from-orange-300 to-amber-400', accentBg: 'bg-orange-100/30' },
  bahasa_tamil: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1dac8b0f4_generated_image.png', label: 'Bahasa Tamil', color: 'from-orange-300 to-red-400', accentBg: 'bg-orange-100/30' },
  bahasa_mandarin: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/477e24964_generated_image.png', label: 'Bahasa Mandarin', color: 'from-red-300 to-pink-400', accentBg: 'bg-red-100/30' },
  // KAFA — single hub card (klik → /kafa, dalam tu pecah jadi 7 subjek UPKK)
  kafa: { image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/35db5430c_generated_image.png', emoji: '🕌', label: 'KAFA', subtitle: 'Kelas Agama Fardhu Ain · 7 Subjek UPKK', color: 'from-emerald-500 via-teal-500 to-indigo-600', accentBg: 'bg-emerald-100/30' },
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  if (!config) return null;

  const hasImage = Boolean(config.image);
  const linkTo = category === 'kafa' ? '/kafa' : `/games/${category}`;

  return (
    <Link to={linkTo}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-[2rem] overflow-hidden cursor-pointer h-full min-h-[160px] sm:min-h-[200px] group relative border border-white/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-shadow transform-gpu [clip-path:inset(0_round_2rem)]"
        >
        {/* Background — Image OR gradient (untuk KAFA yang takde image) */}
        {hasImage ? (
          <img src={config.image} alt={config.label} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${config.color} z-0`}>
            {/* Islamic geometric pattern overlay untuk KAFA */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 40%)'
            }} />
            {config.emoji && (
              <div className="absolute right-4 top-4 text-7xl sm:text-8xl opacity-30 group-hover:opacity-50 transition-opacity">
                {config.emoji}
              </div>
            )}
          </div>
        )}

        {/* Dark gradient only at bottom for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent z-[1]" />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg sm:text-xl md:text-2xl text-white leading-tight break-words drop-shadow-md">{config.label}</h3>
            {config.subtitle && (
              <p className="text-white/85 text-xs sm:text-sm font-bold mt-1 drop-shadow-md leading-snug">{config.subtitle}</p>
            )}
          </div>

          <div className="flex items-end justify-start gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black shadow-xl shadow-black/20 ring-1 ring-white/40 bg-gradient-to-br from-white/35 to-white/15 backdrop-blur-lg hover:from-white/45 hover:to-white/25 transition-all">
              <span className="text-base">🎮</span>
              <p className="text-xs text-white whitespace-nowrap leading-none font-bold">
                {gameCount} <span className="text-white/90">Game</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}