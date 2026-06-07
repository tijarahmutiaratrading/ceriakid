import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Gamepad2, GraduationCap, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/games-hub', icon: Gamepad2, label: 'Games' },
  { path: '/ai-assistant', icon: GraduationCap, label: 'Cikgu AI' },
  { path: '/parent-dashboard', icon: BarChart3, label: 'Prestasi' },
  { path: '/settings', icon: Settings, label: 'Tetapan' },
];

export default function BottomNavigation() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hanya tunjuk pada halaman authenticated, sorok pada landing, game play, dan drawing
  const hiddenPaths = ['/', '/terms', '/privacy', '/contact', '/thank-you'];
  const isGameplay = location.pathname.startsWith('/play/') ||
    location.pathname.startsWith('/games/memory') ||
    location.pathname.startsWith('/games/dragdrop') ||
    location.pathname.startsWith('/games/wordbuilder') ||
    location.pathname.startsWith('/games/sorting') ||
    location.pathname.startsWith('/games/tilematch') ||
    location.pathname.startsWith('/games/story') ||
    location.pathname.startsWith('/games/physics') ||
    location.pathname.startsWith('/games/tracing') ||
    location.pathname.startsWith('/mini-games') ||
    location.pathname === '/drawing' ||
    location.pathname === '/story-kid';

  if (!isAuthenticated || hiddenPaths.includes(location.pathname) || isGameplay) {
    return null;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="sm:hidden fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="flex items-center justify-around px-2 py-2 border-t border-white/10"
        style={{
          background: 'rgba(15,10,30,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all min-w-0 flex-1"
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                active ? 'bg-purple-500/30' : ''
              }`}>
                <Icon
                  className={`w-5 h-5 transition-all ${active ? 'text-purple-300' : 'text-white/50'}`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-purple-500/20 ring-1 ring-purple-400/40"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-black truncate w-full text-center leading-none transition-all ${
                active ? 'text-purple-300' : 'text-white/40'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}