import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook untuk dapatkan game stats real-time dari database.
 * Cache 10 minit — landing page tak perlu fetch berulang kali.
 *
 * Returns:
 *   - stats.totalGames: total semua game published
 *   - stats.accessibleByTier: { asas, standard, keluarga }
 *   - loading: true masa fetch first time
 */
export function useGameStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-game-stats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicGameStats', {});
      return res?.data?.success ? res.data : null;
    },
    staleTime: 10 * 60 * 1000, // 10 minit fresh
    gcTime: 30 * 60 * 1000,    // 30 minit dalam cache
    retry: 1,
  });

  return { stats: data, loading: isLoading };
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