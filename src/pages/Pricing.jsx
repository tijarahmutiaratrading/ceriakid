import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const tiers = [
  {
    name: 'free',
    nameMY: 'Percuma',
    price: '0',
    priceMYR: '0',
    games: '5',
    features: [
      '✅ 5 permainan gratis (tanpa kad kredit)',
      '✅ Prasekolah saja',
      '✅ Dwibahasa (BM & EN)',
      '✅ Tanpa iklan',
      '❌ Tiada dashboard orang tua',
      '❌ Tiada sekolah rendah',
    ],
    cta: 'Coba Gratis',
    highlighted: false,
  },
  {
    name: 'premium',
    nameMY: 'Premium',
    price: '4.99',
    priceMYR: '24.90',
    games: '100+',
    features: [
      '✅ 100+ permainan premium',
      '✅ Prasekolah & Sekolah Rendah',
      '✅ Semua kategori (BM, EN, Math, Sains)',
      '✅ Dashboard progres orang tua LENGKAP',
      '✅ Tanpa iklan',
      '✅ Update game mingguan',
      '❌ Hanya 1 anak (Pro untuk 4 anak)',
    ],
    cta: 'Langganan Premium',
    highlighted: true,
  },
  {
    name: 'pro',
    nameMY: 'Pro (Keluarga)',
    price: '8.99',
    priceMYR: '44.90',
    games: '200+',
    features: [
      '✅ 200+ permainan eksklusif',
      '✅ Untuk 4 anak SEKALIGUS',
      '✅ Semua kategori + konten khusus',
      '✅ Laporan pembelajaran bulanan (Email)',
      '✅ Dukungan prioritas 24/7',
      '✅ Offline mode (boleh main tanpa internet)',
      '✅ BEST VALUE: RM11.22 per anak/bulan',
    ],
    cta: 'Langganan Pro',
    highlighted: false,
  },
];

export default function Pricing() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (tierName) => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }
      // Call backend function untuk checkout
      const response = await base44.functions.invoke('createCheckoutSession', {
        tier: tierName,
        returnUrl: window.location.href,
      });
      
      // Handle free tier redirect
      if (tierName === 'free' && response.redirectUrl) {
        window.location.href = response.redirectUrl;
      } else if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgeGroupSelector = () => {
    return (
      <div className="clay rounded-3xl p-6 mb-8">
        <p className="text-sm font-bold text-gray-600 mb-4">Pilih peringkat untuk anak Anda:</p>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="flex-1 rounded-xl py-2 px-3 font-bold bg-game-yellow/30 border-2 border-game-yellow text-gray-800 text-sm"
          >
            👶 Pra Sekolah (3-5)
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="flex-1 rounded-xl py-2 px-3 font-bold bg-gray-100 border-2 border-gray-300 text-gray-600 text-sm"
          >
            👧 Sekolah Rendah (6-12)
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-game-purple font-bold mb-8"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </motion.button>
        </Link>

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-4">Paket Langganan</h1>
          <p className="text-lg md:text-xl text-gray-600">Pilih paket yang sesuai untuk anak-anak Anda</p>
        </div>

        {renderAgeGroupSelector()}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`clay rounded-3xl p-8 relative ${
                tier.highlighted ? 'ring-2 ring-game-purple scale-105 shadow-2xl' : ''
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-game-purple text-white px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ TERPOPULER
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-2">{tier.nameMY}</h3>
                <p className="text-4xl font-black text-game-purple mb-1">
                  ${tier.price}
                  <span className="text-lg text-gray-600">/bln</span>
                </p>
                <p className="text-sm text-gray-600">RM {tier.priceMYR}/bln</p>
                <p className="text-sm font-bold text-game-purple mt-2">
                  {tier.games} Permainan
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(tier.name)}
                disabled={isLoading}
                className={`w-full py-3 rounded-2xl font-bold mb-6 transition-all ${
                  tier.highlighted
                    ? 'bg-game-purple text-white shadow-lg'
                    : 'clay text-game-purple'
                }`}
              >
                {isLoading ? 'Memproses...' : tier.cta}
              </motion.button>

              <div className="space-y-3">
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Parent Confidence Section */}
        <div className="bg-blue-50 rounded-3xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-black text-game-blue">87%</p>
              <p className="text-sm text-gray-600 mt-2">Ibu bapa nampak peningkatan prestasi dalam 4 minggu</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-game-purple">10,000+</p>
              <p className="text-sm text-gray-600 mt-2">Keluarga Malaysia sudah mempercayai kami</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-game-green">4.8/5</p>
              <p className="text-sm text-gray-600 mt-2">Rating purata di App Stores</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
         <div className="max-w-2xl mx-auto">
           <h2 className="text-3xl font-black text-center mb-8">Soalan Lazim Ibu Bapa 🤔</h2>
           <div className="space-y-4">
             {[
               { q: 'Adakah aman untuk anak bermain aplikasi ini?', a: '✅ Ya! Tiada iklan, tiada data collection, tiada in-app purchase. Dirancang khusus untuk anak dengan tetap mempertahankan privasi keluarga.' },
               { q: 'Boleh saya membatalkan langganan kapan saja?', a: '✅ Tentu saja. Pembatalan sekejap saja, tiada penalti atau pertanyaan yang merepotkan.' },
               { q: 'Adakah ada percubaan gratis?', a: '✅ Paket Percuma memberi anda 5 permainan tanpa kad kredit. Cukup untuk coba-coba dulu!' },
               { q: 'Berapa lama permainan baru ditambah?', a: '✅ Kami menambah 10-20 permainan baru setiap minggu. Anak takkan bosan!' },
               { q: 'Pro plan untuk 4 anak - boleh saya tukar anak?', a: '✅ Boleh! Satu akaun untuk keseluruhan keluarga. Setiap anak ada progress sendiri.' },
             ].map((faq, i) => (
               <div key={i} className="clay rounded-2xl p-6">
                 <p className="font-bold text-lg mb-2">{faq.q}</p>
                 <p className="text-gray-600">{faq.a}</p>
               </div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}