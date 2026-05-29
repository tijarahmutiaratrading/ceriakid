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
        className="pointer-events-auto flex items-center gap-0 px-1.5 py-1.5 rounded-full shadow-xl shadow-black/20 max-w-[calc(100vw-2rem)]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <Link to="/" title="Ke Landing Page" className="flex-shrink-0">
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
            alt="CeriaKid"
            className="h-8 w-8 rounded-full object-cover ml-1 mr-2 ring-1 ring-white/60 shadow-sm hover:ring-amber-300 transition-all"
          />
        </Link>

        {/* Switch ke user dashboard */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black text-amber-700 hover:text-amber-900 hover:bg-white/50 transition-colors whitespace-nowrap"
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
              className={`relative px-3 py-1.5 rounded-full font-black text-sm transition-colors whitespace-nowrap ${
                active ? 'text-white' : 'text-slate-800 hover:text-slate-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className="absolute inset-0 rounded-full bg-slate-900 ring-1 ring-white/20"
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