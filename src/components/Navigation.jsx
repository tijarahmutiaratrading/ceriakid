import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Don't show nav on landing & pricing
  if (location.pathname === '/landing' || location.pathname === '/pricing') {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: '🏠' },
    ...(isAuthenticated ? [{ path: '/parent-dashboard', icon: BarChart3, label: '📊' }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 clay rounded-t-3xl px-4 py-3 mx-4 mb-4 max-w-sm mx-auto"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Nav Items */}
        <div className="flex gap-2 flex-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className="flex-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`w-full py-3 rounded-2xl font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-game-purple text-white shadow-lg'
                    : 'bg-transparent text-game-purple hover:bg-game-purple/10'
                }`}
              >
                <span className="text-lg">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex gap-2">
          <LanguageToggle />
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="clay-button rounded-2xl p-3"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}