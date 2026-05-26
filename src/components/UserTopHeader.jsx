import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Palette, BookOpen, UserCircle, BarChart3, Settings,
  UserPlus, Trophy, ChevronDown, Shield, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';

const NAV_GROUPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    key: 'keluarga',
    label: 'Keluarga',
    icon: Users,
    submenu: [
      { path: '/children-profiles', label: 'Profil Anak', icon: UserCircle },
      { path: '/parent-dashboard', label: 'Prestasi Anak', icon: BarChart3 },
      { path: '/settings', label: 'Tetapan', icon: Settings },
    ],
  },
  {
    key: 'aktiviti',
    label: 'Aktiviti',
    icon: Palette,
    submenu: [
      { path: '/drawing', label: 'Studio Lukisan', icon: Palette },
      { path: '/story-kid', label: 'Story Kid', icon: BookOpen },
    ],
  },
  {
    key: 'sosial',
    label: 'Sosial',
    icon: UserPlus,
    submenu: [
      { path: '/friends', label: 'Kawan', icon: UserPlus },
      { path: '/challenges', label: 'Cabaran', icon: Trophy },
    ],
  },
];

export default function UserTopHeader() {
  const { user, logout } = useAuth() || {};
  const location = useSafeLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // Close dropdowns on outside click
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

  // Close menus on route change
  useEffect(() => {
    setOpenMenu(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className="hidden md:flex sticky top-3 z-40 mx-3 mt-3 rounded-3xl shadow-2xl shadow-black/30 px-3 py-2 items-center gap-2"
      style={{
        background: 'rgba(15, 10, 30, 0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2.5 px-2 flex-shrink-0">
        <img
          src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
          alt="CeriaKid"
          className="w-9 h-9 rounded-xl object-cover shadow-md ring-2 ring-white/40"
        />
        <p className="font-black text-white text-sm leading-tight drop-shadow hidden lg:block">CeriaKid</p>
      </Link>

      <div className="h-8 w-px bg-white/15 mx-1" />

      {/* Nav items */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_GROUPS.map(group => {
          const Icon = group.icon;
          const hasSubmenu = group.submenu && group.submenu.length > 0;
          const groupActive = hasSubmenu ? group.submenu.some(s => isActive(s.path)) : isActive(group.path);
          const isOpen = openMenu === group.key;

          if (!hasSubmenu) {
            return (
              <Link
                key={group.key}
                to={group.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm transition-all ${
                  groupActive ? 'bg-white/20 ring-1 ring-white/30 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{group.label}</span>
              </Link>
            );
          }

          return (
            <div key={group.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : group.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm transition-all ${
                  groupActive || isOpen ? 'bg-white/20 ring-1 ring-white/30 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{group.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                    style={{
                      background: 'rgba(15, 10, 30, 0.85)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.15)',
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
                            subActive ? 'bg-white text-game-purple shadow-sm' : 'text-white/85 hover:bg-white/15 hover:text-white'
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

      {/* Switch to admin dashboard (admin only) */}
      {isAdmin && (
        <Link
          to="/admin-dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all flex-shrink-0"
          title="Tukar ke Admin Panel"
        >
          <Shield className="w-4 h-4" />
          <span className="hidden lg:inline">Admin</span>
        </Link>
      )}

      {/* User menu */}
      {user && (
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 flex items-center justify-center text-white font-black text-sm ring-2 ring-white/30">
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="font-black text-xs text-white truncate max-w-[8rem]">{user.full_name || 'User'}</p>
              <p className="text-[10px] text-white/65 truncate max-w-[8rem]">{user.email}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 min-w-[12rem] rounded-2xl p-2 shadow-2xl z-50"
                style={{
                  background: 'rgba(15, 10, 30, 0.85)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1 lg:hidden">
                  <p className="font-black text-xs text-white truncate">{user.full_name || 'User'}</p>
                  <p className="text-[10px] text-white/65 truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => logout?.()}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/15 hover:text-red-300 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Log Keluar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  );
}