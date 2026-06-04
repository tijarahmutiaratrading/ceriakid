import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, Check, MessageCircle, Send, Facebook, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SLIDES = [
  {
    tagline: 'PROGRAM AFFILIATE',
    title: 'Income pasif setiap bulan',
    meta: 'Share link → mereka langgan → anda dapat komisen',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b447b225b_generated_image.png',
  },
  {
    tagline: 'KOMISEN LUMAYAN',
    title: 'Sehingga 25% komisen',
    meta: 'Setiap subscription + 20% setiap top-up kredit AI',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8f52add30_generated_image.png',
  },
  {
    tagline: 'SISTEM TIER',
    title: 'Bronze hingga Platinum',
    meta: 'Auto-upgrade ikut jumlah rujukan — lifetime, tak reset',
    image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a1d556a25_generated_image.png',
  },
];

export default function AffiliateHero({ affiliate, referralLink }) {
  const [copied, setCopied] = useState(false);
  const [index, setIndex] = useState(0);
  const { toast } = useToast();
  const slide = SLIDES[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-950/40 min-h-[520px] sm:min-h-0 sm:aspect-[16/9] md:aspect-[16/8] sm:max-h-[600px] mb-6">
      {/* Background slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(15,5,40,0.92) 0%, rgba(15,5,40,0.7) 35%, rgba(15,5,40,0.2) 70%, rgba(15,5,40,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top badge — affiliate tier indicator */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-xl shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-wider uppercase">Affiliate Premium</span>
        </motion.div>
      </div>

      {/* Content area — left side */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 pt-16 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-6 items-end">
          {/* Left: animated text content */}
          <div className="lg:col-span-3 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <p className="text-[#D4FF3D] font-black text-[10px] sm:text-xs tracking-[0.2em] mb-2 drop-shadow-lg">
                  {slide.tagline}
                </p>
                <h1 className="text-white font-black text-xl sm:text-4xl md:text-5xl leading-tight mb-1.5 sm:mb-2 drop-shadow-2xl">
                  {slide.title}
                </h1>
                <p className="text-white/85 text-[11px] sm:text-sm md:text-base font-bold mb-3 sm:mb-4 drop-shadow-md max-w-lg leading-snug">
                  {slide.meta}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Persistent mini stats */}
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs">
                <span className="text-white/60">Kod:</span>{' '}
                <strong className="text-amber-300 font-mono">{affiliate.referralCode}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs">
                <span className="text-white/60">Komisen: </span>
                <strong className="text-white">{affiliate.commissionRateSubscription}% + {affiliate.commissionRateCredit}%</strong>
              </div>
            </div>
          </div>

          {/* Right: referral link card (glass) */}
          <div className="lg:col-span-2 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-3 sm:p-4 bg-white/[0.12] backdrop-blur-2xl border border-white/25 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-wider">Link Rujukan</span>
              </div>

              <div className="bg-white rounded-lg p-2.5 mb-2.5 shadow-inner">
                <p className="text-[11px] sm:text-xs font-mono text-slate-700 break-all leading-snug line-clamp-2">
                  {referralLink}
                </p>
              </div>

              <Button
                onClick={copyLink}
                className={`w-full font-black py-4 rounded-lg shadow-lg transition-all text-xs sm:text-sm ${
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

              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {shareOptions.map(opt => (
                  <a
                    key={opt.name}
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-1 py-2 rounded-lg text-white text-[10px] sm:text-xs font-black shadow-lg transition-all ${opt.color}`}
                  >
                    <opt.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{opt.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dots indicator bottom-center */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}