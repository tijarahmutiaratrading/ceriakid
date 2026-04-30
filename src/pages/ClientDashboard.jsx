import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CreditCard, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const data = await base44.entities.UserSubscription.filter({
        email: user.email,
      });
      if (data.length > 0) {
        setSubscription(data[0]);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const tierNames = {
    free: 'Percuma',
    asas: '🌱 Asas',
    standard: '⭐ Standard',
    keluarga: '👑 Keluarga',
  };

  const tierPrices = {
    free: 'RM 0',
    asas: 'RM 49',
    standard: 'RM 99',
    keluarga: 'RM 199',
  };

  const tierFeatures = {
    free: [
      'Beberapa permainan percuma',
      'Prasekolah sahaja',
      'Akses terhad',
      'Tanpa iklan',
    ],
    asas: [
      'Semua subjek',
      'Prasekolah sahaja',
      'Tanpa iklan',
      'Boleh guna offline 📲',
      'Kemas kini mingguan',
    ],
    standard: [
      'Semua subjek',
      'Sekolah Rendah sahaja',
      'Dashboard ibu bapa',
      'Tanpa iklan',
      'Boleh guna offline 📲',
      'Kemas kini mingguan',
    ],
    keluarga: [
      'Semua subjek',
      'Prasekolah & Sekolah Rendah',
      'Sehingga 4 profil anak',
      'Dashboard ibu bapa lengkap',
      'Boleh guna offline 📲',
      'Sokongan prioriti',
    ],
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">🎓 Akaun Saya</h1>
          <p className="text-gray-600">Lihat maklumat langganan & akaun anda</p>
        </motion.div>

        {/* Subscription Card */}
        {subscription ? (
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-black text-gray-800 mb-4">💎 Pakej Langganan</h2>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className={`rounded-3xl p-8 border-2 shadow-lg ${
                  subscription.tier === 'free' ? 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300' :
                  subscription.tier === 'asas' ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-300' :
                  subscription.tier === 'standard' ? 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300' :
                  'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-1">Pakej Semasa</p>
                    <h3 className={`text-4xl font-black ${
                      subscription.tier === 'free' ? 'text-gray-700' :
                      subscription.tier === 'asas' ? 'text-green-600' :
                      subscription.tier === 'standard' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                      {tierNames[subscription.tier]}
                    </h3>
                  </div>
                  <div className="text-5xl opacity-30">
                    {subscription.tier === 'free' ? '🎯' : subscription.tier === 'asas' ? '🌱' : subscription.tier === 'standard' ? '⭐' : '👑'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                    subscription.tier === 'free' ? 'bg-white/60' :
                    subscription.tier === 'asas' ? 'bg-green-200/60' :
                    subscription.tier === 'standard' ? 'bg-blue-200/60' :
                    'bg-purple-200/60'
                  }`}>
                    <span className="text-2xl font-black">{tierPrices[subscription.tier]}</span>
                    <span className="text-sm text-gray-700 font-bold">{subscription.tier !== 'free' ? '/tahun' : 'Selamanya'}</span>
                  </div>

                  {subscription.currentPeriodEnd && (
                    <div className="p-4 bg-white/60 rounded-2xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-xs text-gray-600">Pembaruan</p>
                        <p className="font-bold text-sm">{new Date(subscription.currentPeriodEnd).toLocaleDateString('ms-MY')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/40 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-600 mb-3">✅ Ciri-ciri:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {tierFeatures[subscription.tier].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        <span className="text-green-500">✓</span> {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-xl font-black text-gray-800 mb-4">💎 Pakej Langganan</h2>
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-8 text-center border-2 border-amber-300 shadow-lg"
            >
              <p className="text-4xl mb-4">📦</p>
              <p className="font-black text-xl text-gray-800 mb-2">Tiada Pakej Aktif</p>
              <p className="text-gray-700 mb-6">Mulai langganan untuk akses semua permainan & ciri-ciri premium!</p>
              <Link to="/landing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-game-orange to-orange-500 text-white rounded-full font-bold shadow-lg"
                >
                  Lihat Pakej
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* User Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
      </div>
    </div>
  );
}