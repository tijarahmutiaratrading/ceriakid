import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Sparkles } from 'lucide-react';
import { calculateTier, getNextTier, TIERS } from '@/lib/affiliateTiers';

export default function AffiliateTierCard({ affiliate }) {
  const totalReferrals = affiliate.totalReferrals || 0;
  const currentTier = calculateTier(totalReferrals);
  const nextTier = getNextTier(currentTier.key);

  const progress = nextTier
    ? Math.min(100, ((totalReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100)
    : 100;

  const referralsToNext = nextTier ? nextTier.minReferrals - totalReferrals : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 sm:p-5 mb-6 bg-white border-2 border-slate-200 shadow-md overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${currentTier.color} opacity-10 blur-2xl`} />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier Anda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl">{currentTier.emoji}</span>
              <div className="min-w-0">
                <h3 className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${currentTier.color} bg-clip-text text-transparent truncate`}>
                  {currentTier.name}
                </h3>
                <p className="text-xs text-slate-500">{totalReferrals} jumlah rujukan</p>
              </div>
            </div>
          </div>

          {/* Rate badges */}
          <div className="flex flex-wrap gap-1.5 sm:flex-col sm:items-end sm:gap-1">
            <div className={`inline-block px-2.5 py-1 rounded-full ${currentTier.bgLight} ${currentTier.textColor} text-[11px] sm:text-xs font-black`}>
              {affiliate.commissionRateSubscription || currentTier.subscriptionRate}% Subscription
            </div>
            <div className={`inline-block px-2.5 py-1 rounded-full ${currentTier.bgLight} ${currentTier.textColor} text-[11px] sm:text-xs font-black`}>
              {affiliate.commissionRateCredit || currentTier.creditRate}% Kredit AI
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-bold text-slate-600">
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                Progress ke {nextTier.emoji} {nextTier.name}
              </span>
              <span className="font-black text-slate-900">
                {referralsToNext} rujukan lagi
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${nextTier.color} rounded-full`}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Naik ke <strong>{nextTier.name}</strong> untuk dapat <strong>{nextTier.subscriptionRate}%</strong> komisen subscription & <strong>{nextTier.creditRate}%</strong> kredit AI
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200">
            <div className="flex items-center gap-2 text-violet-700">
              <Sparkles className="w-4 h-4" />
              <p className="text-sm font-black">Anda sudah di tier tertinggi! 🎉</p>
            </div>
            <p className="text-xs text-violet-600 mt-0.5">Komisen maksimum dah anda dapat. Teruskan refer untuk pendapatan tanpa had!</p>
          </div>
        )}

        {/* All tiers preview */}
        <div className="border-t border-slate-100 pt-3 mt-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Semua Tier</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {TIERS.map(tier => {
              const isCurrent = tier.key === currentTier.key;
              const isPast = TIERS.findIndex(t => t.key === tier.key) < TIERS.findIndex(t => t.key === currentTier.key);
              return (
                <div
                  key={tier.key}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                    isCurrent
                      ? `${tier.bgLight} border-current ${tier.textColor} scale-[1.02] shadow-md`
                      : isPast
                        ? 'bg-emerald-50 border-emerald-200 opacity-80'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl flex-shrink-0">{tier.emoji}</div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-black truncate">{tier.name}</p>
                    <p className="text-[11px] sm:text-xs opacity-80 font-bold">{tier.subscriptionRate}% sub · {tier.creditRate}% kredit</p>
                    <p className="text-[10px] sm:text-[11px] opacity-70 mt-0.5">{tier.minReferrals}+ rujukan</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}