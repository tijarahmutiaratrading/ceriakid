import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, Settings, Mail, TrendingUp, GamepadIcon } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminHub() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-xl font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: '📊 Dashboards',
      items: [
        { name: 'Admin Dashboard', path: '/admin-dashboard', icon: BarChart3, desc: 'User & subscription overview' },
        { name: 'Analytics +', path: '/admin-analytics-advanced', icon: TrendingUp, desc: 'Cohort, retention & LTV' },
        { name: 'Basic Analytics', path: '/admin-analytics', icon: BarChart3, desc: 'Quick metrics' },
      ]
    },
    {
      title: '⚙️ Management',
      items: [
        { name: 'Settings', path: '/admin-settings', icon: Settings, desc: 'App configuration' },
        { name: 'Games Manager', path: '/admin-games', icon: GamepadIcon, desc: 'Content management' },
      ]
    },
    {
      title: '👥 Automations',
      items: [
        { name: 'Email Reports', path: '#', icon: Mail, desc: 'Weekly parent emails (scheduled)' },
        { name: 'Webhooks', path: '#', icon: Users, desc: 'Stripe & integrations' },
      ]
    },
    {
      title: '🏢 B2B',
      items: [
        { name: 'B2B Landing', path: '/b2b', icon: TrendingUp, desc: 'School partnerships' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-purple/5 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">🎛️ Admin Hub</h1>
          <p className="text-gray-600">Centralized control panel for {user?.full_name || 'Admin'}</p>
        </motion.div>

        {/* Admin Stats Quick View */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Total Users', value: '500+' },
            { label: 'Active Games', value: '200+' },
            { label: 'Revenue (MTD)', value: 'RM 15K' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 text-center border-2 border-game-purple/20 shadow-md"
            >
              <p className="text-2xl font-black text-game-purple">{stat.value}</p>
              <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="space-y-8">
          {adminSections.map((section, sIdx) => (
            <motion.div key={sIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sIdx * 0.1 }}>
              <h2 className="text-xl font-black text-gray-800 mb-4">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link key={idx} to={item.path} className="group">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-white rounded-2xl p-5 border-2 border-amber-200 shadow-md group-hover:shadow-lg group-hover:border-game-purple/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-6 h-6 text-game-purple mt-1" />
                          <div className="flex-1">
                            <p className="font-black text-gray-800 group-hover:text-game-purple transition-colors">{item.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                          </div>
                          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 p-6 bg-gradient-to-r from-game-purple to-purple-600 text-white rounded-3xl shadow-lg"
        >
          <p className="font-bold mb-4">⚡ Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <a href="mailto:support@jombelajar.app" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition-all">
              📧 Support
            </a>
            <a href="https://github.com" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-bold transition-all">
              🔧 GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}