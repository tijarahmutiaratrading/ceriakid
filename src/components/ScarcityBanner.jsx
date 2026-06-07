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
        <div className="relative px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Harga promo tamat tengah malam ini!</p>
              <p className="text-white/80 text-[11px] font-semibold mt-0.5">Tawaran terbatas untuk 24 jam</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {[
              { label: 'j', value: timeLeft.hours },
              { label: 'm', value: timeLeft.minutes },
              { label: 's', value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center">
                <div className="bg-white/30 backdrop-blur px-2.5 py-2 rounded-lg min-w-[3rem] text-center">
                  <p className="text-white font-black text-base tabular-nums">{padZero(unit.value)}</p>
                  <p className="text-white/70 text-[9px] font-bold uppercase tracking-wide">{unit.label}</p>
                </div>
                {i < 2 && <p className="text-white font-black text-xl mx-1 opacity-60">:</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scarcity Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Live Viewers */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="rounded-xl px-4 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center">
            <Eye className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-emerald-700 font-black text-sm tabular-nums">{viewers}</p>
            <p className="text-emerald-600 text-[10px] font-semibold leading-tight">sedang lihat</p>
          </div>
        </motion.div>

        {/* Sold Today */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          className="rounded-xl px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="text-amber-700 font-black text-sm tabular-nums">{soldToday}</p>
            <p className="text-amber-600 text-[10px] font-semibold leading-tight">terjual hari ini</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}