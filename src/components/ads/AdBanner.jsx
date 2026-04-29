import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

/**
 * AdBanner - Google AdMob Integration
 * Only shows ads to free tier users
 * 
 * Setup:
 * 1. Get Google AdMob App ID from https://admob.google.com
 * 2. Create ad unit (banner) → Copy unit ID
 * 3. Set GOOGLE_ADMOB_APP_ID in env
 * 4. Use: <AdBanner unitId="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy" />
 */

export default function AdBanner({ unitId, position = 'bottom' }) {
  const { user } = useAuth();

  useEffect(() => {
    // Only load ads for free tier users
    if (!user || user.subscription?.tier !== 'free') return;

    // Load Google Mobile Ads SDK
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-xxxxxxxxxxxxxxxx';
      script.onload = () => {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      };
      document.head.appendChild(script);
    } else if (window.adsbygoogle) {
      window.adsbygoogle.push({});
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
          ? 'fixed bottom-0 left-0 right-0'
          : 'sticky top-0 pt-2 pb-2 bg-white border-b'
      }`}
      style={{ minHeight: '80px' }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '80px',
        }}
        data-ad-client="ca-app-pub-xxxxxxxxxxxxxxxx"
        data-ad-slot={unitId}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </div>
  );
}