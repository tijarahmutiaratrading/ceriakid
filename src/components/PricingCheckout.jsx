import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TIERS = [
  {
    name: 'premium',
    nameMY: '🔥 Premium',
    priceMYR: '24.90',
    originalPrice: '49.90',
    description: '100+ permainan • 1 anak • Dashboard ibu bapa',
    badge: 'PALING POPULAR',
  },
  {
    name: 'pro',
    nameMY: '👨‍👩‍👧 Pro Keluarga',
    priceMYR: '44.90',
    originalPrice: '89.90',
    description: '200+ permainan • Sehingga 4 anak • Laporan PDF',
    badge: null,
  },
];

export default function PricingCheckout({ ageGroup, onClose, selectedTier: initialTier }) {
  // If initialTier is passed, hide tier selection (already chosen)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    selectedTier: initialTier || 'premium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Sila masukkan email');
      return;
    }
    if (!formData.name.trim()) {
      setError('Sila masukkan nama');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Sila masukkan nombor telefon');
      return;
    }

    setLoading(true);

    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const response = await base44.functions.invoke('createCheckoutSession', {
        tier: formData.selectedTier,
        ageGroup: ageGroup,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        returnUrl: window.location.href,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (err) {
      setError('Ralat semasa memproses pembayaran. Sila cuba lagi.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tier Selection — always visible, at top */}
      <div>
        <label className="block text-sm font-bold mb-3">Pilih Paket</label>
        <div className="space-y-3">
          {TIERS.map((tier) => {
            const isSelected = formData.selectedTier === tier.name;
            return (
              <motion.label
                key={tier.name}
                whileHover={{ scale: 1.01 }}
                onClick={() => setFormData({ ...formData, selectedTier: tier.name })}
                className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-game-purple bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    {tier.badge}
                  </span>
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-game-purple' : 'border-gray-300'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-game-purple" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-black text-gray-900">{tier.nameMY}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tier.description}</p>
                </div>
                <div className="text-right ml-3">
                  {tier.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">RM{tier.originalPrice}</p>
                  )}
                  <p className={`text-xl font-black ${isSelected ? 'text-game-purple' : 'text-gray-700'}`}>
                    RM{tier.priceMYR}
                  </p>
                  <p className="text-xs text-gray-400">/bulan</p>
                </div>
              </motion.label>
            );
          })}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-bold mb-2">Nama Ibu Bapa</label>
        <input
          type="text"
          placeholder="Nama anda"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-bold mb-2">Nombor Telefon</label>
        <input
          type="tel"
          placeholder="01234567890"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-bold">{error}</p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        type="submit"
        className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold transition-all hover:shadow-lg disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Langganan Sekarang'}
      </motion.button>

      <p className="text-xs text-gray-600 text-center">
        Pembayaran selamat dengan Stripe
      </p>
    </form>
  );
}