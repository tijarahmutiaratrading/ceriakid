import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';

export default function ShareButton({ gameTitle, category, index }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/play/${category}/${index}`
    : '';

  const shareText = `🎮 Aku main permainan "${gameTitle}" di Jom Belajar! Ikut aku belajar sambil bermain! 🎓📚`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleShareInstagram = () => {
    const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    alert(`📱 Salin teks ke Instagram:\n\n${shareText}`);
    handleCopyLink();
  };

  const handleShareTikTok = () => {
    const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    alert(`🎵 Salin teks ke TikTok:\n\n${shareText}`);
    handleCopyLink();
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-game-blue to-purple-500 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
      >
        <Share2 className="w-4 h-4" />
        Kongsi
      </motion.button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-game-blue/20 overflow-hidden z-50 w-48"
        >
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-200"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            <span className="font-bold text-sm text-gray-800">{copied ? 'Tersalin!' : 'Salin Pautan'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors text-left border-b border-gray-200"
          >
            <span className="text-xl">💬</span>
            <span className="font-bold text-sm text-gray-800">WhatsApp</span>
          </button>

          <button
            onClick={handleShareInstagram}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-pink-50 transition-colors text-left border-b border-gray-200"
          >
            <span className="text-xl">📷</span>
            <span className="font-bold text-sm text-gray-800">Instagram</span>
          </button>

          <button
            onClick={handleShareTikTok}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-black/5 transition-colors text-left"
          >
            <span className="text-xl">🎵</span>
            <span className="font-bold text-sm text-gray-800">TikTok</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}