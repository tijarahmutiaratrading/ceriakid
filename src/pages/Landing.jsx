import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import InteractiveGameDemo from '@/components/landing/InteractiveGameDemo';
import PricingCheckout from '@/components/PricingCheckout';
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp';
import TrustedMarquee from '@/components/landing/TrustedMarquee';

// Mascot assets
const MASCOT_BOY = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fbf4ca9f6_generated_image.png';
const MASCOT_GIRL = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0837608b2_generated_image.png';
const MASCOT_ELEPHANT = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0f1e041a2_generated_image.png';
const LOGO = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

const testimonials = [
  { name: 'Beta Tester', location: 'Selangor', quote: 'Saya suka susunan subjek ikut KSPK/KSSR. Anak boleh main latihan pendek tanpa rasa terbeban.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'susunan jelas' },
  { name: 'Beta Tester', location: 'Johor', quote: 'Dashboard ibu bapa sangat membantu untuk lihat subjek mana yang anak perlu lebih latihan.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: 'pantau progress' },
  { name: 'Beta Tester', location: 'Kuala Lumpur', quote: 'Interface ceria dan mesra kanak-kanak. Setup pun cepat — boleh terus mula belajar.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'mesra anak' },
];

const tiers = [
  { name: 'asas', nameMY: '🌱 Asas', priceMYR: '49', perMonth: '4.08', period: '/tahun', features: ['50 game boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', '1 peranti sahaja 📱'], noFeatures: ['Sehingga 4 anak'], cta: 'Mulakan Sekarang', highlighted: false, gradient: 'from-cyan-400 to-blue-500' },
  { name: 'keluarga', nameMY: '👑 Keluarga', priceMYR: '199', perMonth: '16.58', period: '/tahun', savings: 'PALING POPULAR', features: ['200 game semua peringkat boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah', 'Tiada game dikunci 🔓', 'Sehingga 4 profil anak', 'Dashboard ibu bapa lengkap', 'Boleh guna offline 📲', 'Sokongan prioriti', 'Sehingga 4 peranti 📱📱📱📱'], noFeatures: [], cta: '🔥 Pilih Keluarga', highlighted: true, gradient: 'from-fuchsia-500 via-pink-500 to-orange-400' },
  { name: 'standard', nameMY: '⭐ Standard', priceMYR: '99', perMonth: '8.25', period: '/tahun', features: ['100 game boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Dashboard ibu bapa', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', 'Sehingga 2 peranti 📱📱'], noFeatures: ['Sehingga 4 anak'], cta: 'Pilih Standard', highlighted: false, gradient: 'from-violet-500 to-purple-600' },
];

const features = [
  { icon: '🎮', title: 'Game 5-10 Min', desc: 'Latihan pendek, anak tak cepat bosan', color: 'from-yellow-400 to-orange-500' },
  { icon: '📊', title: 'Dashboard Ibu Bapa', desc: 'Pantau markah & progress anak', color: 'from-pink-400 to-rose-500' },
  { icon: '📚', title: 'KSPK + KSSR', desc: 'Ikut silibus rasmi Malaysia', color: 'from-purple-400 to-fuchsia-500' },
  { icon: '🌐', title: '7 Bahasa', desc: 'BM, EN, Math, Sains, Jawi, Tamil, Mandarin', color: 'from-cyan-400 to-blue-500' },
  { icon: '📲', title: 'Offline Mode', desc: 'Main tanpa internet', color: 'from-green-400 to-emerald-500' },
  { icon: '🔒', title: 'Tiada Iklan', desc: 'Selamat untuk kanak-kanak', color: 'from-violet-400 to-purple-500' },
];

const faqList = [
  { q: 'Bagaimana CeriaKid membantu anak belajar?', a: 'Game pembelajaran pendek yang sesuai dengan tahap anak. Belajar BM, English, Math, Sains, Jawi, Tamil & Mandarin sambil bermain.' },
  { q: 'Adakah ikut silibus sekolah Malaysia?', a: 'Ya — Prasekolah ikut KSPK, Sekolah Rendah ikut KSSR Darjah 1–6.' },
  { q: 'Pembayaran selamat ke?', a: 'Ya, pembayaran melalui FPX yang selamat dan diiktiraf bank Malaysia.' },
  { q: 'Berapa anak boleh guna?', a: 'Pelan Asas/Standard untuk 1 anak. Pelan Keluarga boleh sehingga 4 profil anak.' },
  { q: 'Boleh guna offline?', a: 'Ya! Selepas download, boleh main tanpa internet di mana-mana sahaja.' },
  { q: 'Macam mana nak mula?', a: 'Pilih pelan, isi maklumat, bayar FPX — anak boleh terus main dalam 2 minit.' },
];

export default function Landing() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('keluarga');
  const [navVisible, setNavVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
      window.history.replaceState({}, '', '/');
      setTimeout(() => refreshAuth?.(), 1500);
    } else if (payment === 'failed') {
      setPaymentStatus('failed');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setNavVisible(true);
      else if (currentY > lastScrollY.current) setNavVisible(false);
      else setNavVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    setTimeout(() => document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-b from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-x-hidden">

      {/* Floating cartoon decorations — clouds, stars, rainbows, planets */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Stars */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-300 opacity-40"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 19) % 100}%`,
              fontSize: `${18 + (i % 3) * 8}px`,
            }}
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 6 + (i % 4), repeat: Infinity, ease: 'linear' }}
          >✨</motion.div>
        ))}
        {/* Floating clouds */}
        {['☁️', '☁️', '☁️'].map((c, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute opacity-30"
            style={{
              left: `${10 + i * 35}%`,
              top: `${15 + i * 25}%`,
              fontSize: '60px',
            }}
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          >{c}</motion.div>
        ))}
        {/* Floating cartoon emojis */}
        {[
          { emoji: '🌈', top: '20%', left: '85%', dur: 5 },
          { emoji: '🪐', top: '60%', left: '5%', dur: 7 },
          { emoji: '🎈', top: '40%', left: '92%', dur: 4 },
          { emoji: '🦄', top: '75%', left: '88%', dur: 6 },
          { emoji: '🌟', top: '85%', left: '15%', dur: 5 },
        ].map((d, i) => (
          <motion.div
            key={`deco-${i}`}
            className="absolute opacity-50 text-4xl sm:text-5xl"
            style={{ top: d.top, left: d.left }}
            animate={{ y: [0, -15, 0], rotate: [-8, 8, -8] }}
            transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          >{d.emoji}</motion.div>
        ))}
      </div>

      {/* ── PAYMENT STATUS BANNER ── */}
      <AnimatePresence>
        {paymentStatus && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className={`fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between shadow-lg ${paymentStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            <div className="flex items-center gap-3">
              {paymentStatus === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
              <div>
                {paymentStatus === 'success' ? (
                  <><p className="font-black text-lg">🎉 Pembayaran Berjaya!</p><p className="text-sm text-white/90">Langganan anda telah diaktifkan.</p></>
                ) : (
                  <><p className="font-black text-lg">❌ Pembayaran Gagal</p><p className="text-sm text-white/90">Sila cuba lagi.</p></>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {paymentStatus === 'success' && <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white text-green-600 rounded-full font-black text-sm">Dashboard →</button>}
              <button onClick={() => setPaymentStatus(null)} className="text-white text-xl">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3 rounded-full shadow-2xl bg-white">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="CeriaKid" className="h-9 sm:h-10 rounded-2xl" />
            <span className="font-black text-purple-700 text-lg hidden sm:inline">CeriaKid</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {[{ id: 'features', label: 'Ciri-ciri' }, { id: 'testimonials', label: 'Testimoni' }, { id: 'pricing', label: 'Harga' }, { id: 'faq', label: 'FAQ' }].map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="px-4 py-2 text-purple-700 font-black text-sm rounded-full hover:bg-purple-100 transition-colors">
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-full font-black text-xs sm:text-sm shadow-lg shadow-pink-500/40 hover:shadow-xl transition-shadow"
            >
              {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
            </motion.button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-purple-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="md:hidden max-w-6xl mx-auto mt-2 bg-white rounded-3xl shadow-2xl p-4 grid grid-cols-2 gap-2">
              {[{ id: 'features', label: 'Ciri-ciri ⚙️' }, { id: 'testimonials', label: 'Testimoni 💬' }, { id: 'pricing', label: 'Harga 💰' }, { id: 'faq', label: 'FAQ ❓' }].map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="px-4 py-3 bg-purple-50 text-purple-700 font-black text-sm rounded-2xl hover:bg-purple-100 transition-colors">
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        {/* Cartoon decorations around hero */}
        <motion.div animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-32 left-4 sm:left-12 text-5xl sm:text-7xl opacity-80 z-0">🌈</motion.div>
        <motion.div animate={{ y: [0, -10, 0], rotate: [10, -10, 10] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          className="absolute top-40 right-8 sm:right-20 text-4xl sm:text-6xl opacity-80 z-0">🎈</motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative">
          {/* Left: text */}
          <div className="relative z-10 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-300 rounded-full shadow-lg mb-5">
              <span className="text-lg">🇲🇾</span>
              <span className="text-purple-900 font-black text-xs sm:text-sm">Untuk Anak Malaysia</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] text-white mb-5"
              style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.15)' }}>
              Belajar<br />
              <span className="text-yellow-300">Sambil</span><br />
              <span className="bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">Bermain!</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-white/95 font-bold mb-3 leading-snug">
              Game pembelajaran ikut KSPK & KSSR — untuk Prasekolah hingga Darjah 6 🎓
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-sm sm:text-base text-white/80 mb-7">
              BM • English • Math • Sains • Jawi • Tamil • Mandarin
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo('pricing')}
                className="px-7 py-4 bg-yellow-300 text-purple-900 rounded-full font-black text-base sm:text-lg shadow-2xl shadow-yellow-500/40 inline-flex items-center justify-center gap-2 hover:shadow-yellow-500/60 transition-shadow">
                Mula Belajar Sekarang <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo('features')}
                className="px-7 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/40 rounded-full font-black text-base sm:text-lg hover:bg-white/30 transition-colors">
                Lihat Ciri-ciri
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mt-6 justify-center lg:justify-start">
              {['✅ KSPK + KSSR', '🚫 Tiada Iklan', '📊 Dashboard Ibu Bapa'].map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white rounded-full text-xs font-bold">{t}</span>
              ))}
            </motion.div>
          </div>

          {/* Right: game demo with floating cartoon mascots */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="relative">
            {/* Cartoon mascot characters around demo */}
            <motion.div animate={{ y: [0, -12, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-10 -left-6 sm:-left-12 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl z-20 border-4 border-white ring-4 ring-yellow-300/30">
              🧒
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0], rotate: [8, -8, 8] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-8 -right-4 sm:-right-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl z-20 border-4 border-white ring-4 ring-cyan-300/30">
              🐘
            </motion.div>
            {/* Extra cartoon friends */}
            <motion.div animate={{ y: [0, -8, 0], rotate: [-10, 10, -10] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 -right-8 sm:-right-12 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-4xl sm:text-5xl shadow-xl z-20 border-4 border-white">
              🦊
            </motion.div>
            <motion.div animate={{ y: [0, -10, 0], rotate: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
              className="absolute top-1/3 -left-8 sm:-left-12 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-4xl sm:text-5xl shadow-xl z-20 border-4 border-white">
              🐼
            </motion.div>

            {/* Game demo card with cartoon border */}
            <div className="relative rounded-[2.5rem] p-3 sm:p-4 shadow-2xl bg-white border-4 border-yellow-300">
              <InteractiveGameDemo />
            </div>

            {/* Floating badges */}
            <motion.div animate={{ rotate: [6, -3, 6] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 right-4 sm:right-8 bg-yellow-300 text-purple-900 px-3 py-1.5 rounded-full text-xs font-black shadow-lg z-10 border-2 border-white">
              ⭐ 4.9/5.0
            </motion.div>
            <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-2 left-4 sm:left-8 bg-pink-400 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg z-10 border-2 border-white">
              🎮 1,500+ Games
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white shadow-2xl p-5 sm:p-7 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '1,500+', label: 'Game Aktif', icon: '🎮', color: 'text-fuchsia-600' },
            { num: '7', label: 'Subjek', icon: '📚', color: 'text-purple-600' },
            { num: 'KSPK+KSSR', label: 'Silibus Rasmi', icon: '🇲🇾', color: 'text-pink-600' },
            { num: '5-10', label: 'Minit/Hari', icon: '⏱️', color: 'text-violet-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.num}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED MARQUEE ── */}
      <div className="relative py-6">
        <TrustedMarquee />
      </div>

      {/* ── PROBLEM SECTION ── */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-purple-600 to-fuchsia-600 overflow-hidden">
        {/* Cartoon mascot peeking */}
        <motion.div animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-8 right-4 sm:right-12 text-6xl sm:text-8xl opacity-90 z-0">🤔</motion.div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">😮‍💨 MASALAH BIASA</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Pening Kepala?
            </h2>
            <p className="text-white/85 font-bold max-w-xl mx-auto">Kalau salah satu ni rasa familiar — anda bukan keseorangan</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              { emoji: '😤', pain: '"Anak main game je, tak nak belajar"', desc: 'Screen time jadi perang setiap malam', color: 'from-red-400 to-pink-500' },
              { emoji: '💸', pain: '"Bayar tuisyen RM300, result sama je"', desc: 'Wang habis, anak masih tak faham', color: 'from-orange-400 to-yellow-500' },
              { emoji: '😰', pain: '"Exam dekat, anak masih tak hafal"', desc: 'Pressure menjelang peperiksaan', color: 'from-fuchsia-400 to-purple-500' },
              { emoji: '😪', pain: '"Kerja sampai malam, tak sempat ajar"', desc: 'Ibu bapa penat, anak perlukan bantuan', color: 'from-cyan-400 to-blue-500' },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl p-5 shadow-2xl flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-purple-900 mb-1 leading-snug">{p.pain}</p>
                  <p className="text-slate-600 text-sm font-semibold">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
            <p className="text-2xl sm:text-3xl font-black text-yellow-300" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>Ada cara yang lebih senang 👇</p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">⚙️ CIRI-CIRI HEBAT</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Semua dalam<br />Satu App 🎯
            </h2>
            <p className="text-white/85 font-bold max-w-xl mx-auto">Yang ibu bapa dan anak perlukan untuk belajar dengan ceria</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative rounded-3xl p-6 bg-white shadow-2xl overflow-hidden">
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${f.color} opacity-20`} />
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} text-3xl shadow-lg mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-purple-900 text-lg mb-1">{f.title}</h3>
                <p className="text-slate-600 text-sm font-semibold">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-purple-600 to-fuchsia-600 overflow-hidden">
        {/* Cartoon mascots */}
        <motion.div animate={{ y: [0, -12, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3.5, repeat: Infinity }}
          className="absolute top-12 left-2 sm:left-8 text-5xl sm:text-7xl opacity-90 z-0">📚</motion.div>
        <motion.div animate={{ y: [0, -10, 0], rotate: [8, -8, 8] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-12 right-2 sm:right-8 text-5xl sm:text-7xl opacity-90 z-0">🎒</motion.div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">📚 7 SUBJEK</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Subjek Yang<br />Anak Boleh Belajar
            </h2>
            <p className="text-white/85 font-bold max-w-xl mx-auto">Disusun ikut KSPK prasekolah & KSSR sekolah rendah</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: '🇲🇾', sub: 'Bahasa Melayu', desc: 'Baca • Eja • Faham', color: 'from-red-400 to-pink-500' },
              { icon: '🇬🇧', sub: 'English', desc: 'Read • Speak • Play', color: 'from-blue-400 to-indigo-500' },
              { icon: '🔢', sub: 'Matematik', desc: 'Kira • Banding', color: 'from-violet-400 to-purple-500' },
              { icon: '🧪', sub: 'Sains', desc: 'Lihat • Tanya • Cuba', color: 'from-green-400 to-emerald-500' },
              { icon: '🕌', sub: 'Jawi', desc: 'Kenal • Sebut • Tulis', color: 'from-teal-400 to-cyan-500' },
              { icon: '🌺', sub: 'Tamil', desc: 'அ • சொல் • வாசி', color: 'from-orange-400 to-red-500' },
              { icon: '🏮', sub: 'Mandarin', desc: '听 • 说 • 认字', color: 'from-yellow-400 to-orange-500' },
              { icon: '🎓', sub: '6 Tahap', desc: 'Pra + Darjah 1-6', color: 'from-fuchsia-400 to-pink-500' },
            ].map((s, i) => (
              <motion.div key={s.sub} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, scale: 1.04 }}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-2xl text-center cursor-pointer">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-3 shadow-lg`}>
                  {s.icon}
                </div>
                <p className="font-black text-purple-900 text-sm sm:text-base leading-tight">{s.sub}</p>
                <p className="text-slate-500 text-xs font-semibold mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALL IN ONE ── */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-fuchsia-600 to-pink-600">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">🚀 SEMUA DALAM SATU APP</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Lengkap & Mudah Guna
            </h2>
            <p className="text-white/85 font-bold max-w-xl mx-auto">Game interaktif, dashboard ibu bapa, dan progress tracking dalam satu pengalaman</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '🎮', title: 'Game Engine', desc: 'Soalan interaktif pelbagai format untuk 7 subjek utama', color: 'from-yellow-400 to-orange-500' },
              { icon: '📊', title: 'Parent Analytics', desc: 'Pantau skor, streak, dan prestasi setiap anak', color: 'from-cyan-400 to-blue-500' },
              { icon: '🔒', title: 'Selamat 100%', desc: 'Tanpa iklan, tanpa chat orang asing, mesra keluarga', color: 'from-violet-400 to-purple-500' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 shadow-2xl text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-purple-900 text-xl mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-pink-600 to-fuchsia-600 overflow-hidden">
        {/* Cartoon path decoration */}
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-16 right-8 text-5xl sm:text-7xl opacity-70 z-0">🌟</motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-16 left-8 text-5xl sm:text-7xl opacity-70 z-0">🚀</motion.div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-white text-pink-600 rounded-full text-xs font-black mb-4">📲 MULA DALAM 3 LANGKAH</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Senang Je!
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '📲', title: 'Daftar', desc: 'Pilih pelan, isi maklumat, bayar FPX', color: 'from-yellow-400 to-orange-500' },
              { step: '2', icon: '🎯', title: 'Pilih Anak', desc: 'Prasekolah atau Sekolah Rendah', color: 'from-cyan-400 to-blue-500' },
              { step: '3', icon: '🎉', title: 'Main & Belajar', desc: 'Anak terus mula, ibu bapa pantau', color: 'from-violet-400 to-purple-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-white rounded-3xl p-6 shadow-2xl text-center">
                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${s.color} text-white font-black text-xl flex items-center justify-center shadow-lg`}>
                  {s.step}
                </div>
                <div className="text-6xl mb-3 mt-3">{s.icon}</div>
                <h3 className="font-black text-purple-900 text-xl mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm font-semibold">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-fuchsia-600 to-violet-600 overflow-hidden">
        {/* Cartoon heart mascots */}
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [-5, 5, -5] }} transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute top-10 left-4 sm:left-12 text-5xl sm:text-7xl opacity-80 z-0">💖</motion.div>
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [5, -5, 5] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-10 right-4 sm:right-12 text-5xl sm:text-7xl opacity-80 z-0">⭐</motion.div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_, i) => <span key={i} className="text-2xl text-yellow-300">⭐</span>)}</div>
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">💬 TESTIMONI</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Apa Kata Ibu Bapa
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl p-6 shadow-2xl">
                <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_, j) => <span key={j} className="text-yellow-400 text-lg">⭐</span>)}</div>
                <p className="text-slate-700 mb-4 text-sm font-semibold leading-relaxed">"{t.quote}"</p>
                <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-black px-3 py-1 rounded-full mb-3">✅ {t.highlight}</div>
                <div className="flex items-center gap-3 pt-3 border-t-2 border-purple-100">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-purple-300" />
                  <div>
                    <p className="font-black text-purple-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-violet-600 to-purple-700 overflow-hidden">
        {/* Cartoon money/gift mascots */}
        <motion.div animate={{ y: [0, -12, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-12 right-4 sm:right-16 text-5xl sm:text-7xl opacity-80 z-0">🎁</motion.div>
        <motion.div animate={{ y: [0, -10, 0], rotate: [8, -8, 8] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-12 left-4 sm:left-16 text-5xl sm:text-7xl opacity-80 z-0">💎</motion.div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">💰 PILIH PELAN</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Harga Berbaloi
            </h2>
            <p className="text-white/85 font-bold">Pelan tahunan mesra bajet keluarga</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${tier.gradient} ${tier.highlighted ? 'md:scale-105 md:-mt-4 ring-4 ring-yellow-300' : ''}`}>
                {tier.savings && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-300 text-purple-900 text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    🔥 {tier.savings}
                  </div>
                )}
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>{tier.nameMY}</h3>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-black text-white" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>RM{tier.priceMYR}</span>
                  <span className="text-sm font-bold text-white/90">{tier.period}</span>
                </div>
                <p className="text-xs font-bold mb-5 text-white/80">≈ RM{tier.perMonth}/bulan</p>

                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => handleTierSelect(tier.name)}
                  className={`w-full py-3.5 rounded-2xl font-black text-base mb-5 shadow-lg transition-all ${selectedTierForCheckout === tier.name ? 'bg-yellow-300 text-purple-900 ring-4 ring-white' : 'bg-white text-purple-700 hover:bg-yellow-100'}`}>
                  {tier.cta}
                </motion.button>

                <div className="space-y-2">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-white">
                      <Check className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" /> {f}
                    </div>
                  ))}
                  {tier.noFeatures.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-white/50">
                      <span className="w-4 flex-shrink-0">✕</span> {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHECKOUT ── */}
      <section className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-purple-700 to-fuchsia-600">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">🔒 LANGKAH TERAKHIR</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Daftar & Bayar
            </h2>
            <p className="text-white/85 font-bold">Pembayaran FPX selamat — aktif dalam 2 minit</p>
          </motion.div>

          <motion.div id="checkout-form" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-5 sm:p-7 shadow-2xl bg-white">
            <PricingCheckout selectedTier={selectedTierForCheckout} onTierChange={setSelectedTierForCheckout} />
          </motion.div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {['🔒 FPX Selamat', '💳 Tiada Hidden Fee', '📊 Pantau Progress'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3 text-white text-xs sm:text-sm font-bold text-center">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-b from-fuchsia-600 to-purple-700">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-900 rounded-full text-xs font-black mb-4">❓ SOALAN LAZIM</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
              Ada Soalan?
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqList.map((faq, i) => (
              <motion.details key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl shadow-xl group">
                <summary className="cursor-pointer p-5 font-black text-purple-900 text-sm sm:text-base list-none flex items-center justify-between gap-3 hover:bg-purple-50 rounded-2xl transition-colors">
                  <span className="flex-1">{faq.q}</span>
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-center text-lg flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-slate-600 text-sm font-semibold leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cartoon mascot crew */}
          <motion.div animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-8 left-4 sm:left-12 text-7xl sm:text-9xl">👧</motion.div>
          <motion.div animate={{ y: [0, -10, 0], rotate: [5, -5, 5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
            className="absolute bottom-8 right-4 sm:right-12 text-7xl sm:text-9xl">🧒</motion.div>
          <motion.div animate={{ y: [0, -8, 0], rotate: [-8, 8, -8] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
            className="absolute top-8 left-1/4 text-5xl sm:text-7xl opacity-80">🦄</motion.div>
          <motion.div animate={{ y: [0, -10, 0], rotate: [8, -8, 8] }} transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}
            className="absolute top-12 right-1/4 text-5xl sm:text-7xl opacity-80">🌈</motion.div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="text-7xl mb-5">🎓</motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight" style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.15)' }}>
            Anak Layak Dapat<br />Yang <span className="text-yellow-300">Terbaik!</span>
          </h2>
          <p className="text-white/95 text-lg sm:text-xl font-bold mb-8 max-w-xl mx-auto">
            Mula latihan harian yang seronok. Setiap hari, sikit demi sikit.
          </p>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo('pricing')}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-yellow-300 text-purple-900 rounded-full font-black text-lg sm:text-xl shadow-2xl shadow-yellow-500/50 inline-flex items-center gap-3">
            🎮 Pilih Pelan <ArrowRight className="w-6 h-6" />
          </motion.button>
          <p className="text-white/85 text-sm mt-5 font-bold">✅ Setup 2 minit · ✅ Tiada iklan · ✅ Dashboard ibu bapa</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative bg-purple-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={LOGO} alt="" className="h-10 rounded-2xl" />
            <span className="font-black text-2xl">CeriaKid</span>
          </div>
          <p className="text-white/70 text-sm mb-6 font-bold">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            <Link to="/terms" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-black transition-colors">Terma Penggunaan</Link>
            <Link to="/privacy" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-black transition-colors">Dasar Privasi</Link>
            <Link to="/contact" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-black transition-colors">Hubungi Kami</Link>
          </div>
          <p className="text-white/40 text-xs">© 2026 CeriaKid · Made with 💜 in Malaysia 🇲🇾</p>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}