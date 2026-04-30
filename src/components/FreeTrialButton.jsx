import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function FreeTrialButton({ onTrialStarted }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin('/dashboard');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Create or update trial subscription
      await base44.entities.UserSubscription.bulkCreate([{
        email: user.email,
        tier: 'free',
        status: 'active',
        selectedAgeGroup: 'prasekolah',
      }]);

      // Save trial start date to user metadata
      await base44.auth.updateMe({
        trialStartDate: new Date().toISOString(),
        trialActive: true,
      });

      onTrialStarted?.();
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Ralat memulakan trial. Sila cuba lagi.');
      console.error('Trial error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        onClick={handleStartTrial}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? '⏳ Sedang Memproses...' : '🎁 Coba Gratis 7 Hari'}
      </motion.button>
      <p className="text-xs text-gray-500 text-center">
        ✅ Akses penuh • Tiada kad kredit diperlukan • Cancel bila-bila
      </p>
      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
    </div>
  );
}