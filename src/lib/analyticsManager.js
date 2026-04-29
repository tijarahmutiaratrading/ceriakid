// Track custom events for analytics
export const trackEvent = (eventName, properties = {}) => {
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', eventName, properties);
  }

  // Base44 Analytics
  try {
    import('@/api/base44Client').then(m => {
      m.base44.analytics.track({
        eventName,
        properties,
      });
    });
  } catch (e) {
    console.log('Analytics not available');
  }
};

// Track game completion
export const trackGameCompletion = (gameTitle, score, total, stars) => {
  trackEvent('GameCompleted', {
    game: gameTitle,
    score,
    total,
    stars,
    percentage: Math.round((score / total) * 100),
  });
};

// Track purchase
export const trackPurchase = (tier, price, currency = 'MYR') => {
  trackEvent('Purchase', {
    value: price,
    currency,
    content_type: 'subscription',
    content_name: tier,
  });
};

// Track achievement unlock
export const trackAchievementUnlock = (badgeName, badgeId) => {
  trackEvent('AchievementUnlock', {
    achievement: badgeName,
    achievement_id: badgeId,
  });
};

// Track referral
export const trackReferral = (friendEmail) => {
  trackEvent('Referral', {
    referred_user: friendEmail,
  });
};

// Track app update
export const trackAppUpdate = (fromVersion, toVersion) => {
  trackEvent('AppUpdate', {
    from_version: fromVersion,
    to_version: toVersion,
  });
};