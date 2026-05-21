import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Clock, Lock, CreditCard } from 'lucide-react';

/**
 * Banner amaran tempoh langganan untuk Home / Dashboard.
 * - Tunjuk amaran kuning bila ≤ 30 hari
 * - Tunjuk amaran oren bila ≤ 7 hari
 * - Tunjuk amaran merah bila EXPIRED (semua games & features locked)
 * - Sembunyi untuk tier 'free' atau jika lebih 30 hari lagi.
 */
export default function SubscriptionExpiryBanner({ userEmail }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    base44.entities.UserSubscription.filter({ email: userEmail })
      .then(subs => setSubscription(subs?.[0] || null))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, [userEmail]);

  if (loading || !subscription) return null;
  if (subscription.tier === 'free') return null;
  if (!subscription.currentPeriodEnd) return null;

  const endDate = new Date(subscription.currentPeriodEnd);
  const today = new Date();
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;

  // Tak perlu tunjuk apa-apa kalau masih > 30 hari
  if (!isExpired && daysLeft > 30) return null;

  let bg, icon, title, message;
  if (isExpired) {
    bg = 'from-red-500 via-rose-600 to-red-700';
    icon = <Lock className="w-7 h-7 text-white" />;
    title = '🔒 Langganan Tamat Tempoh';
    message = `Tarikh tamat: ${endDate.toLocaleDateString('ms-MY')}. Semua games & features dikunci. Perbaharui sekarang untuk teruskan akses.`;
  } else if (daysLeft <= 7) {
    bg = 'from-orange-500 via-red-500 to-pink-600';
    icon = <AlertTriangle className="w-7 h-7 text-white animate-pulse" />;
    title = `⚠️ ${daysLeft} hari lagi sebelum tamat tempoh!`;
    message = `Langganan akan tamat pada ${endDate.toLocaleDateString('ms-MY')}. Perbaharui sekarang untuk elak terputus akses.`;
  } else {
    bg = 'from-amber-400 via-yellow-500 to-orange-500';
    icon = <Clock className="w-7 h-7 text-white" />;
    title = `📅 ${daysLeft} hari lagi`;
    message = `Langganan tamat pada ${endDate.toLocaleDateString('ms-MY')}. Perbaharui awal untuk akses tanpa gangguan.`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r ${bg}`}
    >
      <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm sm:text-base leading-tight">{title}</p>
          <p className="text-white/90 text-xs sm:text-sm font-semibold mt-0.5 leading-snug">{message}</p>
        </div>
        <Link to="/" className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 sm:px-5 py-2.5 bg-white text-red-600 rounded-full font-black text-xs sm:text-sm shadow-lg hover:bg-white/95 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Perbaharui
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}