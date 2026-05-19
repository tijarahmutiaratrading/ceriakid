// Save mini game progress to ChildGameProgress + Leaderboard.
// Mirrors the pattern used in GamePlayer.jsx but adapted for mini games (round-based).
import { base44 } from '@/api/base44Client';
import { checkAchievements } from '@/lib/achievementManager';

export async function saveMiniGameProgress({ user, childName, categoryId, gameId, gameTitle, score, total }) {
  if (!user?.email || !childName) return { saved: false, reason: 'no_user_or_child' };

  const safeTotal = Math.max(1, Number(total) || 1);
  const safeScore = Math.max(0, Math.min(safeTotal, Number(score) || 0));
  const percent = safeScore / safeTotal;
  const stars = percent >= 0.9 ? 3 : percent >= 0.7 ? 2 : percent >= 0.4 ? 1 : 0;
  const now = new Date().toISOString();
  const gameType = `${categoryId}-${gameId}`;

  try {
    const existing = await base44.entities.ChildGameProgress.filter({
      userEmail: user.email,
      childName,
      gameType,
    });

    const historyEntry = { date: now, score: safeScore, stars };

    if (existing.length > 0) {
      const prev = existing[0];
      const playHistory = [...(prev.playHistory || []), historyEntry].slice(-10);
      await base44.entities.ChildGameProgress.update(prev.id, {
        lastScore: safeScore,
        lastTotal: safeTotal,
        lastStars: stars,
        timesPlayed: (prev.timesPlayed || 0) + 1,
        bestScore: Math.max(prev.bestScore || 0, safeScore),
        bestStars: Math.max(prev.bestStars || 0, stars),
        lastPlayedDate: now,
        playHistory,
      });
    } else {
      await base44.entities.ChildGameProgress.create({
        userEmail: user.email,
        childName,
        gameType,
        category: categoryId,
        ageGroup: 'prasekolah',
        lastScore: safeScore,
        lastTotal: safeTotal,
        lastStars: stars,
        timesPlayed: 1,
        bestScore: safeScore,
        bestStars: stars,
        lastPlayedDate: now,
        playHistory: [historyEntry],
      });
    }

    // Update leaderboard
    try {
      const lbRecords = await base44.entities.Leaderboard.filter({
        userEmail: user.email,
        childName,
      });
      if (lbRecords.length > 0) {
        const lb = lbRecords[0];
        await base44.entities.Leaderboard.update(lb.id, {
          totalStars: (lb.totalStars || 0) + stars,
          gamesCompleted: (lb.gamesCompleted || 0) + 1,
          lastPlayedDate: now,
          ageGroup: 'prasekolah',
        });
      } else {
        await base44.entities.Leaderboard.create({
          userEmail: user.email,
          childName,
          totalStars: stars,
          gamesCompleted: 1,
          lastPlayedDate: now,
          ageGroup: 'prasekolah',
        });
      }
    } catch (err) {
      console.warn('Leaderboard update failed:', err.message);
    }

    // Achievements
    try {
      await checkAchievements(user, childName, { lastScore: safeScore, lastTotal: safeTotal, lastStars: stars }, base44);
    } catch (err) {
      console.warn('Achievement check failed:', err.message);
    }

    return { saved: true, stars, score: safeScore, total: safeTotal };
  } catch (err) {
    console.error('saveMiniGameProgress failed:', err);
    return { saved: false, reason: err.message };
  }
}