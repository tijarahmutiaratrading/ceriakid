import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Info, CheckCircle2, Clock, Download } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getSyncQueue, syncOfflineProgress, getLastSyncTime } from '@/lib/offlineSyncManager';
import OfflineGuideModal from './OfflineGuideModal';

/**
 * Offline mode card for Settings page — shows status, pending sync,
 * and offers a clear "How To" guide for non-technical parents.
 */
export default function OfflineModeCard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  const refresh = () => {
    setPendingCount(getSyncQueue().length);
    setLastSync(getLastSyncTime());
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);

    const handleOnline = () => { setIsOnline(true); refresh(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = async () => {
    if (!user || !isOnline || syncing) return;
    setSyncing(true);
    await syncOfflineProgress(base44, user);
    refresh();
    setSyncing(false);
  };

  const formatLastSync = (date) => {
    if (!date) return 'Belum pernah';
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru sahaja';
    if (mins < 60) return `${mins} minit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return date.toLocaleDateString('ms-MY');
  };

  return (
    <>
      <div className="rounded-3xl overflow-hidden shadow-xl p-5" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(49,16,90,0.78))', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        {/* Status row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOnline ? 'bg-emerald-500/25 border border-emerald-400/40' : 'bg-orange-500/25 border border-orange-400/40'}`}>
              {isOnline ? <Wifi className="w-5 h-5 text-emerald-300" /> : <WifiOff className="w-5 h-5 text-orange-300" />}
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm">
                {isOnline ? 'Bersambung Online' : 'Mode Offline Aktif'}
              </p>
              <p className="text-white/70 text-xs font-semibold mt-0.5">
                {isOnline ? 'Progress disync automatik' : 'Anak masih boleh main game!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black transition-colors flex-shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* PWA install status */}
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Download className={`w-4 h-4 mx-auto mb-1 ${isPWA ? 'text-emerald-300' : 'text-white/50'}`} />
            <p className="text-white font-black text-[11px] leading-tight">{isPWA ? 'Dipasang' : 'Browser'}</p>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">App</p>
          </div>

          {/* Pending sync */}
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Clock className={`w-4 h-4 mx-auto mb-1 ${pendingCount > 0 ? 'text-yellow-300' : 'text-white/50'}`} />
            <p className="text-white font-black text-[11px] leading-tight">{pendingCount}</p>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">Belum Sync</p>
          </div>

          {/* Last sync */}
          <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-cyan-300" />
            <p className="text-white font-black text-[10px] leading-tight truncate">{formatLastSync(lastSync)}</p>
            <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">Last Sync</p>
          </div>
        </div>

        {/* Sync now button — only show if ada pending */}
        {pendingCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSyncNow}
            disabled={!isOnline || syncing}
            className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sedang Sync...' : `Sync ${pendingCount} Progress Sekarang`}
          </motion.button>
        )}

        {/* Helper text */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <p className="text-white/85 text-[11px] font-semibold leading-relaxed">
            💡 <span className="font-black">Tip:</span> Buka semua game subject ketika ada wifi. Selepas itu anak boleh main offline di mana-mana sahaja. Progress auto-sync bila kembali online.
          </p>
        </div>
      </div>

      <OfflineGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}