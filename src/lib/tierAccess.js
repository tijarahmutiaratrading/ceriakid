// IMPORTANT: 'gamesPerBucket' = max games per BUCKET accessible by tier.
// Bucket = darjah (untuk Sekolah Rendah) atau subject (untuk Prasekolah).
// Maksudnya setiap darjah & setiap prasekolah subject dapat quota sendiri,
// supaya user Asas/Standard dapat rasa semua darjah (bukan stuck Darjah 1-2 sahaja).
//
// 'free' = no active subscription (must subscribe to access app).
// 'premium' and 'pro' kept for legacy users only — DO NOT advertise.
export const TIER_LIMITS = {
  free:     { gamesPerBucket: 0,        devices: 0, children: 0 },
  asas:     { gamesPerBucket: 10,       devices: 1, children: 1 },
  standard: { gamesPerBucket: 25,       devices: 2, children: 1 },
  keluarga: { gamesPerBucket: Infinity, devices: 4, children: 4 },
  // Legacy tiers (existing customers only) — map to closest new tier
  premium:  { gamesPerBucket: 25,       devices: 2, children: 1 },
  pro:      { gamesPerBucket: Infinity, devices: 4, children: 4 },
};

export const getActiveTier = (subscription) => {
  const isExpired = subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
  if (!subscription || isExpired) return 'free';
  if (subscription.status === 'active') return subscription.tier || 'free';
  return 'free';
};

export const getTierLimit = (tier, key) => TIER_LIMITS[tier]?.[key] ?? TIER_LIMITS.free[key];

// Check if user has an active paid subscription (any tier except 'free').
export const hasActiveSubscription = (subscription) => {
  const tier = getActiveTier(subscription);
  return tier !== 'free';
};

// Per-bucket lock check. `index` mesti index DALAM bucket (0-based), bukan global index.
// Contoh: kalau Darjah 3 ada 30 games, indexnya 0..29 (bukan 100..129).
export const isGameIndexLocked = ({ index, tier = 'free', isAuthenticated = false }) => {
  if (!isAuthenticated) return index >= TIER_LIMITS.asas.gamesPerBucket;
  const limit = getTierLimit(tier, 'gamesPerBucket');
  return Number.isFinite(limit) ? index >= limit : false;
};