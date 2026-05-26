import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PricingCheckout from '@/components/PricingCheckout';
import TrustedMarquee from '@/components/landing/TrustedMarquee';
import AppPreviewShowcase from '@/components/landing/AppPreviewShowcase';
import HeroCarousel from '@/components/landing/HeroCarousel';
import SectionWrapper from '@/components/landing/SectionWrapper';
import LandingAISection from '@/components/landing/LandingAISection';


// Testimoni ibu bapa pengguna CeriaKid
const testimonials = [
{ name: 'Puan Siti Aishah', location: 'Shah Alam, Selangor', quote: 'Saya suka susunan subjek ikut KSPK/KSSR. Anak saya umur 6 tahun boleh main latihan pendek tanpa rasa terbeban.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'susunan jelas' },
{ name: 'Encik Faizal Rahman', location: 'Johor Bahru, Johor', quote: 'Dashboard ibu bapa sangat membantu. Saya boleh lihat subjek mana anak perlu lebih latihan dan fokus situ.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: 'pantau progress' },
{ name: 'Puan Nurul Huda', location: 'Cheras, Kuala Lumpur', quote: 'Interface ceria dan mesra kanak-kanak. Setup pun cepat — anak terus boleh mula belajar. Berbaloi sangat!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'mesra anak' },
{ name: 'Encik Ahmad Zulkifli', location: 'Bangi, Selangor', quote: 'Anak saya darjah 2, dulu susah nak duduk belajar. Sekarang dia minta sendiri nak main CeriaKid setiap petang. Bagus!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'anak suka belajar' },
{ name: 'Puan Lim Mei Ling', location: 'Petaling Jaya, Selangor', quote: 'Saya pilih plan Keluarga sebab ada 3 orang anak. Boleh setup profil berasingan dan track progress setiap seorang. Sangat sesuai!', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: '3 anak satu plan' },
{ name: 'Puan Roslina Hassan', location: 'Kota Bharu, Kelantan', quote: 'Subjek Jawi dan Bahasa Melayu memang lengkap. Anak saya 5 tahun dah mula kenal huruf Jawi dengan cara yang menyeronokkan.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'Jawi lengkap' }];


const tiers = [
{
  name: 'asas',
  nameMY: '🌱 Asas',
  priceMYR: '49',
  perMonth: '4.08',
  period: '/tahun',
  features: ['50 game boleh dimainkan', '🎁 5 KREDIT AI PERCUMA (cuba Cikgu Firdaus!)', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', '1 peranti sahaja 📱'],
  noFeatures: ['Sehingga 4 anak'],
  cta: 'Mulakan Sekarang',
  highlighted: false
},
{
  name: 'keluarga',
  nameMY: '👑 Keluarga',
  priceMYR: '199',
  perMonth: '16.58',
  period: '/tahun',
  savings: 'PALING POPULAR',
  features: ['200 game semua peringkat boleh dimainkan', '🎁 50 KREDIT AI PERCUMA (Cikgu Firdaus + Penjana Cerita)', 'Semua subjek', 'Prasekolah & Sekolah Rendah', 'Tiada game dikunci 🔓', 'Sehingga 4 profil anak', 'Boleh guna offline 📲', 'Sokongan prioriti', 'Sehingga 4 peranti 📱📱📱📱'],
  noFeatures: [],
  cta: '🔥 Pilih Keluarga',
  highlighted: true
},
{
  name: 'standard',
  nameMY: '⭐ Standard',
  priceMYR: '99',
  perMonth: '8.25',
  period: '/tahun',
  features: ['100 game boleh dimainkan', '🎁 20 KREDIT AI PERCUMA (cuba Cikgu Firdaus!)', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', 'Sehingga 2 peranti 📱📱'],
  noFeatures: ['Sehingga 4 anak'],
  cta: 'Pilih Standard',
  highlighted: false
}];


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

  // Detect payment FAILURE return from Chip.
  // NOTE: Successful payments redirect to /thank-you (see chipCheckout). Purchase pixel
  // is fired there once subscription is confirmed active — NOT here.
  useEffect(() => {
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



  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden bg-slate-950">
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



      {/* ── NAVBAR — Floating pill (Apple Fitness style, sama macam UserTopHeader) ── */}
      {/* Desktop */}
      <header
        className={`hidden md:flex fixed top-2 left-0 right-0 z-50 justify-center px-4 pointer-events-none transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-[140%]'}`}
      >
        <nav
          className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full shadow-2xl shadow-black/50"
          style={{
            background: 'rgba(15, 10, 30, 0.35)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
            alt="CeriaKid"
            className="h-8 w-8 rounded-full object-cover ml-1 mr-2 ring-1 ring-white/20"
          />
          {[
            { href: '#features', label: 'Ciri-ciri' },
            { href: '#ai', label: 'Cikgu AI' },
            { href: '#testimonials', label: 'Testimoni' },
            { href: '#pricing', label: 'Order Now' },
            { href: '#faq', label: 'FAQ' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="relative px-4 py-1.5 rounded-full font-black text-sm text-white/85 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
            className="ml-1 px-4 py-1.5 rounded-full font-black text-sm bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/30 hover:bg-amber-200 transition-colors"
          >
            {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
          </motion.button>
        </nav>
      </header>

      {/* Mobile */}
      <nav className={`md:hidden fixed top-2 left-0 right-0 z-50 px-3 py-3 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div
          className="max-w-md mx-auto w-full px-3 py-2 rounded-full shadow-2xl shadow-black/50 flex items-center justify-between gap-3"
          style={{
            background: 'rgba(15, 10, 30, 0.45)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
              alt="CeriaKid"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20 flex-shrink-0"
            />
            <span className="font-black text-white text-base truncate">CeriaKid</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
            className="px-4 py-2 rounded-full font-black text-sm text-white whitespace-nowrap flex-shrink-0 transition-all hover:bg-white/25"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.08))',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
          </motion.button>
        </div>
      </nav>

      {/* ── HERO — Modern Clean Design ── */}
      <section className="relative w-full overflow-hidden pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Soft gradient background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%)' }} />

        {/* Decorative glow blobs */}
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* LEFT: Text content */}
            <div className="text-center lg:text-left">
              {/* Top badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6"
              >
                <span className="text-base">🇲🇾</span>
                <span className="text-white/90 text-xs sm:text-sm font-bold">Untuk anak-anak Malaysia • KSPK + KSSR</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] text-white tracking-tight mb-5"
              >
                Anak belajar<br />
                <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">
                  sambil main game
                </span>{' '}
                yang berfaedah
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                className="text-base sm:text-lg text-white/75 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
              >
                7 subjek utama dalam satu app — BM, English, Matematik, Sains, Jawi, Tamil & Mandarin. Anak rasa main game, ibu bapa pantau prestasi.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-black text-white text-base shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 10px 30px rgba(234,88,12,0.5)' }}
                >
                  🎮 Cuba Sekarang
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-black text-white/90 text-base bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-colors"
                >
                  Lihat Harga <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex items-center gap-5 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {avatars.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-purple-900 object-cover" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-300 text-sm">★</span>)}
                  </div>
                  <p className="text-white/70 text-xs font-bold">Rating ibu bapa <span className="text-white">4.9/5</span></p>
                </div>
              </motion.div>
            </div>

            {/* RIGHT: Carousel inside floating frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="relative"
            >
              {/* Glow behind carousel */}
              <div className="absolute -inset-4 bg-gradient-to-br from-orange-400/30 via-pink-400/20 to-purple-400/30 rounded-[2.5rem] blur-2xl pointer-events-none" />

              <div className="relative rounded-[2rem] p-2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <HeroCarousel />
              </div>

              {/* Floating stat chips */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="hidden sm:flex absolute -left-4 top-6 items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-xl"
              >
                <span className="text-xl">🎯</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 leading-none">Selari dengan</p>
                  <p className="text-xs font-black text-slate-900 leading-tight">KSPK + KSSR</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                className="hidden sm:flex absolute -right-3 bottom-8 items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-xl"
              >
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 leading-none">200+ permainan</p>
                  <p className="text-xs font-black text-slate-900 leading-tight">Tanpa iklan</p>
                </div>
              </motion.div>
            </motion.div>

          </div>

          {/* Feature pills row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            {[
              { icon: '✅', text: 'Tanpa iklan' },
              { icon: '📊', text: 'Dashboard ibu bapa' },
              { icon: '📲', text: 'Boleh offline' },
              { icon: '🔒', text: 'Selamat untuk anak' },
              { icon: '🎓', text: 'KSPK + KSSR' },
            ].map((pill) => (
              <div key={pill.text} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 text-xs sm:text-sm font-bold">
                <span>{pill.icon}</span> {pill.text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative overflow-hidden py-10 md:py-14 px-5 sm:px-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border-y border-white/5">
        <div className="absolute top-0 -left-20 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { num: '7+', label: 'Subjek Utama', icon: '📚' },
              { num: '2', label: 'Peringkat Umur', icon: '🎯' },
              { num: 'KSPK+KSSR', label: 'Standard Malaysia', icon: '🇲🇾' },
              { num: '5-10', label: 'Minit Harian', icon: '🚀' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-4 md:p-5 bg-white/5 backdrop-blur-md border border-white/10 text-center"
              >
                <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent leading-none">{stat.num}</div>
                <div className="text-white/60 text-xs md:text-sm font-bold mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TrustedMarquee />

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

      {/* ── SOLUTION / FEATURES ── */}
      <SectionWrapper
        id="features"
        badge="SOLUSI SCREEN TIME BERFAEDAH"
        badgeIcon="✅"
        title="Perkenalkan CeriaKid —"
        titleAccent="latihan harian yang anak suka"
        subtitle="Permainan edukatif berasaskan topik sekolah Malaysia. Anak rasa macam main game, ibu bapa pula nampak perkembangan pembelajaran."
        variant="bright"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🎮', title: 'Latihan Rasa Macam Game', desc: 'Soalan pendek, warna ceria dan feedback segera bantu anak kekal fokus tanpa rasa terbeban.' },
            { icon: '📊', title: 'Ibu Bapa Boleh Pantau', desc: 'Lihat markah, percubaan dan topik yang anak perlukan lebih latihan melalui dashboard.' },
            { icon: '📲', title: 'Sesuai Untuk Rutin Harian', desc: 'Gunakan 5–10 minit sehari di rumah, dalam kereta atau bila anak ada masa lapang.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl p-6 sm:p-7 bg-white shadow-xl shadow-emerald-100 border border-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-black text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── APP PREVIEW SHOWCASE ── */}
      <AppPreviewShowcase />

      {/* ── SUBJECTS ── */}
      <SectionWrapper
        badge="SUBJEK PEMBELAJARAN"
        badgeIcon="📚"
        title="Subjek yang anak"
        titleAccent="boleh belajar"
        subtitle="Pilih topik mengikut silibus dan tahap anak — semuanya dalam gaya permainan yang menyeronokkan."
        variant="vibrant"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/866fc318d_generated_image.png', icon: '🇲🇾', sub: 'Bahasa Melayu', word: 'Baca • Eja • Faham', info: 'Latihan ayat mudah dan kosa kata harian.', color: 'from-blue-500 via-sky-400 to-cyan-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🇬🇧', sub: 'English', word: 'Read • Speak • Play', info: 'Belajar perkataan English dengan cara seronok.', color: 'from-emerald-500 via-green-400 to-lime-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e595cc1aa_generated_image.png', icon: '🔢', sub: 'Matematik', word: 'Kira • Banding • Selesaikan', info: 'Nombor dan operasi asas dalam bentuk game.', color: 'from-violet-500 via-purple-400 to-fuchsia-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/866fc318d_generated_image.png', icon: '🧪', sub: 'Sains', word: 'Lihat • Tanya • Cuba', info: 'Kenal alam, haiwan dan eksperimen ringkas.', color: 'from-orange-500 via-amber-400 to-yellow-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🕌', sub: 'Jawi', word: 'Kenal • Sebut • Tulis', info: 'Huruf Jawi dan suku kata secara perlahan.', color: 'from-teal-500 via-cyan-400 to-blue-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e595cc1aa_generated_image.png', icon: '🌺', sub: 'Tamil', word: 'அ • சொல் • வாசி', info: 'Asas huruf dan perkataan Tamil untuk anak.', color: 'from-rose-500 via-pink-400 to-orange-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🏮', sub: 'Mandarin', word: '听 • 说 • 认字', info: 'Kenal bunyi, nombor dan perkataan Mandarin.', color: 'from-red-500 via-orange-400 to-yellow-300' },
          ].map((s, i) => (
            <motion.div
              key={s.sub}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ delay: i * 0.06 }}
              className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/25 transition-all"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={s.img} alt={`Budak belajar ${s.sub}`} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${s.color} opacity-60`} />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-md">{s.icon} {s.sub}</div>
              </div>
              <div className="p-4 text-left">
                <h3 className="font-black text-white text-lg leading-tight">{s.word}</h3>
                <p className="text-white/60 text-xs leading-snug mt-2">{s.info}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── AI FEATURES ── */}
      <LandingAISection />

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

      {/* ── HOW IT WORKS ── */}
      <SectionWrapper
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
      </SectionWrapper>

      {/* ── TESTIMONIALS ── */}
      <SectionWrapper
        id="testimonials"
        badge="⭐ ULASAN IBU BAPA"
        badgeIcon="💬"
        title="Apa kata"
        titleAccent="ibu bapa kami"
        subtitle="Maklum balas sebenar daripada ibu bapa yang menggunakan CeriaKid untuk anak-anak mereka 👇"
        variant="vibrant"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_, j) => <span key={j} className="text-yellow-300">★</span>)}</div>
                <p className="text-white/85 mb-4 leading-relaxed text-sm">"{t.quote}"</p>
                <div className="inline-block bg-green-500/15 text-green-200 border border-green-300/30 text-xs font-black px-3 py-1 rounded-full mb-4">✅ {t.highlight}</div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/20" />
                <div>
                  <p className="font-black text-white text-sm">{t.name}</p>
                  <p className="text-xs text-white/55">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative overflow-hidden py-16 md:py-24 px-5 sm:px-8 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-300/30 backdrop-blur-md mb-5">
              <span>💎</span>
              <span className="text-yellow-200 text-xs sm:text-sm font-bold">PELAN TAHUNAN MESRA BAJET</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight mb-4">
              Pilih pelan{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                yang sesuai
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Pilih pelan yang sesuai untuk umur anak. Semua pelan tahunan dan mesra bajet keluarga.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {tiers.map((tier, i) =>
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-6 relative border-2 transition-all ${
              tier.highlighted ?
              'border-yellow-200/80 shadow-2xl shadow-yellow-950/30 md:scale-105' :
              'border-white/20 shadow-md hover:border-white/40'}`}
              style={tier.highlighted ? 
                { background: 'linear-gradient(135deg, rgba(251,191,36,0.98), rgba(245,158,11,0.96), rgba(217,119,6,0.94))', backdropFilter: 'blur(20px)' } :
                { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }
              }
              >
              
                {tier.savings &&
                <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 ${tier.highlighted ? 'bg-white text-orange-700 border border-white' : 'bg-white/15 text-white border border-white/20'}`}>
                   💰 {tier.savings}
                 </div>
                }

                <h3 className={`text-2xl font-black mb-2 ${tier.highlighted ? 'text-slate-950' : 'text-white'}`}>{tier.nameMY}</h3>

                <div className="flex items-baseline gap-1 mb-0.5">
                 <span className={`text-3xl font-black ${tier.highlighted ? 'text-slate-950' : 'text-yellow-300'}`}>RM{tier.priceMYR}</span>
                 <span className={`text-sm font-bold ${tier.highlighted ? 'text-slate-800' : 'text-white/60'}`}>{tier.period}</span>
                </div>
                <p className={`text-xs font-bold mb-6 ${tier.highlighted ? 'text-slate-800' : 'text-white/50'}`}>
                 ≈ RM{tier.perMonth}/bulan
                </p>

                <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTierSelect(tier.name)}
                className={`w-full py-3.5 rounded-2xl font-black text-base mb-6 shadow-md transition-all ${
                tier.highlighted ? 'bg-slate-950 text-yellow-200 hover:bg-slate-900 shadow-slate-950/30' : 'bg-orange-600 text-white hover:bg-orange-700'} ${
                selectedTierForCheckout === tier.name ? 'ring-4 ring-yellow-300' : ''}`}>
                
                  {tier.cta}
                </motion.button>

                <div className="space-y-2.5">
                  {tier.features.map((f, j) =>
                <div key={j} className={`flex items-center gap-2 text-sm font-semibold ${tier.highlighted ? 'text-slate-900' : 'text-white'}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${tier.highlighted ? 'text-green-700' : 'text-green-400'}`} /> {f}
                    </div>
                )}
                  {tier.noFeatures.map((f, j) =>
                <div key={j} className={`flex items-center gap-2 text-sm font-semibold opacity-40 ${tier.highlighted ? 'text-slate-950' : 'text-white'}`}>
                      <span className="w-4 flex-shrink-0">✕</span> {f}
                    </div>
                )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── CHECKOUT FORM ── */}
      <SectionWrapper
        badge="LANGKAH TERAKHIR"
        badgeIcon="🔒"
        title="Daftar &"
        titleAccent="aktifkan akaun"
        subtitle="Isi maklumat ringkas untuk teruskan pembayaran FPX yang selamat."
        variant="sky"
      >
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

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-16 md:py-24 px-5 sm:px-8 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950">
        <div className="absolute top-10 -left-32 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span>🎓</span>
              <span className="text-white/90 text-xs sm:text-sm font-bold">SEDIA UNTUK MULAKAN?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 text-white leading-[1.1] tracking-tight">
              Anak anda layak dapat{' '}
              <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">yang terbaik</span>
            </h2>
            <p className="text-white/75 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Mulakan dengan latihan pendek yang anak boleh konsisten buat setiap hari — lebih mudah, lebih ceria, lebih teratur.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPricing}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-white text-base sm:text-lg shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 10px 30px rgba(234,88,12,0.5)' }}
            >
              🎮 Pilih Pelan Sekarang <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-white/60 text-sm mt-5">✅ Setup 2 minit &nbsp;•&nbsp; ✅ Tanpa iklan &nbsp;•&nbsp; ✅ Dashboard ibu bapa</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <SectionWrapper
        id="faq"
        badge="SOALAN LAZIM"
        badgeIcon="🤔"
        title="Sebelum anda"
        titleAccent="mula menggunakan"
        subtitle="Jawapan ringkas untuk soalan yang biasa ditanya ibu bapa."
        variant="bright"
      >
        <div className="space-y-3 max-w-3xl mx-auto">
          {[
            { q: 'Adakah selamat untuk anak?', a: 'Ya, 100%! Tiada iklan, tiada pop-up, tiada chat dengan orang asing. App direka khas untuk keselamatan kanak-kanak.' },
            { q: 'Apakah peranti yang disokong?', a: 'Semua jenis smartphone, tablet, dan komputer. iOS, Android, dan browser. Boleh download untuk guna offline.' },
            { q: 'Bagaimana langganan berfungsi?', a: 'CeriaKid menggunakan pelan tahunan. Anda boleh semak status langganan dan maklumat akaun di bahagian tetapan selepas mendaftar.' },
            { q: 'Adakah ikut standard pembelajaran Malaysia?', a: 'Ya — Prasekolah disusun ikut KSPK (Kurikulum Standard Prasekolah Kebangsaan), manakala Sekolah Rendah ikut KSSR (Kurikulum Standard Sekolah Rendah) Darjah 1–6.' },
            { q: 'Berapa anak boleh guna?', a: 'Pelan Asas untuk Prasekolah (1 anak), Standard untuk Sekolah Rendah (1 anak). Pelan Keluarga untuk kedua-dua peringkat dengan sehingga 4 profil anak — jimat lebih!' },
            { q: 'Macam mana nak mula?', a: 'Pilih pelan, isikan maklumat, bayar melalui FPX, dan anak terus boleh mula belajar dalam masa 2 minit!' },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 bg-white shadow-md shadow-emerald-100 border border-emerald-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="font-black text-slate-900 mb-1.5 flex items-start gap-2">
                <span className="text-emerald-600 flex-shrink-0">❓</span>
                <span>{faq.q}</span>
              </p>
              <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── FOOTER ── */}
      <footer className="text-white py-5 text-center md:py-6 relative bg-slate-950 border-t border-white/10">
        <p className="font-black text-lg mb-1">🎓 CeriaKid © 2026</p>
        <p className="text-white/80 text-sm mb-5">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
        <div className="flex justify-center gap-6 text-xs text-white/60">
          <Link to="/terms" className="cursor-pointer hover:text-white">Terma Penggunaan</Link>
          <Link to="/privacy" className="cursor-pointer hover:text-white">Dasar Privasi</Link>
          <Link to="/contact" className="cursor-pointer hover:text-white">Hubungi Kami</Link>
        </div>
      </footer>

      </div>
    </div>);

}