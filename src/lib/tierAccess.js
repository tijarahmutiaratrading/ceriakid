export const TIER_LIMITS = {
  free: { games: 5, devices: 1, children: 1 },
  trial: { games: Infinity, devices: 1, children: 1 },
  asas: { games: 50, devices: 1, children: 1 },
  standard: { games: 100, devices: 2, children: 1 },
  premium: { games: 100, devices: 2, children: 1 },
  keluarga: { games: Infinity, devices: 4, children: 4 },
  pro: { games: Infinity, devices: 4, children: 4 },
};

export const getActiveTier = (subscription) => {
  const isExpired = subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
  if (!subscription || isExpired) return 'free';
  if (subscription.status === 'active' || subscription.status === 'trial') return subscription.tier || 'free';
  return 'free';
};

export const getTierLimit = (tier, key) => TIER_LIMITS[tier]?.[key] ?? TIER_LIMITS.free[key];

export const isGameIndexLocked = ({ index, tier = 'free', isAuthenticated = false }) => {
  if (!isAuthenticated) return index >= TIER_LIMITS.free.games;
  const limit = getTierLimit(tier, 'games');
  return Number.isFinite(limit) ? index >= limit : false;
};