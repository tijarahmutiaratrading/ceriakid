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
      '5 permainan gratis',
      'Prasekolah saja',
      'Dwibahasa (BM & EN)',
      'Tanpa iklan',
    ],
    cta: 'Mulai Sekarang',
    highlighted: false,
  },
  {
    name: 'premium',
    nameMY: 'Premium',
    price: '4.99',
    priceMYR: '24.90',
    games: '100+',
    features: [
      '100+ permainan premium',
      'Prasekolah & Sekolah Rendah',
      'Semua kategori pelajaran',
      'Dashboard progres orang tua',
      'Tanpa iklan',
      'Update game mingguan',
    ],
    cta: 'Langganan Sekarang',
    highlighted: true,
  },
  {
    name: 'pro',
    nameMY: 'Pro (Keluarga)',
    price: '8.99',
    priceMYR: '44.90',
    games: '200+',
    features: [
      '200+ permainan eksklusif',
      'Untuk 4 anak sekaligus',
      'Semua kategori + konten khusus',
      'Laporan pembelajaran bulanan',
      'Dukungan prioritas',
      'Offline mode (beta)',
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
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-game-purple font-bold mb-8"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali
          </motion.button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">Paket Langganan</h1>
          <p className="text-xl text-gray-600">Pilih paket yang sesuai untuk anak-anak Anda</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
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

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-8">Soalan Lazim</h2>
          <div className="space-y-4">
            {[
              { q: 'Boleh saya membatalkan langganan kapan saja?', a: 'Ya, anda boleh membatalkan langganan anda kapan saja tanpa penalti.' },
              { q: 'Adakah ada percubaan gratis?', a: 'Paket Percuma memberi anda 5 permainan untuk dicuba terlebih dahulu.' },
              { q: 'Berapa lama permainan baru ditambah?', a: 'Kami menambah 10-20 permainan baru setiap minggu!' },
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