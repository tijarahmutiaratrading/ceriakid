import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Upload, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDefaultAvatar } from '@/lib/avatarGenerator';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [gender, setGender] = useState(user?.gender || '');
  const [fullName, setFullName] = useState(user?.full_name || '');

  useEffect(() => {
    if (user?.gender) {
      setGender(user.gender);
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
      await base44.auth.updateMe({
        gender,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-purple/5 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">⚙️ Tetapan Profil</h1>
          <p className="text-gray-600">Kemaskini avatar, gender, dan maklumat anda</p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">📸 Avatar Anda</h2>
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-white rounded-3xl p-8 border-2 border-game-purple/20 shadow-lg text-center"
          >
            <img
              src={avatarUrl || getDefaultAvatar(user?.full_name || 'User')}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-game-purple/30"
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
                className="px-6 py-3 bg-game-purple text-white rounded-full font-bold flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {saving ? 'Muat naik...' : 'Tukar Avatar'}
              </motion.button>
            </label>
          </motion.div>
        </motion.div>

        {/* Gender Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">⚡ Jantina</h2>
          <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-white rounded-3xl p-6 border-2 border-game-purple/20 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'male', label: '👨 Lelaki', emoji: '👨' },
                { value: 'female', label: '👩 Perempuan', emoji: '👩' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGender(option.value)}
                  className={`py-4 rounded-2xl font-bold text-lg transition-all border-2 ${
                    gender === option.value
                      ? 'bg-game-purple text-white border-game-purple'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-game-purple'
                  }`}
                >
                  <span className="text-2xl mr-2">{option.emoji}</span>
                  {option.label.split(' ')[1]}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">👤 Maklumat Akaun</h2>
          <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-white rounded-3xl p-6 border-2 border-game-purple/20 shadow-lg">
            <div className="space-y-4">
              {[
                { label: 'Nama', value: user?.full_name, icon: '👤' },
                { label: 'Email', value: user?.email, icon: '📧' },
                { label: 'Ahli Sejak', value: new Date(user?.created_date).toLocaleDateString('ms-MY'), icon: '📅' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-bold">{item.label}</p>
                    <p className="font-bold text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-game-purple to-game-purple/80 text-white rounded-full font-black text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : '💾'}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}