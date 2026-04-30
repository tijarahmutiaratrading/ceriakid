import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const TIERS = [
  {
    name: 'asas',
    nameMY: '🌱 Asas',
    priceMYR: '49',
    perMonth: '4.08',
    description: 'Semua subjek • Prasekolah sahaja',
  },
  {
    name: 'standard',
    nameMY: '⭐ Standard',
    priceMYR: '99',
    perMonth: '8.25',
    description: 'Semua subjek • Sekolah Rendah sahaja',
    badge: 'PALING POPULAR',
  },
  {
    name: 'keluarga',
    nameMY: '👑 Keluarga',
    priceMYR: '199',
    perMonth: '16.58',
    description: 'Semua subjek • Semua peringkat • 4 profil anak',
  },
];

export default function PricingCheckout({ onClose, selectedTier: initialTier }) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    selectedTier: initialTier || 'standard',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) { setError('Sila masukkan email'); return; }
    if (!formData.name.trim()) { setError('Sila masukkan nama'); return; }
    if (!formData.phone.trim()) { setError('Sila masukkan nombor telefon'); return; }

    setLoading(true);

    try {
      if (!isAuthenticated) {
        base44.auth.redirectToLogin();
        return;
      }

      const response = await base44.functions.invoke('chipCheckout', {
        tier: formData.selectedTier,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
      });

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setError('Tidak dapat membuat pembayaran. Sila cuba lagi.');
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
      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-bold mb-3">Pilih Pelan Tahunan</label>
        <div className="space-y-3">
          {TIERS.map((tier) => {
            const isSelected = formData.selectedTier === tier.name;
            return (
              <motion.label
                key={tier.name}
                whileHover={{ scale: 1.01 }}
                onClick={() => setFormData({ ...formData, selectedTier: tier.name })}
                className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  isSelected ? 'border-game-purple bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
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
                  <p className={`text-xl font-black ${isSelected ? 'text-game-purple' : 'text-gray-700'}`}>
                    RM{tier.priceMYR}
                  </p>
                  <p className="text-xs text-gray-400">/tahun</p>
                  <p className="text-xs text-green-600 font-bold">≈ RM{tier.perMonth}/bln</p>
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

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        type="submit"
        className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold transition-all hover:shadow-lg disabled:opacity-50"
      >
        {loading ? 'Memproses...' : '🏦 Bayar via FPX Sekarang'}
      </motion.button>

      <p className="text-xs text-gray-600 text-center">
        🔒 Pembayaran selamat via Chip • FPX Internet Banking Malaysia
      </p>
    </form>
  );
}