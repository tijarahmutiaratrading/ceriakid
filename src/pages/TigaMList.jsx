import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import CinematicHub from '@/components/hub/CinematicHub';
import { findTigaMCategory } from '@/lib/tigaMBlueprints';
import { getGameArtFor } from '@/lib/gameArtPool';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

export default function TigaMList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const category = findTigaMCategory(categoryId);

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  const items = category.games.map((game, idx) => {
    // Setiap kategori 3M = satu bucket sendiri (ikut Games Subjek)
    const locked = isGameIndexLocked({ index: idx, tier: userTier, isAuthenticated });
    const ga = getGameArtFor(game, idx);
    return {
      key: game.id,
      title: game.title,
      desc: game.objective,
      emoji: game.emoji,
      art: ga.art,
      accent: ga.accent,
      badge: locked ? '🔒 Premium' : `3M · ${category.title}`,
      metaChips: [
        `🎯 ${game.rounds?.length || 10} pusingan`,
        ...(game.reward ? [`🏆 ${game.reward}`] : []),
      ],
      locked,
      to: `/3m/${category.id}/play/${game.id}`,
    };
  });

  return (
    <CinematicHub
      label={category.title}
      labelIcon={BookOpen}
      backTo="/3m"
      backLabel="3M"
      items={items}
      playLabel="Main Sekarang"
      railLabel="Pilih Game"
      onPlay={(item) => navigate(item.locked ? '/settings' : item.to)}
    />
  );
}