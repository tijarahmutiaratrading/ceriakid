import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CreditCard, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubscriptionWidget({ userEmail }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [userEmail]);

  const loadSubscription = async () => {
    try {
      const data = await base44.entities.UserSubscription.filter({
        email: userEmail,
      });
      setSubscription(data?.[0] || { email: userEmail, tier: 'free', status: 'active' });
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription({ email: userEmail, tier: 'free', status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const tierColors = {
    free: 'from-gray-300 to-gray-400',
    asas: 'from-green-400 to-emerald-500',
    standard: 'from-blue-400 to-indigo-500',
    keluarga: 'from-purple-500 to-pink-500',
    premium: 'from-blue-300 to-blue-500',
    pro: 'from-purple-300 to-purple-500',
  };

  const tierLabels = {
    free: '🆓 Percuma',
    asas: '🌱 Asas',
    standard: '⭐ Standard',
    keluarga: '👑 Keluarga',
    premium: '⭐ Premium',
    pro: '👑 Pro',
  };

  const isExpired = subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
  
  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return null;
    const endDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-5 text-white shadow-lg mb-6 bg-gradient-to-br ${tierColors[subscription?.tier || 'free'] || 'from-gray-300 to-gray-400'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-black text-lg">{tierLabels[subscription?.tier || 'free']}</h3>
          <p className="text-xs opacity-90 mt-1">
            {isExpired ? '⚠️ Subscription Expired' : subscription?.status === 'active' ? '✅ Active' : '❌ Inactive'}
          </p>
        </div>
        {subscription?.tier !== 'free' && (
          <CheckCircle className="w-6 h-6" />
        )}
      </div>

      {subscription?.currentPeriodEnd && !isExpired && (
        <div className="text-xs opacity-90 mb-3 space-y-1">
          <p>📅 Tamat: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ms-MY')}</p>
          {daysRemaining !== null && (
            <p className={daysRemaining <= 7 ? 'font-bold text-yellow-200' : ''}>
              ⏳ {daysRemaining} hari lagi
            </p>
          )}
        </div>
      )}

      {subscription?.tier === 'free' && (
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white/30 hover:bg-white/50 text-white rounded-xl py-2 font-bold text-sm transition-all flex items-center justify-center gap-2 mt-3"
          >
            <Zap className="w-4 h-4" />
            Naik Taraf Sekarang
          </motion.button>
        </Link>
      )}

      {isExpired && (
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white/30 hover:bg-white/50 text-white rounded-xl py-2 font-bold text-sm transition-all flex items-center justify-center gap-2 mt-3"
          >
            <CreditCard className="w-4 h-4" />
            Perbaharui Langganan
          </motion.button>
        </Link>
      )}
    </motion.div>
  );
}