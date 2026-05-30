import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pin, PinOff } from 'lucide-react';
import { haptic } from '@/lib/haptics';

/**
 * Menu item dengan active highlight bar + notification dot + pin toggle.
 */
export default function DrawerMenuItem({
  to,
  label,
  active = false,
  notificationCount = 0,
  showPin = false,
  pinned = false,
  onPinToggle,
  onNavigate,
  size = 'default', // 'default' | 'small' (sub-item)
}) {
  const handleClick = () => {
    haptic('light');
    onNavigate?.();
  };

  const handlePin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    haptic('medium');
    onPinToggle?.();
  };

  const isSmall = size === 'small';

  return (
    <div className="relative group">
      {/* Active indicator bar */}
      {active && (
        <motion.div
          layoutId="active-menu-bar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-pink-400 to-purple-400"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      <Link to={to} onClick={handleClick}>
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-between rounded-2xl font-bold transition-all ${
            isSmall ? 'px-3 py-2.5 text-xs' : 'px-4 py-3 text-sm'
          } ${
            active
              ? 'bg-white text-game-purple shadow-lg font-black'
              : 'text-white/90 hover:bg-white/15 hover:text-white'
          }`}
        >
          <span className="flex-1 truncate">{label}</span>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                active ? 'bg-rose-500 text-white' : 'bg-rose-400 text-white'
              }`}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}

            {/* Pin toggle (only show on hover or when already pinned, top-level only) */}
            {showPin && (
              <button
                type="button"
                onClick={handlePin}
                aria-label={pinned ? `Buang ${label} dari pin` : `Pin ${label}`}
                className={`p-1 rounded-md transition-all ${
                  pinned
                    ? 'opacity-100 text-yellow-300'
                    : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 text-white/60 hover:text-white'
                } ${active ? '!text-purple-500' : ''}`}
              >
                {pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}