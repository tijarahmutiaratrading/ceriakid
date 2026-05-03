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
      // Check if already had trial before
      const userProfile = await base44.auth.me();
      if (userProfile?.trialStartDate) {
        const trialStart = new Date(userProfile.trialStartDate);
        const now = new Date();
        const daysSinceTrial = (now - trialStart) / (1000 * 60 * 60 * 24);
        if (daysSinceTrial > 7) {
          setError('Trial percuma anda telah tamat. Sila pilih pelan untuk teruskan.');
          setLoading(false);
          return;
        }
      }

      // Check existing subscription — DO NOT overwrite active paid subscription
      const existing = await base44.entities.UserSubscription.filter({ email: user.email });
      if (existing.length > 0) {
        const sub = existing[0];
        const isPaid = ['asas', 'standard', 'keluarga'].includes(sub.tier);
        const isActive = sub.status === 'active';
        const notExpired = sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date();
        if (isPaid && isActive && notExpired) {
          setError('Anda sudah mempunyai langganan aktif. Tiada perlu cuba trial.');
          setLoading(false);
          return;
        }
      }

      // Upsert trial subscription
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      const subData = { email: user.email, tier: 'free', status: 'trial', selectedAgeGroup: 'prasekolah', currentPeriodEnd: trialEnd.toISOString() };
      if (existing.length > 0) {
        await base44.entities.UserSubscription.update(existing[0].id, subData);
      } else {
        await base44.entities.UserSubscription.create(subData);
      }

      // Save trial start date to user metadata
      if (!userProfile?.trialStartDate) {
        await base44.auth.updateMe({
          trialStartDate: new Date().toISOString(),
          trialActive: true,
        });
      }

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
        {loading ? '⏳ Sedang Memproses...' : '🎁 Cuba Percuma 7 Hari'}
      </motion.button>
      <p className="text-xs text-gray-500 text-center">
        ✅ Akses penuh • Tiada kad kredit diperlukan • Cancel bila-bila
      </p>
      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
    </div>
  );
}