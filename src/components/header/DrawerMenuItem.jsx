import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pin, PinOff, ChevronRight } from 'lucide-react';
import { haptic } from '@/lib/haptics';

/**
 * Menu item — pastel candy style dengan active highlight + notif badge + pin toggle.
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
  size = 'default',
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
      <Link to={to} onClick={handleClick}>
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={`flex items-center justify-between rounded-2xl font-bold transition-all ${
            isSmall ? 'px-3 py-2.5 text-xs ml-1' : 'px-4 py-3 text-sm'
          } ${
            active
              ? 'bg-white/80 text-pink-600 font-black'
              : 'text-slate-700 hover:bg-white/70'
          }`}
        >
          <span className="flex-1 truncate">{label}</span>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}

            {/* Pin toggle */}
            {showPin && (
              <button
                type="button"
                onClick={handlePin}
                aria-label={pinned ? `Buang ${label} dari pin` : `Pin ${label}`}
                className={`p-1 rounded-md transition-all ${
                  pinned
                    ? 'opacity-100 text-amber-500'
                    : 'opacity-0 group-hover:opacity-50 hover:!opacity-100 text-slate-400 hover:text-pink-500'
                }`}
              >
                {pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            )}

            {active && !showPin && <ChevronRight className="w-4 h-4 text-pink-500" strokeWidth={3} />}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}