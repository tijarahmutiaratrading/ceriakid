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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black">
          <span className="bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">
            Jom Belajar
          </span>
          <span className="text-3xl">🎓</span>
        </div>
        <a href="#pricing">
          <button className="px-6 py-2 rounded-full bg-game-purple text-white font-bold hover:shadow-lg transition-all">
            Lihat Pakej
          </button>
        </a>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Belajar Sambil <span className="bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">Bermain</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            200+ permainan interaktif untuk anak prasekolah & sekolah rendah. Belajar BM, Inggeris, Matematik & Sains dengan cara yang seru! 🎮
          </p>
          <div className="flex gap-4 justify-center">
           <a href="#pricing">
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-8 py-4 bg-game-purple text-white rounded-full font-bold flex items-center gap-2 shadow-lg"
             >
               Mulai Sekarang <ArrowRight className="w-5 h-5" />
             </motion.button>
           </a>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="bg-gradient-to-br from-amber-200 via-pink-200 to-blue-200 aspect-video flex items-center justify-center text-7xl">
            🎮 📚 🎨 🔢
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-center mb-12">Mengapa Pilih Jom Belajar?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: '200+ Permainan', desc: 'Permainan seru untuk semua mata pelajaran' },
            { icon: Users, title: '2 Peringkat Umur', desc: 'Prasekolah & Sekolah Rendah dengan kandungan yang sesuai' },
            { icon: Globe, title: 'Dwibahasa', desc: 'Bahasa Melayu & Inggeris dalam setiap permainan' },
            { icon: Zap, title: 'Jejak Kemajuan', desc: 'Pantau kemajuan anak dengan dashboard ibu bapa' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay rounded-2xl p-6 text-center"
            >
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-game-purple" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Proof - Parent Testimonials */}
      <div className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl">
        <h2 className="text-4xl font-black text-center mb-12">Apa Kata Ibu Bapa? 💬</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Ibu Siti', kid: 'Amira (5 tahun)', quote: 'Amira sekarang suka belajar! Dulu susah nak belajar, tapi dengan permainan ini dia boleh main sambil belajar. Rating 5 bintang! ⭐⭐⭐⭐⭐', emoji: '👩‍👧' },
            { name: 'Pak Ahmad', kid: 'Zain (7 tahun)', quote: 'Dashboard ibu bapa sangat membantu. Saya boleh lihat kemajuan Zain setiap hari. Lama tak jumpa nilai Matematik dia naik! 📈', emoji: '👨‍👦' },
            { name: 'Ibu Nurul', kid: 'Maya & Hana', quote: 'Paket Pro sangat bernilai! Dua anak saya boleh main bersama. Kemampuan mereka dalam Bahasa Inggeris semakin bagus. Terima kasih Jom Belajar! 🙏', emoji: '👩‍👧‍👧' },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{testimonial.emoji}</span>
                <div>
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.kid}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-game-yellow text-game-yellow" />
                ))}
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Kurikulum Selaras', desc: 'Dirancang mengikuti Kurikulum KBSR Kementerian Pendidikan Malaysia' },
            { icon: Lightbulb, title: 'Terbukti Efektif', desc: '87% ibu bapa nampak peningkatan prestasi akademik dalam 4 minggu' },
            { icon: Users, title: '10,000+ Keluarga', desc: 'Dipercayai oleh ribuan keluarga Malaysia sejak 2024' },
          ].map((signal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <signal.icon className="w-16 h-16 mx-auto mb-4 text-game-purple" />
              <h3 className="text-xl font-bold mb-2">{signal.title}</h3>
              <p className="text-gray-600">{signal.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Paket Langganan</h2>
          <p className="text-lg text-gray-600 mb-8">Pilih paket yang sesuai untuk anak-anak Anda</p>

          {/* Age Group Selector */}
          <div className="clay rounded-3xl p-6 mb-8 inline-block">
            <p className="text-sm font-bold text-gray-600 mb-4">Pilih peringkat untuk anak Anda</p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAgeGroup('prasekolah')}
                className={`rounded-xl py-2 px-6 font-bold text-sm transition-all ${
                  selectedAgeGroup === 'prasekolah'
                    ? 'bg-game-yellow border-2 border-game-yellow text-gray-800'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-600'
                }`}
              >
                👶 Pra Sekolah (3-5)
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAgeGroup('sekolah_rendah')}
                className={`rounded-xl py-2 px-6 font-bold text-sm transition-all ${
                  selectedAgeGroup === 'sekolah_rendah'
                    ? 'bg-game-blue border-2 border-game-blue text-white'
                    : 'bg-gray-100 border-2 border-gray-300 text-gray-600'
                }`}
              >
                👧 Sekolah Rendah (6-12)
              </motion.button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`clay rounded-3xl p-8 relative ${
                tier.highlighted ? 'ring-2 ring-game-purple scale-105 shadow-2xl' : ''
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-game-purple text-white px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ TERPOPULER
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-2">{tier.nameMY}</h3>
                <p className="text-4xl font-black text-game-purple mb-1">
                  RM {tier.priceMYR}
                  <span className="text-lg text-gray-600">/bln</span>
                </p>
                <p className="text-sm font-bold text-game-purple mt-2">
                  {tier.games} Permainan
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(tier)}
                className={`w-full py-3 rounded-2xl font-bold mb-6 transition-all ${
                  tier.highlighted
                    ? 'bg-game-purple text-white shadow-lg hover:shadow-xl'
                    : 'clay text-game-purple hover:shadow-lg'
                }`}
              >
                {tier.cta}
              </motion.button>

              <div className="space-y-3">
                {tier.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Checkout Form */}
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-12 clay rounded-3xl p-8"
          >
            <h3 className="text-2xl font-black mb-6">{selectedTier.nameMY}</h3>
            <PricingCheckout
              tier={selectedTier}
              tierName={selectedTier.name}
              ageGroup={selectedAgeGroup}
              onClose={() => setSelectedTier(null)}
            />
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-8">Soalan Lazim Ibu Bapa 🤔</h2>
          <div className="space-y-4">
            {[
              { q: 'Adakah selamat untuk anak bermain?', a: '✅ Ya! Tiada iklan, tiada pengumpulan data, tiada pembelian dalam aplikasi. Dirancang khusus untuk anak dengan menjaga privasi keluarga.' },
              { q: 'Boleh saya membatalkan langganan kapan saja?', a: '✅ Tentu saja. Pembatalan boleh dilakukan segera, tiada penalti atau pertanyaan yang merepotkan.' },
              { q: 'Adakah ada percubaan percuma?', a: '✅ Paket Percuma memberi anda 5 permainan tanpa kad kredit. Cukup untuk mencuba dahulu!' },
              { q: 'Berapa kerap permainan baru ditambah?', a: '✅ Kami menambah 10-20 permainan baru setiap minggu. Anak takkan bosan!' },
              { q: 'Paket Pro untuk 4 anak - boleh saya tukar anak?', a: '✅ Boleh! Satu akaun untuk seluruh keluarga. Setiap anak mempunyai progres sendiri.' },
            ].map((faq, i) => (
              <div key={i} className="clay rounded-2xl p-6">
                <p className="font-bold text-lg mb-2">{faq.q}</p>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8">
        <p>&copy; 2026 Jom Belajar. Semua hak terpelihara. ❤️</p>
      </footer>
    </div>
  );
}