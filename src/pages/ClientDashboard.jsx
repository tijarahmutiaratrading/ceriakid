import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, User, Mail, Calendar, Shield, Smartphone, Crown, CheckCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getDefaultAvatar } from '@/lib/avatarGenerator';
import UpgradeTierCard from '@/components/dashboard/UpgradeTierCard';
import PersonalInfoCard from '@/components/dashboard/PersonalInfoCard';
import ManageDevices from '@/components/ManageDevices';
import OfflineModeCard from '@/components/offline/OfflineModeCard';

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
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    } else if (user?.gender) {
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
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const uploadedUrl = response?.file_url || response?.url;
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: uploadedUrl } }));
        await base44.auth.updateMe({ avatarUrl: uploadedUrl });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ gender, avatarUrl });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tier = TIER_CONFIG[userTier] || TIER_CONFIG.free;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-8 space-y-5">

        {/* Hero Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-950/30 border border-white/20 relative isolate"
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.82), rgba(190,24,93,0.72))', backdropFilter: 'blur(26px)', clipPath: 'inset(0 round 2.5rem)' }}
        >
          <div className="absolute -top-16 -right-10 w-44 h-44 bg-yellow-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-12 w-56 h-56 bg-pink-200/30 rounded-full blur-2xl" />
          {/* Avatar overlapping strip */}
          <div className="relative px-4 md:px-6 pb-4 md:pb-6 pt-4 md:pt-6">
            <div className="flex items-end gap-4 mb-6">
              <div className="relative">
                {avatarUrl && avatarUrl.includes('http') ? (
                  <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white/40 border-4 border-white shadow-xl flex items-center justify-center text-5xl">🐱</div>
                )}
                <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors z-10">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={saving} className="hidden" />
                  {saving ? <Loader className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                </label>
              </div>
              <div className="mb-1">
                <p className="text-white font-black text-xl leading-tight">{user?.full_name || 'Pengguna'}</p>
                <p className="text-white/70 text-xs font-semibold">{user?.email}</p>
              </div>
            </div>

            {/* Account info row */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
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

        {/* Maklumat Peribadi — edit nama & no. telefon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 mt-6 md:mt-8"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-1 w-8 bg-gradient-to-r from-orange-300 to-pink-400 rounded-full" />
            <p className="text-white/80 text-xs font-black uppercase tracking-wider">👤 Maklumat Peribadi</p>
          </div>
          <PersonalInfoCard user={user} />
        </motion.div>

        {/* Langganan, Jantina & Naik Taraf — gabungan dalam satu card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-1 w-8 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full" />
            <p className="text-white/80 text-xs font-black uppercase tracking-wider">💎 Langganan & Pakej</p>
          </div>
          <UpgradeTierCard currentTier={userTier} user={user} gender={gender} onGenderChange={setGender} />
        </motion.div>

        {/* Manage Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-1 w-8 bg-gradient-to-r from-cyan-300 to-pink-300 rounded-full" />
            <p className="text-white/80 text-xs font-black uppercase tracking-wider">📱 Device Berdaftar</p>
          </div>
          <ManageDevices userEmail={user?.email} tier={userTier} />
        </motion.div>

        {/* Offline Mode — hanya untuk Standard, Keluarga (+ legacy premium/pro) */}
        {['standard', 'keluarga', 'premium', 'pro'].includes(userTier) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-1 w-8 bg-gradient-to-r from-emerald-300 to-cyan-400 rounded-full" />
              <p className="text-white/80 text-xs font-black uppercase tracking-wider">📡 Mode Offline</p>
            </div>
            <OfflineModeCard />
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
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