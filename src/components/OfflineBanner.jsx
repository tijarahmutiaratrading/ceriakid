import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, Download, X } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
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
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-bold text-center">
              Tiada internet — Permainan tetap boleh dimainkan! 🎮
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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