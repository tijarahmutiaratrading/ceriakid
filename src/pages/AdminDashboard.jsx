import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Users, Settings, CreditCard, TrendingUp } from 'lucide-react';
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
      const price = s.tier === 'asas' ? 49 : s.tier === 'standard' ? 99 : s.tier === 'keluarga' ? 199 : 0;
      return sum + price;
    }, 0);

  const tierBreakdown = {
    free: subscriptions.filter(s => s.tier === 'free').length,
    asas: subscriptions.filter(s => s.tier === 'asas').length,
    standard: subscriptions.filter(s => s.tier === 'standard').length,
    keluarga: subscriptions.filter(s => s.tier === 'keluarga').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-purple/5 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Dashboard Jualan</h1>
          <p className="text-gray-600">Monitor penjualan & pelanggan</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total Pembeli', value: subscriptions.length, icon: '👥' },
            { label: 'Pendapatan (RM)', value: totalRevenue.toFixed(0), icon: '💰' },
            { label: 'Berbayar (Asas+Std+Kel)', value: (tierBreakdown.asas + tierBreakdown.standard + tierBreakdown.keluarga), icon: '💎' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 text-center border-2 border-game-purple/20 shadow-md"
            >
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-black text-game-purple">{stat.value}</p>
              <p className="text-xs text-gray-600 font-bold mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Sales Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-black text-gray-800 mb-4">💳 Jualan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Percuma', value: tierBreakdown.free, color: 'bg-gray-100', textColor: 'text-gray-700' },
                { label: 'Asas (RM49)', value: tierBreakdown.asas, color: 'bg-green-100', textColor: 'text-green-700' },
                { label: 'Standard (RM99)', value: tierBreakdown.standard, color: 'bg-blue-100', textColor: 'text-blue-700' },
                { label: 'Keluarga (RM199)', value: tierBreakdown.keluarga, color: 'bg-purple-100', textColor: 'text-purple-700' },
                { label: 'Total Revenue', value: `RM ${totalRevenue.toFixed(2)}`, color: 'bg-orange-100', textColor: 'text-orange-700' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`${item.color} rounded-2xl p-5 border-2 border-amber-200 shadow-md text-center`}
                >
                  <p className="text-sm text-gray-600 font-bold mb-2">{item.label}</p>
                  <p className={`text-3xl font-black ${item.textColor}`}>{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Database Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl font-black text-gray-800 mb-4">📋 Database Pelanggan</h2>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md overflow-x-auto"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-bold text-gray-800">Email</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-800">Paket</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-800">Status</th>
                    <th className="text-left py-2 px-3 font-bold text-gray-800">Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.slice(0, 10).map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3 text-xs">{sub.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          sub.tier === 'free' ? 'bg-gray-200 text-gray-700' :
                          sub.tier === 'asas' ? 'bg-green-200 text-green-700' :
                          sub.tier === 'standard' ? 'bg-blue-200 text-blue-700' :
                          'bg-purple-200 text-purple-700'
                        }`}>
                          {sub.tier === 'free' ? 'Percuma' : sub.tier === 'asas' ? 'Asas' : sub.tier === 'standard' ? 'Standard' : 'Keluarga'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'active' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                        }`}>
                          {sub.status === 'active' ? '✓ Aktif' : '✕ Batal'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-4 text-center">Menunjukkan {Math.min(10, subscriptions.length)} daripada {subscriptions.length} pelanggan</p>
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-r from-game-purple to-purple-600 text-white rounded-3xl shadow-lg"
          >
            <p className="font-bold mb-4">⚙️ Tetapan</p>
            <Link to="/admin-settings" className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition-all">
              📧 Konfigurasi
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}