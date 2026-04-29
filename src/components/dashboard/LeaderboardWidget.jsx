import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { calculateStreak } from '@/lib/achievementManager';

export default function LeaderboardWidget({ userEmail, childName, ageGroup }) {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [userEmail, ageGroup]);

  const loadLeaderboard = async () => {
    try {
      // Get all family leaderboards
      const familyLeaderboards = await base44.entities.Leaderboard.filter({
        userEmail: userEmail,
        ageGroup: ageGroup,
      });

      setAllChildren(familyLeaderboards.sort((a, b) => b.totalStars - a.totalStars));

      // Calculate streak for current child
      const currentStreak = await calculateStreak(
        { email: userEmail },
        childName,
        base44
      );
      setStreak(currentStreak);

      // Get current child's leaderboard entry
      const current = familyLeaderboards.find(l => l.childName === childName);
      if (current) {
        setLeaderboardData(current);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const currentRank = allChildren.findIndex(l => l.childName === childName) + 1;

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-purple-200">
      <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Papan Kedudukan Keluarga
      </h3>

      {allChildren.length > 0 && (
        <div className="space-y-2 mb-6">
          {allChildren.map((child, i) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-xl ${
                child.childName === childName
                  ? 'bg-purple-100 border-2 border-purple-400'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-black w-6">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <div>
                  <p className="font-bold text-gray-900">{child.childName}</p>
                  <p className="text-xs text-gray-500">{child.gamesCompleted} permainan</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-purple-600">⭐ {child.totalStars}</p>
                {child.currentStreak > 0 && (
                  <p className="text-xs text-orange-600 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {child.currentStreak} hari
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400 flex items-center gap-3"
        >
          <Flame className="w-6 h-6 text-orange-600" />
          <div>
            <p className="font-black text-orange-600">{streak} Hari Berturut-turut! 🔥</p>
            <p className="text-xs text-gray-600">Jangan ketinggalan! Mainkan hari ini</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}