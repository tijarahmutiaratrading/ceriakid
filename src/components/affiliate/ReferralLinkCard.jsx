import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Check, MessageCircle, Send, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * Mobile-friendly referral link + share buttons card.
 * Dipisahkan dari AffiliateHero supaya tak tersepit dalam hero di mobile.
 * Hero tunjuk visual + tagline; card ni tunjuk action.
 */
export default function ReferralLinkCard({ referralLink }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: '✅ Link disalin!', description: 'Share dengan kawan-kawan anda.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `🎓 Cuba CeriaKid — apps pembelajaran terbaik untuk anak-anak Malaysia! Pakai link saya untuk daftar: ${referralLink}`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1ebe57]',
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc] hover:bg-[#0077b3]',
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🎓 Cuba CeriaKid — apps pembelajaran terbaik untuk anak-anak Malaysia!')}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#166fe0]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="lg:hidden rounded-3xl p-4 sm:p-5 bg-white border border-slate-200 shadow-lg mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Link Rujukan</span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
        <p className="text-[12px] font-mono text-slate-700 break-all leading-snug">
          {referralLink}
        </p>
      </div>

      <Button
        onClick={copyLink}
        className={`w-full font-black py-5 rounded-xl shadow-lg transition-all text-sm ${
          copied
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-[#D4FF3D] text-slate-900 hover:bg-[#c5f02e]'
        }`}
      >
        {copied ? (
          <><Check className="w-4 h-4 mr-1.5" /> Disalin!</>
        ) : (
          <><Copy className="w-4 h-4 mr-1.5" /> Salin Link</>
        )}
      </Button>

      <div className="grid grid-cols-3 gap-2 mt-2.5">
        {shareOptions.map(opt => (
          <a
            key={opt.name}
            href={opt.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-xs font-black shadow-md transition-all ${opt.color}`}
          >
            <opt.icon className="w-3.5 h-3.5" />
            <span>{opt.name}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}