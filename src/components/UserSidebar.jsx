import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Palette, BookOpen, UserCircle, BarChart3, Settings,
  UserPlus, Trophy, ChevronLeft, ChevronRight, ChevronDown, Shield, LogOut, ChevronsUpDown
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { getChildAvatar } from '@/lib/childAvatars';
import { haptic } from '@/lib/haptics';
import ChildSwitcherModal from '@/components/header/ChildSwitcherModal';

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

export default function UserSidebar() {
  const { user, logout } = useAuth() || {};
  const location = useSafeLocation();
  const { selectedChild, childrenList = [], setSelectedChild } = useSelectedChild() || {};
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const handleCollapse = (newState) => {
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const [expanded, setExpanded] = useState(() => {
    // Auto-expand group containing active route
    const active = NAV_GROUPS.find(g => g.submenu?.some(s => location.pathname.startsWith(s.path)));
    return active?.key || null;
  });

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const showLabels = !collapsed;

  return (
    <aside
      className={`hidden md:flex flex-col flex-shrink-0 rounded-3xl p-3 mt-6 ml-4 transition-all duration-300 shadow-2xl shadow-black/30 sticky top-6 self-start ${collapsed ? 'w-20' : 'w-64'}`}
      style={{
        background: 'rgba(15, 10, 30, 0.35)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 mb-2 ${collapsed ? 'flex-col px-0 py-2' : 'px-2 py-3'}`}>
        <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white/40 flex-shrink-0" />
        {showLabels && (
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm leading-tight drop-shadow truncate">CeriaKid</p>
            <p className="text-[10px] text-white/70 font-semibold truncate">Dashboard Pengguna</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => handleCollapse(!collapsed)}
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/85 transition-all flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Child switcher pill — match top header style */}
      {selectedChild && childrenList.length > 1 && (
        <button
          type="button"
          onClick={() => { haptic('light'); setSwitcherOpen(true); }}
          aria-label={`Anak aktif: ${selectedChild.name}. Tap untuk tukar.`}
          title={!showLabels ? `Anak: ${selectedChild.name}` : undefined}
          className={`flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white shadow-md transition-all mb-3 ${!showLabels ? 'justify-center p-1' : 'pl-1 pr-1.5 py-1 mx-1'}`}
        >
          <img
            src={getChildAvatar(selectedChild)}
            alt={selectedChild.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-200 bg-white flex-shrink-0"
          />
          {showLabels && (
            <>
              <div className="text-left leading-none flex-1 min-w-0">
                <p className="text-pink-600 text-[8px] font-black uppercase tracking-wider">Anak Aktif</p>
                <p className="text-slate-800 text-[11px] font-black truncate mt-0.5">{selectedChild.name}</p>
              </div>
              <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-pink-100 flex-shrink-0">
                <span className="text-pink-600 text-[8px] font-black uppercase tracking-wider">Tukar</span>
                <ChevronsUpDown className="w-2.5 h-2.5 text-pink-600" strokeWidth={3} />
              </div>
            </>
          )}
        </button>
      )}

      {showLabels && (
        <div className="px-2 mb-2">
          <p className="text-[10px] font-black text-white/55 uppercase tracking-widest">Menu</p>
        </div>
      )}

      <nav className="flex flex-col gap-1.5">
        {NAV_GROUPS.map(group => {
          const Icon = group.icon;
          const hasSubmenu = group.submenu && group.submenu.length > 0;
          const groupActive = hasSubmenu ? group.submenu.some(s => isActive(s.path)) : isActive(group.path);
          const isExpanded = expanded === group.key;

          if (!hasSubmenu) {
            return (
              <Link
                key={group.key}
                to={group.path}
                title={!showLabels ? group.label : undefined}
                className={`flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-3' : 'px-3 py-3'} ${groupActive ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${groupActive ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {showLabels && (
                  <>
                    <p className={`flex-1 font-black text-sm leading-tight ${groupActive ? 'text-white' : 'text-white/90'}`}>{group.label}</p>
                    {groupActive && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                  </>
                )}
              </Link>
            );
          }

          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => {
                  if (collapsed) { setCollapsed(false); setExpanded(group.key); return; }
                  setExpanded(isExpanded ? null : group.key);
                }}
                title={!showLabels ? group.label : undefined}
                className={`w-full flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-3' : 'px-3 py-3'} ${groupActive ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${groupActive ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {showLabels && (
                  <>
                    <p className={`flex-1 text-left font-black text-sm leading-tight ${groupActive ? 'text-white' : 'text-white/90'}`}>{group.label}</p>
                    <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </>
                )}
              </button>

              <AnimatePresence initial={false}>
                {showLabels && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 mt-1 mb-1 pl-3 border-l-2 border-white/20 space-y-1">
                      {group.submenu.map(sub => {
                        const SubIcon = sub.icon;
                        const subActive = isActive(sub.path);
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-bold text-xs transition-all ${subActive ? 'bg-white text-game-purple shadow-sm' : 'text-white/85 hover:bg-white/15 hover:text-white'}`}
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {isAdmin && (
          <Link
            to="/admin-dashboard"
            title={!showLabels ? 'Admin' : undefined}
            className={`flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-3' : 'px-3 py-3'} hover:bg-white/10`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500 text-white flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-white/90 leading-tight">Admin</p>
                <p className="text-[10px] text-white/60 font-semibold">Dashboard Admin</p>
              </div>
            )}
          </Link>
        )}
      </nav>

      {user && (
        <div className="mt-2 pt-2 border-t border-white/15">
          <div className={`flex items-center gap-3 rounded-2xl bg-white/10 ${!showLabels ? 'justify-center p-2' : 'p-2'}`} title={!showLabels ? user.full_name || 'User' : undefined}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white/30" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0 ring-2 ring-white/30">
                {(user.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs text-white truncate">{user.full_name || 'User'}</p>
                <p className="text-[10px] text-white/65 truncate">{user.email}</p>
              </div>
            )}
          </div>
          {showLabels && (
            <button
              type="button"
              onClick={() => logout?.()}
              className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs text-white/80 hover:bg-white/10 hover:text-red-300 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Log Keluar</span>
            </button>
          )}
        </div>
      )}

      <ChildSwitcherModal
        open={switcherOpen}
        children={childrenList}
        selectedChild={selectedChild}
        onSelect={setSelectedChild}
        onClose={() => setSwitcherOpen(false)}
        onAddChild={() => setSwitcherOpen(false)}
      />
    </aside>
  );
}