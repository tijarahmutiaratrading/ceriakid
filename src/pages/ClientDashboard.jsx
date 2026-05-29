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
import SettingsHero from '@/components/dashboard/SettingsHero';
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

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4 space-y-5">

        {/* Hero Profile — Apple Fitness style (sama macam dashboard) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <SettingsHero
            user={user}
            avatarUrl={avatarUrl}
            userTier={userTier}
            saving={saving}
            onAvatarUpload={handleAvatarUpload}
          />
        </motion.div>

        {/* Maklumat Peribadi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 mt-6 md:mt-8"
        >
          <PersonalInfoCard user={user} />
        </motion.div>

        {/* Langganan & Naik Taraf */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <UpgradeTierCard currentTier={userTier} user={user} gender={gender} onGenderChange={setGender} />
        </motion.div>

        {/* Manage Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
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