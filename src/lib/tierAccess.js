// IMPORTANT: 'games' = max games per category accessible by tier.
// Tiers below match what's actually sold on the Landing page.
// 'premium' and 'pro' kept for legacy users only — DO NOT advertise.
export const TIER_LIMITS = {
  free: { games: 5, devices: 1, children: 1 },
  asas: { games: 50, devices: 1, children: 1 },
  standard: { games: 100, devices: 2, children: 1 },
  keluarga: { games: 200, devices: 4, children: 4 },
  // Legacy tiers (existing customers only)
  premium: { games: 100, devices: 2, children: 1 },
  pro: { games: 200, devices: 4, children: 4 },
};

export const getActiveTier = (subscription) => {
  const isExpired = subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
  if (!subscription || isExpired) return 'free';
  if (subscription.status === 'active') return subscription.tier || 'free';
  return 'free';
};

export const getTierLimit = (tier, key) => TIER_LIMITS[tier]?.[key] ?? TIER_LIMITS.free[key];

export const isGameIndexLocked = ({ index, tier = 'free', isAuthenticated = false }) => {
  if (!isAuthenticated) return index >= TIER_LIMITS.free.games;
  const limit = getTierLimit(tier, 'games');
  return Number.isFinite(limit) ? index >= limit : false;
};