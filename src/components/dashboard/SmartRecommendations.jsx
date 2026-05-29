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
    <div className="rounded-[2rem] p-5" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
      boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
    }}>
      <div className="flex items-center gap-2.5 mb-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #fdba74 0%, #fb923c 100%)', boxShadow: '0 3px 0 #f97316' }}
        >
          💡
        </motion.div>
        <div>
          <p className="text-slate-800 text-base font-black leading-none">Perlu Bantuan</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Subjek lemah</p>
        </div>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-3"
            style={{ background: '#ffedd5', boxShadow: '0 3px 0 #fdba74' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-slate-800 text-sm truncate">{categoryEmojis[rec.category]}</p>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  Purata {rec.avgStars.toFixed(1)}/3 bintang — cuba lebih banyak
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-orange-500 flex-shrink-0" strokeWidth={3} />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-slate-500 mt-3 font-bold">
        💡 Tip: Latihan lebih banyak dalam subjek ini untuk meningkatkan markah
      </p>
    </div>
  );
}