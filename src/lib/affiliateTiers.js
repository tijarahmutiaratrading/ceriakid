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
    subscriptionRate: 22,
    creditRate: 17,
    color: 'from-slate-400 to-slate-600',
    bgLight: 'bg-slate-50',
    textColor: 'text-slate-700',
    perks: ['22% komisen subscription', '17% komisen kredit AI', 'Priority support'],
  },
  {
    key: 'gold',
    name: 'Gold',
    emoji: '🥇',
    minReferrals: 30,
    maxReferrals: 99,
    subscriptionRate: 24,
    creditRate: 18,
    color: 'from-yellow-400 to-amber-500',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    perks: ['24% komisen subscription', '18% komisen kredit AI', 'Priority support', 'Bulanan payout pantas'],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    emoji: '💎',
    minReferrals: 100,
    maxReferrals: Infinity,
    subscriptionRate: 25,
    creditRate: 20,
    color: 'from-violet-500 via-fuchsia-500 to-pink-500',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-800',
    perks: ['25% komisen subscription', '20% komisen kredit AI', 'VIP support priority 24/7', 'Custom co-branding & landing page', 'Eksklusif promo materials & swag', 'Direct line ke founder'],
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