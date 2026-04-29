import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Globe, Zap, Star, Lightbulb, Target, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PricingCheckout from '@/components/PricingCheckout';

export default function Landing() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('prasekolah');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTier, setSelectedTier] = useState('premium');

    const tiers = [
      {
        name: 'free',
        nameMY: 'Percuma',
        nameEN: 'Free',
        priceMYR: '0',
        games: '5',
        features: [
          '✅ 5 permainan percuma (tanpa kad kredit)',
          '✅ Peringkat Prasekolah sahaja',
          '✅ Dwibahasa (BM & Inggeris)',
          '✅ Tanpa iklan',
          '❌ Tanpa dashboard ibu bapa',
          '❌ Tanpa peringkat Sekolah Rendah',
        ],
        cta: 'Coba Percuma',
        highlighted: false,
      },
      {
        name: 'premium',
        nameMY: 'Premium',
        nameEN: 'Premium',
        priceMYR: '24.90',
        games: '100+',
        features: [
          '✅ 100+ permainan premium',
          '✅ Prasekolah & Sekolah Rendah',
          '✅ Semua mata pelajaran (BM, Inggeris, Matematik, Sains)',
          '✅ Dashboard progres ibu bapa yang LENGKAP',
          '✅ Tanpa iklan',
          '✅ Kemas kini permainan mingguan',
          '❌ Hanya 1 anak (Pro untuk 4 anak)',
        ],
        cta: 'Langganan Premium',
        highlighted: true,
      },
      {
        name: 'pro',
        nameMY: 'Pro (Keluarga)',
        nameEN: 'Pro (Family)',
        priceMYR: '44.90',
        games: '200+',
        features: [
          '✅ 200+ permainan eksklusif',
          '✅ Untuk 4 anak SEKALIGUS',
          '✅ Semua mata pelajaran + konten khas',
          '✅ Laporan pembelajaran bulanan (Email)',
          '✅ Sokongan prioritas 24/7',
          '✅ Mod luar talian (main tanpa internet)',
          '✅ NILAI TERBAIK: RM11.22 per anak/bulan',
        ],
        cta: 'Langganan Pro',
        highlighted: false,
      },
    ];

  const handleSubscribe = (tier) => {
    setSelectedTier(tier);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-20 -right-20 w-96 h-96 bg-game-pink rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-20 -left-20 w-96 h-96 bg-game-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute top-1/2 left-1/2 w-80 h-80 bg-game-blue rounded-full mix-blend-multiply filter blur-3xl opacity-15" animate={{ x: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      {/* Navbar */}
      <nav className="relative flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div className="text-2xl font-black" whileHover={{ scale: 1.05 }}>
          <span className="bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">
            Jom Belajar
          </span>
          <span className="text-3xl ml-2 inline-block animate-bounce">🎓</span>
        </motion.div>
        <a href="#pricing">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 rounded-full bg-gradient-to-r from-game-purple to-game-pink text-white font-bold shadow-lg hover:shadow-xl transition-all">
            Lihat Pakej ✨
          </motion.button>
        </a>
      </nav>

      {/* Hero */}
      <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 mb-16">
          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            Belajar Sambil <span className="bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent animate-pulse">Bermain</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-semibold">
            200+ permainan interaktif 🎮 | Sains, Matematik, Bahasa 📚 | Dwibahasa ✨
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
           <a href="#pricing">
             <motion.button whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-gradient-to-r from-game-purple to-game-pink text-white rounded-full font-bold flex items-center gap-3 shadow-xl hover:shadow-2xl text-lg">
               🚀 Mulai Sekarang <ArrowRight className="w-6 h-6" />
             </motion.button>
           </a>
           <motion.button whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white text-game-purple rounded-full font-bold shadow-xl hover:shadow-2xl border-2 border-game-purple text-lg">
             Coba Gratis 🎁
           </motion.button>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden shadow-2xl relative"
        >
          <div className="bg-gradient-to-br from-game-yellow via-game-pink to-game-blue aspect-video flex items-center justify-center text-8xl">
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="flex gap-4">
              <span>🎮</span>
              <span>📚</span>
              <span>🎨</span>
              <span>🔢</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="relative max-w-7xl mx-auto px-6 py-28">
        <h2 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">Mengapa Pilih Jom Belajar?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: '200+ Permainan', desc: 'Permainan seru untuk semua mata pelajaran', color: 'from-game-yellow to-game-orange' },
            { icon: Users, title: '2 Peringkat Umur', desc: 'Prasekolah & Sekolah Rendah dengan kandungan yang sesuai', color: 'from-game-pink to-game-purple' },
            { icon: Globe, title: 'Dwibahasa', desc: 'Bahasa Melayu & Inggeris dalam setiap permainan', color: 'from-game-blue to-game-purple' },
            { icon: Zap, title: 'Jejak Kemajuan', desc: 'Pantau kemajuan anak dengan dashboard ibu bapa', color: 'from-game-green to-game-blue' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -12, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className={`relative rounded-3xl p-8 text-center bg-gradient-to-br ${feature.color} shadow-xl overflow-hidden group cursor-pointer`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <feature.icon className="w-8 h-8 text-gray-700" />
              </motion.div>
              <h3 className="text-2xl font-black mb-3 text-white">{feature.title}</h3>
              <p className="text-white text-opacity-90 font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof - Parent Testimonials */}
      <div className="relative max-w-7xl mx-auto px-6 py-28">
        <h2 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-game-pink via-game-purple to-game-orange bg-clip-text text-transparent">Apa Kata Ibu Bapa? 💬</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Ibu Siti', kid: 'Amira (5 tahun)', quote: 'Amira sekarang suka belajar! Dulu susah nak belajar, tapi dengan permainan ini dia boleh main sambil belajar. Rating 5 bintang! ⭐⭐⭐⭐⭐', emoji: '👩‍👧', color: 'from-pink-100 to-red-100' },
            { name: 'Pak Ahmad', kid: 'Zain (7 tahun)', quote: 'Dashboard ibu bapa sangat membantu. Saya boleh lihat kemajuan Zain setiap hari. Lama tak jumpa nilai Matematik dia naik! 📈', emoji: '👨‍👦', color: 'from-blue-100 to-purple-100' },
            { name: 'Ibu Nurul', kid: 'Maya & Hana', quote: 'Paket Pro sangat bernilai! Dua anak saya boleh main bersama. Kemampuan mereka dalam Bahasa Inggeris semakin bagus. Terima kasih Jom Belajar! 🙏', emoji: '👩‍👧‍👧', color: 'from-yellow-100 to-orange-100' },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className={`relative rounded-3xl p-8 bg-gradient-to-br ${testimonial.color} shadow-xl border-2 border-white`}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.span className="text-5xl" animate={{ rotate: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>{testimonial.emoji}</motion.span>
                <div className="text-left">
                  <p className="font-black text-lg text-gray-800">{testimonial.name}</p>
                  <p className="text-sm font-semibold text-gray-600">{testimonial.kid}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-game-yellow text-game-yellow" />
                ))}
              </div>
              <p className="text-gray-800 italic font-medium">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="relative max-w-7xl mx-auto px-6 py-28">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Kurikulum Selaras', desc: 'Dirancang mengikuti Kurikulum KBSR Kementerian Pendidikan Malaysia', bg: 'bg-game-yellow' },
            { icon: Lightbulb, title: 'Terbukti Efektif', desc: '87% ibu bapa nampak peningkatan prestasi akademik dalam 4 minggu', bg: 'bg-game-pink' },
            { icon: Users, title: '10,000+ Keluarga', desc: 'Dipercayai oleh ribuan keluarga Malaysia sejak 2024', bg: 'bg-game-blue' },
          ].map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -10 }}
              className="text-center"
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl ${signal.bg}`}>
                <signal.icon className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-black mb-3 text-gray-800">{signal.title}</h3>
              <p className="text-gray-700 font-medium">{signal.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="relative max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">Paket Langganan</h2>
          <p className="text-xl text-gray-700 mb-10 font-semibold">Pilih paket yang sesuai untuk anak-anak Anda</p>

          {/* Age Group Selector */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl p-8 mb-12 inline-block border-2 border-white shadow-xl">
            <p className="text-sm font-black text-gray-700 mb-6 uppercase">Pilih peringkat untuk anak Anda</p>
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => setSelectedAgeGroup('prasekolah')}
                className={`rounded-2xl py-3 px-8 font-black text-sm transition-all shadow-lg ${
                  selectedAgeGroup === 'prasekolah'
                    ? 'bg-gradient-to-r from-game-yellow to-game-orange border-2 border-game-orange text-gray-900'
                    : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-game-yellow'
                }`}
              >
                👶 Pra Sekolah (3-5)
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => setSelectedAgeGroup('sekolah_rendah')}
                className={`rounded-2xl py-3 px-8 font-black text-sm transition-all shadow-lg ${
                  selectedAgeGroup === 'sekolah_rendah'
                    ? 'bg-gradient-to-r from-game-blue to-game-purple border-2 border-game-purple text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-game-blue'
                }`}
              >
                👧 Sekolah Rendah (6-12)
              </motion.button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: tier.highlighted ? -20 : -8 }}
              className={`relative rounded-3xl p-10 border-2 border-white shadow-xl overflow-hidden group ${
                tier.highlighted 
                  ? 'bg-gradient-to-br from-game-purple via-game-pink to-game-orange scale-105 ring-4 ring-game-purple/30' 
                  : 'bg-white'
              }`}
            >
              {tier.highlighted && (
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-game-yellow to-game-orange text-gray-900 px-6 py-2 rounded-full text-sm font-black shadow-lg">
                  ⭐ TERPOPULER
                </motion.div>
              )}

              <div className="mb-8">
                <h3 className={`text-3xl font-black mb-3 ${tier.highlighted ? 'text-white' : 'text-gray-800'}`}>{tier.nameMY}</h3>
                <p className={`text-5xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-game-purple'}`}>
                  RM {tier.priceMYR}
                  <span className={`text-lg ${tier.highlighted ? 'text-white/80' : 'text-gray-600'}`}>/bln</span>
                </p>
                <p className={`text-sm font-bold mt-3 ${tier.highlighted ? 'text-white/90' : 'text-game-purple'}`}>
                  🎮 {tier.games} Permainan
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSubscribe(tier)}
                className={`w-full py-4 rounded-2xl font-bold mb-8 text-lg transition-all shadow-lg ${
                  tier.highlighted
                    ? 'bg-white text-game-purple hover:shadow-2xl'
                    : 'bg-gradient-to-r from-game-purple to-game-pink text-white hover:shadow-xl'
                }`}
              >
                {tier.cta} ✨
              </motion.button>

              <div className={`space-y-4 ${tier.highlighted ? 'text-white' : 'text-gray-700'}`}>
                {tier.features.map((feature, j) => (
                  <motion.div key={j} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.05 }} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{feature.includes('✅') ? '✅' : '❌'}</span>
                    <span className={`text-sm font-medium ${tier.highlighted ? 'text-white/95' : 'text-gray-700'}`}>{feature.replace(/^✅|❌/, '').trim()}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Checkout Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mb-12 clay rounded-3xl p-8"
        >
          <h3 className="text-2xl font-black mb-6">Langganan Sekarang</h3>
          <PricingCheckout
            ageGroup={selectedAgeGroup}
            onClose={() => setSelectedTier(null)}
          />
        </motion.div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-game-orange via-game-pink to-game-purple bg-clip-text text-transparent">Soalan Lazim Ibu Bapa 🤔</h2>
          <div className="space-y-6">
            {[
              { q: 'Adakah selamat untuk anak bermain?', a: '✅ Ya! Tiada iklan, tiada pengumpulan data, tiada pembelian dalam aplikasi. Dirancang khusus untuk anak dengan menjaga privasi keluarga.', icon: '🔒' },
              { q: 'Boleh saya membatalkan langganan kapan saja?', a: '✅ Tentu saja. Pembatalan boleh dilakukan segera, tiada penalti atau pertanyaan yang merepotkan.', icon: '✋' },
              { q: 'Adakah ada percubaan percuma?', a: '✅ Paket Percuma memberi anda 5 permainan tanpa kad kredit. Cukup untuk mencuba dahulu!', icon: '🎁' },
              { q: 'Berapa kerap permainan baru ditambah?', a: '✅ Kami menambah 10-20 permainan baru setiap minggu. Anak takkan bosan!', icon: '⚡' },
              { q: 'Paket Pro untuk 4 anak - boleh saya tukar anak?', a: '✅ Boleh! Satu akaun untuk seluruh keluarga. Setiap anak mempunyai progres sendiri.', icon: '👨‍👩‍👧‍👦' },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-game-purple hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{faq.icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-lg text-gray-800 mb-3">{faq.q}</p>
                    <p className="text-gray-700 font-medium">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-gray-900 via-game-purple to-gray-900 text-white text-center py-12 mt-20">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-lg font-black">&copy; 2026 Jom Belajar. Semua hak terpelihara. ❤️</motion.p>
        <p className="text-gray-300 mt-2 font-medium">Belajar sambil bermain, bermain sambil belajar 🎮📚</p>
      </footer>
    </div>
  );
}