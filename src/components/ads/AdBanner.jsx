import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * AdBanner - Facebook Ads Integration
 * Only shows ads to free tier users
 * 
 * Setup:
 * 1. Get Facebook App ID from https://developers.facebook.com
 * 2. Set FB_APP_ID in env
 * 3. Create audience segmentation in Ads Manager
 * 4. Use: <AdBanner position="bottom" />
 */

export default function AdBanner({ position = 'bottom' }) {
  const { user } = useAuth();

  useEffect(() => {
    // Only load FB SDK for free tier users
    if (!user || user.subscription?.tier !== 'free') return;

    // Load Facebook SDK
    window.fbAsyncInit = function() {
      if (window.FB) {
        window.FB.init({
          appId: import.meta.env.VITE_FB_APP_ID,
          xfbml: true,
          version: 'v18.0'
        });
      }
    };

    if (!window.FB) {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = 'https://connect.facebook.net/ms_MY/sdk.js#xfbml=1&version=v18.0&appId=' + import.meta.env.VITE_FB_APP_ID;
      document.body.appendChild(script);
    }
  }, [user]);

  // Don't show ads to premium/pro users
  if (user?.subscription?.tier !== 'free') {
    return null;
  }

  return (
    <div
      className={`w-full ${
        position === 'bottom'
          ? 'fixed bottom-0 left-0 right-0 z-40'
          : 'sticky top-0 pt-2 pb-2 bg-white border-b'
      }`}
    >
      <div
        className="fb-ad"
        data-placement-id="YOUR_PLACEMENT_ID"
        data-format="banner"
        data-height="250"
      />
    </div>
  );
}