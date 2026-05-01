import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Trash2, Shield } from 'lucide-react';
import { getUserDevices, removeDevice, getDeviceFingerprint, DEVICE_LIMITS } from '@/lib/deviceManager';
import { format } from 'date-fns';

export default function ManageDevices({ userEmail, tier }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDeviceId = getDeviceFingerprint();
  const limit = DEVICE_LIMITS[tier] || 1;

  useEffect(() => {
    loadDevices();
  }, [userEmail]);

  const loadDevices = async () => {
    setLoading(true);
    const data = await getUserDevices(userEmail);
    setDevices(data);
    setLoading(false);
  };

  const handleRemove = async (device) => {
    await removeDevice(device.id);
    setDevices(prev => prev.filter(d => d.id !== device.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-5 border-2 border-white/30 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="font-black text-gray-900">Device Berdaftar</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black ${
          devices.length >= limit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {devices.length} / {limit} device
        </span>
      </div>

      {devices.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Tiada device berdaftar</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const isCurrent = device.deviceId === currentDeviceId;
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-xl p-3 border ${
                  isCurrent ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className={`w-5 h-5 ${isCurrent ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      {device.deviceName}
                      {isCurrent && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-black">
                          Device Ini
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Terakhir: {device.lastSeen ? format(new Date(device.lastSeen), 'dd MMM yyyy, HH:mm') : '-'}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRemove(device)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Pakej <span className="font-bold capitalize">{tier}</span> — maksimum {limit} device
      </p>
    </div>
  );
}