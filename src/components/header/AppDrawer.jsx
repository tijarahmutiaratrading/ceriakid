import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, LogOut, Crown, ChevronsUpDown, Sparkles, Pin, PinOff } from 'lucide-react';
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
  const [showSwitcher, setShowSwitcher] = useState(false);
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

  // Swipe-to-close
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -60) { haptic('light'); onClose?.(); }
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

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="sm:hidden fixed top-0 bottom-0 left-0 z-50 w-[84%] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header — profile */}
        {isAuthenticated && user ? (
          <ProfileHeader
            user={user}
            avatarUrl={avatarUrl}
            tier={tier}
            selectedChild={selectedChild}
            childCount={childrenList?.length || 0}
            onClose={onClose}
            onOpenSwitcher={() => setShowSwitcher(true)}
          />
        ) : (
          <GuestHeader onClose={onClose} />
        )}

        {/* Scrollable menu */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Pinned */}
          {isAuthenticated && pinnedItems.length > 0 && (
            <>
              <SectionLabel icon={<Pin className="w-3 h-3 fill-current" />} label="Pin Anda" />
              {pinnedItems.map((item) => (
                <MenuItem
                  key={`pin-${item.path}`}
                  to={item.path}
                  label={item.label}
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
          <div className="px-3 py-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { haptic('medium'); onClose?.(); onLogout?.(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 font-black text-sm hover:bg-rose-50 active:bg-rose-100 transition-colors"
            >
              <LogOut className="w-5 h-5" strokeWidth={2.5} />
              <span>Log Keluar</span>
            </button>
          </div>
        )}
      </aside>

      {/* Child switcher (inline) */}
      {showSwitcher && (
        <ChildSwitcherSheet
          children={childrenList}
          selectedChild={selectedChild}
          onSelect={(c) => { onSwitchChild?.(c); setShowSwitcher(false); }}
          onClose={() => setShowSwitcher(false)}
          onManage={() => { setShowSwitcher(false); onClose?.(); }}
        />
      )}
    </>
  );
}

/* ─────────────── Sub-components ─────────────── */

function ProfileHeader({ user, avatarUrl, tier, selectedChild, childCount, onClose, onOpenSwitcher }) {
  return (
    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
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

      {/* Child switcher chip */}
      {selectedChild && childCount > 1 && (
        <button
          type="button"
          onClick={() => { haptic('light'); onOpenSwitcher(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 active:bg-pink-100 transition-colors"
        >
          <img src={getChildAvatar(selectedChild)} alt="" className="w-7 h-7 rounded-full object-cover" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-pink-600 text-[9px] font-black uppercase tracking-wider leading-none">Anak Aktif</p>
            <p className="text-slate-800 text-xs font-black truncate leading-tight mt-0.5">{selectedChild.name}</p>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

function GuestHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
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
    <p className="px-4 pt-3 pb-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
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
        className={`w-full flex items-center justify-between mx-1 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
          expanded ? 'bg-slate-50 text-slate-900' : 'text-slate-700 active:bg-slate-100'
        }`}
        style={{ width: 'calc(100% - 0.5rem)' }}
      >
        <span>{section.label}</span>
        <ChevronRight
          className="w-4 h-4 flex-shrink-0 transition-transform duration-150"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>

      {expanded && (
        <div className="ml-4 pl-2 border-l border-slate-100">
          {section.items.map((item) => (
            <MenuItem
              key={item.path}
              to={item.path}
              label={item.label}
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

function MenuItem({ to, label, active, pinned, showPin, onPinToggle, onNavigate, size = 'default' }) {
  const isSmall = size === 'small';

  return (
    <div className="relative group">
      <Link
        to={to}
        onClick={() => { haptic('light'); onNavigate?.(); }}
        className={`flex items-center justify-between mx-1 rounded-xl transition-colors ${
          isSmall ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'
        } ${
          active
            ? 'bg-purple-50 text-purple-700 font-black'
            : 'text-slate-700 font-bold active:bg-slate-100'
        }`}
      >
        <span className="flex-1 truncate">{label}</span>

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
          {active && !showPin && <ChevronRight className="w-4 h-4 text-purple-500" strokeWidth={3} />}
        </div>
      </Link>
    </div>
  );
}

function ChildSwitcherSheet({ children, selectedChild, onSelect, onClose, onManage }) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-slate-900 font-black text-base">Tukar Anak Aktif</p>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-600"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1.5">
          {(children || []).map((child) => {
            const isActive = selectedChild?.id === child.id;
            const levelLabel = child.ageGroup === 'prasekolah' ? '🎨 Prasekolah' : '📚 Sekolah Rendah';
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => { haptic('medium'); onSelect?.(child); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                  isActive ? 'bg-purple-50 ring-1 ring-purple-200' : 'active:bg-slate-100'
                }`}
              >
                <img src={getChildAvatar(child)} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <p className={`font-black text-sm truncate ${isActive ? 'text-purple-700' : 'text-slate-800'}`}>
                    {child.name}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 truncate">{levelLabel}</p>
                </div>
                {isActive && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
                  </div>
                )}
              </button>
            );
          })}

          <Link
            to="/children-profiles"
            onClick={() => { haptic('light'); onManage?.(); }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-slate-200 active:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚙️</span>
            </div>
            <div className="text-left">
              <p className="text-slate-700 font-black text-sm">Urus Anak</p>
              <p className="text-slate-500 text-[11px] font-bold">Tambah / edit / padam</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

/* ─────────────── Menu config ─────────────── */

function buildMenuSections({ isAuthenticated, isAdmin, isLanding }) {
  if (isLanding && !isAuthenticated) {
    return [{
      key: 'landing',
      type: 'flat',
      items: [
        { path: '/', label: 'Rumah' },
        { path: '#features', label: 'Ciri-ciri', external: true },
        { path: '#testimonials', label: 'Testimoni', external: true },
        { path: '#pricing', label: 'Harga', external: true },
        { path: '#faq', label: 'Soalan Lazim', external: true },
      ],
    }];
  }

  const sections = [{
    key: 'home',
    type: 'flat',
    items: [{ path: '/', label: 'Halaman Utama' }],
  }];

  if (isAuthenticated) {
    sections.push({
      key: 'account',
      type: 'flat',
      label: 'Akaun',
      allowPin: true,
      items: [
        { path: '/dashboard', label: 'Dashboard Pengguna' },
        { path: '/settings', label: 'Tetapan Akaun' },
        { path: '/affiliate', label: 'Program Affiliate' },
        { path: '/contact', label: 'Hubungi Kami' },
      ],
    });

    sections.push({
      key: 'aktiviti',
      type: 'grouped',
      label: 'Aktiviti',
      allowPin: true,
      items: [
        { path: '/games-subjek', label: 'Belajar Ikut Subjek' },
        { path: '/games-hub', label: 'Game Hub' },
        { path: '/drawing', label: 'Studio Lukisan' },
        { path: '/story-kid', label: 'Story Kid' },
        { path: '/friends', label: 'Kawan' },
        { path: '/challenges', label: 'Cabaran' },
      ],
    });

    sections.push({
      key: 'keluarga',
      type: 'grouped',
      label: 'Keluarga',
      allowPin: true,
      items: [
        { path: '/children-profiles', label: 'Profil Anak' },
        { path: '/parent-dashboard', label: 'Prestasi Anak' },
      ],
    });

    sections.push({
      key: 'cikgu-ai',
      type: 'grouped',
      label: 'Cikgu AI',
      allowPin: true,
      items: [
        { path: '/ai-assistant', label: 'Cikgu Firdaus — Tutor' },
        { path: '/quiz-ai', label: 'Cikgu Rosie — Kuiz' },
        { path: '/story-generator', label: 'Cikgu Mira — Cerita' },
        { path: '/bbm-generator', label: 'Cikgu Daniel — BBM' },
      ],
    });
  }

  if (isAdmin) {
    sections.push({
      key: 'admin',
      type: 'grouped',
      label: 'Admin',
      items: [
        { path: '/admin-dashboard?tab=analytics', label: 'Analytics' },
        { path: '/admin-dashboard?tab=gamemanager', label: 'Game Manager' },
        { path: '/admin-dashboard?tab=health', label: 'System Health' },
        { path: '/admin-dashboard?tab=settings', label: 'Settings' },
      ],
    });
  }

  return sections;
}