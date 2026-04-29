import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Gift } from 'lucide-react';
import { trackReferral } from '@/lib/analyticsManager';

export default function ReferralSystem({ userEmail }) {
  const [copied, setCopied] = useState(false);
  const referralCode = userEmail ? userEmail.split('@')[0].substring(0, 6).toUpperCase() : '';
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralCode}` : '';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = (platform) => {
    const text = `🎁 Pakai kod rujukan saya: ${referralCode} - dapat 20% diskaun! 🎓 Jom Belajar bersama!`;
    const encodedText = encodeURIComponent(`${text}\n${referralLink}`);
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${referralLink}&text=${encodedText}`, '_blank');
    }
    
    trackReferral(userEmail);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-game-orange to-orange-500 text-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6" />
        <h3 className="font-black text-lg">Ajak Kawan & Dapat Diskaun!</h3>
      </div>

      <p className="text-sm opacity-90 mb-4">Bagikan kod rujukan untuk dapatkan 20% untuk kawan kamu, dan kamu juga dapat keuntungan! 🎉</p>

      <div className="bg-white/20 rounded-lg p-3 flex items-center justify-between gap-2 mb-4 backdrop-blur-sm">
        <code className="font-mono font-bold text-base">{referralCode}</code>
        <button
          onClick={handleCopyReferral}
          className="p-2 hover:bg-white/30 rounded-lg transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShareReferral('whatsapp')}
          className="flex-1 bg-white/30 hover:bg-white/40 rounded-lg py-2 px-3 font-bold text-sm transition-all"
        >
          💬 WhatsApp
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleShareReferral('telegram')}
          className="flex-1 bg-white/30 hover:bg-white/40 rounded-lg py-2 px-3 font-bold text-sm transition-all"
        >
          ✈️ Telegram
        </motion.button>
      </div>
    </motion.div>
  );
}