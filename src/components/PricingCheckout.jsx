import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { trackPixelEvent } from '@/lib/pixel';
import { genEventID, getFbCookies } from '@/lib/fbTracking';
import { getStoredReferralCode } from '@/lib/referralTracker';
import { useGameStats, formatGameCount } from '@/hooks/useGameStats';

const TIER_VALUES = {
  asas: 49,
  standard: 99,
  keluarga: 199,
};

// Bina tier descriptions dengan game count real-time
const buildTiers = (stats) => {
  const fmt = formatGameCount;
  const asasGames = stats?.accessibleByTier?.asas;
  const standardGames = stats?.accessibleByTier?.standard;
  const keluargaGames = stats?.accessibleByTier?.keluarga;

  return [
    {
      name: 'asas',
      nameMY: '🌱 Asas',
      priceMYR: '49',
      perMonth: '4.08',
      description: asasGames ? `Semua subjek • ${fmt(asasGames)} game • 1 anak` : 'Semua subjek • 10 game per darjah/subjek • 1 anak'
    },
    {
      name: 'standard',
      nameMY: '⭐ Standard',
      priceMYR: '99',
      perMonth: '8.25',
      description: standardGames ? `Semua subjek • ${fmt(standardGames)} game • 1 anak` : 'Semua subjek • 20 game per darjah/subjek • 1 anak'
    },
    {
      name: 'keluarga',
      nameMY: '👑 Keluarga',
      priceMYR: '199',
      perMonth: '16.58',
      description: keluargaGames ? `Akses penuh ${fmt(keluargaGames)} game • 4 profil anak` : 'Akses penuh semua game • 4 profil anak',
      badge: 'PALING POPULAR'
    }
  ];
};


export default function PricingCheckout({ onClose, selectedTier: initialTier, onTierChange }) {
  const { isAuthenticated, user } = useAuth();
  const { stats } = useGameStats();
  const TIERS = buildTiers(stats);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    selectedTier: initialTier || 'keluarga'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leadFired, setLeadFired] = useState(false);

  // Fire `Lead` event sekali bila user mula isi form (focus on email/name/phone)
  const fireLeadOnce = () => {
    if (leadFired) return;
    setLeadFired(true);
    trackPixelEvent('Lead', { content_name: 'pricing_form_started', currency: 'MYR' }, genEventID('Lead'));
  };

  // Sync when parent changes the selected tier (via pricing card buttons)
  useEffect(() => {
    if (initialTier && initialTier !== formData.selectedTier) {
      setFormData((prev) => ({ ...prev, selectedTier: initialTier }));
    }
  }, [initialTier]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        name: prev.name || user.full_name || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    // Strict validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+0-9\s-]{8,15}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) { setError('Email tidak sah'); return; }
    if (!formData.name.trim() || formData.name.trim().length < 2) { setError('Sila masukkan nama penuh'); return; }
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) { setError('Nombor telefon tidak sah'); return; }

    setLoading(true);

    // Fire InitiateCheckout SELEPAS validation pass (bukan sebelum)
    const checkoutEventID = genEventID('InitiateCheckout');
    trackPixelEvent('InitiateCheckout', {
      currency: 'MYR',
      value: TIER_VALUES[formData.selectedTier] || 0,
      content_name: formData.selectedTier,
      content_ids: [formData.selectedTier],
      content_type: 'product',
    }, checkoutEventID);

    // Capture fbp/fbc cookies untuk CAPI server-side backup
    const { fbp, fbc } = getFbCookies();

    try {

      const response = await base44.functions.invoke('chipCheckout', {
        tier: formData.selectedTier,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        referralCode: getStoredReferralCode(),
        fbp,
        fbc,
        checkoutEventID,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAuthenticated && (
        <div className="rounded-2xl bg-yellow-100 border border-yellow-300/60 p-4 text-slate-800 text-sm font-bold">
          Log masuk dahulu supaya pembayaran dan langganan boleh diaktifkan pada akaun anda.
        </div>
      )}

      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-bold mb-3 text-slate-800">Pilih Pelan Tahunan</label>
        <div className="space-y-2">
          {TIERS.map((tier) => {
            const isSelected = formData.selectedTier === tier.name;
            return (
              <motion.label
                key={tier.name}
                whileHover={{ scale: 1.01 }}
                onClick={() => {setFormData({ ...formData, selectedTier: tier.name });onTierChange?.(tier.name);}}
                className={`relative flex items-center gap-2.5 px-3 py-2.5 border-2 rounded-2xl cursor-pointer transition-all ${
                isSelected ? 'border-game-purple bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`
                }>
                
                {tier.badge &&
                <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    {tier.badge}
                  </span>
                }
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-game-purple' : 'border-gray-300'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-game-purple" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-black text-gray-900 text-sm leading-tight">{tier.nameMY}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{tier.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-black leading-tight ${isSelected ? 'text-game-purple' : 'text-gray-700'}`}>
                    RM{tier.priceMYR}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight">/tahun</p>
                  <p className="text-[10px] text-green-600 font-bold leading-tight">≈ RM{tier.perMonth}/bln</p>
                </div>
              </motion.label>);

          })}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-800">Nama Penuh</label>
        <input
          type="text"
          placeholder="Nama penuh anda"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onFocus={fireLeadOnce}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple" />
        
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-800">Email</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onFocus={fireLeadOnce}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple" />
        
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-800">Nombor Telefon</label>
        <input
          type="tel"
          placeholder="01234567890"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          onFocus={fireLeadOnce}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple" />
        
      </div>

      {getStoredReferralCode() && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 flex items-center gap-2">
          🎁 Anda dirujuk oleh kod: <code className="bg-white px-2 py-0.5 rounded">{getStoredReferralCode()}</code>
        </div>
      )}

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        type="submit" className="min-h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 font-bold rounded-2xl w-full transition-all hover:shadow-lg disabled:opacity-50 shadow-md">
        {loading ? '🔄 Memproses...' : isAuthenticated ? '💳 Bayar via FPX Sekarang' : '🔐 Log Masuk untuk Teruskan'}
      </motion.button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs text-slate-600 font-semibold">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">🔒</span>
          <span>Secure</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">✅</span>
          <span>Verified</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">🛡️</span>
          <span>Protected</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center mt-3">
        🏦 Pembayaran selamat via Chip • FPX Internet Banking Malaysia<br/>
        <span className="text-green-700 font-bold">✓ Sesuai untuk ibu bapa di Malaysia</span>
      </p>

    </form>);

}