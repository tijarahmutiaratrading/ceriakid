import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppHeader from '@/components/AppHeader';
import InteractiveGameDemo from '@/components/landing/InteractiveGameDemo';
import PricingCheckout from '@/components/PricingCheckout';

// Countdown Timer Hook
function useCountdown(minutes = 15) {
  const [time, setTime] = useState({ m: minutes, s: 0 });
  useEffect(() => {
    const end = Date.now() + minutes * 60 * 1000;
    const interval = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) { setTime({ m: 0, s: 0 }); clearInterval(interval); return; }
      setTime({ m: Math.floor(diff / 60000), s: Math.floor((diff % 60000) / 1000) });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

const testimonials = [
  { name: 'Nurul Ain', location: 'Shah Alam, Selangor', quote: 'Anak saya dulu taknak buka buku langsung. 2 minggu pakai Jom Belajar, markah BM naik 20 markah! Betul-betul terkejut.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2b50ffa6a_generated_image.png', highlight: 'markah naik 20 markah' },
  { name: 'Ismail Hashim', location: 'Johor Bahru, Johor', quote: 'Sebelum ni bayar tuisyen RM300 sebulan. Sekarang RM24.90 je, anak lagi enjoy belajar. Dashboard tu best, boleh tengok progress real-time.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0120578d7_generated_image.png', highlight: 'jimat RM275 sebulan' },
  { name: 'Rohani Bakar', location: 'Kota Bharu, Kelantan', quote: 'Tiga orang anak pakai satu akaun Pro. Berbaloi sangat! Anak yang paling kecil pun dah kenal huruf dan nombor dalam masa sebulan.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b20705224_generated_image.png', highlight: '3 anak, 1 akaun' },
  { name: 'Faridah Mohamad', location: 'Penang', quote: 'Saya kerja shift, tak sempat nak duduk ajar anak. Jom Belajar macam cikgu peribadi — anak boleh belajar sendiri, saya boleh pantau dari jauh.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2b50ffa6a_generated_image.png', highlight: 'belajar sendiri, pantau dari jauh' },
  { name: 'Ahmad Zulkifli', location: 'Kuching, Sarawak', quote: 'Anak autisme saya sangat suka! Gameplay yang consistent dan tak ada terlalu banyak distraction. Cikgu dia pun recommend.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0120578d7_generated_image.png', highlight: 'cikgu pun recommend' },
  { name: 'Siti Hajar', location: 'Ipoh, Perak', quote: 'Cuba dulu versi free, terus upgrade sebab content dia bagus gila. Ikut KSSR betul-betul, sama macam yang sekolah ajar.', stars: 5, avatar: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b20705224_generated_image.png', highlight: 'ikut KSSR betul-betul' },
];

const tiers = [
  {
    name: 'asas',
    nameMY: '🌱 Asas',
    priceMYR: '49',
    perMonth: '4.08',
    period: '/tahun',
    features: ['Semua subjek', 'Prasekolah sahaja', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan'],
    noFeatures: ['Sekolah Rendah', 'Sehingga 4 anak'],
    cta: 'Mulakan Sekarang',
    highlighted: false,
  },
  {
    name: 'standard',
    nameMY: '⭐ Standard',
    priceMYR: '99',
    perMonth: '8.25',
    period: '/tahun',
    savings: 'PALING POPULAR',
    features: ['Semua subjek', 'Sekolah Rendah sahaja', 'Dashboard ibu bapa', 'Tanpa iklan', 'Boleh guna offline 📲', 'Kemas kini mingguan'],
    noFeatures: ['Sehingga 4 anak'],
    cta: '🔥 Pilih Standard',
    highlighted: true,
  },
  {
    name: 'keluarga',
    nameMY: '👑 Keluarga',
    priceMYR: '199',
    perMonth: '16.58',
    period: '/tahun',
    features: ['Semua subjek', 'Prasekolah & Sekolah Rendah', 'Sehingga 4 profil anak', 'Dashboard ibu bapa lengkap', 'Boleh guna offline 📲', 'Sokongan prioriti'],
    noFeatures: [],
    cta: 'Pilih Keluarga',
    highlighted: false,
  },
];

const avatars = [
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2b50ffa6a_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0120578d7_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b20705224_generated_image.png',
];

export default function Landing() {
   const countdown = useCountdown(15);
   const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('standard');
   const { isAuthenticated, refreshAuth } = useAuth();
   const navigate = useNavigate();



   const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen font-nunito" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fff3e6 40%, #fff9f0 100%)' }}>
      <AppHeader />



      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-black text-gray-900">🎓 <span className="text-orange-500">Jom Belajar</span></div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a href="#features" className="hover:text-orange-500 transition-colors">Ciri-ciri</a>
          <a href="#testimonials" className="hover:text-orange-500 transition-colors">Testimoni</a>
          <a href="#pricing" className="hover:text-orange-500 transition-colors">Harga</a>
          <a href="#faq" className="hover:text-orange-500 transition-colors">Soalan Lazim</a>
        </div>
        <div className="flex items-center gap-3">
           <motion.button whileTap={{ scale: 0.95 }} onClick={() => base44.auth.redirectToLogin('/dashboard')} className="px-5 py-2.5 bg-orange-500 text-white rounded-full font-black text-sm shadow-md">
             Log Masuk
           </motion.button>
         </div>
      </nav>

      {/* ── HERO ── */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text */}
          <div>
            {/* Social proof pill */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-2 mb-8 shadow-sm">
              <div className="flex -space-x-2">
                {avatars.map((a, i) => (
                  <img key={i} src={a} className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <span key={i} className="text-orange-400 text-xs">★</span>)}</div>
              <span className="text-xs font-black text-gray-700">Dah dipercayai <span className="text-orange-500">5,000+ keluarga</span> 🇲🇾</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-black leading-tight text-gray-900 mb-4">
              Anak Malas<br />Belajar?{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Tukar Jadi</span>
                <span className="absolute inset-0 bg-yellow-300 rounded-lg transform -rotate-1 z-0"></span>
              </span>
              {' '}Suka! 🎉
            </motion.h1>

            {/* Subtext */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-lg text-gray-600 mb-2 font-bold text-orange-500">
              Belajar Sambil Main, Markah Pasti Naik
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-gray-600 mb-8 leading-relaxed">
              200+ permainan interaktif ikut silibus <strong>KSSR</strong> — Bahasa Melayu, English, Matematik, Sains & Jawi. Anak seronok, markah naik, ibu bapa tenang. ✅
            </motion.p>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-col sm:flex-row gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToPricing}
                className="px-6 py-3 bg-orange-500 text-white rounded-full font-black text-base shadow-lg flex items-center gap-2 justify-center"
              >
                🎮 Dapatkan Akses Sekarang <ArrowRight className="w-4 h-4" />
              </motion.button>
              <Link to="/dashboard">
                <button className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-bold text-base hover:border-orange-400 transition-colors w-full sm:w-auto">
                  Log Masuk →
                </button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 text-sm text-gray-600">
              {['✅ Ikut silibus KSSR', '✅ Tiada iklan', '✅ Jaminan Wang Balik 30 Hari'].map((t, i) => (
                <span key={i} className="font-semibold">{t}</span>
              ))}
            </motion.div>

            {/* Star rating */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex items-center gap-2 mt-5">
              <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <span key={i} className="text-orange-400 text-xl">★</span>)}</div>
              <span className="text-sm font-bold text-gray-600">4.9/5 — lebih <span className="text-orange-500 font-black">1,200</span> ibu bapa dah bagi review! 😍</span>
            </motion.div>
          </div>

          {/* Right: Game Demo */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: 'spring', damping: 20 }}>
            <div className="relative">
              {/* Floating badge */}
              <div className="absolute -top-4 -left-4 z-10 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">200+ Permainan</p>
                  <p className="text-xs font-black text-orange-500">Cuba sekarang!</p>
                </div>
              </div>
              <InteractiveGameDemo />
              {/* Rating badge */}
              <div className="absolute -bottom-4 -right-4 z-10 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Rating Ibu Bapa</p>
                  <p className="text-sm font-black text-gray-800">4.9 / 5.0</p>
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
                { icon: '💰', text: 'Jaminan 30 Hari' },
              ].map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-white border border-orange-100 rounded-full px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                  {s.icon} {s.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>


      </div>

      {/* ── STATS STRIP ── */}
      <div className="py-6 md:py-12" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 text-center">
            {[
              { num: '5,000+', label: 'Keluarga Aktif', icon: '👨‍👩‍👧' },
              { num: '200+', label: 'Permainan', icon: '🎮' },
              { num: '4.9/5', label: 'Rating', icon: '⭐' },
              { num: '92%', label: 'Markah Anak Naik', icon: '📈' },
            ].map((stat, i) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM SECTION ── */}
      <div className="py-16 px-6" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fffaf5 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
            <p className="text-4xl mb-3">😮‍💨</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Pening kepala bila<br />anak tak nak belajar?</h2>
            <p className="text-gray-500 text-lg">Kalau salah satu ni rasa familiar — anda bukan keseorangan...</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { emoji: '😤', pain: '"Anak main game je, tak nak belajar"', desc: 'Screen time jadi perang setiap malam. Stress anak, stress ibu bapa.' },
              { emoji: '💸', pain: '"Dah bayar tuisyen RM300, result sama je"', desc: 'Wang habis tapi anak masih tak faham apa yang diajar.' },
              { emoji: '😰', pain: '"Exam dah dekat, anak masih tak hafal"', desc: 'Pressure menjelang peperiksaan. Semua orang dalam rumah tegang.' },
              { emoji: '😪', pain: '"Kerja sampai malam, tak sempat nak ajar"', desc: 'Ibu bapa penat, anak perlukan bantuan. Tiada masa yang cukup.' },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4 bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <p className="font-black text-gray-900 mb-1">{p.pain}</p>
                  <p className="text-gray-500 text-sm">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-10">
            <p className="text-xl font-bold text-gray-700">Mestilah ada cara lain yang lebih senang...</p>
            <p className="text-2xl font-black text-orange-500 mt-2">ADA. Jom tengok 👇</p>
          </motion.div>
        </div>
      </div>

      {/* ── SOLUTION / FEATURES ── */}
      <div id="features" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <span className="inline-block bg-green-100 text-green-700 font-black px-4 py-1.5 rounded-full text-sm mb-4">✅ PENYELESAIAN TERBUKTI</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Perkenalkan — <span className="text-orange-500">Jom Belajar</span><br />Cikgu Peribadi Yang Sentiasa Ada</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Permainan edukatif yang direka bersama cikgu berpengalaman. Anak rasa macam main game, tapi sebenarnya belajar.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { icon: '🎮', title: 'Belajar Sambil Main', desc: '200+ permainan interaktif. Anak tak sedar pun dia tengah belajar — tapi otak dia dah absorb semua.' },
              { icon: '📊', title: 'Pantau Progress Anak', desc: 'Dashboard ibu bapa tunjuk apa yang anak dah belajar, markah, dan mana yang perlu lebih latihan.' },
              { icon: '📲', title: 'Boleh Main Offline', desc: 'Dalam kereta, dalam flight, tiada wifi — tak kisah. App boleh dimuat turun ke telefon.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-orange-50 rounded-2xl p-7 border border-orange-100 text-center mx-auto hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Subjects */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '🇲🇾', sub: 'Bahasa Melayu', count: '50+' },
              { icon: '🇬🇧', sub: 'English', count: '45+' },
              { icon: '🔢', sub: 'Matematik', count: '50+' },
              { icon: '🧪', sub: 'Sains', count: '45+' },
              { icon: '🕌', sub: 'Jawi', count: '30+' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="font-black text-gray-800 text-sm">{s.sub}</div>
                <div className="text-orange-500 font-black text-xs mt-1">{s.count} permainan</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="py-16 px-6" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fffaf5 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Mulakan Dalam 3 Langkah</h2>
            <p className="text-gray-500">Setup dalam 2 minit. Anak terus boleh mula belajar.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📲', title: 'Daftar & Langganan', desc: 'Buka app, pilih pelan, dan mula belajar dalam masa 2 minit.' },
              { step: '2', icon: '🎯', title: 'Pilih Peringkat Anak', desc: 'Prasekolah atau Sekolah Rendah. App auto-suggest permainan yang sesuai.' },
              { step: '3', icon: '🏆', title: 'Anak Terus Main & Belajar', desc: 'Pantau progress dari dashboard. Lihat markah naik minggu demi minggu.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md">{s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div id="testimonials" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-14">
            <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_,i) => <span key={i} className="text-2xl text-orange-400">★</span>)}</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Ini Kata Ibu Bapa<br />Yang Dah Cuba Sendiri</h2>
            <p className="text-gray-500">Bukan kami cakap — mereka yang cerita sendiri 👇</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_,j) => <span key={j} className="text-orange-400">★</span>)}</div>
                  <p className="text-gray-700 mb-4 leading-relaxed text-sm">"{t.quote}"</p>
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full mb-4">✅ {t.highlight}</div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-orange-100">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-orange-200" />
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" className="py-16 px-6" style={{ background: 'linear-gradient(160deg, #fff8f0 0%, #fffaf5 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <span className="inline-block bg-red-100 text-red-500 font-black px-4 py-1.5 rounded-full text-sm mb-4">
              ⏱️ Tawaran Tamat Dalam: {String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Pilih Pelan Anda</h2>
            <p className="text-gray-500">Pilih pelan yang sesuai. Cancel bila-bila masa. Jaminan 30 hari.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-6 relative border-2 transition-all ${
                  tier.highlighted
                    ? 'bg-orange-500 border-orange-400 shadow-2xl md:scale-105'
                    : 'bg-white border-gray-200 shadow-md hover:border-orange-300'
                }`}
              >
                {tier.savings && (
                  <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 ${tier.highlighted ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                    💰 {tier.savings}
                  </div>
                )}

                <h3 className={`text-2xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>{tier.nameMY}</h3>

                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className={`text-3xl font-black ${tier.highlighted ? 'text-white' : 'text-orange-500'}`}>RM{tier.priceMYR}</span>
                  <span className={`text-sm font-bold ${tier.highlighted ? 'text-white/80' : 'text-gray-400'}`}>{tier.period}</span>
                </div>
                <p className={`text-xs font-bold mb-6 ${tier.highlighted ? 'text-yellow-200' : 'text-gray-400'}`}>
                  ≈ RM{tier.perMonth}/bulan
                </p>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTierSelect(tier.name)}
                  className={`w-full py-3.5 rounded-2xl font-black text-base mb-6 shadow-md transition-all ${
                    tier.highlighted ? 'bg-white text-orange-500 hover:bg-yellow-50' : 'bg-orange-500 text-white hover:bg-orange-600'
                  } ${selectedTierForCheckout === tier.name ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {tier.cta}
                </motion.button>

                <div className="space-y-2.5">
                  {tier.features.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-sm font-semibold ${tier.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                    </div>
                  ))}
                  {tier.noFeatures.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-sm font-semibold opacity-40 ${tier.highlighted ? 'text-white' : 'text-gray-500'}`}>
                      <span className="w-4 flex-shrink-0">✕</span> {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkout Form - Always visible */}
          <motion.div
            id="checkout-form"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-10 bg-white border-2 border-orange-200 rounded-3xl p-6 md:p-10 max-w-lg mx-auto shadow-xl"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900">Daftar & Bayar 🔒</h3>
              <p className="text-sm text-gray-400 mt-1">Pilih pakej di bawah dan isi maklumat untuk checkout</p>
            </div>
            <PricingCheckout selectedTier={selectedTierForCheckout} onTierChange={setSelectedTierForCheckout} />
          </motion.div>

          {/* Money Back */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-10 bg-white border border-green-200 rounded-2xl p-6 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Jaminan Wang Balik 30 Hari</h3>
            <p className="text-gray-500 text-sm">Tidak berpuas hati dalam 30 hari? Kami pulangkan wang anda sepenuhnya — tanpa soal tanya. Kami yakin dengan produk kami. 💪</p>
          </motion.div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Soalan Lazim 🤔</h2>
          <div className="space-y-4">
            {[
              { q: 'Adakah selamat untuk anak?', a: 'Ya, 100%! Tiada iklan, tiada pop-up, tiada chat dengan orang asing. App direka khas untuk keselamatan kanak-kanak.' },
              { q: 'Apakah peranti yang disokong?', a: 'Semua jenis smartphone, tablet, dan komputer. iOS, Android, dan browser. Boleh download untuk guna offline.' },
              { q: 'Boleh cancel bila-bila masa?', a: 'Ya! Cancel dari settings dalam 10 saat. Tiada penalti, tiada fee tersembunyi. Janji kami.' },
              { q: 'Adakah ikut silibus sekolah Malaysia?', a: 'Ya — kami ikut KSSR (Kurikulum Standard Sekolah Rendah) sepenuhnya. Sama persis dengan apa yang diajar di sekolah, Darjah 1-6.' },
              { q: 'Berapa anak boleh guna?', a: 'Pelan Asas & Standard untuk 1 peringkat. Pelan Keluarga untuk Prasekolah & Sekolah Rendah dengan sehingga 4 profil anak — jimat lebih!' },
              { q: 'Macam mana nak mula?', a: 'Pilih pelan, isikan maklumat, bayar melalui FPX, dan anak terus boleh mula belajar dalam masa 2 minit!' },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-orange-50 rounded-2xl p-5 border border-orange-100 hover:border-orange-300 transition-colors">
                <p className="font-black text-gray-900 mb-1.5">❓ {faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="bg-orange-500 py-16 px-6 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <p className="text-5xl mb-5">🎓</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Anak Anda Layak Dapat<br />Yang Terbaik</h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Setiap hari yang berlalu tanpa belajar dengan cara yang betul ialah peluang yang terlepas. Mula hari ini.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPricing}
              className="px-8 py-4 bg-white text-orange-500 rounded-full font-black text-lg shadow-xl inline-flex items-center gap-3"
            >
              🎮 Pilih Pelan Sekarang <ArrowRight className="w-6 h-6" />
            </motion.button>
            <p className="text-white/80 text-sm mt-5">✅ Setup 2 minit &nbsp;•&nbsp; ✅ Jaminan Wang Balik 30 Hari &nbsp;•&nbsp; ✅ Cancel bila-bila</p>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-orange-600 text-white py-10 text-center">
        <p className="font-black text-lg mb-1">🎓 Jom Belajar © 2026</p>
        <p className="text-orange-100 text-sm mb-5">Belajar sambil bermain, bermain sambil belajar 🎮📚</p>
        <div className="flex justify-center gap-6 text-xs text-orange-200">
          <span className="cursor-pointer hover:text-white">Terma Penggunaan</span>
          <span className="cursor-pointer hover:text-white">Dasar Privasi</span>
          <span className="cursor-pointer hover:text-white">Hubungi Kami</span>
        </div>
      </footer>

    </div>
  );
}