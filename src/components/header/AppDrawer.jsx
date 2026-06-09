import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, ChevronRight, LogOut, Crown, ChevronsUpDown, Sparkles, Pin, PinOff, Check, Plus,
  Home, LayoutDashboard, Settings, Users, Mail, BookOpen, Gamepad2, Palette, BookMarked,
  UserPlus, Trophy, Baby, LineChart, GraduationCap, HelpCircle, Sparkle, FileText,
  BarChart3, Wrench, Activity, Cog, Globe, Star, MessageCircle, DollarSign,
} from 'lucide-react';
import { haptic } from '@/lib/haptics';
import { getChildAvatar } from '@/lib/childAvatars';
import { getPinned, togglePinned } from '@/lib/menuPrefs';

/**
 * Lightweight drawer — iOS clean white style.
 * - Zero API calls (no credits/streak/notifications fetch)
 * - CSS-only animations (no framer-motion)
 * - Solid white background (no blur, no gradient)
 * - Single file: profile + child switcher + menu list + logout
 */
export default function AppDrawer({
  open,
  onClose,
  user,
  avatarUrl,
  tier = 'free',
  selectedChild,
  childrenList = [],
  onSwitchChild,
  isAuthenticated,
  isAdmin,
  isLanding,
  activePath,
  onLogout,
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [childMenuOpen, setChildMenuOpen] = useState(false);
  const [pinnedItems, setPinnedItems] = useState([]);
  const touchStartX = useRef(null);

  // Mount/unmount with CSS transition
  useEffect(() => {
    if (open) {
      setMounted(true);
      // next frame untuk trigger transition
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') { haptic('light'); onClose?.(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  // Load pinned items (sync, no API)
  useEffect(() => {
    if (open && user?.email) {
      setPinnedItems(getPinned(user.email));
    }
  }, [open, user?.email]);

  const handlePinToggle = (path, label) => {
    if (!user?.email) return;
    haptic('light');
    setPinnedItems(togglePinned(user.email, path, label));
  };

  // Swipe-down-to-close
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartX.current;
    if (dy > 70) { haptic('light'); onClose?.(); }
    touchStartX.current = null;
  };

  if (!mounted) return null;

  // Build menu sections berdasarkan auth state
  const sections = buildMenuSections({ isAuthenticated, isAdmin, isLanding });

  const isActive = (path) =>
    path === '/' ? activePath === '/' : activePath === path || activePath.startsWith(path + '/');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { haptic('light'); onClose?.(); }}
        className="sm:hidden fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Drawer — floating glass panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="sm:hidden fixed left-3 right-3 z-50 flex flex-col overflow-hidden rounded-[2rem] transition-all duration-200 ease-out"
        style={{
          top: 'calc(env(safe-area-inset-top) + 0.75rem)',
          bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)',
          maxWidth: '380px',
          marginLeft: 'auto',
          marginRight: 'auto',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'top center',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,245,255,0.92) 100%)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 24px 60px -12px rgba(88, 28, 135, 0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        {/* Drag handle pill */}
        <div className="flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-300/80" />
        </div>

        {/* Header — profile */}
        {isAuthenticated && user ? (
          <ProfileHeader
            user={user}
            avatarUrl={avatarUrl}
            tier={tier}
            selectedChild={selectedChild}
            childCount={childrenList?.length || 0}
            childMenuOpen={childMenuOpen}
            onClose={onClose}
            onToggleChildMenu={() => { haptic('light'); setChildMenuOpen((v) => !v); }}
          />
        ) : (
          <GuestHeader onClose={onClose} />
        )}

        {/* Child switcher — inline submenu (like Aktiviti) */}
        {isAuthenticated && selectedChild && (childrenList?.length || 0) > 1 && childMenuOpen && (
          <ChildInlineList
            childrenList={childrenList}
            selectedChild={selectedChild}
            onSelect={(c) => { onSwitchChild?.(c); setChildMenuOpen(false); }}
            onManage={() => { setChildMenuOpen(false); onClose?.(); }}
          />
        )}

        {/* Scrollable menu */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
          {/* Pinned */}
          {isAuthenticated && pinnedItems.length > 0 && (
            <>
              <SectionLabel icon={<Pin className="w-3 h-3 fill-current" />} label="Pin Anda" />
              {pinnedItems.map((item) => (
                <MenuItem
                  key={`pin-${item.path}`}
                  to={item.path}
                  label={item.label}
                  icon={getIconForPath(item.path)}
                  active={isActive(item.path)}
                  pinned
                  showPin
                  onPinToggle={() => handlePinToggle(item.path, item.label)}
                  onNavigate={onClose}
                />
              ))}
            </>
          )}

          {/* Upgrade nudge — free tier */}
          {isAuthenticated && tier === 'free' && (
            <Link
              to="/settings"
              onClick={() => { haptic('medium'); onClose?.(); }}
              className="mx-3 my-3 flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-pink-50 border border-amber-200 active:bg-amber-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-700 text-[10px] font-black uppercase tracking-wider leading-none">Naik Taraf</p>
                <p className="text-slate-800 text-sm font-black leading-tight mt-1">Buka semua game + AI →</p>
              </div>
            </Link>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <MenuSection
              key={section.key}
              section={section}
              isActive={isActive}
              pinnedItems={pinnedItems}
              onPinToggle={handlePinToggle}
              onNavigate={onClose}
            />
          ))}
        </nav>

        {/* Footer — logout */}
        {isAuthenticated && (
          <div className="px-3 pt-3 pb-2 border-t border-white/40 flex items-center gap-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
            <button
              type="button"
              onClick={() => { haptic('medium'); onClose?.(); onLogout?.(); }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-red-600 font-black text-sm active:scale-[0.98] transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(254,226,226,0.5), rgba(254,202,202,0.25))',
                backdropFilter: 'blur(14px) saturate(180%)',
                WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px -4px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              <span>Log Keluar</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-600 text-[11px] font-black">Online</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─────────────── Sub-components ─────────────── */

function ProfileHeader({ user, avatarUrl, tier, selectedChild, childCount, childMenuOpen, onClose, onToggleChildMenu }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-white/40">
      <div className="flex items-center gap-3 mb-3">
        <Link to="/settings" onClick={() => { haptic('light'); onClose?.(); }} className="flex-1 flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">🐱</div>
            )}
            {tier && tier !== 'free' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center ring-2 ring-white">
                <Crown className="w-3 h-3 text-amber-900" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 font-black text-sm truncate">{user?.full_name || 'User'}</p>
            <p className="text-slate-500 text-[11px] font-semibold truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </Link>
        <button
          type="button"
          onClick={() => { haptic('light'); onClose?.(); }}
          aria-label="Tutup menu"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex-shrink-0 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Child switcher chip — glass (toggles inline submenu) */}
      {selectedChild && childCount > 1 && (
        <button
          type="button"
          onClick={onToggleChildMenu}
          aria-expanded={childMenuOpen}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl active:scale-[0.98] transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(244,114,182,0.18) 0%, rgba(192,132,252,0.18) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 16px -4px rgba(192,132,252,0.25), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-pink-200/40 blur-xl pointer-events-none" />
          <img
            src={getChildAvatar(selectedChild)}
            alt=""
            className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white/80 shadow-sm flex-shrink-0"
          />
          <div className="relative flex-1 min-w-0 text-left">
            <p className="text-pink-700 text-[9px] font-black uppercase tracking-wider leading-none">Anak Aktif</p>
            <p className="text-slate-800 text-xs font-black truncate leading-tight mt-0.5">{selectedChild.name}</p>
          </div>
          <div className="relative flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 shadow-sm">
            <span className="text-pink-600 text-[9px] font-black uppercase tracking-wider">Tukar</span>
            <ChevronRight
              className="w-3 h-3 text-pink-600 transition-transform duration-150"
              strokeWidth={3}
              style={{ transform: childMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </div>
        </button>
      )}
    </div>
  );
}

function GuestHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-white/40">
      <img
        src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png"
        alt="CeriaKid"
        className="h-8 rounded-lg"
      />
      <button
        type="button"
        onClick={() => { haptic('light'); onClose?.(); }}
        aria-label="Tutup menu"
        className="p-2 rounded-xl bg-slate-100 text-slate-600"
      >
        <X className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <p className="px-4 pt-4 pb-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
      {icon}
      {label}
    </p>
  );
}

function MenuSection({ section, isActive, pinnedItems, onPinToggle, onNavigate }) {
  const [expanded, setExpanded] = useState(false);

  if (section.type === 'flat') {
    return (
      <>
        {section.label && <SectionLabel label={section.label} />}
        {section.items.map((item) =>
          item.external ? (
            <a
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className="block px-4 py-3 mx-1 rounded-xl text-slate-700 font-bold text-sm active:bg-slate-100 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <MenuItem
              key={item.path}
              to={item.path}
              label={item.label}
              icon={item.icon}
              active={isActive(item.path)}
              pinned={pinnedItems.some((p) => p.path === item.path)}
              showPin={section.allowPin}
              onPinToggle={() => onPinToggle(item.path, item.label)}
              onNavigate={onNavigate}
            />
          )
        )}
      </>
    );
  }

  // Grouped (collapsible)
  return (
    <>
      <button
        type="button"
        onClick={() => { haptic('light'); setExpanded(!expanded); }}
        className={`w-full flex items-center justify-between mx-1 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
          expanded ? 'bg-white/70 text-slate-900 shadow-sm' : 'text-slate-700 active:bg-white/50'
        }`}
        style={{ width: 'calc(100% - 0.5rem)' }}
      >
        <span>{section.label}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-orange-100' : 'bg-slate-100'}`}>
          <ChevronRight
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${expanded ? 'text-orange-500' : 'text-slate-400'}`}
            strokeWidth={2.5}
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {expanded && (
        <div className="ml-4 pl-2 border-l border-slate-100">
          {section.items.map((item) => (
            <MenuItem
              key={item.path}
              to={item.path}
              label={item.label}
              icon={item.icon}
              active={isActive(item.path)}
              pinned={pinnedItems.some((p) => p.path === item.path)}
              showPin={section.allowPin}
              onPinToggle={() => onPinToggle(item.path, item.label)}
              onNavigate={onNavigate}
              size="small"
            />
          ))}
        </div>
      )}
    </>
  );
}

function MenuItem({ to, label, icon: Icon, active, pinned, showPin, onPinToggle, onNavigate, size = 'default' }) {
  const isSmall = size === 'small';
  const iconSize = isSmall ? 'w-4 h-4' : 'w-[18px] h-[18px]';

  return (
    <div className="relative group">
      <Link
        to={to}
        onClick={() => { haptic('light'); onNavigate?.(); }}
        className={`flex items-center justify-between mx-1 rounded-xl transition-all ${
          isSmall ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'
        } ${
          active
            ? 'text-white font-black'
            : 'text-slate-700 font-bold active:bg-white/50'
        }`}
        style={
          active
            ? {
                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                boxShadow: '0 4px 12px -2px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              }
            : undefined
        }
      >
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          {Icon && (
            <Icon
              className={`${iconSize} flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`}
              strokeWidth={active ? 2.5 : 2.25}
            />
          )}
          <span className="truncate">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {showPin && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPinToggle?.(); }}
              aria-label={pinned ? `Buang ${label} dari pin` : `Pin ${label}`}
              className={`p-1 rounded-md transition-opacity ${
                pinned ? 'opacity-100 text-amber-500' : 'opacity-0 group-hover:opacity-50 text-slate-400'
              }`}
            >
              {pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          )}
          {active && !showPin && <ChevronRight className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
      </Link>
    </div>
  );
}

function ChildInlineList({ childrenList, selectedChild, onSelect, onManage }) {
  return (
    <div className="px-3 py-2 border-b border-white/40">
      <div className="ml-4 pl-2 border-l border-slate-200/70 space-y-1">
        {(childrenList || []).map((child) => {
          const isActive = selectedChild?.id === child.id;
          const levelLabel = child.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah';
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => { haptic('medium'); onSelect?.(child); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all active:scale-[0.98] ${
                isActive ? 'text-white' : 'text-slate-700 active:bg-white/60'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      boxShadow: '0 4px 12px -2px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }
                  : undefined
              }
            >
              <img
                src={getChildAvatar(child)}
                alt=""
                loading="lazy"
                className={`w-7 h-7 rounded-full object-cover flex-shrink-0 ring-2 ${
                  isActive ? 'ring-white/80' : 'ring-slate-200'
                } bg-white`}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs font-black truncate leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {child.name}
                </p>
                <p className={`text-[10px] font-bold truncate leading-tight ${isActive ? 'text-white/90' : 'text-slate-500'}`}>
                  {levelLabel}
                </p>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" strokeWidth={3.5} />}
            </button>
          );
        })}

        {/* Manage children link */}
        <Link
          to="/children-profiles"
          onClick={() => { haptic('light'); onManage?.(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-bold text-xs active:bg-white/60 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-white/80 border border-dashed border-pink-300 flex items-center justify-center flex-shrink-0">
            <Plus className="w-3.5 h-3.5 text-pink-500" strokeWidth={3} />
          </div>
          <span>Urus Anak</span>
        </Link>
      </div>
    </div>
  );
}

/* ─────────────── Menu config ─────────────── */

function buildMenuSections({ isAuthenticated, isAdmin, isLanding }) {
  if (isLanding && !isAuthenticated) {
    return [{
      key: 'landing',
      type: 'flat',
      items: [
        { path: '/', label: 'Rumah', icon: Home },
        { path: '#features', label: 'Ciri-ciri', icon: Star, external: true },
        { path: '#testimonials', label: 'Testimoni', icon: MessageCircle, external: true },
        { path: '#pricing', label: 'Harga', icon: DollarSign, external: true },
        { path: '#faq', label: 'Soalan Lazim', icon: HelpCircle, external: true },
      ],
    }];
  }

  const sections = [{
    key: 'home',
    type: 'flat',
    items: [{ path: '/', label: 'Halaman Utama', icon: Home }],
  }];

  // Admin section — DULUKAN sebelum dashboard pengguna
  if (isAdmin) {
    sections.push({
      key: 'admin',
      type: 'grouped',
      label: 'Admin',
      items: [
        { path: '/admin-dashboard?tab=analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin-dashboard?tab=gamemanager', label: 'Game Manager', icon: Wrench },
        { path: '/admin-dashboard?tab=health', label: 'System Health', icon: Activity },
        { path: '/admin-dashboard?tab=settings', label: 'Settings', icon: Cog },
      ],
    });
  }

  if (isAuthenticated) {
    sections.push({
      key: 'account',
      type: 'flat',
      label: 'Akaun',
      allowPin: true,
      items: [
        { path: '/dashboard', label: 'Dashboard Pengguna', icon: LayoutDashboard },
        { path: '/settings', label: 'Tetapan Akaun', icon: Settings },
        { path: '/affiliate', label: 'Program Affiliate', icon: Users },
        { path: '/contact', label: 'Hubungi Kami', icon: Mail },
      ],
    });

    sections.push({
      key: 'aktiviti',
      type: 'grouped',
      label: 'Aktiviti',
      allowPin: true,
      items: [
        { path: '/games-subjek', label: 'Belajar Ikut Subjek', icon: BookOpen },
        { path: '/games-hub', label: 'Game Hub', icon: Gamepad2 },
        { path: '/drawing', label: 'Studio Lukisan', icon: Palette },
        { path: '/story-kid', label: 'Story Kid', icon: BookMarked },
        { path: '/friends', label: 'Kawan', icon: UserPlus },
        { path: '/challenges', label: 'Cabaran', icon: Trophy },
      ],
    });

    sections.push({
      key: 'keluarga',
      type: 'grouped',
      label: 'Keluarga',
      allowPin: true,
      items: [
        { path: '/children-profiles', label: 'Profil Anak', icon: Baby },
        { path: '/parent-dashboard', label: 'Prestasi Anak', icon: LineChart },
      ],
    });

    sections.push({
      key: 'cikgu-ai',
      type: 'grouped',
      label: 'Cikgu AI',
      allowPin: true,
      items: [
        { path: '/ai-assistant', label: 'Cikgu Firdaus — Tutor', icon: GraduationCap },
        { path: '/quiz-ai', label: 'Cikgu Rosie — Kuiz', icon: HelpCircle },
        { path: '/story-generator', label: 'Cikgu Mira — Cerita', icon: Sparkle },
        { path: '/bbm-generator', label: 'Cikgu Daniel — BBM', icon: FileText },
      ],
    });
  }

  return sections;
}

/* Map path → icon for pinned items (which only store path + label) */
function getIconForPath(path) {
  const map = {
    '/': Home,
    '/dashboard': LayoutDashboard,
    '/settings': Settings,
    '/affiliate': Users,
    '/contact': Mail,
    '/games-subjek': BookOpen,
    '/games-hub': Gamepad2,
    '/drawing': Palette,
    '/story-kid': BookMarked,
    '/friends': UserPlus,
    '/challenges': Trophy,
    '/children-profiles': Baby,
    '/parent-dashboard': LineChart,
    '/ai-assistant': GraduationCap,
    '/quiz-ai': HelpCircle,
    '/story-generator': Sparkle,
    '/bbm-generator': FileText,
  };
  return map[path] || Globe;
}