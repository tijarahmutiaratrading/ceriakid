import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Upload, Loader, User, Mail, Calendar } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { getDefaultAvatar } from '@/lib/avatarGenerator';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [gender, setGender] = useState(user?.gender || '');

  useEffect(() => {
    if (user?.gender) {
      setAvatarUrl(getDefaultAvatar(user.full_name, user.gender));
    } else {
      setAvatarUrl(getDefaultAvatar(user?.full_name || 'User'));
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const { url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await base44.auth.updateMe({ gender });
      alert('Profile updated!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24 pt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">⚙️ {t('profileSettings', lang)}</h1>
          <p className="text-gray-600 text-sm">{t('updateProfile', lang)}</p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-amber-100 shadow-sm text-center"
          >
            <img
              src={avatarUrl || getDefaultAvatar(user?.full_name || 'User')}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-game-purple/20"
            />
            
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={saving}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={saving}
                className="px-5 py-2.5 bg-game-orange text-white rounded-full font-bold flex items-center gap-2 mx-auto text-sm disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {saving ? t('uploading', lang) : t('changeAvatar', lang)}
              </motion.button>
            </label>
          </motion.div>
        </motion.div>

        {/* Gender Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <p className="text-xs font-bold text-gray-700 uppercase mb-3">{t('gender', lang)}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: t('male', lang), emoji: '👨' },
              { value: 'female', label: t('female', lang), emoji: '👩' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGender(option.value)}
                className={`py-3.5 rounded-2xl font-bold transition-all border-2 text-sm ${
                  gender === option.value
                    ? 'bg-game-orange text-white border-game-orange shadow-lg'
                    : 'bg-white text-gray-700 border-amber-100 hover:border-game-orange'
                }`}
              >
                <span className="text-xl block mb-1">{option.emoji}</span>
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 pb-6 border-b-2 border-amber-200">
          <p className="text-xs font-bold text-gray-700 uppercase mb-3">{t('accountInfo', lang)}</p>
          <div className="space-y-3">
            {[
              { label: t('name', lang), value: user?.full_name, icon: User },
              { label: t('email', lang), value: user?.email, icon: Mail },
              { label: t('memberSince', lang), value: new Date(user?.created_date).toLocaleDateString('ms-MY'), icon: Calendar },
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-amber-100"
                >
                  <IconComponent className="w-5 h-5 text-game-orange flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-bold">{item.label}</p>
                    <p className="font-bold text-gray-800 text-sm truncate">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-game-orange to-orange-500 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : '💾'}
            {saving ? t('saving', lang) : t('saveChanges', lang)}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}