import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

const ADMIN_MENU = [
  { key: 'analytics', label: 'Dashboard' },
  { key: 'customers', label: 'Pelanggan' },
  { key: 'launch', label: 'Launch' },
  { key: 'health', label: 'Health' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminTopHeader({ activeTab, setActiveTab }) {
  return (
    <header className="hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center px-4 pointer-events-none">
      {/* Floating pill nav (Apple Fitness style) — selari dengan UserTopHeader */}
      <nav
        className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full shadow-2xl shadow-black/50"
        style={{
          background: 'rgba(15, 10, 30, 0.35)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        {/* Switch ke user dashboard (kiri, macam Admin badge di UserTopHeader) */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-amber-300 hover:text-amber-200 hover:bg-white/5 transition-all"
          title="Tukar ke Dashboard Pengguna"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Pengguna</span>
        </Link>

        {/* Admin tabs */}
        {ADMIN_MENU.map(item => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`relative px-4 py-1.5 rounded-full font-black text-sm transition-colors ${
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
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}