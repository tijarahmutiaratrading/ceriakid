import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

export default function ReusableSidebar({ 
  menuItems = [], 
  userGroups = [], 
  logo = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png',
  logoLabel = 'CeriaKid',
  logoSub = 'Dashboard',
  user = null,
  onMenuClick = () => {},
  onLogout = null,
  activeTab = null,
  setActiveTab = null,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const location = useLocation();

  const isPathActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const SidebarContent = ({ isDrawer = false }) => {
    const showLabels = isDrawer || !collapsed;

    return (
      <>
        {/* Header */}
        <div className={`flex items-center gap-3 mb-2 ${!isDrawer && collapsed ? 'flex-col px-0 py-2' : 'px-2 py-3'}`}>
          <img src={logo} alt={logoLabel} className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white/40 flex-shrink-0" />
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-tight drop-shadow truncate">{logoLabel}</p>
              <p className="text-[10px] text-white/70 font-semibold truncate">{logoSub}</p>
            </div>
          )}
          {!isDrawer && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/85 transition-all flex-shrink-0"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
          {isDrawer && (
            <button
              type="button"
              onClick={() => setExpandedGroup(null)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/85 transition-all flex-shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showLabels && (
          <div className="px-2 mb-2">
            <p className="text-[10px] font-black text-white/55 uppercase tracking-widest">Menu</p>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          {/* Main menu items */}
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeTab ? activeTab === item.tab : isPathActive(item.path);

            if (item.tab && setActiveTab) {
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.tab);
                    onMenuClick();
                  }}
                  title={!showLabels ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-2xl text-left transition-all ${!showLabels ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${active ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {showLabels && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm leading-tight ${active ? 'text-white' : 'text-white/90'}`}>{item.label}</p>
                        {item.sub && <p className="text-[10px] text-white/60 font-semibold truncate">{item.sub}</p>}
                      </div>
                      {active && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                    </>
                  )}
                </button>
              );
            }

            if (item.action) {
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    item.action();
                    onMenuClick();
                  }}
                  title={!showLabels ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-2xl text-left transition-all ${!showLabels ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${active ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {showLabels && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm leading-tight ${active ? 'text-white' : 'text-white/90'}`}>{item.label}</p>
                        {item.sub && <p className="text-[10px] text-white/60 font-semibold truncate">{item.sub}</p>}
                      </div>
                      {active && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                    </>
                  )}
                </button>
              );
            }

            if (item.path) {
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={onMenuClick}
                  title={!showLabels ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${active ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {showLabels && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm leading-tight ${active ? 'text-white' : 'text-white/90'}`}>{item.label}</p>
                        {item.sub && <p className="text-[10px] text-white/60 font-semibold truncate">{item.sub}</p>}
                      </div>
                      {active && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
                    </>
                  )}
                </Link>
              );
            }
          })}

          {/* User groups */}
          {userGroups.length > 0 && (
            <>
              {showLabels && (
                <div className="px-2 mt-4 mb-1">
                  <p className="text-[10px] font-black text-white/55 uppercase tracking-widest">Pengguna</p>
                </div>
              )}
              {!showLabels && <div className="h-px bg-white/10 my-2" />}

              {userGroups.map(group => {
                const Icon = group.icon;
                const hasSubmenu = group.submenu && group.submenu.length > 0;
                const groupActive = hasSubmenu ? group.submenu.some(s => isPathActive(s.path)) : isPathActive(group.path);
                const isExpanded = expandedGroup === group.key;

                if (!hasSubmenu) {
                  return (
                    <Link
                      key={group.key}
                      to={group.path}
                      onClick={onMenuClick}
                      title={!showLabels ? group.label : undefined}
                      className={`flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${groupActive ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
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
                        if (!showLabels) {
                          setCollapsed(false);
                          setExpandedGroup(group.key);
                          return;
                        }
                        setExpandedGroup(isExpanded ? null : group.key);
                      }}
                      title={!showLabels ? group.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-2xl transition-all ${!showLabels ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'} ${groupActive ? 'bg-white/20 ring-1 ring-white/30' : 'hover:bg-white/10'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${groupActive ? 'bg-white text-game-purple' : 'bg-white/15 text-white/85'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {showLabels && (
                        <>
                          <p className={`flex-1 text-left font-black text-sm leading-tight ${groupActive ? 'text-white' : 'text-white/90'}`}>{group.label}</p>
                          {groupActive && <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />}
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
                              const subActive = isPathActive(sub.path);
                              return (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={onMenuClick}
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
            </>
          )}
        </nav>

        {/* User profile */}
        {user && (
          <div className="mt-6 pt-4 border-t border-white/15">
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
            {showLabels && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs text-white/80 hover:bg-white/10 hover:text-red-300 transition-all"
              >
                <span>🚪</span>
                <span>Log Keluar</span>
              </button>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <aside className={`hidden md:flex flex-col flex-shrink-0 pro-glass rounded-3xl p-3 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <SidebarContent isDrawer={false} />
    </aside>
  );
}