import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAnalyticsEnhanced() {
  const { user } = useAuth();
  const [cohortData, setCohortData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [ltvData, setLtvData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const allProgress = await base44.entities.ChildGameProgress.list();
      const allUsers = await base44.entities.UserSubscription.list();
      const leaderboard = await base44.entities.Leaderboard.list();

      // Cohort analysis - group by signup week
      const cohorts = {};
      allUsers.forEach(u => {
        const signupDate = new Date(u.created_date);
        const weekKey = `Week ${Math.floor(signupDate.getDate() / 7) + 1}`;
        if (!cohorts[weekKey]) {
          cohorts[weekKey] = { users: 0, paidUsers: 0, active: 0 };
        }
        cohorts[weekKey].users++;
        if (u.tier !== 'free') cohorts[weekKey].paidUsers++;
        
        // Check if active (played in last 7 days)
        const recentPlay = allProgress.find(p => {
          const lastPlay = new Date(p.lastPlayedDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastPlay >= weekAgo && p.userEmail === u.email;
        });
        if (recentPlay) cohorts[weekKey].active++;
      });

      const cohortDataFormatted = Object.entries(cohorts).map(([week, data]) => ({
        week,
        totalUsers: data.users,
        paidConversion: ((data.paidUsers / data.users) * 100).toFixed(1),
        activeRate: ((data.active / data.users) * 100).toFixed(1),
      }));

      // Retention - D7, D14, D30
      const retention = {};
      allUsers.forEach(u => {
        const signupDate = new Date(u.created_date);
        const today = new Date();
        const daysOld = Math.floor((today - signupDate) / (1000 * 60 * 60 * 24));

        const userProgress = allProgress.filter(p => p.userEmail === u.email);
        const lastPlayDate = userProgress.length > 0 
          ? new Date(userProgress[0].lastPlayedDate)
          : signupDate;

        if (daysOld >= 7) {
          if (!retention.d7) retention.d7 = { total: 0, active: 0 };
          retention.d7.total++;
          if (lastPlayDate >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
            retention.d7.active++;
          }
        }
        if (daysOld >= 14) {
          if (!retention.d14) retention.d14 = { total: 0, active: 0 };
          retention.d14.total++;
          if (lastPlayDate >= new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)) {
            retention.d14.active++;
          }
        }
        if (daysOld >= 30) {
          if (!retention.d30) retention.d30 = { total: 0, active: 0 };
          retention.d30.total++;
          if (lastPlayDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
            retention.d30.active++;
          }
        }
      });

      const retentionFormatted = [
        {
          day: 'D7',
          rate: retention.d7 ? ((retention.d7.active / retention.d7.total) * 100).toFixed(1) : 0,
        },
        {
          day: 'D14',
          rate: retention.d14 ? ((retention.d14.active / retention.d14.total) * 100).toFixed(1) : 0,
        },
        {
          day: 'D30',
          rate: retention.d30 ? ((retention.d30.active / retention.d30.total) * 100).toFixed(1) : 0,
        },
      ];

      // LTV calculation - revenue per user
      const paidUsers = allUsers.filter(u => u.tier !== 'free');
      const totalRevenue = paidUsers.reduce((sum, u) => {
        const price = u.tier === 'premium' ? 24.90 : u.tier === 'pro' ? 44.90 : 0;
        return sum + price;
      }, 0);

      const avgLTV = paidUsers.length > 0 ? (totalRevenue / paidUsers.length).toFixed(2) : 0;

      setCohortData(cohortDataFormatted);
      setRetentionData(retentionFormatted);
      setLtvData({
        totalRevenue: totalRevenue || 0,
        avgLTV: avgLTV || 0,
        paidUsers: paidUsers.length || 0,
        conversionRate: allUsers.length > 0 ? ((paidUsers.length / allUsers.length) * 100).toFixed(1) : 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Analytics load failed:', error);
      setCohortData([]);
      setRetentionData([
        { day: 'D7', rate: 0 },
        { day: 'D14', rate: 0 },
        { day: 'D30', rate: 0 },
      ]);
      setLtvData({ totalRevenue: 0, avgLTV: 0, paidUsers: 0, conversionRate: 0 });
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <p className="text-2xl font-black">🔒 Access Denied</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!cohortData.length && !retentionData.length) {
    return (
      <div className="min-h-screen bg-amber-50 pb-32">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/admin-dashboard">
            <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
          <p className="text-center text-xl font-black text-gray-500">📊 No analytics data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-32">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to="/admin-dashboard">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-game-orange" />
          Advanced Analytics
        </h1>

        {/* LTV & Conversion */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200">
            <p className="text-xs font-bold text-gray-600 mb-2">💰 Total Revenue</p>
            <p className="text-3xl font-black text-game-green">RM {ltvData.totalRevenue?.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200">
            <p className="text-xs font-bold text-gray-600 mb-2">👤 Avg LTV</p>
            <p className="text-3xl font-black text-game-blue">RM {ltvData.avgLTV}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200">
            <p className="text-xs font-bold text-gray-600 mb-2">💳 Paid Users</p>
            <p className="text-3xl font-black text-game-purple">{ltvData.paidUsers}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200">
            <p className="text-xs font-bold text-gray-600 mb-2">🎯 Conv Rate</p>
            <p className="text-3xl font-black text-game-orange">{ltvData.conversionRate}%</p>
          </motion.div>
        </div>

        {/* Retention Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200 mb-8">
          <h2 className="text-xl font-black mb-4">📊 Retention Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cohort Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border-2 border-amber-200">
          <h2 className="text-xl font-black mb-4">👥 Cohort Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-bold">Cohort</th>
                  <th className="text-left py-3 px-4 font-bold">Total Users</th>
                  <th className="text-left py-3 px-4 font-bold">Paid Conv %</th>
                  <th className="text-left py-3 px-4 font-bold">Active Rate %</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-amber-50">
                    <td className="py-3 px-4 font-bold">{cohort.week}</td>
                    <td className="py-3 px-4">{cohort.totalUsers}</td>
                    <td className="py-3 px-4">{cohort.paidConversion}%</td>
                    <td className="py-3 px-4">{cohort.activeRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}