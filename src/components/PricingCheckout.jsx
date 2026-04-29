import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TIERS = [
  {
    name: 'premium',
    nameMY: 'Premium',
    priceMYR: '24.90',
    description: '100+ permainan',
  },
  {
    name: 'pro',
    nameMY: 'Pro (Keluarga)',
    priceMYR: '44.90',
    description: '200+ permainan untuk 4 anak',
  },
];

export default function PricingCheckout({ ageGroup, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    selectedTier: 'premium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      {/* Name */}
      <div>
        <label className="block text-sm font-bold mb-2">Nama Ibu Bapa</label>
        <input
          type="text"
          placeholder="Nama anda"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
        />
      </div>

      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-bold mb-4">Pilih Paket</label>
        <div className="space-y-3">
          {TIERS.map((tier) => (
            <motion.label
              key={tier.name}
              whileHover={{ scale: 1.02 }}
              className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
              style={{
                borderColor:
                  formData.selectedTier === tier.name
                    ? 'hsl(280, 60%, 55%)'
                    : '#e5e7eb',
                backgroundColor:
                  formData.selectedTier === tier.name
                    ? 'hsl(280, 60%, 55%, 0.05)'
                    : 'transparent',
              }}
            >
              <input
                type="radio"
                name="tier"
                value={tier.name}
                checked={formData.selectedTier === tier.name}
                onChange={(e) =>
                  setFormData({ ...formData, selectedTier: e.target.value })
                }
                className="w-5 h-5 cursor-pointer"
              />
              <div className="ml-4 flex-1">
                <p className="font-bold text-lg">{tier.nameMY}</p>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-game-purple">
                  RM {tier.priceMYR}
                </p>
                <p className="text-xs text-gray-600">/bulan</p>
              </div>
            </motion.label>
          ))}
        </div>
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