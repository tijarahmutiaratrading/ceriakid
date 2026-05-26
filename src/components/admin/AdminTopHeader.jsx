import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Settings, Activity, Rocket,
  ChevronDown, LogOut, Home
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const ADMIN_MENU = [
  { key: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'customers', label: 'Pelanggan', icon: Users },
  { key: 'launch', label: 'Launch', icon: Rocket },
  { key: 'health', label: 'Health', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminTopHeader({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth() || {};
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const glassStyle = {
    background: 'rgba(15, 10, 30, 0.35)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.18)',
  };

  return (
    <header
      ref={navRef}
      className="hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 max-w-full">
        {/* Center: Floating pill nav with admin badge inside */}
        <nav
          className="flex items-center gap-1 px-2 py-1.5 rounded-full shadow-2xl shadow-black/50"
          style={glassStyle}
        >
          {/* Admin badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
            <span>Admin</span>
          </div>

          <div className="h-5 w-px bg-white/15 mx-0.5" />

          {/* Admin tabs */}
          {ADMIN_MENU.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm transition-colors ${
                  active ? 'text-amber-300' : 'text-white/85 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-pill"
                    className="absolute inset-0 rounded-full bg-black/45 ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative w-3.5 h-3.5" />
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Switch to user dashboard */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full font-black text-xs text-white shadow-2xl shadow-black/50 hover:bg-white/10 transition-all"
          style={glassStyle}
          title="Tukar ke Dashboard Pengguna"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Pengguna</span>
        </Link>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full shadow-2xl shadow-black/50 hover:bg-white/10 transition-all"
              style={glassStyle}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-300/40" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-black text-xs ring-1 ring-amber-300/40">
                  {(user.full_name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown className={`w-3 h-3 text-white/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-3 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                  style={{
                    background: 'rgba(20, 14, 38, 0.92)',
                    backdropFilter: 'blur(28px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="font-black text-xs text-white truncate">{user.full_name || 'Admin'}</p>
                    <p className="text-[10px] text-white/65 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout?.()}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/10 hover:text-red-300 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Log Keluar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}