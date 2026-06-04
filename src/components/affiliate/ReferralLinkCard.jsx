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
      className="lg:hidden mb-5 rounded-3xl overflow-hidden shadow-xl shadow-purple-950/15 relative"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)',
      }}
    >
      {/* Glow accents */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-pink-500/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-purple-500/30 blur-3xl pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25">
              <Share2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-wider leading-none">Link Rujukan Anda</p>
              <p className="text-white text-sm font-black leading-tight mt-0.5">Kongsi & dapat komisen</p>
            </div>
          </div>
        </div>

        {/* Link pill with inline copy */}
        <button
          type="button"
          onClick={copyLink}
          className="w-full group flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 hover:ring-white/40 transition-all p-2.5 mb-3 text-left"
        >
          <div className="flex-1 min-w-0 px-2">
            <p className="text-white/95 text-[12px] font-mono truncate font-bold">
              {referralLink.replace(/^https?:\/\//, '')}
            </p>
          </div>
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            copied ? 'bg-emerald-400 text-slate-900' : 'bg-[#D4FF3D] text-slate-900 group-hover:scale-105'
          }`}>
            {copied ? <Check className="w-4 h-4" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
          </div>
        </button>

        {/* Primary copy CTA */}
        <Button
          onClick={copyLink}
          className={`w-full font-black py-5 rounded-2xl shadow-lg transition-all text-sm ${
            copied
              ? 'bg-emerald-400 hover:bg-emerald-500 text-slate-900'
              : 'bg-[#D4FF3D] text-slate-900 hover:bg-[#c5f02e]'
          }`}
        >
          {copied ? (
            <><Check className="w-4 h-4 mr-1.5" strokeWidth={3} /> Link Disalin!</>
          ) : (
            <><Copy className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Salin Link Penuh</>
          )}
        </Button>

        {/* Divider with label */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/15" />
          <p className="text-white/50 text-[10px] font-black uppercase tracking-wider">Atau Share Terus</p>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {shareOptions.map(opt => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1 py-2 rounded-xl text-white text-[10px] font-black shadow-md transition-transform active:scale-95 ${opt.color}`}
            >
              <opt.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>{opt.name}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}