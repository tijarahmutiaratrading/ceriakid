import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, RefreshCw, Trash2, LogOut, LayoutGrid, BarChart3, Gamepad2, Activity, Share2, Settings } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const TABS = [
  { key: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { key: 'launch', label: 'Launch', icon: Gamepad2 },
  { key: 'health', label: 'Health', icon: Activity },
  { key: 'affiliate', label: 'Affiliate', icon: Share2 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Linear/Stripe-style consolidated admin header.
 * Combines: greeting + KPI stats + tab nav into 1 clean section.
 */
export default function AdminUnifiedHeader({
  activeTab,
  setActiveTab,
  stats,
  onRefresh,
  onClearCache,
  clearingCache,
}) {
  const { user, logout } = useAuth() || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const firstName = (user?.full_name || '').split(' ')[0] || 'Admin';

  return (
    <div className="space-y-5">
      {/* Top bar — greeting + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 group"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-600" />
                  <p className="text-[10px] font-black tracking-[0.15em] text-amber-700">ADMIN</p>
                </div>
                <p className="text-slate-900 font-black text-sm leading-tight truncate flex items-center gap-1">
                  {firstName} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </p>
              </div>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-2 min-w-[14rem] rounded-xl p-1.5 shadow-xl z-20 bg-white ring-1 ring-slate-200"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-black text-xs text-slate-900 truncate">{user?.full_name || 'Admin'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Dashboard Pengguna</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); logout?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-xs text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Log Keluar</span>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm ring-1 ring-slate-200 bg-white/60 transition-all"
            title="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={onClearCache}
            disabled={clearingCache}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm ring-1 ring-slate-200 bg-white/60 transition-all disabled:opacity-50"
            title="Clear cache"
          >
            <Trash2 className={`w-3.5 h-3.5 ${clearingCache ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Cache</span>
          </button>
        </div>
      </div>

      {/* KPI strip — minimal, no big colored cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden ring-1 ring-slate-200">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {s.icon && <s.icon className={`w-3.5 h-3.5 ${s.iconColor || 'text-slate-400'}`} />}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{s.value}</p>
              {s.sub && (
                <p className="text-[11px] font-semibold text-slate-500 mt-1.5 truncate">{s.sub}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Sticky tab nav — Linear-style segmented */}
      <div className="sticky top-2 z-30 -mx-1 px-1">
        <div
          className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-unified-tab"
                    className="absolute inset-0 rounded-lg bg-slate-900"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative w-3.5 h-3.5" />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}