import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BarChart3, Users, Settings } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-4">🔒</p>
          <p className="text-white font-semibold">Akses Ditolak</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
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
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Sales & Subscription Overview</p>
          </div>
          <Link to="/admin-settings">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors">
              <Settings className="w-5 h-5" /> Tetapan
            </motion.button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-slate-600 transition-colors"
          >
            <p className="text-slate-400 text-sm font-semibold mb-2">Total Subscribers</p>
            <p className="text-4xl font-bold text-white">{subscriptions.length}</p>
            <p className="text-slate-500 text-xs mt-3">Semua Paket</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-slate-600 transition-colors"
          >
            <p className="text-slate-400 text-sm font-semibold mb-2">Premium</p>
            <p className="text-4xl font-bold text-blue-400">{tierBreakdown.premium}</p>
            <p className="text-slate-500 text-xs mt-3">RM 24.90/bulan</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-slate-600 transition-colors"
          >
            <p className="text-slate-400 text-sm font-semibold mb-2">Pro</p>
            <p className="text-4xl font-bold text-purple-400">{tierBreakdown.pro}</p>
            <p className="text-slate-500 text-xs mt-3">RM 44.90/bulan</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-slate-600 transition-colors"
          >
            <p className="text-slate-400 text-sm font-semibold mb-2">Monthly Revenue</p>
            <p className="text-4xl font-bold text-green-400">RM {totalRevenue.toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-3">Paid Tiers</p>
          </motion.div>
        </div>

        {/* Subscribers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              Subscribers Database
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Plan</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-300">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-300">{sub.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        sub.tier === 'free' ? 'bg-slate-700 text-slate-300' :
                        sub.tier === 'premium' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-purple-900/50 text-purple-300'
                      }`}>
                        {sub.tier === 'free' ? 'Free' : sub.tier === 'premium' ? 'Premium' : 'Pro'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        sub.status === 'active' ? 'bg-green-900/50 text-green-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {sub.status === 'active' ? 'Active' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{new Date(sub.created_date).toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}