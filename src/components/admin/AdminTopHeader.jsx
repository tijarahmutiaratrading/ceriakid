import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home } from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const ADMIN_MENU = [
  { key: 'analytics', label: 'Dashboard' },
  { key: 'launch', label: 'Launch' },
  { key: 'health', label: 'Health' },
  { key: 'affiliate', label: 'Affiliate' },
  { key: 'settings', label: 'Settings' },
];

export default function AdminTopHeader({ activeTab, setActiveTab }) {
  const isVisible = useScrollDirection();

  return (
    <header className={`hidden sm:flex fixed top-5 left-0 right-0 z-50 justify-center px-4 pointer-events-none transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>
      {/* Floating pill nav (Apple Fitness style — glossy light) */}
      <nav
        className="pointer-events-auto flex items-center gap-0 px-1.5 py-0.5 rounded-full max-w-[calc(100vw-2rem)]"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.85))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        {/* Switch ke user dashboard */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1 px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded-full text-sm lg:text-[15px] font-black text-amber-300 hover:text-amber-200 hover:bg-white/10 transition-colors whitespace-nowrap"
          title="Tukar ke Dashboard Pengguna"
        >
          <LayoutGrid className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
          <span>User</span>
        </Link>

        {/* Admin tabs */}
        {ADMIN_MENU.map(item => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`relative px-2 py-1.5 lg:px-2.5 lg:py-2 rounded-full font-black text-sm lg:text-[15px] transition-colors whitespace-nowrap ${
                active ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-full brand-gradient-br"
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