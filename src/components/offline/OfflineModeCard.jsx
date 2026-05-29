import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Info, CheckCircle2, Clock, Download, Radio } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getSyncQueue, syncOfflineProgress, getLastSyncTime } from '@/lib/offlineSyncManager';
import OfflineGuideModal from './OfflineGuideModal';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

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
      <div
        className="rounded-3xl overflow-hidden shadow-xl p-5 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 24px rgba(251, 207, 232, 0.25)',
        }}
      >

        <SectionCardHeader
          icon={Radio}
          title="Mode Offline"
          subtitle="Main game tanpa internet & sync auto"
          gradient="from-emerald-400 to-cyan-500"
        />

        {/* Status row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOnline ? 'bg-emerald-100 border border-emerald-200' : 'bg-orange-100 border border-orange-200'}`}>
              {isOnline ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-orange-600" />}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 font-black text-sm">
                {isOnline ? 'Bersambung Online' : 'Mode Offline Aktif'}
              </p>
              <p className="text-slate-600 text-xs font-semibold mt-0.5">
                {isOnline ? 'Progress disync automatik' : 'Anak masih boleh main game!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-black transition-colors flex-shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* PWA install status */}
          <div className="rounded-xl p-2.5 text-center bg-slate-50 border border-slate-200">
            <Download className={`w-4 h-4 mx-auto mb-1 ${isPWA ? 'text-emerald-600' : 'text-slate-400'}`} />
            <p className="text-slate-800 font-black text-[11px] leading-tight">{isPWA ? 'Dipasang' : 'Browser'}</p>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">App</p>
          </div>

          {/* Pending sync */}
          <div className="rounded-xl p-2.5 text-center bg-slate-50 border border-slate-200">
            <Clock className={`w-4 h-4 mx-auto mb-1 ${pendingCount > 0 ? 'text-yellow-600' : 'text-slate-400'}`} />
            <p className="text-slate-800 font-black text-[11px] leading-tight">{pendingCount}</p>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">Belum Sync</p>
          </div>

          {/* Last sync */}
          <div className="rounded-xl p-2.5 text-center bg-slate-50 border border-slate-200">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-cyan-600" />
            <p className="text-slate-800 font-black text-[10px] leading-tight truncate">{formatLastSync(lastSync)}</p>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">Last Sync</p>
          </div>
        </div>

        {/* Sync now button — only show if ada pending */}
        {pendingCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSyncNow}
            disabled={!isOnline || syncing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sedang Sync...' : `Sync ${pendingCount} Progress Sekarang`}
          </motion.button>
        )}

        {/* Helper text */}
        <div className="rounded-xl p-3 bg-purple-50 border border-purple-200">
          <p className="text-slate-700 text-[11px] font-semibold leading-relaxed">
            💡 <span className="font-black text-purple-700">Tip:</span> Buka semua game subject ketika ada wifi. Selepas itu anak boleh main offline di mana-mana sahaja. Progress auto-sync bila kembali online.
          </p>
        </div>
      </div>

      <OfflineGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}