import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [gameStats, setGameStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Fetch all progress data
      const progress = await base44.entities.ChildGameProgress.list();
      
      // Category breakdown
      const catMap = {};
      progress.forEach(p => {
        if (!catMap[p.category]) catMap[p.category] = 0;
        catMap[p.category] += p.timesPlayed || 0;
      });
      
      const catData = Object.entries(catMap)
        .map(([name, plays]) => ({ name: name.replace(/_/g, ' '), plays }))
        .sort((a, b) => b.plays - a.plays);
      
      setCategoryStats(catData);

      // Daily trend (mock - last 7 days)
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayProgress = progress.filter(p => {
          const pDate = new Date(p.lastPlayedDate);
          return pDate.toDateString() === date.toDateString();
        });
        return {
          date: date.toLocaleDateString('ms-MY', { month: 'short', day: 'numeric' }),
          plays: dayProgress.reduce((sum, p) => sum + (p.timesPlayed || 0), 0),
        };
      });
      
      setDailyStats(dailyData);

      // Top games
      const gameMap = {};
      progress.forEach(p => {
        if (!gameMap[p.gameType]) gameMap[p.gameType] = 0;
        gameMap[p.gameType] += p.timesPlayed || 0;
      });
      
      const topGames = Object.entries(gameMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, plays]) => ({ name: name.split('-').pop(), plays }));
      
      setGameStats(topGames);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black mb-4">🔒</p>
          <p className="font-bold">Akses Ditolak</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalPlays = gameStats.reduce((sum, g) => sum + g.plays, 0);
  const avgDaily = (dailyStats.reduce((sum, d) => sum + d.plays, 0) / 7).toFixed(0);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black flex items-center gap-3 text-gray-800">
            <TrendingUp className="w-10 h-10 text-game-orange" />
            Analitik Permainan
          </h1>
          <Link to="/admin-dashboard">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="clay-button rounded-full w-12 h-12 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">🎮 Total Main</p>
            <p className="text-3xl font-black text-game-orange">{totalPlays}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">📊 Purata Harian</p>
            <p className="text-3xl font-black text-game-blue">{avgDaily}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">🎯 Mata Pelajaran</p>
            <p className="text-3xl font-black text-game-purple">{categoryStats.length}</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <h3 className="text-xl font-black mb-4 text-gray-800">📈 Trend 7 Hari Terakhir</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="plays" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <h3 className="text-xl font-black mb-4 text-gray-800">🎨 Mata Pelajaran Popular</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="plays"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md lg:col-span-2"
          >
            <h3 className="text-xl font-black mb-4 text-gray-800">🏆 Top 5 Permainan</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gameStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plays" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}