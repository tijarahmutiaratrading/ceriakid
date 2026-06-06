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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl ring-1 ring-black/5"
      >
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">🔒</div>
          <h2 className="text-xl font-black text-gray-900 mb-1.5">Had Device Dicapai</h2>
          <p className="text-gray-500 text-sm">
            Pakej <span className="font-black text-purple-600 capitalize">{tier}</span> anda hanya membenarkan{' '}
            <span className="font-black">{limit} device</span>. Sila buang device lama untuk teruskan.
          </p>
        </div>

        <div className="space-y-2 mb-5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Device Berdaftar</p>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <Smartphone className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-xs truncate">{device.deviceName}</p>
                  <p className="text-[10px] text-gray-400">
                    Terakhir: {device.lastSeen ? format(new Date(device.lastSeen), 'dd MMM yyyy') : 'Tidak diketahui'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(device)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-purple-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Cuba Semula
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-3">
          Nak lebih device? <a href="/settings" className="text-purple-500 font-bold">Naik taraf pakej →</a>
        </p>
      </motion.div>
    </div>
  );
}