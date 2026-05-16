import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, ExternalLink, Gamepad2 } from 'lucide-react';

const MENU = [
  { key: 'dashboard', label: 'Dashboard', sub: 'Order & Analytics', icon: LayoutDashboard, tab: 'analytics' },
  { key: 'customers', label: 'Pelanggan', sub: 'Customer Database', icon: Users, tab: 'customers' },
  { key: 'settings', label: 'Settings', sub: 'Payment & Pixel', icon: Settings, tab: 'settings' },
];

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 pro-glass rounded-3xl p-4 sticky top-28 h-fit">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2">
        <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white/40" />
        <div>
          <p className="font-black text-white text-sm leading-tight drop-shadow">Admin Panel</p>
          <p className="text-[10px] text-white/70 font-semibold">CeriaKid Control</p>
        </div>
      </div>

      <div className="px-2 mb-2">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-widest">Menu</p>
      </div>

      <nav className="flex flex-col gap-1">
        {MENU.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.tab;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all ${active ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm leading-tight ${active ? 'text-white' : 'text-white/90'}`}>{item.label}</p>
                <p className="text-[10px] text-white/60 font-semibold truncate">{item.sub}</p>
              </div>
              {active && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
            </button>
          );
        })}

        <Link
          to="/admin-game-manager"
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/10 transition-all"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-400/30 text-emerald-100 flex-shrink-0 ring-1 ring-white/15">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white/90 leading-tight">Game Manager</p>
            <p className="text-[10px] text-white/60 font-semibold">Master Generator</p>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/10 transition-all"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 text-white/85 flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white/90 leading-tight">Lihat Website</p>
            <p className="text-[10px] text-white/60 font-semibold">Landing Page</p>
          </div>
        </Link>
      </nav>

      {/* User card */}
      {user && (
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0 ring-2 ring-white/30">
              {(user.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs text-white truncate">{user.full_name || 'Admin'}</p>
              <p className="text-[10px] text-white/65 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}