import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { trackPixelEvent } from '@/lib/pixel';
import { genEventID } from '@/lib/fbTracking';

// A/B test variants — randomized per session, tracked via Pixel events.
// Buat data-driven decision pasal mana convert lebih baik.
const VARIANTS = {
  A: {
    id: 'A',
    badge: 'Tunggu! Jangan pergi dulu',
    headline: 'Cuba 50 kredit AI PERCUMA',
    headlineHighlight: '50 kredit AI PERCUMA',
    body: 'Langgan pelan <strong>Keluarga</strong> sekarang & dapat Cikgu AI percuma. Bayar sekali, guna setahun penuh!',
    cta: '🎁 Tuntut Bonus Sekarang',
    bg: 'from-purple-600 via-pink-600 to-orange-500',
  },
  B: {
    id: 'B',
    badge: 'Last chance — offer terhad',
    headline: 'Anak anda layak dapat yang TERBAIK',
    headlineHighlight: 'yang TERBAIK',
    body: '5,000+ ibu bapa dah pilih CeriaKid. Setup 2 minit — anak anda terus boleh mula belajar hari ini!',
    cta: '🚀 Mula Sekarang',
    bg: 'from-blue-600 via-purple-600 to-pink-500',
  },
};

// Exit-intent popup — detect mouse leave window OR mobile back gesture.
// Hanya tunjuk SEKALI per session. A/B test 2 variants secara random.
export default function ExitIntentPopup({ onCTA }) {
  const [show, setShow] = useState(false);

  // Sticky variant selection — sama sepanjang session
  const variant = useMemo(() => {
    const saved = sessionStorage.getItem('exit_intent_variant');
    if (saved && VARIANTS[saved]) return VARIANTS[saved];
    const pick = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem('exit_intent_variant', pick);
    return VARIANTS[pick];
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('exit_intent_shown')) return;

    // Disable on touch devices (tablet/phone) — iOS/Android simulate fake mouseleave
    // events during momentum scrolling which causes the popup (and its scrollToPricing
    // CTA) to auto-trigger and jump the page back to top.
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    );
    if (isTouchDevice) return;

    let timer;
    const handleMouseLeave = (e) => {
      // Hanya trigger kalau mouse keluar dari TOP window (cursor menuju ke close/URL bar)
      if (e.clientY <= 0 && !sessionStorage.getItem('exit_intent_shown')) {
        sessionStorage.setItem('exit_intent_shown', '1');
        setShow(true);
        trackPixelEvent('ViewContent', {
          content_name: 'exit_intent_popup',
          content_category: `variant_${variant.id}`,
        }, genEventID('ViewContent'));
      }
    };

    // Tunggu 15 saat sebelum aktifkan supaya tak terlalu agresif
    timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 15000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [variant.id]);

  const handleClaim = () => {
    // Track CTA conversion per variant — bandingkan dalam FB Pixel Analytics
    trackPixelEvent('Lead', {
      content_name: 'exit_intent_cta_clicked',
      content_category: `variant_${variant.id}`,
    }, genEventID('Lead'));
    setShow(false);
    onCTA?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShow(false)}
            aria-hidden="true"
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[92%] max-w-md"
          >
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${variant.bg}`}>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="px-6 py-8 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex w-16 h-16 rounded-2xl bg-yellow-300 items-center justify-center mb-4 shadow-lg"
                >
                  <Gift className="w-9 h-9 text-purple-900" />
                </motion.div>
                <p className="text-yellow-300 text-xs font-black uppercase tracking-widest mb-2">{variant.badge}</p>
                <h2 className="text-white font-black text-2xl leading-tight mb-3">
                  {variant.headline.split(variant.headlineHighlight)[0]}
                  <span className="bg-yellow-300 text-purple-900 px-2 rounded-lg">{variant.headlineHighlight}</span>
                  {variant.headline.split(variant.headlineHighlight)[1]}
                </h2>
                <p className="text-white/90 text-sm mb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: variant.body }} />
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full py-3.5 rounded-2xl bg-yellow-300 hover:bg-yellow-200 text-purple-900 font-black text-base shadow-xl shadow-yellow-500/40 transition-all"
                >
                  {variant.cta}
                </button>
                <p className="text-white/70 text-xs mt-3">✓ Setup 2 minit  •  ✓ Tanpa iklan  •  ✓ Boleh offline</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}