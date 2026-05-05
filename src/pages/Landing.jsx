import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppHeader from '@/components/AppHeader';
import InteractiveGameDemo from '@/components/landing/InteractiveGameDemo';
import PricingCheckout from '@/components/PricingCheckout';
import TrustedMarquee from '@/components/landing/TrustedMarquee';

// Countdown Timer Hook
function useCountdown(minutes = 15) {
  const [time, setTime] = useState({ m: minutes, s: 0 });
  useEffect(() => {
    const end = Date.now() + minutes * 60 * 1000;
    const interval = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) {setTime({ m: 0, s: 0 });clearInterval(interval);return;}
      setTime({ m: Math.floor(diff / 60000), s: Math.floor(diff % 60000 / 1000) });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

const testimonials = [
{ name: 'Nurul Ain', location: 'Shah Alam, Selangor', quote: 'Anak saya lebih mudah duduk buat latihan bila bentuknya macam game. Saya suka sebab topik dia tersusun dan tak terlalu berat.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png', highlight: 'anak lebih konsisten' },
{ name: 'Ismail Hashim', location: 'Johor Bahru, Johor', quote: 'Dashboard ibu bapa sangat membantu. Saya boleh nampak subjek mana anak selalu cuba dan mana yang perlu ulang semula.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png', highlight: 'mudah pantau progress' },
{ name: 'Rohani Bakar', location: 'Kota Bharu, Kelantan', quote: 'Pelan keluarga memang praktikal untuk rumah kami. Anak-anak boleh guna ikut peringkat masing-masing tanpa perlu banyak app berbeza.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png', highlight: 'sesuai untuk keluarga' },
{ name: 'Faridah Mohamad', location: 'Penang', quote: 'Saya kerja shift, jadi latihan pendek macam ni memudahkan anak belajar sendiri sekejap setiap hari.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e1156a4f3_generated_image.png', highlight: 'latihan harian lebih mudah' },
{ name: 'Ahmad Zulkifli', location: 'Kuching, Sarawak', quote: 'Saya suka interface dia ceria, mudah faham dan tidak terlalu serabut. Anak lebih selesa cuba soalan satu demi satu.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fa45e0b6a_generated_image.png', highlight: 'interface mesra anak' },
{ name: 'Siti Hajar', location: 'Ipoh, Perak', quote: 'Cuba versi percuma dulu, kemudian upgrade sebab kandungan dan susunan subjeknya sesuai untuk latihan di rumah.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/845d3a3d9_generated_image.png', highlight: 'boleh cuba dahulu' }];


const tiers = [
{
  name: 'asas',
  nameMY: '🌱 Asas',
  priceMYR: '49',
  perMonth: '4.08',
  period: '/tahun',
  features: ['50 game Prasekolah boleh dimainkan', 'Semua subjek', 'Prasekolah sahaja', 'Game Sekolah Rendah dikunci 🔒', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', '1 peranti sahaja 📱'],
  noFeatures: ['Sekolah Rendah', 'Sehingga 4 anak'],
  cta: 'Mulakan Sekarang',
  highlighted: false
},
{
  name: 'standard',
  nameMY: '⭐ Standard',
  priceMYR: '99',
  perMonth: '8.25',
  period: '/tahun',
  features: ['100 game Sekolah Rendah boleh dimainkan', 'Semua subjek', 'Sekolah Rendah sahaja', 'Game Prasekolah dikunci 🔒', 'Dashboard ibu bapa', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan', 'Sehingga 2 peranti 📱📱'],
  noFeatures: ['Sehingga 4 anak'],
  cta: 'Pilih Standard',
  highlighted: false
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
  highlighted: true
}];


const avatars = [
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/512f26c46_generated_image.png',
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e997c6e39_generated_image.png',
'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e057bebe4_generated_image.png'];


export default function Landing() {
  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const countdown = useCountdown(15);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('keluarga');
  const [navVisible, setNavVisible] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed' | null
  const lastScrollY = useRef(0);

  // Detect payment return from Chip
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentStatus('success');
      // Clean URL
      window.history.replaceState({}, '', '/');
      // Refresh auth to pick up new subscription
      setTimeout(() => refreshAuth?.(), 1500);
    } else if (payment === 'failed') {
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
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
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
                  onClick={() => navigate('/dashboard')}
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



      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 sm:px-4 py-2.5 rounded-[1.75rem] pro-glass ring-1 ring-white/20">
          <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-10 rounded-2xl shadow-lg ring-1 ring-white/40" />
          <div className="hidden md:flex items-center justify-center gap-7 text-sm font-black text-white/75">
            <a href="#features" className="hover:text-white transition-colors">Ciri-ciri</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimoni</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="#faq" className="hover:text-white transition-colors">Soalan Lazim</a>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => isAuthenticated ? navigate('/dashboard') : base44.auth.redirectToLogin('/dashboard')} className="px-4 sm:px-5 py-2.5 bg-white text-game-purple rounded-full font-black text-xs sm:text-sm shadow-lg hover:bg-white/95 transition-colors">
            {isAuthenticated ? 'Dashboard' : 'Log Masuk'}
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Text */}
          <div>
            {/* Social proof pill */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap sm:inline-flex items-center gap-2 max-w-full bg-white/12 border border-white/20 rounded-3xl sm:rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8 shadow-xl backdrop-blur-xl">
              <div className="flex -space-x-2 flex-shrink-0">
                {avatars.map((a, i) =>
                <img key={i} src={a} className="w-7 h-7 rounded-full border-2 border-white object-cover flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-0.5 flex-shrink-0">{[...Array(5)].map((_, i) => <span key={i} className="text-orange-400 text-xs">★</span>)}</div>
              <span className="text-[11px] sm:text-xs font-black text-white/85 leading-snug min-w-0 flex-1 sm:flex-none">Dipercayai <span className="text-yellow-300">5,000+ keluarga</span> Malaysia • Dibina khas untuk <span className="text-yellow-300">anak Malaysia</span> 🇲🇾</span>
            </motion.div>

            {/* Headline */}
             <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-white mb-4">
               Anak Suka Main Game?<br />{' '}
               <span className="relative inline-block">
                 <span className="relative z-10 text-black">Jadikan Ia</span>
                 <span className="absolute inset-0 bg-yellow-300 rounded-lg transform -rotate-1 z-0"></span>
               </span>
               {' '}Masa Belajar 🎉
             </motion.h1>

             {/* Subtext */}
             <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg text-yellow-300 mb-2 font-bold">
               Game pembelajaran KSSR untuk Prasekolah & Sekolah Rendah
             </motion.p>
             <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 leading-relaxed">
               CeriaKid bantu anak belajar BM, English, Matematik, Sains, Jawi, Tamil & Mandarin melalui game pendek, soalan interaktif dan dashboard ibu bapa — sesuai untuk latihan harian di rumah. ✅
             </motion.p>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToPricing}
                className="px-5 py-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-white rounded-full font-black text-sm shadow-2xl shadow-orange-950/30 flex items-center gap-2 justify-center">
                
                Lihat Pelan Harga <ArrowRight className="w-4 h-4" />
              </motion.button>

            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 text-sm text-white/70">
              {['✅ Ikut silibus KSSR', '✅ Tiada iklan', '✅ Dashboard ibu bapa'].map((t, i) =>
              <span key={i} className="font-semibold">{t}</span>
              )}
            </motion.div>


          </div>

          {/* Right: Game Demo */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: 'spring', damping: 20 }}>
            <div className="relative">
              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 z-10 bg-slate-950/75 border border-white/20 rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2 backdrop-blur-xl">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="text-xs text-white/75 font-semibold">200+ Permainan</p>
                  <p className="text-xs font-black text-yellow-300">Cuba sekarang!</p>
                </div>
              </div>
              <InteractiveGameDemo />
              {/* Rating badge */}
              <div className="absolute -bottom-4 -right-4 z-10 bg-slate-950/75 border border-white/20 rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2 backdrop-blur-xl">
                <span className="text-yellow-300 text-xl">⭐</span>
                <div>
                  <p className="text-xs text-white/75 font-semibold">Rating Ibu Bapa</p>
                  <p className="text-sm font-black text-white">4.9 / 5.0</p>
                </div>
              </div>
            </div>

            {/* Mini badges below game demo */}
            <div className="flex flex-wrap gap-2 mt-8 justify-center">
              {[
              { icon: '🏆', text: 'Ikut KSSR' },
              { icon: '🚫', text: 'Tiada Iklan' },
              { icon: '📲', text: 'Offline' },
              { icon: '🔒', text: '100% Selamat' },
              { icon: '🧒', text: 'Mesra Kanak-kanak' }].
              map((s, i) =>
              <span key={i} className="flex items-center gap-1 bg-white/12 border border-white/20 rounded-full px-2.5 py-1 text-xs font-bold text-white/80 shadow-sm backdrop-blur-xl">
                  {s.icon} {s.text}
                </span>
              )}
            </div>
          </motion.div>
        </div>


      </div>

      {/* ── STATS STRIP ── */}
      <div className="py-8 md:py-10 border-y border-white/10" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 text-center">
            {[
            { num: '7+', label: 'Subjek Utama', icon: '📚' },
            { num: '2', label: 'Peringkat Umur', icon: '🎯' },
            { num: 'KSSR', label: 'Silibus Malaysia', icon: '🇲🇾' },
            { num: '5-10', label: 'Minit Latihan Harian', icon: '🚀' }].
            map((stat, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`px-6 py-4
                  ${i % 2 !== 0 ? 'border-l border-white/40' : ''}
                  ${i >= 2 ? 'border-t border-white/40' : ''}
                  md:${i % 4 !== 0 ? 'border-l' : 'border-l-0'}
                  md:border-t-0
                `}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-orange-400">{stat.num}</div>
                <div className="text-white/60 text-sm font-semibold mt-2">{stat.label}</div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <TrustedMarquee />

      {/* ── PROBLEM SECTION ── */}
      <div className="py-16 md:py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
            <p className="text-4xl mb-3">😮‍💨</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Pening kepala bila<br />anak tak nak belajar?</h2>
            <p className="text-white/65 text-lg">Kalau salah satu ni rasa familiar — anda bukan keseorangan...</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch auto-rows-fr">
            {[
            { emoji: '😤', pain: '"Anak main game je, tak nak belajar"', desc: 'Screen time jadi perang setiap malam. Stress anak, stress ibu bapa.' },
            { emoji: '💸', pain: '"Dah bayar tuisyen RM300, result sama je"', desc: 'Wang habis tapi anak masih tak faham apa yang diajar.' },
            { emoji: '😰', pain: '"Exam dah dekat, anak masih tak hafal"', desc: 'Pressure menjelang peperiksaan. Semua orang dalam rumah tegang.' },
            { emoji: '😪', pain: '"Kerja sampai malam, tak sempat nak ajar"', desc: 'Ibu bapa penat, anak perlukan bantuan. Tiada masa yang cukup.' }].
            map((p, i) =>
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative z-0 h-full min-h-[132px] md:min-h-[118px] flex items-start gap-3 sm:gap-4 bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-xl text-left min-w-0 overflow-hidden">
                <span className="text-3xl w-10 h-10 flex-shrink-0 flex items-center justify-center">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white mb-1 leading-snug">{p.pain}</p>
                  <p className="text-white/65 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            )}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-10">
            <p className="text-xl font-bold text-white/80">Mestilah ada cara lain yang lebih senang...</p>
            <p className="text-2xl font-black text-orange-500 mt-2">ADA. Jom tengok 👇</p>
          </motion.div>
        </div>
      </div>

      {/* ── SOLUTION / FEATURES ── */}
      <div id="features" className="py-12 md:py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="inline-block bg-green-100 text-green-700 font-black px-4 py-1.5 rounded-full text-sm mb-4">✅ SOLUSI SCREEN TIME BERFAEDAH</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Perkenalkan — <span className="text-orange-500">CeriaKid</span><br />Latihan Harian Yang Anak Tak Cepat Bosan</h2>
            <p className="text-lg text-white/65 max-w-2xl mx-auto">Permainan edukatif berasaskan topik sekolah Malaysia. Anak rasa macam main game, ibu bapa pula nampak perkembangan pembelajaran.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
            { icon: '🎮', title: 'Latihan Rasa Macam Game', desc: 'Soalan pendek, warna ceria dan feedback segera bantu anak kekal fokus tanpa rasa terbeban.' },
            { icon: '📊', title: 'Ibu Bapa Boleh Pantau', desc: 'Lihat markah, percubaan dan topik yang anak perlukan lebih latihan melalui dashboard.' },
            { icon: '📲', title: 'Sesuai Untuk Rutin Harian', desc: 'Gunakan 5–10 minit sehari di rumah, dalam kereta atau bila anak ada masa lapang.' }].
            map((f, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/10 rounded-3xl p-7 border border-white/15 text-center mx-auto hover:bg-white/15 transition-all shadow-xl backdrop-blur-xl">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )}
          </div>

          {/* Subjects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/866fc318d_generated_image.png', icon: '🇲🇾', sub: 'Bahasa Melayu', word: 'Baca • Eja • Faham', info: 'Latihan ayat mudah dan kosa kata harian.', color: 'from-blue-500 via-sky-400 to-cyan-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🇬🇧', sub: 'English', word: 'Read • Speak • Play', info: 'Belajar perkataan English dengan cara seronok.', color: 'from-emerald-500 via-green-400 to-lime-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e595cc1aa_generated_image.png', icon: '🔢', sub: 'Matematik', word: 'Kira • Banding • Selesaikan', info: 'Nombor dan operasi asas dalam bentuk game.', color: 'from-violet-500 via-purple-400 to-fuchsia-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/866fc318d_generated_image.png', icon: '🧪', sub: 'Sains', word: 'Lihat • Tanya • Cuba', info: 'Kenal alam, haiwan dan eksperimen ringkas.', color: 'from-orange-500 via-amber-400 to-yellow-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🕌', sub: 'Jawi', word: 'Kenal • Sebut • Tulis', info: 'Huruf Jawi dan suku kata secara perlahan.', color: 'from-teal-500 via-cyan-400 to-blue-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e595cc1aa_generated_image.png', icon: '🌺', sub: 'Tamil', word: 'அ • சொல் • வாசி', info: 'Asas huruf dan perkataan Tamil untuk anak.', color: 'from-rose-500 via-pink-400 to-orange-300' },
            { img: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/637932d3e_generated_image.png', icon: '🏮', sub: 'Mandarin', word: '听 • 说 • 认字', info: 'Kenal bunyi, nombor dan perkataan Mandarin.', color: 'from-red-500 via-orange-400 to-yellow-300' }].
            map((s, i) =>
            <motion.div key={s.sub} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ delay: i * 0.06 }} className="overflow-hidden rounded-2xl bg-white/10 border border-white/20 shadow-xl backdrop-blur-xl">
                <div className="relative h-36 overflow-hidden">
                  <img src={s.img} alt={`Budak belajar ${s.sub}`} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${s.color} opacity-55`} />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-md">{s.icon} {s.sub}</div>
                </div>
                <div className="p-4 text-left">
                  <h3 className="font-black text-white text-lg leading-tight">{s.word}</h3>
                  <div className="mt-3 bg-white/90 text-slate-800 rounded-xl px-3 py-2 shadow-lg">
                    <p className="font-black text-xs text-slate-900">Info belajar</p>
                    <p className="text-xs font-bold text-slate-600 leading-snug mt-0.5">{s.info}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── INVESTOR WOW ── */}
      <div className="py-12 md:py-16 px-6 bg-gradient-to-r from-yellow-100/95 via-orange-100/95 to-pink-100/95 text-slate-900 border-y border-yellow-200/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <span className="inline-block bg-orange-100 text-orange-700 border border-orange-300/70 font-black px-4 py-1.5 rounded-full text-sm mb-4">🚀 SEMUA DALAM SATU APP</span>
            <h2 className="text-3xl md:text-4xl font-black mb-3 text-slate-900">Lebih Mudah Untuk Anak Belajar, Lebih Senang Untuk Ibu Bapa Pantau</h2>
            <p className="text-slate-700 max-w-2xl mx-auto">CeriaKid gabungkan game interaktif, dashboard ibu bapa, kandungan KSSR, bahan latihan dan progress tracking dalam satu pengalaman yang mudah digunakan.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: '🎮', title: 'Game Engine', desc: 'Soalan interaktif pelbagai format untuk subjek utama.' },
              { icon: '📊', title: 'Parent Analytics', desc: 'Pantau skor, progress, streak dan prestasi anak.' },
              { icon: '📚', title: 'BBM Library', desc: 'Bahan bantu mengajar untuk guru dan ibu bapa.' },
              { icon: '🔒', title: 'Pembelajaran Selamat', desc: 'Pengalaman tanpa iklan dan lebih terkawal untuk kanak-kanak.' }
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-3xl p-5 border border-orange-200/70 bg-white/80 backdrop-blur-xl shadow-xl shadow-orange-200/30">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black text-lg mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="py-12 md:py-16 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <h2 className="text-3xl font-black text-white mb-3">Mulakan Dalam 3 Langkah</h2>
            <p className="text-white/65">Setup dalam 2 minit. Anak terus boleh mula belajar.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            { step: '1', icon: '📲', title: 'Daftar & Langganan', desc: 'Buka app, pilih pelan, dan mula belajar dalam masa 2 minit.' },
            { step: '2', icon: '🎯', title: 'Pilih Peringkat Anak', desc: 'Prasekolah atau Sekolah Rendah. App auto-suggest permainan yang sesuai.' },
            { step: '3', icon: '🏆', title: 'Anak Terus Main & Belajar', desc: 'Pantau progress dari dashboard. Lihat markah naik minggu demi minggu.' }].
            map((s, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 text-white rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-xl shadow-orange-950/30">{s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-black text-white mb-2">{s.title}</h3>
                <p className="text-white/65 text-sm">{s.desc}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials" className="py-12 md:py-16 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_, i) => <span key={i} className="text-2xl text-orange-400">★</span>)}</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Ini Kata Ibu Bapa<br />Yang Dah Cuba Sendiri</h2>
            <p className="text-white/65">Bukan kami cakap — mereka yang cerita sendiri 👇</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) =>
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/10 rounded-3xl p-6 border border-white/15 flex flex-col justify-between shadow-xl backdrop-blur-xl">
                <div>
                  <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_, j) => <span key={j} className="text-orange-400">★</span>)}</div>
                  <p className="text-white/80 mb-4 leading-relaxed text-sm">"{t.quote}"</p>
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full mb-4">✅ {t.highlight}</div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <p className="font-black text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" className="py-12 md:py-16 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <span className="inline-block bg-green-500/25 text-green-100 font-black px-4 py-1.5 rounded-full text-sm mb-4 border border-green-300/30">
              Pelan tahunan mesra bajet keluarga
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Pilih Pelan Anda</h2>
            <p className="text-white/60">Pilih pelan yang sesuai untuk umur anak. Semua pelan tahunan dan mesra bajet keluarga.</p>
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
                { background: 'linear-gradient(135deg, rgba(251,191,36,0.95), rgba(245,158,11,0.9), rgba(217,119,6,0.88))', backdropFilter: 'blur(20px)' } :
                { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }
              }
              >
              
                {tier.savings &&
                <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 ${tier.highlighted ? 'bg-white text-orange-700 border border-white' : 'bg-white/15 text-white border border-white/20'}`}>
                   💰 {tier.savings}
                 </div>
                }

                <h3 className="text-2xl font-black mb-2 text-white">{tier.nameMY}</h3>

                <div className="flex items-baseline gap-1 mb-0.5">
                 <span className="text-3xl font-black text-yellow-300">RM{tier.priceMYR}</span>
                 <span className="text-sm font-bold text-white/60">{tier.period}</span>
                </div>
                <p className="text-xs font-bold mb-6 text-white/50">
                 ≈ RM{tier.perMonth}/bulan
                </p>

                <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTierSelect(tier.name)}
                className={`w-full py-3.5 rounded-2xl font-black text-base mb-6 shadow-md transition-all ${
                tier.highlighted ? 'bg-slate-950 text-yellow-200 hover:bg-slate-900' : 'bg-orange-600 text-white hover:bg-orange-700'} ${
                selectedTierForCheckout === tier.name ? 'ring-4 ring-yellow-300' : ''}`}>
                
                  {tier.cta}
                </motion.button>

                <div className="space-y-2.5">
                  {tier.features.map((f, j) =>
                <div key={j} className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </div>
                )}
                  {tier.noFeatures.map((f, j) =>
                <div key={j} className="flex items-center gap-2 text-sm font-semibold opacity-40 text-white">
                      <span className="w-4 flex-shrink-0">✕</span> {f}
                    </div>
                )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Checkout Form - Always visible */}
          <motion.div
            id="checkout-form"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-8 border-2 border-orange-200/70 rounded-3xl p-4 md:p-6 max-w-lg mx-auto shadow-xl shadow-orange-200/30 bg-white/85 backdrop-blur-xl">
            
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Daftar & Bayar 🔒</h3>
              <p className="text-xs md:text-sm text-slate-600 mt-1 leading-snug">Pilih pakej, isi maklumat dan teruskan ke pembayaran FPX yang selamat.</p>
            </div>
            <PricingCheckout selectedTier={selectedTierForCheckout} onTierChange={setSelectedTierForCheckout} />
          </motion.div>

          {/* Trust */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-5 border border-orange-200/70 rounded-2xl p-3 md:p-4 text-center max-w-xl mx-auto shadow-lg shadow-orange-200/25 bg-white/85 backdrop-blur-xl">
            <div className="text-2xl mb-1">🛡️</div>
            <h3 className="text-base font-black text-slate-900 mb-1">Direka Untuk Kanak-kanak Malaysia</h3>
            <p className="text-slate-600 text-xs md:text-sm leading-snug">Tanpa iklan, kandungan mesra keluarga, progress boleh dipantau ibu bapa, dan pembelajaran disusun mengikut tahap umur. 💪</p>
          </motion.div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-3xl mx-auto text-center">
            {['🔒 Pembayaran FPX selamat', '💳 Pelan tahunan jelas', '📊 Pantau progress anak'].map((item) => (
              <div key={item} className="rounded-xl bg-white/90 border border-orange-200/70 px-3 py-2 text-slate-800 text-xs md:text-sm font-bold shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" className="py-12 md:py-16 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Soalan Lazim 🤔</h2>
            <p className="text-white/65">Jawapan ringkas sebelum ibu bapa mula menggunakan CeriaKid.</p>
          </div>
          <div className="space-y-4">
            {[
            { q: 'Adakah selamat untuk anak?', a: 'Ya, 100%! Tiada iklan, tiada pop-up, tiada chat dengan orang asing. App direka khas untuk keselamatan kanak-kanak.' },
            { q: 'Apakah peranti yang disokong?', a: 'Semua jenis smartphone, tablet, dan komputer. iOS, Android, dan browser. Boleh download untuk guna offline.' },
            { q: 'Bagaimana langganan berfungsi?', a: 'CeriaKid menggunakan pelan tahunan. Anda boleh semak status langganan dan maklumat akaun di bahagian tetapan selepas mendaftar.' },
            { q: 'Adakah ikut silibus sekolah Malaysia?', a: 'Ya — kami ikut KSSR (Kurikulum Standard Sekolah Rendah) sepenuhnya. Sama persis dengan apa yang diajar di sekolah, Darjah 1-6.' },
            { q: 'Berapa anak boleh guna?', a: 'Pelan Asas untuk Prasekolah (1 anak), Standard untuk Sekolah Rendah (1 anak). Pelan Keluarga untuk kedua-dua peringkat dengan sehingga 4 profil anak — jimat lebih!' },
            { q: 'Macam mana nak mula?', a: 'Pilih pelan, isikan maklumat, bayar melalui FPX, dan anak terus boleh mula belajar dalam masa 2 minit!' }].
            map((faq, i) =>
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/10 rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all shadow-lg backdrop-blur-xl">
                <p className="font-black text-white mb-1.5">❓ {faq.q}</p>
                <p className="text-white/65 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="py-12 md:py-16 px-6 text-white border-y border-white/10" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.22), rgba(236,72,153,0.20), rgba(139,92,246,0.22))', backdropFilter: 'blur(18px)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <p className="text-5xl mb-5">🎓</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Anak Anda Layak Dapat<br />Yang Terbaik</h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Mulakan dengan latihan pendek yang anak boleh konsisten buat setiap hari — lebih mudah, lebih ceria, lebih teratur.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPricing}
              className="px-8 py-4 bg-white text-game-purple rounded-full font-black text-lg shadow-2xl inline-flex items-center gap-3">
              
              🎮 Pilih Pelan Sekarang <ArrowRight className="w-6 h-6" />
            </motion.button>
            <p className="text-white/80 text-sm mt-5">✅ Setup 2 minit &nbsp;•&nbsp; ✅ Tanpa iklan &nbsp;•&nbsp; ✅ Dashboard ibu bapa</p>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="text-white py-8 text-center md:py-10 relative" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-black text-lg mb-1">🎓 CeriaKid © 2026</p>
        <p className="text-white/80 text-sm mb-5">Ceria belajar, suka bermain, maju bersama! 🎮📚</p>
        <div className="flex justify-center gap-6 text-xs text-white/60">
          <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Terma Penggunaan</a>
          <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Dasar Privasi</a>
          <a href="mailto:support@ceriakid.com" className="cursor-pointer hover:text-white">Hubungi Kami</a>
        </div>
      </footer>

      </div>
    </div>);

}