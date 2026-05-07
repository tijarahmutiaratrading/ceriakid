import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSelectedMiniGame(category) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const gameId = new URLSearchParams(window.location.search).get('gameId');
    if (!gameId) {
      setGame(null);
      return;
    }

    setLoading(true);
    base44.entities.Game.filter({ id: gameId })
      .then((games) => {
        const found = games?.[0];
        setGame(found && (!category || found.category === category) ? found : null);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { game, loading };
}