import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BarChart3, Users, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [gameStats, setGameStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [subData, progress] = await Promise.all([
        base44.entities.UserSubscription.list(),
        base44.entities.ChildGameProgress.list(),
      ]);
      
      setSubscriptions(subData);
      
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
      
      // Daily trend
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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const totalRevenue = subscriptions
    .filter(s => s.tier !== 'free')
    .reduce((sum, s) => {
      const price = s.tier === 'premium' ? 24.90 : s.tier === 'pro' ? 44.90 : 0;
      return sum + price;
    }, 0);

  const tierBreakdown = {
    free: subscriptions.filter(s => s.tier === 'free').length,
    premium: subscriptions.filter(s => s.tier === 'premium').length,
    pro: subscriptions.filter(s => s.tier === 'pro').length,
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black flex items-center gap-3 text-gray-800">
            <BarChart3 className="w-10 h-10 text-game-orange" />
            Admin Dashboard
          </h1>
          <Link to="/admin-settings">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-game-purple text-white rounded-xl font-bold shadow-md">
              <Settings className="w-4 h-4" /> Tetapan
            </motion.button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">📊 Jumlah Pembeli</p>
            <p className="text-3xl font-black text-game-orange">{subscriptions.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">💎 Premium</p>
            <p className="text-3xl font-black text-game-blue">{tierBreakdown.premium}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">👑 Pro</p>
            <p className="text-3xl font-black text-game-purple">{tierBreakdown.pro}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
          >
            <p className="text-sm text-gray-600 mb-2 font-bold">💰 Pendapatan (RM)</p>
            <p className="text-3xl font-black text-game-green">{totalRevenue.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Game Analytics Section */}
        <div className="mt-12 pt-12 border-t-2 border-amber-200">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-gray-800">
            <TrendingUp className="w-8 h-8 text-game-orange" />
            Analitik Permainan
          </h2>

          {/* Game KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
            >
              <p className="text-sm text-gray-600 mb-2 font-bold">🎮 Total Main</p>
              <p className="text-3xl font-black text-game-orange">{gameStats.reduce((sum, g) => sum + g.plays, 0)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
            >
              <p className="text-sm text-gray-600 mb-2 font-bold">📊 Purata Harian</p>
              <p className="text-3xl font-black text-game-blue">{(dailyStats.reduce((sum, d) => sum + d.plays, 0) / 7).toFixed(0)}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
            >
              <p className="text-sm text-gray-600 mb-2 font-bold">🎯 Mata Pelajaran</p>
              <p className="text-3xl font-black text-game-purple">{categoryStats.length}</p>
            </motion.div>
          </div>

          {/* Game Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
            >
              <h3 className="text-xl font-black mb-4 text-gray-800">📈 Trend 7 Hari</h3>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md"
            >
              <h3 className="text-xl font-black mb-4 text-gray-800">🎨 Mata Pelajaran Popular</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryStats} dataKey="plays" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
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

        {/* Clients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 overflow-x-auto border-2 border-amber-200 shadow-md"
        >
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
            <Users className="w-7 h-7 text-game-orange" />
            Daftar Pembeli
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-bold">Email</th>
                <th className="text-left py-3 px-4 font-bold">Paket</th>
                <th className="text-left py-3 px-4 font-bold">Status</th>
                <th className="text-left py-3 px-4 font-bold">Tarikh Daftar</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, i) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{sub.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      sub.tier === 'free' ? 'bg-gray-200 text-gray-700' :
                      sub.tier === 'premium' ? 'bg-game-blue/20 text-game-blue' :
                      'bg-game-purple/20 text-game-purple'
                    }`}>
                      {sub.tier === 'free' ? 'Percuma' : sub.tier === 'premium' ? 'Premium' : 'Pro'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      sub.status === 'active' ? 'bg-green-200 text-green-700' :
                      'bg-red-200 text-red-700'
                    }`}>
                      {sub.status === 'active' ? 'Aktif' : 'Batal'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}