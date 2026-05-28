import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Cache di module level supaya semua component share data yang sama
// dan tak perlu fetch ulang dalam sesi yang sama.
let cachedStats = null;
let inFlight = null;

/**
 * Hook untuk dapatkan game stats real-time dari database.
 * Auto-update kalau ada game baru ditambah.
 *
 * Returns:
 *   - totalGames: total semua game published (e.g. 1621)
 *   - accessibleByTier: { asas, standard, keluarga } — game accessible per tier
 *   - loading: true masa fetch first time
 */
export function useGameStats() {
  const [stats, setStats] = useState(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);

  useEffect(() => {
    if (cachedStats) return;

    // Single in-flight request — kalau ada banyak component fetch sekali,
    // share Promise yang sama
    if (!inFlight) {
      inFlight = base44.functions.invoke('getPublicGameStats', {})
        .then((res) => {
          const data = res?.data;
          if (data?.success) {
            cachedStats = data;
            return data;
          }
          return null;
        })
        .catch((err) => {
          console.error('Failed to fetch game stats:', err);
          return null;
        })
        .finally(() => {
          // Allow retry on next mount
          setTimeout(() => { inFlight = null; }, 5000);
        });
    }

    inFlight.then((data) => {
      if (data) {
        setStats(data);
      }
      setLoading(false);
    });
  }, []);

  return { stats, loading };
}

/**
 * Helper: bulatkan number ke nearest 50/100 supaya marketing look cleaner.
 * 921 → "900+", 1621 → "1,600+"
 */
export function formatGameCount(n) {
  if (!n) return '—';
  if (n < 100) return `${n}+`;
  if (n < 1000) return `${Math.floor(n / 50) * 50}+`;
  return `${(Math.floor(n / 100) * 100).toLocaleString()}+`;
}