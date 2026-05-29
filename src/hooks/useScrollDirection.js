import { useState, useEffect, useRef } from 'react';

/**
 * Returns true when header should be visible (scrolling up or near top),
 * false when scrolling down past 50px.
 *
 * IMPORTANT: We track lastScrollY with useRef (not useState) so the effect
 * runs ONCE and the listener is stable. Putting lastScrollY in a state +
 * dependency array would re-attach the listener on every scroll tick, which
 * caused stale-closure bugs and visible jank near the bottom of long pages
 * (header flickering / page appearing to "jump back up" on overscroll).
 */
export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          setIsVisible(false);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isVisible;
}