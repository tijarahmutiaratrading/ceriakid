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
              ? 'text-white font-black shadow-lg'
              : 'text-slate-700 hover:bg-white/70'
          }`}
          style={
            active
              ? { background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)', boxShadow: '0 4px 14px rgba(192, 132, 252, 0.4)' }
              : undefined
          }
        >
          <span className="flex-1 truncate">{label}</span>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {/* Notification badge */}
            {notificationCount > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow-sm"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                    : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                }}
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
                    ? `opacity-100 ${active ? 'text-yellow-200' : 'text-amber-500'}`
                    : `opacity-0 group-hover:opacity-50 hover:!opacity-100 ${active ? 'text-white' : 'text-slate-400 hover:text-pink-500'}`
                }`}
              >
                {pinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            )}

            {active && !showPin && <ChevronRight className="w-4 h-4 text-white/80" strokeWidth={3} />}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}