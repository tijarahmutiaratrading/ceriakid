import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { trackAppUpdate } from '@/lib/analyticsManager';

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration;
    
    const handleServiceWorkerUpdate = () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdate(true);
            trackAppUpdate('current', 'new');
          }
        });
      }
    };

    navigator.serviceWorker.ready.then(reg => {
      registration = reg;
      reg.addEventListener('updatefound', handleServiceWorkerUpdate);
      
      // Check for updates every hour
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);
    });

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', handleServiceWorkerUpdate);
      }
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-game-blue to-purple-500 text-white rounded-xl p-4 shadow-xl flex items-center justify-between gap-3 md:max-w-md md:left-auto md:right-4"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <div>
          <p className="font-bold text-sm">Versi Baru Tersedia</p>
          <p className="text-xs opacity-90">Muat ulang untuk fitur terbaru</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-white text-game-blue rounded-lg font-bold text-xs hover:bg-gray-100 transition-all"
        >
          Muat Ulang
        </button>
        <button
          onClick={() => setShowUpdate(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}