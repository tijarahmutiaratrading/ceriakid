import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Flame, TrendingUp } from 'lucide-react';

export default function ScarcityBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [viewers, setViewers] = useState(0);
  const [soldToday, setSoldToday] = useState(0);

  // Calculate midnight countdown (tonight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live metrics with slight variations
  useEffect(() => {
    const randomizeMetrics = () => {
      setViewers(Math.floor(Math.random() * 15) + 18); // 18-32
      setSoldToday(Math.floor(Math.random() * 12) + 35); // 35-46
    };

    randomizeMetrics();
    const interval = setInterval(randomizeMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const padZero = (num) => String(num).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 mb-5"
    >
      {/* Countdown Timer Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 opacity-95" />
        <div className="relative px-3 sm:px-5 py-3 sm:py-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center animate-pulse flex-shrink-0">
              <Flame className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-[11px] sm:text-sm leading-tight sm:hidden truncate">Harga promo tamat ...</p>
              <p className="text-white font-black text-xs sm:text-sm leading-snug hidden sm:block">Harga promo tamat<br/>tengah malam ini!</p>
              <p className="text-white/80 text-[9px] sm:text-[11px] font-semibold mt-0.5 leading-tight hidden sm:block">Tawaran terbatas 24 jam</p>
            </div>
          </div>
          
          <div className="flex gap-1.5 sm:gap-2 items-center justify-end flex-grow sm:flex-grow-0">
            {[
              { value: timeLeft.hours },
              { value: timeLeft.minutes },
              { value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={i} className="flex items-center gap-0.5 sm:gap-1">
                <div className="bg-white/25 backdrop-blur w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <p className="text-white font-black text-sm sm:text-base tabular-nums">{padZero(unit.value)}</p>
                </div>
                {i < 2 && <p className="text-white font-black text-xs sm:text-sm">:</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scarcity Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Live Viewers */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-2 sm:gap-3"
        >
          <div className="flex-shrink-0 w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-emerald-200 flex items-center justify-center">
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-emerald-700 font-black text-xs sm:text-sm tabular-nums">{viewers}</p>
            <p className="text-emerald-600 text-[9px] sm:text-[10px] font-semibold leading-tight">sedang lihat</p>
          </div>
        </motion.div>

        {/* Sold Today */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          className="rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-2 sm:gap-3"
        >
          <div className="flex-shrink-0 w-6 sm:w-7 h-6 sm:h-7 rounded-lg bg-amber-200 flex items-center justify-center">
            <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="text-amber-700 font-black text-xs sm:text-sm tabular-nums">{soldToday}</p>
            <p className="text-amber-600 text-[9px] sm:text-[10px] font-semibold leading-tight">terjual hari ini</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}