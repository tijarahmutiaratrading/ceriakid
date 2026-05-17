import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, ExternalLink, Gamepad2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU = [
  { key: 'dashboard', label: 'Dashboard', sub: 'Order & Analytics', icon: LayoutDashboard, tab: 'analytics' },
  { key: 'customers', label: 'Pelanggan', sub: 'Customer Database', icon: Users, tab: 'customers' },
  { key: 'gamemanager', label: 'Game Manager', sub: 'Generator & QC', icon: Gamepad2, tab: 'gamemanager' },
  { key: 'settings', label: 'Settings', sub: 'Payment & Pixel', icon: Settings, tab: 'settings' },
];

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ isDrawer = false }) => (
    <div className={`flex items-center gap-3 mb-2 ${!isDrawer && collapsed ? 'flex-col px-0 py-2' : 'px-2 py-3'}`}>
      <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white/40 flex-shrink-0" />
      {(!isDrawer || !collapsed) && (
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm leading-tight drop-shadow truncate">Admin Panel</p>
          <p className="text-[10px] text-white/70 font-semibold truncate">CeriaKid Control</p>
        </div>
      )}
      {!isDrawer && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/85 transition-all flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
      {isDrawer && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/85 transition-all flex-shrink-0"
          title="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    {((!isDrawer && !collapsed) || isDrawer) && (
      <div className="px-2 mb-2">
        <p className="text-[10px] font-black text-white/55 uppercase tracking-widest">Menu</p>
      </div>
    )}

    <nav className="flex flex-col gap-1">
        {MENU.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.tab;
          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.tab);
                if (isDrawer) setMobileOpen(false);
              }}
              title={!isDrawer && collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-2xl text-left transition-all ${!isDrawer && collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${active ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                <Icon className="w-4 h-4" />
              </div>
              {((!isDrawer && !collapsed) || isDrawer) && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm leading-tight ${active ? 'text-white' : 'text-white/90'}`}>{item.label}</p>
                    <p className="text-[10px] text-white/60 font-semibold truncate">{item.sub}</p>
                  </div>
                  {active && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                </>
              )}
            </button>
          );
        })}

        <Link
          to="/"
          onClick={() => isDrawer && setMobileOpen(false)}
          title={!isDrawer && collapsed ? 'Lihat Website' : undefined}
          className={`flex items-center gap-3 rounded-2xl hover:bg-white/10 transition-all ${!isDrawer && collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 text-white/85 flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
          {((!isDrawer && !collapsed) || isDrawer) && (
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-white/90 leading-tight">Lihat Website</p>
              <p className="text-[10px] text-white/60 font-semibold">Landing Page</p>
            </div>
          )}
        </Link>
      </nav>

    {user && (
      <div className="mt-6 pt-4 border-t border-white/15">
        <div className={`flex items-center gap-3 rounded-2xl bg-white/10 ${!isDrawer && collapsed ? 'justify-center p-2' : 'p-2'}`} title={!isDrawer && collapsed ? user.full_name || 'Admin' : undefined}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0 ring-2 ring-white/30">
            {(user.full_name || 'A').charAt(0).toUpperCase()}
          </div>
          {((!isDrawer && !collapsed) || isDrawer) && (
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs text-white truncate">{user.full_name || 'Admin'}</p>
              <p className="text-[10px] text-white/65 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    )}
  );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 pro-glass rounded-3xl p-3 sticky top-28 h-fit transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent isDrawer={false} />
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
        title="Admin menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="lg:hidden fixed left-3 right-3 top-20 bottom-3 z-50 w-auto pro-glass rounded-3xl p-3 flex flex-col overflow-y-auto"
            >
              <SidebarContent isDrawer={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}