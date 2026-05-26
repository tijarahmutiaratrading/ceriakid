import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Palette, BookOpen, UserCircle, BarChart3, Settings,
  UserPlus, Trophy, ChevronDown, Shield, LogOut, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';

const NAV_GROUPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    key: 'keluarga',
    label: 'Keluarga',
    submenu: [
      { path: '/children-profiles', label: 'Profil Anak', icon: UserCircle },
      { path: '/parent-dashboard', label: 'Prestasi Anak', icon: BarChart3 },
      { path: '/settings', label: 'Tetapan', icon: Settings },
    ],
  },
  {
    key: 'aktiviti',
    label: 'Aktiviti',
    submenu: [
      { path: '/drawing', label: 'Studio Lukisan', icon: Palette },
      { path: '/story-kid', label: 'Story Kid', icon: BookOpen },
    ],
  },
  {
    key: 'sosial',
    label: 'Sosial',
    submenu: [
      { path: '/friends', label: 'Kawan', icon: UserPlus },
      { path: '/challenges', label: 'Cabaran', icon: Trophy },
    ],
  },
  {
    key: 'sokongan',
    label: 'Sokongan',
    submenu: [
      { path: '/contact', label: 'Hubungi Kami', icon: MessageCircle },
    ],
  },
];

export default function UserTopHeader() {
  const { user, logout } = useAuth() || {};
  const location = useSafeLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className="hidden md:flex fixed top-2 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
    >
      {/* Center: Floating pill nav (Apple Fitness style) */}
      <nav
        className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full shadow-2xl shadow-black/50"
        style={{
          background: 'rgba(15, 10, 30, 0.35)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        {isAdmin && (
          <Link
            to="/admin-dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-all"
            title="Tukar ke Admin Panel"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}
        {NAV_GROUPS.map(group => {
          const hasSubmenu = group.submenu && group.submenu.length > 0;
          const groupActive = hasSubmenu ? group.submenu.some(s => isActive(s.path)) : isActive(group.path);
          const isOpen = openMenu === group.key;
          const showActive = groupActive || isOpen;

          if (!hasSubmenu) {
            return (
              <Link
                key={group.key}
                to={group.path}
                className={`relative px-4 py-1.5 rounded-full font-black text-sm transition-colors ${
                  showActive ? 'text-amber-300' : 'text-white/85 hover:text-white'
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-black/45 ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{group.label}</span>
              </Link>
            );
          }

          return (
            <div key={group.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : group.key)}
                className={`relative flex items-center gap-1 px-4 py-1.5 rounded-full font-black text-sm transition-colors ${
                  showActive ? 'text-amber-300' : 'text-white/85 hover:text-white'
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-black/45 ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{group.label}</span>
                <ChevronDown className={`relative w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                    style={{
                      background: 'rgba(20, 14, 38, 0.92)',
                      backdropFilter: 'blur(28px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {group.submenu.map(sub => {
                      const SubIcon = sub.icon;
                      const subActive = isActive(sub.path);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            subActive ? 'bg-white/15 text-amber-300' : 'text-white/85 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </header>
  );
}