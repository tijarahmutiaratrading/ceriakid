import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Trash2, Shield } from 'lucide-react';
import { getUserDevices, removeDevice, getDeviceFingerprint, DEVICE_LIMITS } from '@/lib/deviceManager';
import { format } from 'date-fns';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

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
    // removeDevice expects the entity record id (not deviceId fingerprint)
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
    <div className="rounded-3xl p-5 shadow-lg space-y-4" style={{ background: 'rgba(30,30,40,0.35)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <SectionCardHeader
        icon={Shield}
        title="Device Berdaftar"
        subtitle="Urus peranti yang log masuk akaun"
        gradient="from-cyan-400 to-pink-400"
        right={
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex-shrink-0 ${
            devices.length >= limit ? 'bg-red-500/25 text-red-200 border border-red-300/40' : 'bg-green-500/25 text-green-200 border border-green-300/40'
          }`}>
            {devices.length} / {limit}
          </span>
        }
      />

      {devices.length === 0 ? (
        <p className="text-white/60 text-sm text-center py-4">Tiada device berdaftar</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const isCurrent = device.deviceId === currentDeviceId;
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 justify-between rounded-xl p-3 border ${
                  isCurrent ? 'bg-purple-500/20 border-purple-300/40' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Smartphone className={`w-5 h-5 ${isCurrent ? 'text-purple-300' : 'text-white/50'}`} />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm flex flex-wrap items-center gap-2 break-words">
                      {device.deviceName}
                      {isCurrent && (
                        <span className="text-xs bg-purple-500/30 text-purple-100 px-2 py-0.5 rounded-full font-black border border-purple-300/40">
                          Device Ini
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/55">
                      Terakhir: {device.lastSeen ? format(new Date(device.lastSeen), 'dd MMM yyyy, HH:mm') : '-'}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => handleRemove(device)}
                    className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/15 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-white/70 mt-4 text-center">
        Pakej <span className="font-bold capitalize text-white">{tier}</span> — maksimum {limit} device
      </p>
    </div>
  );
}