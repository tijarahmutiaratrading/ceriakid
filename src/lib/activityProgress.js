// Generic activity progress tracker — untuk aktiviti selain games biasa
// (cth: Drawing Studio, Story Kid). Simpan ke ChildGameProgress + Leaderboard
// supaya muncul dekat ParentDashboard sama seperti games.
//
// Penggunaan:
//   saveActivityProgress({
//     user, childName,
//     category: 'drawing_tracing' | 'drawing_art' | 'story_kid',
//     activityId: 'trace-A' | 'lukisan-bebas' | 'story-1',
//     activityTitle: 'Trace huruf A',
//     stars: 3,   // 0-3
//     ageGroup: 'prasekolah',
//   });
import { base44 } from '@/api/base44Client';
import { checkAchievements } from '@/lib/achievementManager';

export async function saveActivityProgress({
  user,
  childName,
  category,
  activityId,
  activityTitle,
  stars = 1,
  ageGroup = 'prasekolah',
}) {
  if (!user?.email || !childName) return { saved: false, reason: 'no_user_or_child' };
  if (!category || !activityId) return { saved: false, reason: 'missing_params' };

  const safeStars = Math.max(0, Math.min(3, Number(stars) || 0));
  const score = safeStars;       // treat stars as score (out of 3)
  const total = 3;
  const now = new Date().toISOString();
  const gameType = `${category}-${activityId}`;

  try {
    const existing = await base44.entities.ChildGameProgress.filter({
      userEmail: user.email,
      childName,
      gameType,
    });

    const historyEntry = { date: now, score, stars: safeStars };

    if (existing.length > 0) {
      const prev = existing[0];
      const playHistory = [...(prev.playHistory || []), historyEntry].slice(-10);
      await base44.entities.ChildGameProgress.update(prev.id, {
        lastScore: score,
        lastTotal: total,
        lastStars: safeStars,
        timesPlayed: (prev.timesPlayed || 0) + 1,
        bestScore: Math.max(prev.bestScore || 0, score),
        bestStars: Math.max(prev.bestStars || 0, safeStars),
        lastPlayedDate: now,
        playHistory,
      });
    } else {
      await base44.entities.ChildGameProgress.create({
        userEmail: user.email,
        childName,
        gameType,
        category,
        ageGroup,
        lastScore: score,
        lastTotal: total,
        lastStars: safeStars,
        timesPlayed: 1,
        bestScore: score,
        bestStars: safeStars,
        lastPlayedDate: now,
        playHistory: [historyEntry],
      });
    }

    // Update leaderboard so streak & total stars work
    try {
      const lbRecords = await base44.entities.Leaderboard.filter({
        userEmail: user.email,
        childName,
      });
      if (lbRecords.length > 0) {
        const lb = lbRecords[0];
        await base44.entities.Leaderboard.update(lb.id, {
          totalStars: (lb.totalStars || 0) + safeStars,
          gamesCompleted: (lb.gamesCompleted || 0) + 1,
          lastPlayedDate: now,
          ageGroup,
        });
      } else {
        await base44.entities.Leaderboard.create({
          userEmail: user.email,
          childName,
          totalStars: safeStars,
          gamesCompleted: 1,
          lastPlayedDate: now,
          ageGroup,
        });
      }
    } catch (err) {
      console.warn('Leaderboard update failed:', err.message);
    }

    // Achievements
    try {
      await checkAchievements(
        user,
        childName,
        { lastScore: score, lastTotal: total, lastStars: safeStars },
        base44,
      );
    } catch (err) {
      console.warn('Achievement check failed:', err.message);
    }

    return { saved: true, stars: safeStars, activityTitle };
  } catch (err) {
    console.error('saveActivityProgress failed:', err);
    return { saved: false, reason: err.message };
  }
}