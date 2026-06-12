import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Trash2, RefreshCw } from 'lucide-react';
import { removeDevice, DEVICE_LIMITS } from '@/lib/deviceManager';
import { format } from 'date-fns';

export default function DeviceBlockedScreen({ devices, tier, onDeviceRemoved }) {
  const limit = DEVICE_LIMITS[tier] || 1;

  const handleRemove = async (device) => {
    await removeDevice(device.id);
    onDeviceRemoved();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto bg-slate-950">
      {/* Glowing red radial accents — cinematic PS5 vibe */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-red-500/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/15"
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🔒</div>
          <h2 className="text-xl font-black text-white mb-1.5">Had Device Dicapai</h2>
          <p className="text-white/60 text-sm">
            Pakej <span className="font-black text-rose-300 capitalize">{tier}</span> anda hanya membenarkan{' '}
            <span className="font-black text-white">{limit} device</span>. Sila buang device lama untuk teruskan.
          </p>
        </div>

        <div className="space-y-2 mb-5">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">Device Berdaftar</p>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <Smartphone className="w-4 h-4 text-rose-300 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-white text-xs truncate">{device.deviceName}</p>
                  <p className="text-[10px] text-white/40">
                    Terakhir: {device.lastSeen ? format(new Date(device.lastSeen), 'dd MMM yyyy') : 'Tidak diketahui'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(device)}
                className="p-1.5 text-red-300 hover:text-red-200 hover:bg-red-500/15 rounded-lg transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-white text-slate-900 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Cuba Semula
        </button>

        <p className="text-center text-[11px] text-white/40 mt-3">
          Nak lebih device? <a href="/settings" className="text-rose-300 font-bold">Naik taraf pakej →</a>
        </p>
      </motion.div>
    </div>
  );
}