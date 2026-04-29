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
    premium: 'Premium',
    pro: 'Pro (Keluarga)',
  };

  const tierPrices = {
    free: 'RM 0',
    premium: 'RM 24.90',
    pro: 'RM 44.90',
  };

  const tierFeatures = {
    free: [
      '5 permainan percuma',
      'Prasekolah sahaja',
      'Dwibahasa (BM & EN)',
      'Tanpa iklan',
    ],
    premium: [
      '100+ permainan premium',
      'Prasekolah & Sekolah Rendah',
      'Semua mata pelajaran',
      'Dashboard ibu bapa lengkap',
      'Tanpa iklan',
      'Update mingguan',
    ],
    pro: [
      '200+ permainan eksklusif',
      'Untuk 4 anak sekaligus',
      'Semua mata pelajaran + eksklusif',
      'Laporan bulanan email',
      'Sokongan 24/7',
      'Mod luar talian',
    ],
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-4xl font-black mb-8 text-gray-800">Akaun Saya</h1>

        {/* Subscription Card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-8 mb-8 border-2 border-amber-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-700 font-bold mb-2">📦 Paket Semasa</p>
                <h2 className="text-3xl font-black text-game-orange">
                  {tierNames[subscription.tier]}
                </h2>
                <p className="text-2xl font-bold mt-2">
                  {tierPrices[subscription.tier]}/{subscription.tier === 'free' ? '' : 'bulan'}
                </p>
              </div>
              <CreditCard className="w-16 h-16 text-game-purple opacity-20" />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-green-100 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-700">Aktif</p>
                <p className="text-sm text-green-600">Paket anda aktif dan berfungsi</p>
              </div>
            </div>

            {/* Renewal Date */}
            {subscription.currentPeriodEnd && (
              <div className="flex items-center gap-3 p-4 bg-blue-100 rounded-2xl mb-6">
                <Calendar className="w-6 h-6 text-game-blue" />
                <div>
                  <p className="text-sm text-gray-600">Tarikh Pembaruan</p>
                  <p className="font-bold text-game-blue">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('ms-MY')}
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-8">
              <p className="font-bold text-lg mb-4">Ciri-ciri Paket:</p>
              <div className="space-y-3">
                {tierFeatures[subscription.tier].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* No Subscription */}
        {!subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 text-center border-2 border-amber-200 shadow-lg"
          >
            <p className="text-2xl font-black mb-4">📦</p>
            <p className="font-bold text-lg mb-2">Tiada Paket Aktif</p>
            <p className="text-gray-600 mb-6">
              Mulai langganan sekarang untuk akses 200+ permainan seru!
            </p>
            <Link to="/landing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-3 bg-game-orange text-white rounded-full font-bold hover:bg-orange-600 transition-all"
              >
                Lihat Paket
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-lg"
        >
          <h2 className="text-2xl font-black mb-6 text-gray-800">👤 Maklumat Akaun</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nama</p>
              <p className="font-bold">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-bold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ahli Sejak</p>
              <p className="font-bold">
                {new Date(user?.created_date).toLocaleDateString('ms-MY')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}