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
import ParentAvatarPicker from '@/components/dashboard/ParentAvatarPicker';
import ManageDevices from '@/components/ManageDevices';
import OfflineModeCard from '@/components/offline/OfflineModeCard';
import ThemeSwitcherPanel from '@/components/admin/ThemeSwitcherPanel';

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

  const handleSelectAvatar = async (url) => {
    setAvatarUrl(url);
    window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatarUrl: url } }));
    await base44.auth.updateMe({ avatarUrl: url });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)' }}
    >
      {/* Floating decorations — CeriaKid vibe (same as Challenges) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>

      <AppHeader />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-16 pt-4 space-y-5">

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

        {/* Pilih / Upload Avatar Parent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-4"
        >
          <ParentAvatarPicker
            selectedUrl={avatarUrl}
            saving={saving}
            onSelect={handleSelectAvatar}
            onUpload={handleAvatarUpload}
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

        {/* Tema Warna App */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21 }}
          className="mb-5"
        >
          <ThemeSwitcherPanel />
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

        {/* Save Button — Linear style */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-end">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm transition-all ${
              saved ? 'bg-emerald-600 text-white' : 'brand-gradient text-white'
            } disabled:opacity-60`}
          >
            {saving ? (
              <><Loader className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Tersimpan</>
            ) : (
              <>Simpan Perubahan</>
            )}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}