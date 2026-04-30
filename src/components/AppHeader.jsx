import React, { useState } from 'react';
import { useState as useStateImport } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AppHeader({ showBack = null, backTo = '/', title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAgeGroup, setExpandedAgeGroup] = useState(null);
  const { isAuthenticated, user, logout } = useAuth() || {};
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  
  // Auto-show back button on non-home pages
  const shouldShowBack = showBack !== null ? showBack : !isLanding;

  const ageGroups = [
    {
      key: 'prasekolah',
      label: 'Pra Sekolah',
      emoji: '🎨',
      subjects: [
        { path: '/games/bahasa_melayu', emoji: '🇲🇾', label: 'Bahasa Melayu' },
        { path: '/games/english', emoji: '🇬🇧', label: 'English' },
        { path: '/games/mathematics', emoji: '🔢', label: 'Matematik' },
        { path: '/games/science', emoji: '🔬', label: 'Sains' },
      ]
    },
    {
      key: 'sekolah_rendah',
      label: 'Sekolah Rendah',
      emoji: '📚',
      subjects: [
        { path: '/games/bahasa_melayu', emoji: '🇲🇾', label: 'Bahasa Melayu' },
        { path: '/games/english', emoji: '🇬🇧', label: 'English' },
        { path: '/games/mathematics', emoji: '🔢', label: 'Matematik' },
        { path: '/games/science', emoji: '🔬', label: 'Sains' },
        { path: '/games/jawi', emoji: '🕌', label: 'Jawi' },
      ]
    }
  ];

  const otherItems = [
    { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
    { path: '/parent-dashboard', emoji: '📊', label: 'Prestasi' },
    { path: '/friends', emoji: '👥', label: 'Kawan' },
    { path: '/challenges', emoji: '⚡', label: 'Cabaran' },
  ];

  // Determine menu based on user role and location
  let topItems = [];
  let showSubjectsSection = true;
  let adminItems = [];
  let dashboardItems = [];

  if (isLanding && !isAuthenticated) {
    topItems = [
      { path: '/', emoji: '🏠', label: 'Rumah' },
      { path: '#features', emoji: '⭐', label: 'Ciri-ciri', external: true },
      { path: '#testimonials', emoji: '💬', label: 'Testimoni', external: true },
      { path: '#pricing', emoji: '💰', label: 'Harga', external: true },
      { path: '#faq', emoji: '❓', label: 'Soalan Lazim', external: true },
    ];
    showSubjectsSection = false;
  } else {
    topItems = [{ path: '/', emoji: '🏠', label: 'Halaman Utama' }];
    
    if (isAuthenticated) {
      dashboardItems = [
        { path: '/dashboard', emoji: '👨‍👩‍👧', label: 'Dashboard Pengguna' },
      ];
    }
    
    if (isAdmin) {
      adminItems = [
        { path: '/admin-dashboard', emoji: '🎛️', label: 'Admin Dashboard' },
      ];
    }
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      {/* Header Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl px-5 h-16 flex items-center justify-between shadow-lg border border-gray-200/50"
             style={{
               boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
             }}>
          {/* Left: Hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Logo / Title */}
          <Link to="/" className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-xl">🎓</span>
            <span className="font-bold text-gray-900 text-lg">CeriaJaya</span>
          </Link>

          {/* Right: Language Switcher or Back */}
          <div className="flex items-center gap-2">
            {!isLanding && <LanguageSwitcher />}
            {shouldShowBack ? (
              <Link to={backTo}>
                <button type="button" className="p-2 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/10"
          />
        )}
      </AnimatePresence>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-screen w-72 bg-white shadow-2xl pt-6 px-4 overflow-y-auto backdrop-filter-none"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="font-bold text-gray-900 text-lg">CeriaJaya</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
              <X className="w-5 h-5" />
            </button>
            </div>

            <nav className="space-y-3">
              {/* Top Items */}
              {topItems.map((item) => (
                item.external ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all text-sm"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                   <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                     <motion.button
                       type="button"
                       whileHover={{ x: 4 }}
                       whileTap={{ scale: 0.98 }}
                       className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                         isActive(item.path)
                           ? 'bg-game-purple text-white shadow-md'
                           : 'text-gray-700 hover:bg-gray-100'
                       }`}
                     >
                       <span className="text-2xl">{item.emoji}</span>
                       <span>{item.label}</span>
                     </motion.button>
                   </Link>
                 )
              ))}

              {/* Age Groups & Subjects Section */}
              {showSubjectsSection && (
                <div className="space-y-2">
                  {ageGroups.map((ageGroupItem) => (
                    <div key={ageGroupItem.key} className="space-y-1">
                      {/* Age Group Header */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedAgeGroup(expandedAgeGroup === ageGroupItem.key ? null : ageGroupItem.key);
                        }}
                        className="w-full text-left flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{ageGroupItem.emoji}</span>
                          <span className="text-sm">{ageGroupItem.label}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedAgeGroup === ageGroupItem.key ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </motion.div>
                      </button>

                      {/* Subjects */}
                      <AnimatePresence>
                        {expandedAgeGroup === ageGroupItem.key && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 pl-4 overflow-hidden"
                          >
                            {ageGroupItem.subjects.map((item) => (
                              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                                <motion.button
                                  type="button"
                                  whileHover={{ x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                    isActive(item.path)
                                      ? 'bg-game-purple text-white shadow-md'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <span className="text-2xl">{item.emoji}</span>
                                  <span>{item.label}</span>
                                </motion.button>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* Dashboard Items */}
              {dashboardItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {dashboardItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                      <motion.button
                        type="button"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          isActive(item.path)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.button>
                    </Link>
                  ))}
                </>
              )}

              {/* Other Items */}
              {otherItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                  <motion.button
                    type="button"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      isActive(item.path)
                        ? 'bg-game-purple text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.label}</span>
                  </motion.button>
                </Link>
              ))}

              {/* Admin Items */}
              {adminItems.length > 0 && (
                <>
                   <div className="border-t border-gray-200 my-2" />
                   {adminItems.map((item) => (
                     <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                       <motion.button
                         type="button"
                         whileHover={{ x: 4 }}
                         whileTap={{ scale: 0.98 }}
                         className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                           isActive(item.path)
                             ? 'bg-red-600 text-white shadow-md'
                             : 'text-gray-700 hover:bg-gray-100'
                         }`}
                       >
                         <span className="text-2xl">{item.emoji}</span>
                         <span>{item.label}</span>
                       </motion.button>
                     </Link>
                   ))}
                 </>
               )}

              {/* Logout */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  <motion.button
                    type="button"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsOpen(false);
                      logout?.();
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Keluar</span>
                  </motion.button>
                </>
              )}
              </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}