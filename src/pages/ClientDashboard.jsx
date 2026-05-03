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
           className="mb-6 rounded-3xl overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.8)' }}
         >
           {/* Top gradient strip */}
           <div className={`h-32 bg-gradient-to-r ${tier.color} relative overflow-hidden`}>
             <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1.5px, transparent 1.5px)', backgroundSize: '25px 25px' }} />
             {/* Decorative shapes */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
             {/* Tier badge */}
             <div className="absolute top-4 right-5 flex items-center gap-1.5 bg-white/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/50">
               <span className="text-lg">{tier.emoji}</span>
               <span className="text-white font-black text-xs">{tier.label}</span>
             </div>
           </div>

           {/* Avatar overlapping strip */}
           <div className="px-8 pb-8">
             <div className="flex items-end gap-5 -mt-14 mb-6">
               <div className="relative flex-shrink-0">
                 {avatarUrl && avatarUrl.includes('http') ? (
                   <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-2xl" />
                 ) : (
                   <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-300 to-pink-300 border-4 border-white shadow-2xl flex items-center justify-center text-6xl">🐱</div>
                 )}
                 <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:shadow-2xl transition-all hover:scale-110">
                   <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={saving} className="hidden" />
                   {saving ? <Loader className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                 </label>
               </div>
               <div className="flex-1 pb-1">
                 <p className="text-gray-900 font-black text-3xl leading-tight">{user?.full_name || 'Pengguna'}</p>
                 <p className="text-gray-500 text-sm font-medium mt-1">{user?.email}</p>
               </div>
             </div>

            {/* Account info row */}
            <div className="grid grid-cols-2 gap-3.5">
               {[
                 { icon: Mail, label: 'E-mel', value: user?.email },
                 { icon: Calendar, label: 'Ahli Sejak', value: user?.created_date ? new Date(user.created_date).toLocaleDateString('ms-MY') : '-' },
               ].map((item, i) => {
                 const Icon = item.icon;
                 return (
                   <div key={i} className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100/50 hover:border-indigo-200/70 transition-colors">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-game-purple to-game-pink flex items-center justify-center">
                         <Icon className="w-3.5 h-3.5 text-white" />
                       </div>
                       <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                     </div>
                     <p className="text-gray-900 font-black text-sm truncate ml-8">{item.value}</p>
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
           className="mb-6 rounded-3xl p-6"
           style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.08)' }}
         >
           <p className="text-gray-700 text-xs font-black uppercase tracking-wider mb-4">👤 Jantina</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: 'Lelaki', emoji: '👨' },
              { value: 'female', label: 'Perempuan', emoji: '👩' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGender(option.value)}
                className={`py-4 rounded-2xl font-bold transition-all text-sm flex flex-col items-center gap-2 ${
                  gender === option.value
                    ? 'bg-gradient-to-r from-game-purple to-game-pink text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
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
          className="mb-6"
        >
          <p className="text-gray-700 text-xs font-black uppercase tracking-wider mb-4 px-1">💎 Langganan Saya</p>
          <SubscriptionWidget userEmail={user?.email} />
        </motion.div>

        {/* Manage Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-700 text-xs font-black uppercase tracking-wider mb-4 px-1">📱 Device Berdaftar</p>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.08)' }}>
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
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-game-purple to-game-pink text-white hover:shadow-2xl'
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