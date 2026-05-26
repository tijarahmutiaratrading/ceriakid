import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Sparkles, Check, MessageCircle, Send, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AffiliateHero({ affiliate, referralLink }) {
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
      className="relative overflow-hidden rounded-3xl mb-6 shadow-2xl"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900" />
      <div className="absolute top-0 -left-20 w-72 h-72 rounded-full bg-pink-500/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 rounded-full bg-orange-500/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative p-6 sm:p-8 lg:p-10">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-wider uppercase">Program Affiliate Premium</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center">
          {/* Left side: Title + earnings */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-3">
              Dapatkan{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">komisen pasif</span>
              {' '}setiap bulan
            </h1>
            <p className="text-white/75 text-sm sm:text-base mb-5 max-w-lg leading-relaxed">
              Share CeriaKid dengan kawan & keluarga. Setiap kali mereka langgan atau beli kredit AI, anda dapat <strong className="text-amber-300">{affiliate.commissionRateSubscription}%</strong> + <strong className="text-amber-300">{affiliate.commissionRateCredit}%</strong> komisen secara automatik.
            </p>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm">
                <span className="text-white/60">Kod anda:</span>{' '}
                <strong className="text-amber-300 font-mono">{affiliate.referralCode}</strong>
              </div>
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm">
                <span className="text-white/60">🔥 Lifetime tier — </span>
                <strong className="text-white">tak reset</strong>
              </div>
            </div>
          </div>

          {/* Right side: Referral link card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4 sm:p-5 bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-amber-300" />
                <span className="text-[11px] font-black text-white/90 uppercase tracking-wider">Link Rujukan Anda</span>
              </div>

              <div className="bg-white rounded-xl p-3 mb-3 shadow-inner">
                <p className="text-xs sm:text-sm font-mono text-slate-700 break-all leading-snug">
                  {referralLink}
                </p>
              </div>

              <Button
                onClick={copyLink}
                className={`w-full font-black py-5 rounded-xl shadow-lg transition-all ${
                  copied
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white text-purple-900 hover:bg-white/90'
                }`}
              >
                {copied ? (
                  <><Check className="w-4 h-4 mr-2" /> Disalin!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Salin Link</>
                )}
              </Button>

              {/* Quick share buttons */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {shareOptions.map(opt => (
                  <a
                    key={opt.name}
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all ${opt.color}`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{opt.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}