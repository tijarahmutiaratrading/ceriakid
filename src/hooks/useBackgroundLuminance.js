import { useState, useEffect, useRef } from 'react';

/**
 * Detect background luminance behind a fixed element by sampling pixels.
 * Returns 'dark' or 'light'.
 *
 * Strategy:
 * 1. At given sample point (x,y), use document.elementsFromPoint() to get all
 *    elements stacked at that coordinate.
 * 2. Skip the ref element (and its children) — we want what's BEHIND it.
 * 3. Walk down the stack until we find an element with a non-transparent background.
 * 4. Parse the rgb() color, compute luminance (sRGB perceived brightness).
 * 5. If image background — fall back to <html>/<body> bg color.
 *
 * Updates on scroll (rAF-throttled) + route change.
 */
export function useBackgroundLuminance(ref, sampleY = 30) {
  const [tone, setTone] = useState('dark'); // default 'dark' = use white text
  const rafRef = useRef(null);

  useEffect(() => {
    const parseRGB = (str) => {
      // matches rgb(r,g,b) / rgba(r,g,b,a)
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(',').map(p => parseFloat(p.trim()));
      const [r, g, b, a = 1] = parts;
      if (a < 0.3) return null; // too transparent — keep walking
      return { r, g, b, a };
    };

    const luminance = ({ r, g, b }) => {
      // sRGB perceived luminance (0..255)
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const detect = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sampleX = rect.left + rect.width / 2;
      const sampleAtY = rect.top + Math.min(sampleY, rect.height / 2);

      // Get elements stacked at that point — top first
      const stack = document.elementsFromPoint(sampleX, sampleAtY);

      let foundColor = null;
      for (const node of stack) {
        // Skip the header itself & anything inside it
        if (el.contains(node)) continue;

        const cs = window.getComputedStyle(node);

        // If element has bg image, treat as 'unknown' → fall back to body
        if (cs.backgroundImage && cs.backgroundImage !== 'none') {
          // Don't break — continue walking; image elements are mostly photos = assume dark
          // But if we hit one, we'll just default to dark unless something opaque under it
          continue;
        }

        const rgb = parseRGB(cs.backgroundColor);
        if (rgb) {
          foundColor = rgb;
          break;
        }
      }

      // Fallback to body/html bg
      if (!foundColor) {
        const bodyBg = parseRGB(window.getComputedStyle(document.body).backgroundColor)
          || parseRGB(window.getComputedStyle(document.documentElement).backgroundColor);
        if (bodyBg) foundColor = bodyBg;
      }

      // If still nothing → there's likely an image behind — default to dark (white text)
      if (!foundColor) {
        setTone(prev => (prev === 'dark' ? prev : 'dark'));
        return;
      }

      const lum = luminance(foundColor);
      // Threshold ~140 (out of 255) — above = bright bg → use dark text
      const next = lum > 140 ? 'light' : 'dark';
      setTone(prev => (prev === next ? prev : next));
    };

    const onScrollOrResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(detect);
    };

    // Initial detect (slight delay so DOM settles)
    const initTimer = setTimeout(detect, 50);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      clearTimeout(initTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [ref, sampleY]);

  // Re-detect when route changes
  useEffect(() => {
    const reDetect = () => {
      setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const el = ref.current;
        if (!el) return;
        // Trigger scroll event manually to re-run detection
        window.dispatchEvent(new Event('scroll'));
      }, 100);
    };

    window.addEventListener('popstate', reDetect);
    // Listen to pushState/replaceState via custom event (some routers fire this)
    const observer = new MutationObserver(reDetect);
    observer.observe(document.body, { childList: true, subtree: false });

    return () => {
      window.removeEventListener('popstate', reDetect);
      observer.disconnect();
    };
  }, [ref]);

  return tone;
}