import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import InteractiveGameDemo from '@/components/landing/InteractiveGameDemo';
import PricingCheckout from '@/components/PricingCheckout';
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp';

// Asset URLs
const BG_TOP = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ff7efefb9_generated_image.png';
const MASCOT_BOY = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fbf4ca9f6_generated_image.png';
const MASCOT_GIRL = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0837608b2_generated_image.png';
const MASCOT_ELEPHANT = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0f1e041a2_generated_image.png';
const LOGO = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

// Beta tester highlights — placeholder sehingga testimoni sebenar dikumpul
const testimonials = [
{ name: 'Beta Tester', location: 'Selangor', quote: 'Saya suka susunan subjek ikut KSPK/KSSR. Anak boleh main latihan pendek tanpa rasa terbeban.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'susunan jelas' },
{ name: 'Beta Tester', location: 'Johor', quote: 'Dashboard ibu bapa sangat membantu untuk lihat subjek mana yang anak perlu lebih latihan.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: 'pantau progress' },
{ name: 'Beta Tester', location: 'Kuala Lumpur', quote: 'Interface ceria dan mesra kanak-kanak. Setup pun cepat — boleh terus mula belajar.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'mesra anak' }];


const tiers = [
{
  name: 'asas',
  nameMY: '🌱 Asas',
  priceMYR: '49',
  perMonth: '4.08',
  period: '/tahun',
  features: ['50 game boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', '1 peranti sahaja 📱'],
  noFeatures: ['Sehingga 4 anak'],
  cta: 'Mulakan Sekarang',
  highlighted: false,
  bgColor: 'from-cyan-300 to-blue-400'
},
{
  name: 'keluarga',
  nameMY: '👑 Keluarga',
  priceMYR: '199',
  perMonth: '16.58',
  period: '/tahun',
  savings: 'PALING POPULAR',
  features: ['200 game semua peringkat boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah', 'Tiada game dikunci 🔓', 'Sehingga 4 profil anak', 'Dashboard ibu bapa lengkap', 'Boleh guna offline 📲', 'Sokongan prioriti', 'Sehingga 4 peranti 📱📱📱📱'],
  noFeatures: [],
  cta: '🔥 Pilih Keluarga',
  highlighted: true,
  bgColor: 'from-yellow-300 via-orange-400 to-pink-500'
},
{
  name: 'standard',
  nameMY: '⭐ Standard',
  priceMYR: '99',
  perMonth: '8.25',
  period: '/tahun',
  features: ['100 game boleh dimainkan', 'Semua subjek', 'Prasekolah & Sekolah Rendah boleh akses', 'Game selepas had dikunci 🔒', 'Dashboard ibu bapa', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', 'Sehingga 2 peranti 📱📱'],
  noFeatures: ['Sehingga 4 anak'],
  cta: 'Pilih Standard',
  highlighted: false,
  bgColor: 'from-purple-400 to-pink-400'
}];


const faqList = [
  { q: 'Bagaimana CeriaKid membantu?', icon: '💡', a: 'Game pembelajaran pendek yang sesuai dengan tahap anak. Belajar BM, English, Math, Sains, Jawi, Tamil & Mandarin sambil bermain.' },
  { q: 'Pelan tahunan jelas', icon: '📅', a: 'Pelan tahunan dengan harga jelas. Tiada hidden fee. Mula dari RM49/tahun (≈RM4/bulan).' },
  { q: 'Pembayaran FPX selamat', icon: '💰', a: 'Pembayaran melalui FPX yang selamat dan diiktiraf bank Malaysia.' },
  { q: 'Pantau progress anak', icon: '📈', a: 'Dashboard ibu bapa lengkap — lihat markah, streak, subjek mana anak kuat/lemah.' },
  { q: 'Adakah CeriaKid sesuai untuk Prasekolah?', icon: '🏫', a: 'Ya! Kandungan disusun ikut KSPK (Kurikulum Standard Prasekolah Kebangsaan).' },
  { q: 'Apakah content untuk Sekolah Rendah?', icon: '📚', a: 'Subjek penuh KSSR Darjah 1–6 dengan ratusan game untuk setiap tahap.' },
];


export default function Landing() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('keluarga');
  const [navVisible, setNavVisible] = useState(true);
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

  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFaq = () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToTestimonials = () => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFeatures = () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen font-nunito relative overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #d8b4fe 0%, #f0abfc 15%, #fbcfe8 30%, #fef3c7 55%, #fde68a 70%, #bef264 88%, #86efac 100%)' }}>
      
      {/* Decorative floating elements — top */}
      <div className="absolute top-32 left-4 sm:left-12 text-3xl sm:text-5xl animate-bounce" style={{ animationDuration: '3s' }}>⭐</div>
      <div className="absolute top-40 right-6 sm:right-16 text-2xl sm:text-4xl animate-pulse">💜</div>
      <div className="absolute top-60 left-10 text-2xl sm:text-3xl">✨</div>
      <div className="absolute top-72 right-20 text-3xl">🌟</div>

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
              {paymentStatus === 'success' ? <CheckCircle className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
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
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white text-green-600 rounded-full font-black text-sm shadow">
                  Ke Dashboard →
                </button>
              )}
              <button onClick={() => setPaymentStatus(null)} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAVBAR (Cartoony Style) ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 rounded-[2rem] shadow-2xl border-4 border-white" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #e879f9 50%, #f0abfc 100%)' }}>
          {/* Logo + Elephant */}
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="CeriaKid" className="h-9 sm:h-11 rounded-2xl shadow-lg ring-2 ring-white" />
            <img src={MASCOT_ELEPHANT} alt="Mascot" className="hidden sm:block h-12 w-12 object-contain" />
          </div>
          
          {/* Nav buttons */}
          <div className="hidden md:flex items-center justify-center gap-2 lg:gap-3">
            <button onClick={scrollToFeatures} className="px-3 lg:px-4 py-2 bg-white text-purple-700 rounded-full font-black text-xs lg:text-sm shadow-md hover:scale-105 transition-transform">
              Ciri-ciri ⚙️
            </button>
            <button onClick={scrollToTestimonials} className="px-3 lg:px-4 py-2 bg-white text-purple-700 rounded-full font-black text-xs lg:text-sm shadow-md hover:scale-105 transition-transform">
              Testimoni 💬
            </button>
            <button onClick={scrollToPricing} className="px-3 lg:px-4 py-2 bg-white text-purple-700 rounded-full font-black text-xs lg:text-sm shadow-md hover:scale-105 transition-transform">
              Harga 💰
            </button>
            <button onClick={scrollToFaq} className="px-3 lg:px-4 py-2 bg-white text-purple-700 rounded-full font-black text-xs lg:text-sm shadow-md hover:scale-105 transition-transform">
              Soalan Lazim ❓
            </button>
          </div>
          
          {/* Login button */}
          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }} onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')} className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-300 to-orange-400 text-purple-900 rounded-full font-black text-xs sm:text-sm shadow-lg border-2 border-white hover:shadow-xl transition-shadow">
            {isAuthenticated ? 'Dashboard 🏠' : 'Log Masuk 🔓'}
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 sm:pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-2xl border-4 border-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fef3c7 60%, #fff7ed 100%)' }}
        >
          {/* Decorative items inside hero */}
          <div className="absolute top-6 left-8 text-3xl opacity-60">✏️</div>
          <div className="absolute top-32 left-4 text-2xl opacity-50">📚</div>
          <div className="absolute top-12 right-12 text-2xl">🍎</div>
          <div className="absolute top-32 right-6 text-2xl">🍌</div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-center">
            {/* Left: Text */}
            <div className="relative z-10 text-center lg:text-left">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm sm:text-base font-black text-purple-800 mb-3">
                Dibuat Khas untuk anak Malaysia ✨
              </motion.p>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] mb-4">
                <span className="block bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm" style={{ textShadow: '3px 3px 0 rgba(255,255,255,0.6)' }}>
                  Anak Suka<br />Main Game?
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl text-purple-700 mt-2">
                  Jadikan ia Masa Belajar
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm sm:text-base text-slate-700 font-bold mb-2">
                Game pembelajaran KSPK untuk Prasekolah & KSSR untuk Sekolah Rendah.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                CeriaKid bantu anak belajar BM, English, Matematik, Sains, Jawi, Tamil & Mandarin melalui game pendek, soalan interaktif dan dashboard ibu bapa — ditetap ikut KSPK prasekolah dan KSSR sekolah rendah 🇲🇾
              </motion.p>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToPricing}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-white rounded-full font-black text-base sm:text-lg shadow-2xl shadow-orange-500/50 inline-flex items-center gap-2 border-4 border-white"
              >
                Lihat Pakej Harga <span className="text-xl">👆</span>
              </motion.button>

              {/* Mascot boy below CTA (mobile) */}
              <div className="lg:hidden flex justify-center mt-6">
                <img src={MASCOT_BOY} alt="Pelajar" className="h-32 object-contain" />
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center lg:justify-start">
                <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 rounded-full text-xs font-black shadow-md border-2 border-white">✅ KSPK + KSSR</span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-300 to-pink-300 text-red-900 rounded-full text-xs font-black shadow-md border-2 border-white">❌ Tiada Iklan</span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-green-300 to-emerald-300 text-green-900 rounded-full text-xs font-black shadow-md border-2 border-white">📊 Dashboard Ibu Bapa</span>
              </div>
            </div>

            {/* Right: Game demo card */}
            <div className="relative">
              {/* Floating fruits */}
              <div className="absolute -top-4 -left-2 text-4xl z-20 animate-bounce" style={{ animationDuration: '2s' }}>🍎</div>
              <div className="absolute -top-2 -right-4 text-4xl z-20 animate-bounce" style={{ animationDuration: '2.5s' }}>🍌</div>
              <div className="absolute bottom-12 -left-6 text-3xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>🍇</div>

              <div className="rounded-[2rem] p-3 shadow-2xl border-4 border-white" style={{ background: 'linear-gradient(135deg, #c084fc 0%, #f0abfc 100%)' }}>
                <InteractiveGameDemo />
              </div>

              {/* Mascot girl beside game (desktop only) */}
              <img src={MASCOT_GIRL} alt="Pelajar" className="hidden lg:block absolute -bottom-12 -left-20 h-36 object-contain z-10" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 shadow-2xl border-4 border-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f0abfc 100%)' }}
        >
          {/* Pennant decoration */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
            {['🚩', '🎉', '🎊', '🚩', '🎉'].map((e, i) => (
              <span key={i} className="text-lg">{e}</span>
            ))}
          </div>

          {/* Stars left & right */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl sm:text-5xl">⭐</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl sm:text-5xl">⭐</div>

          <div className="text-center relative z-10 px-12 sm:px-16">
            <p className="text-xs sm:text-sm font-black text-white/90 tracking-widest mb-1">DIPAPARKAN & DIPERCAYAI OLEH</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Dipercayai 5,000+ Keluarga Malaysia 🇲🇾</h2>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4 relative z-10">
            {[
              { txt: '4.9 Rating', icon: '⭐', bg: 'from-yellow-300 to-orange-300', text: 'text-orange-900' },
              { txt: 'Verified Safe', icon: '✅', bg: 'from-green-300 to-emerald-300', text: 'text-green-900' },
              { txt: 'Learn & Play Together', icon: '🎯', bg: 'from-purple-300 to-violet-300', text: 'text-purple-900' },
              { txt: 'Anak Malaysia', icon: '🇲🇾', bg: 'from-red-300 to-pink-300', text: 'text-red-900' },
              { txt: 'Belajar Sambil Main', icon: '🎮', bg: 'from-blue-300 to-cyan-300', text: 'text-blue-900' },
              { txt: 'Trusted by 3,000+', icon: '✨', bg: 'from-fuchsia-300 to-pink-300', text: 'text-fuchsia-900' },
            ].map((b, i) => (
              <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md border-2 border-white bg-gradient-to-r ${b.bg} ${b.text}`}>
                {b.icon} {b.txt}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── DECORATIVE WAVE/HILLS DIVIDER ── */}
      <div className="relative h-32 sm:h-48 overflow-hidden z-0">
        <div className="absolute inset-0 flex items-end justify-around px-4 pb-8">
          <span className="text-3xl sm:text-4xl">🎈</span>
          <span className="text-2xl sm:text-3xl">🎒</span>
          <span className="text-3xl sm:text-4xl">🚌</span>
          <span className="text-2xl sm:text-3xl">🪁</span>
          <span className="text-3xl sm:text-4xl">⭐</span>
        </div>
      </div>

      {/* ── FEATURES SECTION (Hidden anchor) ── */}
      <div id="features" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-purple-800 mb-3">Ciri-ciri Hebat CeriaKid ⚙️</h2>
          <p className="text-purple-700 font-bold">Semua yang ibu bapa & anak perlukan dalam satu app</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🎮', title: 'Game Pendek 5-10 Min', desc: 'Latihan harian yang anak tak cepat bosan.', bg: 'from-yellow-200 to-orange-200', border: 'border-orange-300' },
            { icon: '📊', title: 'Dashboard Ibu Bapa', desc: 'Pantau markah, streak, dan subjek lemah anak.', bg: 'from-pink-200 to-rose-200', border: 'border-pink-300' },
            { icon: '📚', title: 'KSPK + KSSR Sebenar', desc: 'Disusun ikut silibus rasmi Kementerian Pendidikan.', bg: 'from-purple-200 to-violet-200', border: 'border-purple-300' },
            { icon: '🌐', title: '7 Bahasa', desc: 'BM, English, Math, Sains, Jawi, Tamil, Mandarin.', bg: 'from-blue-200 to-cyan-200', border: 'border-blue-300' },
            { icon: '📲', title: 'Offline Mode', desc: 'Boleh main tanpa internet di kereta atau bila travel.', bg: 'from-green-200 to-emerald-200', border: 'border-green-300' },
            { icon: '🔒', title: 'Tiada Iklan', desc: 'Persekitaran selamat untuk kanak-kanak.', bg: 'from-fuchsia-200 to-pink-200', border: 'border-fuchsia-300' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-3xl p-5 bg-gradient-to-br ${f.bg} border-4 ${f.border} shadow-xl hover:scale-105 transition-transform`}>
              <div className="text-5xl mb-3">{f.icon}</div>
              <h3 className="font-black text-purple-900 text-lg mb-1">{f.title}</h3>
              <p className="text-slate-700 text-sm font-semibold">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
          <div className="flex justify-center gap-1 mb-2">{[...Array(5)].map((_, i) => <span key={i} className="text-2xl text-orange-500">⭐</span>)}</div>
          <h2 className="text-3xl sm:text-4xl font-black text-purple-800 mb-2">Apa Kata Ibu Bapa 💬</h2>
          <p className="text-purple-700 font-bold">Maklum balas daripada keluarga yang menggunakan CeriaKid</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-3xl p-6 border-4 border-purple-200 shadow-xl">
              <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_, j) => <span key={j} className="text-orange-500">⭐</span>)}</div>
              <p className="text-slate-700 mb-4 text-sm font-semibold">"{t.quote}"</p>
              <div className="inline-block bg-gradient-to-r from-green-200 to-emerald-200 text-green-900 text-xs font-black px-3 py-1 rounded-full mb-3 border-2 border-green-300">✅ {t.highlight}</div>
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

      {/* ── PRICING ── */}
      <div id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-purple-800 mb-3">Pilih Pakej Harga 💰</h2>
          <p className="text-purple-700 font-bold">Pelan tahunan mesra bajet keluarga</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-6 relative border-4 border-white shadow-2xl bg-gradient-to-br ${tier.bgColor} ${tier.highlighted ? 'md:scale-105 md:-mt-4' : ''}`}
            >
              {tier.savings && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-purple-700 text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-purple-300">
                  💰 {tier.savings}
                </div>
              )}

              <h3 className="text-2xl font-black mb-2 text-white drop-shadow-md">{tier.nameMY}</h3>

              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-3xl font-black text-white drop-shadow-md">RM{tier.priceMYR}</span>
                <span className="text-sm font-bold text-white/90">{tier.period}</span>
              </div>
              <p className="text-xs font-bold mb-5 text-white/80">≈ RM{tier.perMonth}/bulan</p>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTierSelect(tier.name)}
                className={`w-full py-3 rounded-2xl font-black text-base mb-5 shadow-lg border-2 border-white bg-white text-purple-700 hover:bg-purple-50 transition-colors ${
                  selectedTierForCheckout === tier.name ? 'ring-4 ring-yellow-300' : ''
                }`}
              >
                {tier.cta}
              </motion.button>

              <div className="space-y-2">
                {tier.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs font-semibold text-white">
                    <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" /> {f}
                  </div>
                ))}
                {tier.noFeatures.map((f, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs font-semibold text-white/60">
                    <span className="w-4 flex-shrink-0">✕</span> {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CHECKOUT ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          id="checkout-form"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-white bg-white"
        >
          <div className="mb-4 text-center">
            <h3 className="text-xl sm:text-2xl font-black text-purple-800">Daftar & Bayar 🔒</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">Pilih pakej, isi maklumat dan teruskan ke pembayaran FPX yang selamat.</p>
          </div>
          <PricingCheckout selectedTier={selectedTierForCheckout} onTierChange={setSelectedTierForCheckout} />
        </motion.div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-purple-800 mb-2">Soalan Lazim 🤔</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqList.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border-4 border-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow group"
              style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%)' }}
            >
              <summary className="font-black text-purple-900 text-sm sm:text-base list-none flex items-center gap-2">
                <span className="flex-1">{faq.q}</span>
                <span className="text-xl flex-shrink-0">{faq.icon}</span>
              </summary>
              <p className="text-slate-700 text-xs sm:text-sm mt-2 font-semibold leading-relaxed">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 pb-8 pt-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Sun + Wood sign */}
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="bg-gradient-to-br from-amber-700 to-amber-900 text-yellow-100 px-5 py-2.5 rounded-2xl font-black text-sm shadow-xl border-4 border-amber-600 transform -rotate-3">
              CeriaKid @ 2026
            </div>
            <div className="text-6xl animate-pulse">☀️</div>
          </div>

          {/* Tagline */}
          <div className="text-center mb-4">
            <div className="inline-block bg-white px-5 py-2 rounded-full shadow-lg border-2 border-purple-200">
              <p className="font-black text-purple-900 text-xs sm:text-sm">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/terms" className="px-4 py-1.5 bg-white text-purple-700 rounded-full text-xs font-black shadow-md border-2 border-purple-200 hover:scale-105 transition-transform">
              Terma Penggunaan
            </Link>
            <Link to="/privacy" className="px-4 py-1.5 bg-white text-purple-700 rounded-full text-xs font-black shadow-md border-2 border-purple-200 hover:scale-105 transition-transform">
              Dasar Privasi
            </Link>
            <Link to="/contact" className="px-4 py-1.5 bg-white text-purple-700 rounded-full text-xs font-black shadow-md border-2 border-purple-200 hover:scale-105 transition-transform">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}