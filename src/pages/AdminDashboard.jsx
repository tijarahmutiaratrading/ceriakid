import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BarChart3, Users, Settings, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    try {
      const data = await base44.entities.UserSubscription.list();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
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
          <div className="flex gap-3">
            <Link to="/admin-analytics-advanced">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-game-orange text-white rounded-xl font-bold shadow-md">
                <TrendingUp className="w-4 h-4" /> Analytics+
              </motion.button>
            </Link>
            <Link to="/admin-settings">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-game-purple text-white rounded-xl font-bold shadow-md">
                <Settings className="w-4 h-4" /> Tetapan
              </motion.button>
            </Link>
          </div>
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