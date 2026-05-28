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
    <div className="rounded-3xl p-4" style={{ background: 'rgba(30,30,40,0.35)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 12px 40px -10px rgba(15,23,42,0.5)' }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-orange-300" />
        <h3 className="text-white text-xs font-black uppercase tracking-wider">Perlu Bantuan</h3>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-3 bg-white/8 border border-white/15 border-l-4 border-l-orange-400/70"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-white text-sm truncate">{categoryEmojis[rec.category]}</p>
                <p className="text-[11px] text-white/70 font-semibold mt-0.5">
                  Purata {rec.avgStars.toFixed(1)}/3 bintang — cuba lebih banyak
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-orange-300 flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-white/55 mt-3 font-semibold">
        💡 Tip: Latihan lebih banyak dalam subjek ini untuk meningkatkan markah
      </p>
    </div>
  );
}