import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { captureReferralFromUrl } from '@/lib/referralTracker';
import { trackPixelEvent } from '@/lib/pixel';
import { genEventID } from '@/lib/fbTracking';
import PricingCheckout from '@/components/PricingCheckout';
import TrustedMarquee from '@/components/landing/TrustedMarquee';
import AppPreviewShowcase from '@/components/landing/AppPreviewShowcase';
import LandingHeroCarousel from '@/components/landing/LandingHeroCarousel';
import SectionWrapper from '@/components/landing/SectionWrapper';
import LandingFeatureHighlight from '@/components/landing/LandingFeatureHighlight';
import ExitIntentPopup from '@/components/landing/ExitIntentPopup';
import LiveSocialProof from '@/components/landing/LiveSocialProof';
import { useGameStats, formatGameCount } from '@/hooks/useGameStats';


// Testimoni ibu bapa pengguna CeriaKid
const testimonials = [
{ name: 'Puan Siti Aishah', location: 'Shah Alam, Selangor', quote: 'Saya suka susunan subjek ikut KSPK/KSSR. Anak saya umur 6 tahun boleh main latihan pendek tanpa rasa terbeban.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'susunan jelas' },
{ name: 'Encik Faizal Rahman', location: 'Johor Bahru, Johor', quote: 'Dashboard ibu bapa sangat membantu. Saya boleh lihat subjek mana anak perlu lebih latihan dan fokus situ.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: 'pantau progress' },
{ name: 'Puan Nurul Huda', location: 'Cheras, Kuala Lumpur', quote: 'Interface ceria dan mesra kanak-kanak. Setup pun cepat — anak terus boleh mula belajar. Berbaloi sangat!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'mesra anak' },
{ name: 'Encik Ahmad Zulkifli', location: 'Bangi, Selangor', quote: 'Anak saya darjah 2, dulu susah nak duduk belajar. Sekarang dia minta sendiri nak main CeriaKid setiap petang. Bagus!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'anak suka belajar' },
{ name: 'Puan Lim Mei Ling', location: 'Petaling Jaya, Selangor', quote: 'Saya pilih plan Keluarga sebab ada 3 orang anak. Boleh setup profil berasingan dan track progress setiap seorang. Sangat sesuai!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: '3 anak satu plan' },
{ name: 'Puan Roslina Hassan', location: 'Kota Bharu, Kelantan', quote: 'Subjek Jawi dan Bahasa Melayu memang lengkap. Anak saya 5 tahun dah mula kenal huruf Jawi dengan cara yang menyeronokkan.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'Jawi lengkap' }];


// Tiers dijana dinamik dari real-time game stats (lihat buildTiers)
const buildTiers = (stats) => {
  const fmt = formatGameCount;
  const asasGames = stats?.accessibleByTier?.asas;
  const standardGames = stats?.accessibleByTier?.standard;
  const keluargaGames = stats?.accessibleByTier?.keluarga;

  // Susunan: Asas → Standard → Keluarga (murah ke mahal, Keluarga ditandakan POPULAR)
  return [
    {
      name: 'asas',
      nameMY: '🌱 Asas',
      priceMYR: '49',
      perMonth: '4.08',
      period: '/tahun',
      features: [
        asasGames ? `${fmt(asasGames)} game (10 per darjah/subjek)` : '10 game per darjah/subjek',
        '📚 Modul 3M — Membaca, Menulis, Mengira (10 per kategori)',
        '📒 Library Hub — Nota & Mind Map silibus (akses asas)',
        '🎁 5 KREDIT AI PERCUMA (cuba Cikgu Firdaus!)',
        'Semua subjek (Prasekolah & Darjah 1–6)',
        'Akses sampling setiap darjah 🎯',
        'Game selepas had dikunci 🔒',
        'Tanpa iklan',
        'Kemas kini mingguan',
        '1 peranti sahaja 📱',
      ],
      noFeatures: ['Sehingga 4 profil anak (1 anak sahaja)'],
      cta: 'Mulakan Sekarang',
      highlighted: false,
    },
    {
      name: 'standard',
      nameMY: '⭐ Standard',
      priceMYR: '99',
      perMonth: '8.25',
      period: '/tahun',
      features: [
        standardGames ? `${fmt(standardGames)} game (20 per darjah/subjek)` : '20 game per darjah/subjek',
        '📚 Modul 3M — Membaca, Menulis, Mengira (20 per kategori)',
        '📒 Library Hub — Nota & Mind Map silibus (akses lebih luas)',
        '🎁 20 KREDIT AI PERCUMA (cuba Cikgu Firdaus!)',
        'Semua subjek (Prasekolah & Darjah 1–6)',
        'Lebih luas akses setiap darjah 🎯',
        'Game selepas had dikunci 🔒',
        'Tanpa iklan',
        'Boleh guna offline 📲',
        'Kemas kini mingguan',
        'Sehingga 2 peranti 📱📱',
      ],
      noFeatures: ['Sehingga 4 profil anak (1 anak sahaja)'],
      cta: 'Pilih Standard',
      highlighted: false,
      badge: '🔥 Nilai Terbaik',
    },
    {
      name: 'keluarga',
      nameMY: '👑 Keluarga',
      priceMYR: '199',
      perMonth: '16.58',
      period: '/tahun',
      savings: 'PALING POPULAR',
      features: [
        keluargaGames ? `Akses penuh ${fmt(keluargaGames)} game 🔓` : 'Akses penuh semua game 🔓',
        '📚 Modul 3M PENUH — Membaca, Menulis, Mengira 🔓',
        '📒 Library Hub PENUH — Semua Nota & Mind Map silibus 🔓',
        '🎁 50 KREDIT AI PERCUMA (Cikgu Firdaus + Penjana Cerita)',
        'Semua subjek (Prasekolah & Darjah 1–6)',
        'Tiada had setiap darjah 🎯',
        'Tiada game dikunci 🔓',
        'Sehingga 4 profil anak',
        'Boleh guna offline 📲',
        'Sokongan prioriti',
        'Sehingga 4 peranti 📱📱📱📱',
      ],
      noFeatures: [],
      cta: '🔥 Pilih Keluarga',
      highlighted: true,
    },
  ];
};


const avatars = [
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png',
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png',
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png'];


export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('keluarga');
  const [navVisible, setNavVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const lastScrollY = useRef(0);
  const { stats } = useGameStats();
  const tiers = buildTiers(stats);

  // Detect payment FAILURE return from Chip.
  // NOTE: Successful payments redirect to /thank-you (see chipCheckout). Purchase pixel
  // is fired there once subscription is confirmed active — NOT here.
  useEffect(() => {
    // Capture referral code dari URL (?ref=CODE) untuk simpan dalam localStorage
    captureReferralFromUrl();

    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'failed') {
      setPaymentStatus('failed');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ViewContent event — fire bila pricing section visible (depth scroll signal)
  useEffect(() => {
    let fired = false;
    const observer = new IntersectionObserver((entries) => {
      if (fired) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fired = true;
          trackPixelEvent('ViewContent', {
            content_name: 'pricing_section',
            content_category: 'subscription_plans',
            currency: 'MYR',
          }, genEventID('ViewContent'));
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    const target = document.getElementById('pricing');
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Funnel tracking — checkout form jadi visible (orang sampai ke borang isi maklumat)
  useEffect(() => {
    let fired = false;
    const observer = new IntersectionObserver((entries) => {
      if (fired) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fired = true;
          base44.analytics.track({ eventName: 'checkout_form_viewed', properties: { tier: selectedTierForCheckout } });
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    const target = document.getElementById('checkout-form');
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);



  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    // Funnel tracking — user klik butang pilih pelan (signal niat beli)
    base44.analytics.track({ eventName: 'pricing_tier_clicked', properties: { tier: tierName } });
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden bg-slate-950">
      {/* Exit-intent popup — auto-trigger bila user nak tinggalkan page */}
      <ExitIntentPopup onCTA={scrollToPricing} />
      {/* Live social proof toast — rotate at bottom-left, desktop only */}
      <LiveSocialProof />

      <div className="relative">

      {/* ── PAYMENT STATUS BANNER ── */}
      <AnimatePresence>
        {paymentStatus && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className={`fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between shadow-lg ${
              paymentStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {paymentStatus === 'success' ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <div>
                {paymentStatus === 'success' ? (
                  <>
                    <p className="font-black text-lg">🎉 Pembayaran Berjaya!</p>
                    <p className="text-sm text-white/90">Langganan anda telah diaktifkan. Selamat belajar!</p>
                  </>
                ) : (
                  <>
                    <p className="font-black text-lg">❌ Pembayaran Gagal</p>
                    <p className="text-sm text-white/90">Sila cuba lagi atau hubungi kami untuk bantuan.</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {paymentStatus === 'success' && (
                <button
                  onClick={() => { window.location.href = '/dashboard'; }}
                  className="px-4 py-2 bg-white text-green-600 rounded-full font-black text-sm shadow"
                >
                  Ke Dashboard →
                </button>
              )}
              <button onClick={() => setPaymentStatus(null)} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ── NAVBAR — Floating pill, fixed with auto hide/show on scroll ── */}
      {/* Desktop + Tablet (sm and up) */}
      <header
        className={`hidden sm:flex fixed top-5 left-0 right-0 z-50 justify-center px-4 pointer-events-none transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}
      >
        <nav
          className="pointer-events-auto flex items-center gap-0 px-1.5 py-1.5 rounded-full shadow-xl shadow-black/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png"
            alt="CeriaKid"
            className="h-8 w-8 rounded-full object-cover ml-1 mr-2 ring-1 ring-white/60 shadow-sm"
          />
          {[
            { href: '#features', label: 'Ciri-ciri' },
            { href: '#testimonials', label: 'Testimoni' },
            { href: '#pricing', label: 'Order Now' },
            { href: '#faq', label: 'FAQ' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="relative px-3 py-1.5 rounded-full font-black text-sm text-slate-800 hover:text-slate-900 hover:bg-white/50 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
            className="ml-1 px-3 py-1.5 rounded-full font-black text-sm bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/30 hover:bg-amber-200 transition-colors"
          >
            {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
          </motion.button>
        </nav>
      </header>

      {/* Mobile only (below sm) */}
      <nav className={`sm:hidden fixed top-2 left-0 right-0 z-50 px-3 py-3 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}>
        <div
          className="max-w-md mx-auto w-full px-3 py-2 rounded-full shadow-xl shadow-black/15 flex items-center justify-between gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png"
              alt="CeriaKid"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/60 flex-shrink-0 shadow-sm"
            />
            <span className="font-black text-slate-900 text-base truncate">CeriaKid</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
            className="px-4 py-2 rounded-full font-black text-sm bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/30 hover:bg-amber-200 whitespace-nowrap flex-shrink-0 transition-colors"
          >
            {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
          </motion.button>
        </div>
      </nav>

      {/* ── HERO — Edge-to-edge full screen carousel ── */}
      <section className="relative w-full overflow-hidden">
        {/* Full screen carousel — no padding, no rounded corners */}
        <div className="relative w-full h-screen">
          <LandingHeroCarousel
            onCTAClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
            onPricingClick={scrollToPricing}
            fullScreen
          />
        </div>

        {/* Secondary content below the full hero — with normal padding */}
        <div className="relative bg-gradient-to-b from-sky-50 via-rose-50 to-amber-50 pt-10 sm:pt-14 pb-10 sm:pb-14">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-orange-300/40 blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-1/3 w-72 h-72 rounded-full bg-sky-300/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Feature pills row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {[
              { icon: '✅', text: 'Tanpa iklan' },
              { icon: '📊', text: 'Dashboard ibu bapa' },
              { icon: '📲', text: 'Boleh offline' },
              { icon: '🔒', text: 'Selamat untuk anak' },
              { icon: '🎓', text: 'KSPK + KSSR' },
            ].map((pill) => (
              <div key={pill.text} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 border border-white shadow-sm backdrop-blur-md text-slate-800 text-xs sm:text-sm font-bold">
                <span>{pill.icon}</span> {pill.text}
              </div>
            ))}
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-4 justify-center"
          >
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="" loading="lazy" decoding="async" className="w-8 h-8 rounded-full border-2 border-white shadow object-cover" />
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <span key={i} className="text-amber-500 text-sm">★</span>)}
              </div>
              <p className="text-slate-700 text-xs font-bold">Dipercayai <span className="text-slate-900">5,000+</span> keluarga • <span className="text-slate-900">4.9/5</span> ★</p>
            </div>
          </motion.div>

          {/* Stats grid — digabungkan dalam hero */}
          <div className="mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { num: stats?.totalGames ? formatGameCount(stats.totalGames) : '2,500+', label: 'Game Interaktif', icon: '🎮' },
              { num: '5,000+', label: 'Keluarga Malaysia', icon: '👨‍👩‍👧' },
              { num: 'KSPK+KSSR', label: 'Standard KPM', icon: '🇲🇾' },
              { num: '4.9★', label: 'Rating Ibu Bapa', icon: '⭐' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-md border border-white shadow-md text-center"
              >
                <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-amber-500 bg-clip-text text-transparent leading-none">{stat.num}</div>
                <div className="text-slate-700 text-xs md:text-sm font-bold mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trusted marquee — digabungkan dalam hero */}
          <div className="mt-10 md:mt-12">
            <TrustedMarquee />
          </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <SectionWrapper
        badge="MASALAH BIASA IBU BAPA"
        badgeIcon="😮‍💨"
        title="Pening kepala bila"
        titleAccent="anak tak nak belajar?"
        subtitle="Kalau salah satu ni rasa familiar — anda bukan keseorangan..."
        variant="alarm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {[
            { emoji: '😤', pain: '"Anak main game je, tak nak belajar"', desc: 'Screen time jadi perang setiap malam. Stress anak, stress ibu bapa.' },
            { emoji: '💸', pain: '"Dah bayar tuisyen RM300, result sama je"', desc: 'Wang habis tapi anak masih tak faham apa yang diajar.' },
            { emoji: '😰', pain: '"Exam dah dekat, anak masih tak hafal"', desc: 'Pressure menjelang peperiksaan. Semua orang dalam rumah tegang.' },
            { emoji: '😪', pain: '"Kerja sampai malam, tak sempat nak ajar"', desc: 'Ibu bapa penat, anak perlukan bantuan. Tiada masa yang cukup.' },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-2xl p-5 sm:p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span className="text-3xl flex-shrink-0">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white mb-1.5 leading-snug">{p.pain}</p>
                <p className="text-white/65 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-base sm:text-lg text-white/70 font-semibold">Mestilah ada cara lain yang lebih senang...</p>
          <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent mt-2">ADA. Jom tengok 👇</p>
        </motion.div>
      </SectionWrapper>

      {/* ── SOLUTION + APP PREVIEW SHOWCASE (combined) ── */}
      <div id="features">
        <AppPreviewShowcase />
      </div>

      {/* ── 3M + LIBRARY HUB HIGHLIGHT ── */}
      <LandingFeatureHighlight />

      {/* ── INVESTOR WOW ── */}
      <SectionWrapper
        badge="SEMUA DALAM SATU APP"
        badgeIcon="🚀"
        title="Lebih mudah untuk anak,"
        titleAccent="lebih senang untuk ibu bapa"
        subtitle="CeriaKid gabungkan game interaktif, dashboard ibu bapa, kandungan KSPK/KSSR dan progress tracking dalam satu pengalaman yang mudah digunakan."
        variant="sky"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🎮', title: 'Game Engine', desc: 'Soalan interaktif pelbagai format untuk subjek utama.' },
            { icon: '📊', title: 'Parent Analytics', desc: 'Pantau skor, progress, streak dan prestasi anak.' },
            { icon: '🔒', title: 'Pembelajaran Selamat', desc: 'Pengalaman tanpa iklan dan lebih terkawal untuk kanak-kanak.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl p-6 bg-white shadow-xl shadow-blue-100 border border-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-black text-lg mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── HOW IT WORKS + TESTIMONIALS (combined) ── */}
      <SectionWrapper
        id="testimonials"
        badge="MUDAH UNTUK MULA"
        badgeIcon="🚀"
        title="Mulakan dalam"
        titleAccent="3 langkah sahaja"
        subtitle="Setup dalam 2 minit. Anak terus boleh mula belajar."
        variant="cream"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent pointer-events-none" />
          {[
            { step: '1', icon: '📲', title: 'Daftar & Langganan', desc: 'Buka app, pilih pelan, dan mula belajar dalam masa 2 minit.' },
            { step: '2', icon: '🎯', title: 'Pilih Peringkat Anak', desc: 'Prasekolah atau Sekolah Rendah. App auto-suggest permainan yang sesuai.' },
            { step: '3', icon: '🏆', title: 'Anak Terus Main & Belajar', desc: 'Pantau progress dari dashboard. Lihat markah naik minggu demi minggu.' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center rounded-3xl p-6 bg-white shadow-xl shadow-orange-100 border border-orange-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-xl text-white" style={{ background: 'linear-gradient(135deg, #F97316, #EC4899)', boxShadow: '0 8px 24px rgba(234,88,12,0.4)' }}>{s.step}</div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-black text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials sub-section */}
        <div className="mt-16 md:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-400/30 backdrop-blur-md mb-4">
              <span>💬</span>
              <span className="text-orange-700 text-xs sm:text-sm font-bold">⭐ ULASAN IBU BAPA</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight mb-3 text-slate-900">
              Apa kata{' '}
              <span className="bg-gradient-to-r from-orange-600 via-pink-500 to-red-500 bg-clip-text text-transparent">ibu bapa kami</span>
            </h3>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Maklum balas sebenar daripada ibu bapa yang menggunakan CeriaKid untuk anak-anak mereka 👇
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl p-6 bg-white shadow-xl shadow-orange-100 border border-orange-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_, j) => <span key={j} className="text-amber-500">★</span>)}</div>
                  <p className="text-slate-700 mb-4 leading-relaxed text-sm">"{t.quote}"</p>
                  <div className="inline-block bg-green-100 text-green-700 border border-green-200 text-xs font-black px-3 py-1 rounded-full mb-4">✅ {t.highlight}</div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-orange-100">
                  <img src={t.avatar} alt={t.name} loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover border-2 border-orange-100" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ── PRICING + CHECKOUT (combined) ── */}
      <SectionWrapper
        id="pricing"
        badge="LANGKAH TERAKHIR"
        badgeIcon="🔒"
        title="Pilih pelan &"
        titleAccent="aktifkan akaun"
        subtitle="Pilih pelan yang sesuai untuk umur anak, kemudian isi maklumat untuk teruskan pembayaran FPX yang selamat."
        variant="sky"
      >
        {/* Pricing tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {tiers.map((tier, i) =>
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-3xl p-6 relative border-2 transition-all ${
            tier.highlighted ?
            'border-amber-400 shadow-2xl shadow-amber-200/50 md:scale-105 bg-gradient-to-br from-amber-50 to-orange-50' :
            'border-blue-100 shadow-md hover:border-blue-300 bg-white'}`}
            >
              {(tier.savings || tier.badge) &&
              <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 ${tier.highlighted ? 'bg-amber-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                 {tier.savings ? `💰 ${tier.savings}` : tier.badge}
               </div>
              }

              <h3 className="text-2xl font-black mb-2 text-slate-900">{tier.nameMY}</h3>

              <div className="flex items-baseline gap-1 mb-0.5">
               <span className="text-3xl font-black text-slate-900">RM{tier.priceMYR}</span>
               <span className="text-sm font-bold text-slate-600">{tier.period}</span>
              </div>
              <p className="text-xs font-bold mb-6 text-slate-500">
               ≈ RM{tier.perMonth}/bulan
              </p>

              <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTierSelect(tier.name)}
              style={{ animationDelay: `${i * 0.4}s` }}
              className={`w-full py-3.5 rounded-2xl font-black text-base mb-6 shadow-md transition-all animate-glow-pulse ${
              tier.highlighted ? 'bg-slate-900 text-amber-200 hover:bg-slate-800' : 'bg-orange-500 text-white hover:bg-orange-600'} ${
              selectedTierForCheckout === tier.name ? 'ring-4 ring-amber-400' : ''}`}>
                {tier.cta}
              </motion.button>

              <div className="space-y-2.5">
                {tier.features.map((f, j) =>
              <div key={j} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Check className="w-4 h-4 flex-shrink-0 text-green-600" /> {f}
                  </div>
              )}
                {tier.noFeatures.map((f, j) =>
              <div key={j} className="flex items-center gap-2 text-sm font-semibold opacity-40 text-slate-700">
                    <span className="w-4 flex-shrink-0">✕</span> {f}
                  </div>
              )}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          id="checkout-form"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-5 md:p-7 max-w-lg mx-auto bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20"
        >
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Daftar & Bayar 🔒</h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1 leading-snug">Pilih pakej, isi maklumat dan teruskan ke pembayaran FPX yang selamat.</p>
          </div>
          <PricingCheckout selectedTier={selectedTierForCheckout} onTierChange={setSelectedTierForCheckout} />
        </motion.div>

        {/* Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 rounded-2xl p-4 text-center max-w-xl mx-auto bg-white shadow-lg shadow-blue-100 border border-blue-100"
        >
          <div className="text-2xl mb-1">🛡️</div>
          <h3 className="text-base font-black text-slate-900 mb-1">Direka untuk kanak-kanak Malaysia</h3>
          <p className="text-slate-600 text-xs md:text-sm leading-snug">Tanpa iklan, kandungan mesra keluarga, progress boleh dipantau ibu bapa, dan pembelajaran disusun mengikut tahap umur. 💪</p>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-3xl mx-auto text-center">
          {['🔒 Pembayaran FPX selamat', '💳 Pelan tahunan jelas', '📊 Pantau progress anak'].map((item) => (
            <div key={item} className="rounded-xl bg-white border border-blue-100 shadow-sm px-3 py-2 text-slate-700 text-xs md:text-sm font-bold">
              {item}
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── FAQ + FINAL CTA (combined) ── */}
      <SectionWrapper
        id="faq"
        badge="SOALAN LAZIM"
        badgeIcon="🤔"
        title="Sebelum anda"
        titleAccent="mula menggunakan"
        subtitle="Jawapan ringkas untuk soalan yang biasa ditanya ibu bapa."
        variant="sky"
      >
        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            { q: 'Adakah selamat untuk anak?', a: 'Ya, 100%! Tiada iklan, tiada pop-up, tiada chat dengan orang asing. App direka khas untuk keselamatan kanak-kanak.' },
            { q: 'Apakah peranti yang disokong?', a: 'Semua jenis smartphone, tablet, dan komputer. iOS, Android, dan browser. Boleh download untuk guna offline.' },
            { q: 'Bagaimana langganan berfungsi?', a: 'CeriaKid menggunakan pelan tahunan. Anda boleh semak status langganan dan maklumat akaun di bahagian tetapan selepas mendaftar.' },
            { q: 'Adakah ikut standard pembelajaran Malaysia?', a: 'Ya — Prasekolah disusun ikut KSPK (Kurikulum Standard Prasekolah Kebangsaan), manakala Sekolah Rendah ikut KSSR (Kurikulum Standard Sekolah Rendah) Darjah 1–6.' },
            { q: 'Berapa anak boleh guna?', a: 'Pelan Asas & Standard menyokong 1 profil anak (boleh akses Prasekolah & Sekolah Rendah). Pelan Keluarga membenarkan sehingga 4 profil anak berasingan — sesuai untuk keluarga ramai anak.' },
            { q: 'Macam mana nak mula?', a: 'Pilih pelan, isikan maklumat, bayar melalui FPX, dan anak terus boleh mula belajar dalam masa 2 minit!' },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 bg-white shadow-md shadow-sky-100 border border-sky-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="font-black text-slate-900 mb-1.5 flex items-start gap-2">
                <span className="text-sky-600 flex-shrink-0">❓</span>
                <span>{faq.q}</span>
              </p>
              <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.a}</p>
            </motion.div>
          ))}
        </div>


      </SectionWrapper>

      {/* ── FOOTER ── */}
      <footer className="text-white py-8 md:py-10 relative border-t border-white/10" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png"
                  alt="CeriaKid"
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30"
                />
                <p className="font-black text-lg">CeriaKid</p>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">Platform pembelajaran interaktif untuk kanak-kanak Malaysia, berasaskan silibus KSPK & KSSR.</p>
            </div>
            {/* Links */}
            <div>
              <p className="font-black text-sm mb-3 text-white">Pautan</p>
              <div className="flex flex-col gap-2 text-sm text-white/70">
                <Link to="/terms" className="hover:text-white hover:underline transition-colors">Terma Penggunaan</Link>
                <Link to="/privacy" className="hover:text-white hover:underline transition-colors">Dasar Privasi</Link>
                <Link to="/contact" className="hover:text-white hover:underline transition-colors">Hubungi Kami</Link>
              </div>
            </div>
            {/* Support */}
            <div>
              <p className="font-black text-sm mb-3 text-white">Sokongan</p>
              <a href="https://wa.me/60177844120" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-black text-sm transition-colors border border-green-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Kami
              </a>
              <p className="text-white/60 text-xs mt-2">Isnin – Jumaat, 9am – 6pm</p>
            </div>
          </div>
          <div className="border-t border-white/15 pt-5 text-center">
            <p className="text-white/60 text-xs">© 2026 CeriaKid. Hak cipta terpelihara. Dibina dengan ❤️ untuk ibu bapa Malaysia.</p>
          </div>
        </div>
      </footer>

      </div>
    </div>);

}