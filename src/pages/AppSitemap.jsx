import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AppSitemap() {
  const { isAuthenticated } = useAuth();

  const siteStructure = [
    {
      category: '🏠 Home',
      desc: 'Main entry point',
      items: [
        { name: 'Home Page', path: '/', users: 'All', emoji: '🎮' },
        { name: 'Landing (Pricing)', path: '/landing', users: 'Public', emoji: '💰' },
      ]
    },
    {
      category: '📚 Learning',
      desc: 'Core game & learning features',
      items: [
        { name: 'Games by Category', path: '/games/:category', users: 'All', emoji: '🎯' },
        { name: 'Game Player', path: '/play/:category/:index', users: 'All', emoji: '🎮' },
        { name: 'Drawing Studio', path: '/drawing', users: 'All', emoji: '🎨' },
        { name: 'Daily Challenge', path: '#', users: 'Logged In', emoji: '⚡' },
      ]
    },
    {
      category: '👥 Social & Challenges',
      desc: 'Viral & engagement features',
      items: [
        { name: 'Friends List', path: '/friends', users: 'Logged In', emoji: '👥' },
        { name: 'Friend Challenges', path: '/challenges', users: 'Logged In', emoji: '⚔️' },
        { name: 'Leaderboards', path: '#', users: 'Logged In', emoji: '🏆' },
      ]
    },
    {
      category: '📊 Parent/Student',
      desc: 'Progress tracking & reports',
      items: [
        { name: 'Parent Dashboard', path: '/parent-dashboard', users: 'Parents', emoji: '📈' },
        { name: 'Student Progress', path: '#', users: 'Students', emoji: '⭐' },
        { name: 'Achievements', path: '#', users: 'Logged In', emoji: '🏅' },
      ]
    },
    {
      category: '🛒 Subscription',
      desc: 'Billing & account management',
      items: [
        { name: 'Client Dashboard', path: '/client-dashboard', users: 'Logged In', emoji: '💳' },
        { name: 'Checkout', path: '#', users: 'Public', emoji: '🛍️' },
      ]
    },
    {
      category: '🎛️ Admin Only',
      desc: 'Administration & analytics',
      items: [
        { name: 'Admin Hub', path: '/admin-hub', users: 'Admins', emoji: '🎛️' },
        { name: 'Admin Dashboard', path: '/admin-dashboard', users: 'Admins', emoji: '📊' },
        { name: 'Analytics+', path: '/admin-analytics-advanced', users: 'Admins', emoji: '📈' },
        { name: 'Basic Analytics', path: '/admin-analytics', users: 'Admins', emoji: '📉' },
        { name: 'Settings', path: '/admin-settings', users: 'Admins', emoji: '⚙️' },
      ]
    },
    {
      category: '🏢 B2B',
      desc: 'School partnerships & enterprise',
      items: [
        { name: 'B2B Landing', path: '/b2b', users: 'Schools', emoji: '🏫' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-blue/5 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">🗺️ App Sitemap</h1>
          <p className="text-gray-600">Complete guide to all features & pages in Jom Belajar</p>
        </motion.div>

        {/* Legend */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'All Users', color: 'bg-green-100' },
            { label: 'Logged In', color: 'bg-blue-100' },
            { label: 'Admins', color: 'bg-purple-100' },
            { label: 'Public', color: 'bg-gray-100' },
            { label: 'Schools', color: 'bg-orange-100' },
            { label: 'Parents', color: 'bg-pink-100' },
          ].map((badge, i) => (
            <div key={i} className={`${badge.color} rounded-lg px-3 py-2 text-xs font-bold`}>
              {badge.label}
            </div>
          ))}
        </div>

        {/* Sitemap */}
        <div className="space-y-8">
          {siteStructure.map((section, sIdx) => (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-black text-gray-900">{section.category}</h2>
                <p className="text-sm text-gray-600">{section.desc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item, idx) => {
                  const badgeMap = {
                    'All': 'bg-green-100 text-green-700',
                    'Logged In': 'bg-blue-100 text-blue-700',
                    'Admins': 'bg-purple-100 text-purple-700',
                    'Public': 'bg-gray-100 text-gray-700',
                    'Schools': 'bg-orange-100 text-orange-700',
                    'Parents': 'bg-pink-100 text-pink-700',
                    'Students': 'bg-indigo-100 text-indigo-700',
                  };

                  const isLinkable = item.path && item.path !== '#' && (
                    !item.users === 'Admins' || isAuthenticated
                  );

                  const content = (
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="bg-white rounded-xl p-4 border-2 border-amber-200 flex items-center justify-between group hover:border-game-blue/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 group-hover:text-game-blue transition-colors">{item.name}</p>
                          <code className="text-xs text-gray-500 font-mono">{item.path}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeMap[item.users]}`}>
                          {item.users}
                        </span>
                        {isLinkable && <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-game-blue" />}
                      </div>
                    </motion.div>
                  );

                  return isLinkable ? (
                    <Link key={idx} to={item.path} className="group">
                      {content}
                    </Link>
                  ) : (
                    <div key={idx} className="group opacity-75">
                      {content}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* App Flow Diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-gradient-to-br from-game-blue/10 to-purple-100/10 rounded-3xl border-2 border-game-blue/20"
        >
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            📱 User Journey Flow
          </h3>
          <div className="space-y-4 text-sm">
            <p className="flex items-center gap-2"><span className="text-lg">👤</span> <strong>Public User:</strong> Landing → Games → (Login) → Play Games</p>
            <p className="flex items-center gap-2"><span className="text-lg">👨‍👧</span> <strong>Parent:</strong> Home → Games → Parent Dashboard → (Optional: B2B Demo)</p>
            <p className="flex items-center gap-2"><span className="text-lg">🎮</span> <strong>Student:</strong> Home → Games → Challenges → Friends → Achievements</p>
            <p className="flex items-center gap-2"><span className="text-lg">🎛️</span> <strong>Admin:</strong> Admin Hub → Dashboards → Analytics → Settings</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}