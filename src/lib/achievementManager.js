// Achievement system for badges & streaks
export const ACHIEVEMENTS = {
  '5_games': { emoji: '🎮', name: '5 Permainan', desc: '5 permainan dimainkan' },
  '10_games': { emoji: '🏆', name: '10 Permainan', desc: '10 permainan dimainkan' },
  '3_day_streak': { emoji: '🔥', name: '3 Hari Berturut', desc: 'Bermain 3 hari berturut-turut' },
  'perfect_8': { emoji: '⭐', name: 'Sempurna!', desc: '8/8 jawapan betul' },
  '100_stars': { emoji: '✨', name: '100 Bintang', desc: 'Kumpul 100 bintang' },
  'all_subjects': { emoji: '🌟', name: 'Master Semua', desc: 'Mainkan semua mata pelajaran' },
};

export const checkAchievements = async (user, childName, progressData, base44) => {
  if (!user || !childName) return [];
  
  const unlockedBadges = [];
  
  try {
    // Get all existing achievements
    const existing = await base44.entities.Achievement.filter({
      userEmail: user.email,
    });
    const existingBadgeIds = existing.map(a => a.badgeId);
    
    // Get total games played
    const allProgress = await base44.entities.ChildGameProgress.filter({
      userEmail: user.email,
      childName: childName,
    });
    
    const totalGames = allProgress.reduce((sum, p) => sum + (p.timesPlayed || 0), 0);
    const totalStars = allProgress.reduce((sum, p) => sum + (p.bestStars || 0), 0);
    
    // Check 5 games
    if (totalGames >= 5 && !existingBadgeIds.includes('5_games')) {
      unlockedBadges.push({
        badgeId: '5_games',
        badgeName: ACHIEVEMENTS['5_games'].name,
        badgeEmoji: ACHIEVEMENTS['5_games'].emoji,
      });
    }
    
    // Check 10 games
    if (totalGames >= 10 && !existingBadgeIds.includes('10_games')) {
      unlockedBadges.push({
        badgeId: '10_games',
        badgeName: ACHIEVEMENTS['10_games'].name,
        badgeEmoji: ACHIEVEMENTS['10_games'].emoji,
      });
    }
    
    // Check perfect score (100% accuracy on any game)
    if (progressData?.lastScore === progressData?.lastTotal && progressData?.lastStars === 3 && !existingBadgeIds.includes('perfect_8')) {
      unlockedBadges.push({
        badgeId: 'perfect_8',
        badgeName: ACHIEVEMENTS['perfect_8'].name,
        badgeEmoji: ACHIEVEMENTS['perfect_8'].emoji,
      });
    }
    
    // Check 100 stars
    if (totalStars >= 100 && !existingBadgeIds.includes('100_stars')) {
      unlockedBadges.push({
        badgeId: '100_stars',
        badgeName: ACHIEVEMENTS['100_stars'].name,
        badgeEmoji: ACHIEVEMENTS['100_stars'].emoji,
      });
    }
    
    // Check all subjects (at least 1 game in each)
    const subjects = new Set(allProgress.map(p => p.category));
    if (subjects.size >= 5 && !existingBadgeIds.includes('all_subjects')) {
      unlockedBadges.push({
        badgeId: 'all_subjects',
        badgeName: ACHIEVEMENTS['all_subjects'].name,
        badgeEmoji: ACHIEVEMENTS['all_subjects'].emoji,
      });
    }
    
    // Save unlocked badges
    for (const badge of unlockedBadges) {
      await base44.entities.Achievement.create({
        userEmail: user.email,
        ...badge,
        unlockedDate: new Date().toISOString(),
      });
    }
    
    return unlockedBadges;
  } catch (error) {
    console.error('Achievement check failed:', error);
    return [];
  }
};

export const calculateStreak = async (user, childName, base44) => {
  if (!user || !childName) return 0;
  
  try {
    const allProgress = await base44.entities.ChildGameProgress.filter({
      userEmail: user.email,
      childName: childName,
    });
    
    if (allProgress.length === 0) return 0;
    
    // Sort by last played date
    const sorted = [...allProgress].sort((a, b) => 
      new Date(b.lastPlayedDate) - new Date(a.lastPlayedDate)
    );
    
    const lastPlayedDate = new Date(sorted[0].lastPlayedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPlayedDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastPlayedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken
    return calculateConsecutiveDays(sorted);
  } catch (error) {
    console.error('Streak calculation failed:', error);
    return 0;
  }
};

const calculateConsecutiveDays = (progressArray) => {
  if (progressArray.length === 0) return 0;
  
  // Create unique dates map to avoid counting same-day replays
  const uniqueDates = new Map();
  progressArray.forEach(p => {
    const dateKey = new Date(p.lastPlayedDate).toISOString().split('T')[0];
    if (!uniqueDates.has(dateKey)) {
      uniqueDates.set(dateKey, p);
    }
  });
  
  if (uniqueDates.size === 0) return 0;
  
  const uniqueSorted = Array.from(uniqueDates.values()).sort((a, b) => 
    new Date(b.lastPlayedDate) - new Date(a.lastPlayedDate)
  );
  
  let streak = 1;
  for (let i = 0; i < uniqueSorted.length - 1; i++) {
    const current = new Date(uniqueSorted[i].lastPlayedDate);
    const next = new Date(uniqueSorted[i + 1].lastPlayedDate);
    current.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};