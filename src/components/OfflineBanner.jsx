import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Download, X, Info, CheckCircle2 } from 'lucide-react';
import { getSyncQueue } from '@/lib/offlineSyncManager';
import OfflineGuideModal from '@/components/offline/OfflineGuideModal';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showSyncedToast, setShowSyncedToast] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Track pending sync count
    const refreshPending = () => setPendingSync(getSyncQueue().length);
    refreshPending();
    const pendingInterval = setInterval(refreshPending, 4000);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      // Show "synced" toast if there was pending data
      if (getSyncQueue().length > 0) {
        setShowSyncedToast(true);
        setTimeout(() => setShowSyncedToast(false), 4000);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 3 seconds if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    // Service worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    return () => {
      clearInterval(pendingInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline Banner — improved with guide button & pending count */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 sm:px-4 py-2.5 shadow-lg"
          >
            <div className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-black leading-tight">Tiada Internet</p>
                <p className="text-[10px] sm:text-xs font-semibold opacity-90 leading-tight mt-0.5">
                  Anak masih boleh main game 🎮 {pendingSync > 0 ? `· ${pendingSync} progress menunggu sync` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-xs font-black transition-colors flex-shrink-0"
              >
                <Info className="w-3 h-3" />
                <span className="hidden sm:inline">Cara Guna</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synced Toast — bila kembali online & ada pending sync */}
      <AnimatePresence>
        {showSyncedToast && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-black text-center">
              Wifi kembali! Progress anak sedang disync... ✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Modal */}
      <OfflineGuideModal open={showGuide} onClose={() => setShowGuide(false)} />

      {/* Install App Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !installed && deferredPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50"
          >
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-game-purple p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-game-purple/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📲</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm">Pasang Jom Belajar!</p>
                <p className="text-xs text-gray-600 mt-0.5">Main tanpa internet, terus dari skrin utama 📱</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-game-purple text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Pasang
                </motion.button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-3 py-1.5 text-gray-500 text-xs font-medium text-center"
                >
                  Nanti dulu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-game-purple text-white px-4 py-3 flex items-center justify-between gap-2 shadow-lg"
          >
            <p className="text-sm font-bold">✨ Kemaskini baru tersedia!</p>
            <button
              onClick={handleUpdate}
              className="text-xs bg-white text-game-purple px-3 py-1 rounded-full font-bold"
            >
              Muat semula
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}