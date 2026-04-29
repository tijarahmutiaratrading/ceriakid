import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, BarChart3, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>🔒 Access Denied</p>
      </div>
    );
  }

  const settings = [
    {
      title: 'Tetapan Sistem',
      icon: Settings,
      desc: 'Kelola API keys, webhook, dan konfigurasi',
      path: '#settings-system',
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Dashboard Penjualan',
      icon: BarChart3,
      desc: 'Lihat KPI, revenue, dan konversi',
      path: '/admin-analytics-advanced',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Kelola Pengguna',
      icon: Users,
      desc: 'Lihat, edit, dan urus pengguna',
      path: '#settings-users',
      color: 'from-green-400 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <Link to="/admin-hub">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-4xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Settings className="w-10 h-10" />
          Tetapan Admin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.map((setting, i) => {
            const Icon = setting.icon;
            return (
              <a key={i} href={setting.path} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${setting.color} text-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-black text-lg mb-2">{setting.title}</h3>
                  <p className="text-sm opacity-90">{setting.desc}</p>
                </motion.div>
              </a>
            );
          })}
        </div>

        {/* Settings sections */}
        <div id="settings-system" className="mt-12 bg-white rounded-2xl p-8 border-2 border-amber-200 shadow-md">
          <h2 className="text-2xl font-black mb-6">🔑 API Keys & Webhooks</h2>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-bold text-amber-900 mb-2">FB Pixel ID</p>
              <code className="text-sm font-mono text-amber-700 break-all">1234567890</code>
              <p className="text-xs text-amber-600 mt-2">⚠️ Ganti dengan ID sebenar dari Facebook Ads Manager</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-bold text-amber-900 mb-2">Stripe Webhook URL</p>
              <code className="text-sm font-mono text-amber-700 break-all">https://jombelajar.app/functions/handleStripeWebhook</code>
              <p className="text-xs text-amber-600 mt-2">✅ Webhook signature validation aktif</p>
            </div>
          </div>
        </div>

        <div id="settings-users" className="mt-12 bg-white rounded-2xl p-8 border-2 border-amber-200 shadow-md">
          <h2 className="text-2xl font-black mb-6">👥 Kelola Pengguna</h2>
          <Link to="/admin-dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-game-purple text-white rounded-full font-bold shadow-lg"
            >
              Lihat Semua Pengguna →
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}