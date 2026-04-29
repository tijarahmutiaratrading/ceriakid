import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { X } from 'lucide-react';

export default function AdBanner({ position = 'bottom' }) {
  const { user } = useAuth();
  const [showAds, setShowAds] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [userTier, setUserTier] = useState('free');

  useEffect(() => {
    checkUserTier();
    initAdMob();
  }, [user]);

  const checkUserTier = async () => {
    if (!user) {
      setUserTier('free');
      setShowAds(true);
      return;
    }

    try {
      const { base44 } = await import('@/api/base44Client');
      const subs = await base44.entities.UserSubscription.filter({
        email: user.email,
      });
      
      if (subs.length > 0 && subs[0].status === 'active') {
        setUserTier(subs[0].tier || 'free');
        if (subs[0].tier === 'free' || !subs[0].tier) {
          setShowAds(true);
        }
      } else {
        setUserTier('free');
        setShowAds(true);
      }
    } catch (e) {
      setShowAds(true);
    }
  };

  const initAdMob = () => {
    if (typeof window !== 'undefined' && window.googletag) {
      window.googletag.cmd.push(() => {
        window.googletag.display('adunit-' + position);
        setAdLoaded(true);
      });
    }
  };

  if (!showAds || userTier !== 'free') return null;

  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-40',
    bottom: 'fixed bottom-0 left-0 right-0 z-40',
    inline: 'my-4',
  };

  return (
    <div className={`${positionClasses[position]} bg-gray-50 border-t border-gray-200 p-2 flex items-center justify-between`}>
      <div id={`adunit-${position}`} className="flex-1">
        {/* AdMob ads render here */}
      </div>
      <button
        onClick={() => setShowAds(false)}
        className="p-1 hover:bg-gray-200 rounded"
        title="Hide ads"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}