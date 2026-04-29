import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calculator, Microscope, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function BottomNavigation() {
  const { isAuthenticated, logout } = useAuth();
  const ageGroupContext = useAgeGroup();
  const ageGroup = ageGroupContext?.ageGroup;
  const setAgeGroup = ageGroupContext?.setAgeGroup;
  const location = useLocation();

  // Don't show nav on landing, pricing, admin & client dashboards
  if (location.pathname === '/landing' || location.pathname === '/pricing' || 
      location.pathname === '/admin-dashboard' || location.pathname === '/client-dashboard') {
    return null;
  }

  const navItems = [
    { path: '/', emoji: '🏠', label: 'Home', category: 'home' },
    { path: `/games/bahasa_melayu`, emoji: '🇲🇾', label: 'Bahasa', category: 'bahasa_melayu' },
    { path: `/games/english`, emoji: '🇬🇧', label: 'English', category: 'english' },
    { path: `/games/mathematics`, emoji: '🔢', label: 'Math', category: 'mathematics' },
    { path: `/games/science`, emoji: '🔬', label: 'Science', category: 'science' },
    ...(isAuthenticated ? [{ path: '/parent-dashboard', emoji: '📊', label: 'Prestasi', category: 'dashboard' }] : []),
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 inset-x-0 z-40 px-4 py-4"
    >
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-full shadow-2xl px-3 py-3">
        {/* Navigation - Flex centered */}
        <div className="flex items-center justify-between gap-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} className="flex-1 min-w-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                className={`w-full flex flex-col items-center gap-1 py-2.5 px-2 rounded-2xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-slate-500/50 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="text-xs font-semibold tracking-tight">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}