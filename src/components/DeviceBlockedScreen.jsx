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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🔒</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Had Device Dicapai</h2>
          <p className="text-gray-500 text-sm">
            Pakej <span className="font-black text-purple-600 capitalize">{tier}</span> anda hanya membenarkan{' '}
            <span className="font-black">{limit} device</span>. Sila buang device lama untuk teruskan.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Device Berdaftar</p>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{device.deviceName}</p>
                  <p className="text-xs text-gray-400">
                    Terakhir: {device.lastSeen ? format(new Date(device.lastSeen), 'dd MMM yyyy') : 'Tidak diketahui'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(device)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-purple-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Cuba Semula
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Nak lebih device? <a href="/settings" className="text-purple-500 font-bold">Naik taraf pakej →</a>
        </p>
      </motion.div>
    </div>
  );
}