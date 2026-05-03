import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, User, Mail, Calendar, Shield, Smartphone, Crown, CheckCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getDefaultAvatar } from '@/lib/avatarGenerator';
import SubscriptionWidget from '@/components/dashboard/SubscriptionWidget';
import ManageDevices from '@/components/ManageDevices';

const TIER_CONFIG = {
  free:      { label: 'Percuma',  emoji: '🆓', color: 'from-gray-400 to-gray-500' },
  asas:      { label: 'Asas',     emoji: '🌱', color: 'from-green-400 to-emerald-500' },
  standard:  { label: 'Standard', emoji: '⭐', color: 'from-blue-400 to-indigo-500' },
  keluarga:  { label: 'Keluarga', emoji: '👑', color: 'from-purple-500 to-pink-500' },
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [gender, setGender] = useState(user?.gender || '');
  const [userTier, setUserTier] = useState('free');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.email) {
      base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
        if (subs?.length > 0) setUserTier(subs[0].tier || 'free');
      });
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.gender) {
      setAvatarUrl(getDefaultAvatar(user.full_name, user.gender));
    } else {
      setAvatarUrl(getDefaultAvatar(user?.full_name || 'User'));
    }
    setGender(user?.gender || '');
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const { url } = await base44.integrations.Core.UploadFile({ file });
    setAvatarUrl(url);
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ gender });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tier = TIER_CONFIG[userTier] || TIER_CONFIG.free;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader />

      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Hero Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          {/* Top gradient strip */}
          <div className={`h-24 bg-gradient-to-r ${tier.color} relative`}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0.5px, transparent 0.5px)', backgroundSize: '4px 8px' }} />
            {/* Tier badge */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-3 py-1.5">
              <span className="text-lg">{tier.emoji}</span>
              <span className="text-white font-black text-xs">{tier.label}</span>
            </div>
          </div>

          {/* Avatar overlapping strip */}
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="relative">
                {avatarUrl && avatarUrl.includes('http') ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/40 border-4 border-white shadow-xl flex items-center justify-center text-4xl">🐱</div>
                )}
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={saving} className="hidden" />
                  {saving ? <Loader className="w-3.5 h-3.5 text-white animate-spin" /> : <Upload className="w-3.5 h-3.5 text-white" />}
                </label>
              </div>
              <div className="mb-1">
                <p className="text-white font-black text-xl leading-tight">{user?.full_name || 'Pengguna'}</p>
                <p className="text-white/70 text-xs font-semibold">{user?.email}</p>
              </div>
            </div>

            {/* Account info row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Mail, label: 'E-mel', value: user?.email },
                { icon: Calendar, label: 'Ahli Sejak', value: user?.created_date ? new Date(user.created_date).toLocaleDateString('ms-MY') : '-' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white/20 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-white/70" />
                      <p className="text-white/70 text-xs font-bold">{item.label}</p>
                    </div>
                    <p className="text-white font-black text-xs truncate">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Gender Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 mt-6 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">👤 Jantina</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: 'Lelaki', emoji: '👨' },
              { value: 'female', label: 'Perempuan', emoji: '👩' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGender(option.value)}
                className={`py-4 rounded-2xl font-bold transition-all text-sm flex flex-col items-center gap-1 ${
                  gender === option.value
                    ? 'bg-white text-purple-600 shadow-xl'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">💎 Langganan Saya</p>
          <SubscriptionWidget userEmail={user?.email} />
        </motion.div>

        {/* Manage Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">📱 Device Berdaftar</p>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <div className="p-4">
              <ManageDevices userEmail={user?.email} tier={userTier} />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-white text-purple-600 hover:bg-white/90'
            } disabled:opacity-60`}
          >
            {saving ? (
              <><Loader className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : saved ? (
              <><CheckCircle className="w-5 h-5" /> Tersimpan!</>
            ) : (
              <>💾 Simpan Perubahan</>
            )}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}