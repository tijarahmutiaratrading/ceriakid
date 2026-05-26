import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Settings, Activity, Rocket,
  ChevronDown, LogOut, ExternalLink, Home
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const ADMIN_MENU = [
  { key: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'customers', label: 'Pelanggan', icon: Users },
  { key: 'launch', label: 'Launch Control', icon: Rocket },
  { key: 'health', label: 'System Health', icon: Activity },
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

  return (
    <header
      ref={navRef}
      className="hidden md:flex sticky top-3 z-40 mx-3 mt-3 rounded-3xl shadow-2xl shadow-black/30 px-3 py-2 items-center gap-2"
      style={{
        background: 'rgba(15, 10, 30, 0.35)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      {/* Logo + Admin badge */}
      <Link to="/admin-dashboard" className="flex items-center gap-2.5 px-2 flex-shrink-0">
        <img
          src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
          alt="CeriaKid"
          className="w-9 h-9 rounded-xl object-cover shadow-md ring-2 ring-amber-300/60"
        />
        <div className="hidden lg:block">
          <p className="font-black text-white text-sm leading-tight drop-shadow">Admin Panel</p>
          <p className="text-[10px] text-amber-300 font-semibold">CeriaKid Control</p>
        </div>
      </Link>

      <div className="h-8 w-px bg-white/15 mx-1" />

      {/* Admin tabs */}
      <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
        {ADMIN_MENU.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
                active ? 'bg-white/20 ring-1 ring-white/30 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Switch to user dashboard */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all flex-shrink-0"
        title="Tukar ke Dashboard Pengguna"
      >
        <Home className="w-4 h-4" />
        <span className="hidden lg:inline">Pengguna</span>
      </Link>

      {/* User menu */}
      {user && (
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-300/40" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-black text-sm ring-2 ring-amber-300/40">
                {(user.full_name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                style={{
                  background: 'rgba(15, 10, 30, 0.9)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="font-black text-xs text-white truncate">{user.full_name || 'Admin'}</p>
                  <p className="text-[10px] text-white/65 truncate">{user.email}</p>
                </div>
                <Link
                  to="/"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/15 hover:text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Lihat Website</span>
                </Link>
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