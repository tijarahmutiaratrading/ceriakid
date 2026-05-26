// Affiliate tier configuration — single source of truth untuk frontend & backend
// Tier dikira berdasarkan totalReferrals (lifetime).
// Auto-upgrade berlaku dalam chipWebhook setiap kali ada referral baru.

export const TIERS = [
  {
    key: 'bronze',
    name: 'Bronze',
    emoji: '🥉',
    minReferrals: 0,
    maxReferrals: 9,
    subscriptionRate: 20,
    creditRate: 15,
    color: 'from-amber-700 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-800',
    perks: ['20% komisen subscription', '15% komisen kredit AI'],
  },
  {
    key: 'silver',
    name: 'Silver',
    emoji: '🥈',
    minReferrals: 10,
    maxReferrals: 29,
    subscriptionRate: 23,
    creditRate: 17,
    color: 'from-slate-400 to-slate-600',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-700',
    perks: ['23% komisen subscription', '17% komisen kredit AI', 'Priority support'],
  },
  {
    key: 'gold',
    name: 'Gold',
    emoji: '🥇',
    minReferrals: 30,
    maxReferrals: 99,
    subscriptionRate: 26,
    creditRate: 19,
    color: 'from-yellow-400 to-amber-500',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    perks: ['26% komisen subscription', '19% komisen kredit AI', 'Priority support', 'Bulanan payout pantas'],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    minReferrals: 100,
    maxReferrals: Infinity,
    subscriptionRate: 30,
    creditRate: 22,
    color: 'from-violet-500 via-fuchsia-500 to-pink-500',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-800',
    perks: ['30% komisen subscription', '22% komisen kredit AI', 'VIP support', 'Custom co-branding', 'Eksklusif promo materials'],
  },
];

export function calculateTier(totalReferrals = 0) {
  const tier = TIERS.find(t => totalReferrals >= t.minReferrals && totalReferrals <= t.maxReferrals);
  return tier || TIERS[0];
}

export function getTierByKey(key) {
  return TIERS.find(t => t.key === key) || TIERS[0];
}

export function getNextTier(currentTierKey) {
  const idx = TIERS.findIndex(t => t.key === currentTierKey);
  if (idx === -1 || idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
}