import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SmartRecommendations({ userEmail, childName, ageGroup }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userEmail, childName, ageGroup]);

  const generateRecommendations = async () => {
    try {
      const allProgress = await base44.entities.ChildGameProgress.filter({
        userEmail: userEmail,
        childName: childName,
      });

      if (allProgress.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Group by category and calculate average stars
      const categoryStats = {};
      allProgress.forEach(p => {
        if (!categoryStats[p.category]) {
          categoryStats[p.category] = { avgStars: 0, count: 0 };
        }
        categoryStats[p.category].avgStars += p.bestStars || 0;
        categoryStats[p.category].count += 1;
      });

      // Calculate averages and find weak subjects
      const stats = Object.entries(categoryStats).map(([cat, data]) => ({
        category: cat,
        avgStars: data.avgStars / data.count,
      }));

      const weakSubjects = stats
        .filter(s => s.avgStars < 2) // Less than 2 stars average
        .sort((a, b) => a.avgStars - b.avgStars)
        .slice(0, 2);

      setRecommendations(weakSubjects);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  const categoryEmojis = {
    bahasa_melayu: '🇲🇾 Bahasa Melayu',
    english: '🇬🇧 English',
    mathematics: '🔢 Matematik',
    science: '🔬 Sains',
    jawi: '🕌 Jawi',
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <h3 className="font-black text-gray-900">Mata Pelajaran Perlu Bantuan</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">{categoryEmojis[rec.category]}</p>
                <p className="text-sm text-gray-600">
                  Purata {rec.avgStars.toFixed(1)}/3 bintang — cuba lebih banyak
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        💡 Tip: Latihan lebih banyak dalam subjek ini untuk meningkatkan markah
      </p>
    </div>
  );
}