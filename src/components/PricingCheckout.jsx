import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PricingCheckout({ tier, tierName, onClose, ageGroup }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const response = await base44.functions.invoke('createCheckoutSession', {
        tier: tierName,
        ageGroup: ageGroup,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-game-purple/10 rounded-2xl mb-4">
        <p className="text-2xl font-black text-game-purple">
          ${tier.price}<span className="text-sm text-gray-600">/bln</span>
        </p>
        <p className="text-sm text-gray-600">RM {tier.priceMYR}/bln</p>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">Nombor Kad</label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          value={formData.cardNumber}
          onChange={(e) =>
            setFormData({ ...formData, cardNumber: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-2">Luput</label>
          <input
            type="text"
            placeholder="MM/YY"
            value={formData.cardExpiry}
            onChange={(e) =>
              setFormData({ ...formData, cardExpiry: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">CVC</label>
          <input
            type="text"
            placeholder="123"
            value={formData.cardCvc}
            onChange={(e) =>
              setFormData({ ...formData, cardCvc: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-game-purple"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className="w-full py-3 bg-game-purple text-white rounded-2xl font-bold transition-all hover:shadow-lg disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Bayar Sekarang'}
      </motion.button>

      <p className="text-xs text-gray-600 text-center">
        Pembayaran selamat dengan Stripe
      </p>
    </form>
  );
}