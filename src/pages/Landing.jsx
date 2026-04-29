import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Shield, Star, Zap, Gift, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
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
    name: 'starter',
    nameMY: 'Starter',
    priceMYR: '24.90',
    originalPrice: null,
    period: '/bulan',
    games: '50+',
    features: ['50+ permainan', 'Prasekolah & Sekolah Rendah', 'Semua 4 mata pelajaran', 'Boleh guna offline 📲', 'Kemas kini mingguan'],
    noFeatures: ['Dashboard ibu bapa', 'Sehingga 4 anak'],
    cta: 'Mulakan Sekarang',
    highlighted: false,
    color: 'from-blue-100 to-blue-200',
  },
  {
    name: 'premium',
    nameMY: '🔥 Premium',
    priceMYR: '49.90',
    originalPrice: null,
    period: '/bulan',
    savings: 'PALING POPULAR',
    games: '150+',
    features: ['150+ permainan', 'Semua 4 mata pelajaran', 'Dashboard progres anak', 'Boleh guna offline 📲', 'Kemas kini mingguan', 'Sokongan WhatsApp'],
    noFeatures: [],
    cta: '🔥 Mulakan Sekarang',
    highlighted: true,
    color: 'from-orange-400 to-yellow-400',
  },
  {
    name: 'pro',
    nameMY: 'Pro Keluarga',
    priceMYR: '99.90',
    originalPrice: null,
    period: '/bulan',
    games: '200+',
    features: ['200+ permainan', 'Sehingga 4 anak', 'Laporan kemajuan PDF', 'Akses semua peringkat', 'Jawi & Worksheet', 'Sokongan Prioriti 24/7'],
    noFeatures: [],
    cta: 'Mulakan Pro',
    highlighted: false,
    color: 'from-purple-100 to-purple-200',
  },
];

export default function Landing() {
  const countdown = useCountdown(15);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState('premium');

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  const handleTierSelect = (tierName) => {
    setSelectedTierForCheckout(tierName);
    setTimeout(() => {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-nunito">

      {/* ── TOP URGENCY BAR ── */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2.5 px-4">
        <p className="text-sm font-black">
          🔥 TAWARAN TERHAD — Diskaun 50% untuk <span className="underline">50 pendaftar pertama</span> hari ini!
          &nbsp;⏱️ Tamat dalam: <span className="font-black text-yellow-200">{String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}</span>
        </p>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-black">🎓 <span className="text-game-purple">Jom Belajar</span></div>
        <div className="flex items-center gap-3">
          <Link to="/"><span className="text-sm text-gray-600 font-bold cursor-pointer hover:text-game-purple">Log Masuk</span></Link>
          <motion.button whileTap={{ scale: 0.95 }} onClick={scrollToPricing} className="px-5 py-2.5 bg-game-orange text-white rounded-full font-black text-sm shadow-md">
            Cuba Percuma →
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">

        {/* Social proof badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-300 rounded-full px-5 py-2.5">
            <div className="flex -space-x-2">
              {[testimonials[0], testimonials[1], testimonials[2]].map((t, i) => (
                <img key={i} src={t.avatar} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}</div>
            <span className="text-sm font-black text-green-800">5,000+ keluarga Malaysia guna setiap hari 🇲🇾</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5 text-gray-900">
            Anak Malas Belajar?<br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-game-orange">Tukar Jadi Suka</span>
              <span className="absolute inset-0 bg-yellow-200 rounded-lg transform -rotate-1 z-0"></span>
            </span>
            {" "}Dalam 7 Hari
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-semibold leading-relaxed">
            200+ permainan interaktif ikut silibus <strong>KSSR</strong> — Bahasa Melayu, English, Matematik, Sains & Jawi. Anak seronok, markah naik, ibu bapa tenang. ✅
          </p>
        </motion.div>

        {/* CTA Block */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToPricing}
            className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3"
          >
            🎮 Cuba PERCUMA Sekarang <ArrowRight className="w-6 h-6" />
          </motion.button>
          <p className="text-sm text-gray-500 font-semibold">✅ Tanpa kad kredit &nbsp;•&nbsp; ✅ Setup dalam 2 minit &nbsp;•&nbsp; ✅ Cancel bila-bila</p>
        </motion.div>

        {/* Quick trust signals */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: '🏆', text: 'Ikut KSSR 2024' },
            { icon: '🚫', text: 'Tiada Iklan' },
            { icon: '📲', text: 'Boleh Main Offline' },
            { icon: '🔒', text: '100% Selamat' },
            { icon: '💰', text: 'Jaminan 30 Hari' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
              <span>{s.icon}</span> {s.text}
            </div>
          ))}
        </motion.div>

        {/* Game Demo */}
        <InteractiveGameDemo />
      </div>

      {/* ── RESULTS / PROOF NUMBERS ── */}
      <div className="bg-gradient-to-r from-game-purple to-game-blue py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { num: '5,000+', label: 'Keluarga Aktif', icon: '👨‍👩‍👧' },
              { num: '200+', label: 'Permainan', icon: '🎮' },
              { num: '4.9/5', label: 'Rating', icon: '⭐' },
              { num: '92%', label: 'Markah Anak Naik', icon: '📈' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black">{stat.num}</div>
                <div className="text-white/80 text-sm font-semibold mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM SECTION ── */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-10">
            <p className="text-4xl mb-3">😮‍💨</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Rasanya familiar tak?</h2>
            <p className="text-gray-600 text-lg">Ramai ibu bapa Malaysia hadapi situasi ni setiap hari...</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { emoji: '😤', pain: '"Anak main game je, tak nak belajar"', desc: 'Screen time jadi perang setiap malam. Stress anak, stress ibu bapa.' },
              { emoji: '💸', pain: '"Dah bayar tuisyen RM200-400, result sama je"', desc: 'Wang habis tapi anak masih tak faham apa yang diajar.' },
              { emoji: '😰', pain: '"Exam dah dekat, anak masih tak hafal"', desc: 'Pressure menjelang UPSR/peperiksaan. Semua orang dalam rumah tegang.' },
              { emoji: '😪', pain: '"Kerja sampai malam, tak sempat nak ajar"', desc: 'Ibu bapa penat, anak perlukan bantuan. Tiada masa yang cukup.' },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-4 bg-red-50 border-l-4 border-red-400 rounded-xl p-5">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <p className="font-black text-gray-900 mb-1">{p.pain}</p>
                  <p className="text-gray-600 text-sm">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-10">
            <p className="text-2xl font-black text-gray-800">Kalau ada satu cara yang boleh <span className="text-game-orange">selesaikan semua ni</span>...</p>
            <p className="text-3xl font-black text-game-purple mt-2">Kami dah buatnya. 👇</p>
          </motion.div>
        </div>
      </div>

      {/* ── SOLUTION ── */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
          <span className="inline-block bg-green-100 text-green-700 font-black px-4 py-1.5 rounded-full text-sm mb-4">✅ SOLUSI TERBUKTI</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Jom Belajar — Cikgu Peribadi<br />Yang Sentiasa Ada</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Permainan edukatif yang direka bersama cikgu berpengalaman. Anak rasa macam main game, tapi sebenarnya belajar.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '🎮', title: 'Belajar Sambil Main', desc: '200+ permainan interaktif. Anak tak sedar pun dia tengah belajar — tapi otak dia dah absorb semua.' },
            { icon: '📊', title: 'Pantau Progress Anak', desc: 'Dashboard ibu bapa tunjuk apa yang anak dah belajar, markah, dan mana yang perlu lebih latihan.' },
            { icon: '📲', title: 'Boleh Main Offline', desc: 'Dalam kereta, dalam flight, tiada wifi — tak kisah. App boleh dimuat turun ke telefon.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-7 border-2 border-gray-100 shadow-md text-center hover:border-game-orange transition-all">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
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
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl p-4 text-center border-2 border-amber-100 shadow-sm">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="font-black text-gray-800 text-sm">{s.sub}</div>
              <div className="text-game-orange font-black text-xs mt-1">{s.count} permainan</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
            <div className="flex justify-center gap-1 mb-3">{[...Array(5)].map((_,i) => <span key={i} className="text-2xl text-yellow-400">★</span>)}</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Ibu Bapa Dah Buktikan</h2>
            <p className="text-gray-600">Bukan kami cakap — mereka yang cerita sendiri 👇</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-3">{[...Array(t.stars)].map((_,j) => <span key={j} className="text-yellow-400">★</span>)}</div>
                  <p className="text-gray-800 mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="inline-block bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full mb-4">✅ {t.highlight}</div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-amber-200">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-amber-300" />
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Mulakan Dalam 3 Langkah</h2>
          <p className="text-gray-600">Setup dalam 2 minit. Anak terus boleh mula belajar.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '📲', title: 'Daftar Percuma', desc: 'Buka app, daftar dengan email. Tiada kad kredit diperlukan.' },
            { step: '2', icon: '🎯', title: 'Pilih Peringkat Anak', desc: 'Prasekolah atau Sekolah Rendah. App auto-suggest permainan yang sesuai.' },
            { step: '3', icon: '🏆', title: 'Anak Terus Main & Belajar', desc: 'Pantau progress dari dashboard. Lihat markah naik minggu demi minggu.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="w-14 h-14 bg-game-purple text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg">{s.step}</div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-4">
            <span className="inline-block bg-red-100 text-red-600 font-black px-4 py-1.5 rounded-full text-sm mb-4">
              ⏱️ Tawaran Tamat Dalam: {String(countdown.m).padStart(2,'0')}:{String(countdown.s).padStart(2,'0')}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Pilih Pelan Anda</h2>
            <p className="text-gray-600">Cuba percuma dulu. Upgrade bila-bila masa. Cancel senang je.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-7 relative overflow-hidden border-2 transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 shadow-2xl scale-105'
                    : 'bg-white border-gray-200 shadow-md'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-5 py-1.5 rounded-full text-xs font-black shadow-md">
                    🔥 PALING POPULAR
                  </div>
                )}

                {tier.savings && (
                  <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 mt-2 ${tier.highlighted ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    💰 {tier.savings}
                  </div>
                )}

                <h3 className={`text-2xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-900'}`}>{tier.nameMY}</h3>

                <div className="flex items-baseline gap-2 mb-1">
                  {tier.originalPrice && (
                    <span className={`text-sm line-through opacity-60 ${tier.highlighted ? 'text-white' : 'text-gray-400'}`}>RM{tier.originalPrice}</span>
                  )}
                  <span className={`text-3xl font-black ${tier.highlighted ? 'text-white' : 'text-game-orange'}`}>RM{tier.priceMYR}</span>
                </div>
                <p className={`text-sm font-bold mb-6 ${tier.highlighted ? 'text-white/80' : 'text-gray-500'}`}>{tier.period}</p>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTierSelect(tier.name)}
                  className={`w-full py-4 rounded-2xl font-black text-base mb-6 shadow-md transition-all ${
                    tier.highlighted ? 'bg-white text-orange-600 hover:bg-yellow-50' : 'bg-game-orange text-white hover:bg-orange-600'
                  } ${selectedTierForCheckout === tier.name ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {tier.cta}
                </motion.button>

                <div className="space-y-2.5">
                  {tier.features.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-sm font-semibold ${tier.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      <span className="text-green-400 font-black">✓</span> {f}
                    </div>
                  ))}
                  {tier.noFeatures.map((f, j) => (
                    <div key={j} className={`flex items-center gap-2 text-sm font-semibold opacity-50 ${tier.highlighted ? 'text-white' : 'text-gray-500'}`}>
                      <span>✕</span> {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Inline Checkout Form */}
          <AnimatePresence>
            {selectedTierForCheckout && (
              <motion.div
                id="checkout-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-10 bg-white border-2 border-game-purple rounded-3xl p-8 max-w-lg mx-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">Daftar & Bayar 🔒</h3>
                    <p className="text-sm text-gray-500 mt-1">Paket: <span className="font-black text-game-purple capitalize">{selectedTierForCheckout === 'starter' ? 'Starter — RM24.90/bln' : selectedTierForCheckout === 'premium' ? 'Premium — RM49.90/bln' : 'Pro Keluarga — RM99.90/bln'}</span></p>
                  </div>
                  <button onClick={() => setSelectedTierForCheckout(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-black">✕</button>
                </div>
                <PricingCheckout selectedTier={selectedTierForCheckout} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Money Back Guarantee */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-10 bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center max-w-xl mx-auto">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Jaminan Wang Balik 30 Hari</h3>
            <p className="text-gray-600 text-sm">Tidak berpuas hati dalam 30 hari? Kami pulangkan wang anda sepenuhnya — tanpa soal tanya. Kami yakin dengan produk kami. 💪</p>
          </motion.div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-10">Soalan Lazim 🤔</h2>
        <div className="space-y-4">
          {[
            { q: 'Adakah selamat untuk anak?', a: 'Ya, 100%! Tiada iklan, tiada pop-up, tiada chat dengan orang asing. App direka khas untuk keselamatan kanak-kanak.' },
            { q: 'Apakah peranti yang disokong?', a: 'Semua jenis smartphone, tablet, dan komputer. iOS, Android, dan browser. Boleh download untuk guna offline.' },
            { q: 'Boleh cancel bila-bila masa?', a: 'Ya! Cancel dari settings dalam 10 saat. Tiada penalti, tiada fee tersembunyi. Janji kami.' },
            { q: 'Adakah ikut silibus sekolah Malaysia?', a: 'Ya — kami ikut KSSR (Kurikulum Standard Sekolah Rendah) sepenuhnya. Sama persis dengan apa yang diajar di sekolah, Darjah 1-6.' },
            { q: 'Berapa anak boleh guna?', a: 'Premium untuk 1 anak. Pro untuk sehingga 4 anak dalam 1 akaun — jimat lebih!' },
            { q: 'Macam mana nak mula?', a: 'Daftar percuma dalam 2 minit. Terus boleh akses 5 permainan tanpa kad kredit. Seronok dulu, bayar kemudian!' },
          ].map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm hover:border-game-orange transition-all">
              <p className="font-black text-gray-900 mb-1.5">❓ {faq.q}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA SECTION ── */}
      <div className="bg-gradient-to-br from-game-purple to-game-blue py-16 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <p className="text-5xl mb-5">🎓</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">Anak Anda Layak Dapat<br />Yang Terbaik</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Setiap hari yang berlalu tanpa belajar dengan cara yang betul ialah peluang yang terlepas. Mula hari ini — percuma.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToPricing}
              className="px-10 py-5 bg-white text-game-purple rounded-2xl font-black text-xl shadow-2xl inline-flex items-center gap-3"
            >
              🎮 Cuba Percuma Sekarang <ArrowRight className="w-6 h-6" />
            </motion.button>
            <p className="text-white/60 text-sm mt-4">✅ Tanpa kad kredit &nbsp;•&nbsp; ✅ Setup 2 minit &nbsp;•&nbsp; ✅ Jaminan 30 hari</p>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p className="font-black text-lg mb-1">🎓 Jom Belajar © 2026</p>
        <p className="text-gray-400 text-sm mb-4">Belajar sambil bermain, bermain sambil belajar 🎮📚</p>
        <div className="flex justify-center gap-6 text-xs text-gray-500">
          <span className="cursor-pointer hover:text-white">Terma Penggunaan</span>
          <span className="cursor-pointer hover:text-white">Dasar Privasi</span>
          <span className="cursor-pointer hover:text-white">Hubungi Kami</span>
        </div>
      </footer>


    </div>
  );
}