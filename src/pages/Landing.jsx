import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PricingCheckout from '@/components/PricingCheckout';
import InteractiveGameDemo from '@/components/landing/InteractiveGameDemo';

export default function Landing() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('prasekolah');
  const [selectedTier, setSelectedTier] = useState('premium');

  const tiers = [
    {
      name: 'free',
      nameMY: 'Percuma',
      priceMYR: '0',
      games: '5',
      features: ['✅ 5 permainan percuma', '✅ Tanpa kad kredit', '❌ Tanpa dashboard ibu bapa'],
      cta: 'Coba Percuma',
      highlighted: false,
    },
    {
      name: 'premium',
      nameMY: 'Premium',
      priceMYR: '24.90',
      games: '100+',
      features: ['✅ 100+ permainan', '✅ Dashboard progres', '✅ Semua mata pelajaran', '✅ Kemas kini mingguan'],
      cta: 'Langganan',
      highlighted: true,
    },
    {
      name: 'pro',
      nameMY: 'Pro (Keluarga)',
      priceMYR: '44.90',
      games: '200+',
      features: ['✅ 200+ permainan', '✅ Untuk 4 anak', '✅ Laporan bulanan', '✅ Sokongan 24/7'],
      cta: 'Langganan Pro',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black">
          🎓 <span className="text-game-purple">Jom Belajar</span>
        </div>
        <a href="#pricing">
          <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-2 bg-game-orange text-white rounded-full font-bold">
            Log Masuk
          </motion.button>
        </a>
      </nav>

      {/* Hero - Problem/Solution Narrative */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Trust badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-12">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-700">Dah dipercayai</span>
            <span className="inline-flex gap-1">
              <span className="w-6 h-6 rounded-full bg-game-yellow flex items-center justify-center text-xs text-white font-bold">●</span>
              <span className="w-6 h-6 rounded-full bg-game-pink flex items-center justify-center text-xs text-white font-bold">●</span>
              <span className="w-6 h-6 rounded-full bg-game-blue flex items-center justify-center text-xs text-white font-bold">●</span>
            </span>
            <span className="text-sm font-bold text-gray-700">5,000+ keluarga seluruh Malaysia 🇲🇾</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Anak Suka Belajar,<br />Orang Tua <span className="bg-yellow-300 px-4 py-2 inline-block rounded-lg">Tenang</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl font-semibold">
            <span className="text-game-orange font-black">200+ Permainan Edukatif</span> — Semua Subjek, Satu Aplikasi
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mb-8 leading-relaxed">
            Permainan interaktif yang dirancang untuk anak prasekolah hingga tahun 6, mengikut kurikulum KBSR. Tiada iklan mengganggu, tiada pembelian tersembunyi. Anak bermain sambil belajar, orang tua boleh relaks. 🎮✨
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#pricing">
              <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 bg-game-orange text-white rounded-full font-black text-lg shadow-lg flex items-center gap-2">
                Dapatkan Sekarang <ArrowRight className="w-5 h-5" />
              </motion.button>
            </a>
            <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 border-2 border-gray-400 text-gray-700 rounded-full font-bold text-lg">
              Coba Percuma 🎁
            </motion.button>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-4 mt-10 text-sm font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Akses selamanya
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Ikut silibus KSSR
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Terus boleh download
            </div>
          </div>
        </motion.div>

        {/* Hero Image - Interactive Game Demo */}
        <InteractiveGameDemo />
      </div>

      {/* Rating & Review */}
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-block">
          <div className="flex items-center justify-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">⭐</span>
            ))}
          </div>
          <p className="text-gray-700 font-bold">
            4.9/5 — <span className="text-game-orange">lebih 1,200 ibu bapa</span> dah bagi review! 😍
          </p>
        </motion.div>
      </div>

      {/* Problems Section */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mb-12 text-center">
            <p className="text-3xl mb-4">🤔 Masalah Biasa?</p>
            <h2 className="text-4xl font-black text-gray-800 mb-4">Anak kurang minat belajar?</h2>
            <p className="text-lg text-gray-600">Banyak orang tua hadapi cabaran yang sama. Anda bukan sorang-sorang.</p>
          </motion.div>

          {/* Problems Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { emoji: '📱', title: 'Anak lebih suka gadget dari buku', desc: 'Game dan sosial media lebih menarik. Sukar disuruh duduk untuk belajar akademik.' },
              { emoji: '😔', title: 'Prestasi akademik stagnan', desc: 'Walaupun sudah pergi tuisyen, nilai tidak meningkat. Diambang pelepasan ujian lagi.' },
              { emoji: '😫', title: 'Sulit fokus dengan pembelajaran tradisional', desc: 'Gaya belajar dari buku teks tidak sesuai dengan minat anak zaman sekarang.' },
              { emoji: '⏱️', title: 'Orang tua sibuk, sulit beri bimbingan langsung', desc: 'Masa terbatas untuk membantu anak belajar. Ingin ada solusi yang praktis.' },
            ].map((problem, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-amber-100 rounded-2xl p-6 border-2 border-amber-200">
                <p className="text-4xl mb-3">{problem.emoji}</p>
                <h3 className="text-xl font-black text-gray-800 mb-2">{problem.title}</h3>
                <p className="text-gray-700">{problem.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-800 mb-2">"Kalau saja ada cara yang lebih efektif dan menyeronokkan..."</p>
            <p className="text-2xl font-black text-game-orange">Ada! Lihat di bawah. ⬇️</p>
          </motion.div>
        </div>
      </div>

      {/* Features/Content */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-800 mb-4">✨ Solusi Kami</h2>
          <p className="text-2xl font-black text-gray-800"><span className="text-game-orange">Jom Belajar</span> — Permainan Edukatif yang Berkesan</p>
          <p className="text-lg text-gray-600 mt-4">Ratusan permainan interaktif dirancang oleh pendidik profesional, mengikut kurikulum KBSR. Setiap permainan telah diuji untuk memastikan anak belajar dengan efektif.</p>
        </motion.div>

        {/* Content Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            { icon: '🎮', title: 'Permainan Bahasa Melayu', desc: 'Pelajari huruf, perkataan, dan tatabahasa melalui permainan yang asyik. Cocok untuk semua peringkat.', badge: '50+' },
            { icon: '🔢', title: 'Permainan Matematik', desc: 'Tambah, tolak, darab, bahagi — semua dalam bentuk permainan interaktif yang tidak membosankan.', badge: '45+' },
            { icon: '🧪', title: 'Permainan Sains', desc: 'Jelajahi dunia sains dengan eksperimen virtual yang aman dan menyeronokkan untuk rumah.', badge: '40+' },
            { icon: '🌍', title: 'Permainan Umum', desc: 'Pelajari geografi, sejarah, dan kemahiran hidup lewat permainan yang menghibur.', badge: '65+' },
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-game-orange hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="text-5xl">{feature.icon}</span>
                <span className="bg-game-yellow text-gray-900 text-sm font-black px-3 py-1 rounded-full">{feature.badge}</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-amber-100 rounded-3xl p-8 text-center border-2 border-game-orange">
          <p className="text-xl font-black text-gray-800">🆕 Permainan baru ditambah setiap bulan</p>
          <p className="text-gray-700 mt-2">Kami terus mengembangkan koleksi berdasarkan feedback orang tua dan keperluan pendidikan terkini.</p>
        </motion.div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-black text-center text-gray-800 mb-16">💬 Apa Kata Orang Tua?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ibu Nurul', location: 'Selangor', quote: 'Sejak pakai Jom Belajar, anak saya lebih fokus belajar. Permainannya menarik dan tidak bikin stress macam tuisyen biasa.' },
              { name: 'Pak Ismail', location: 'Melaka', quote: 'Saya suka dashboard yang boleh lihat progres anak. Tahu dia belajar apa, berapa skor. Transparent dan senang dipantau.' },
              { name: 'Ibu Rohani', location: 'Johor', quote: 'Harganya sangat berpatutan untuk berapa banyak permainan. Anak boleh main berkali-kali, takut tak cukup waktu!' },
            ].map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <span key={j}>⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-black text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-black text-center text-gray-800 mb-8">Paket Langganan</h2>

        {/* Age Selector */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { key: 'prasekolah', label: 'Pra Sekolah (3-5)' },
            { key: 'sekolah_rendah', label: 'Sekolah Rendah (6-12)' },
          ].map((age) => (
            <motion.button
              key={age.key}
              onClick={() => setSelectedAgeGroup(age.key)}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${
                selectedAgeGroup === age.key ? 'bg-game-orange text-white shadow-lg' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {age.label}
            </motion.button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl p-10 border-3 relative overflow-hidden transition-all hover:shadow-xl ${
                tier.highlighted ? 'bg-gradient-to-br from-game-orange to-game-yellow border-game-orange scale-105' : 'bg-white border-gray-200'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-1 rounded-full text-sm font-black">
                  ⭐ TERPOPULER
                </div>
              )}

              <h3 className={`text-3xl font-black mb-2 ${tier.highlighted ? 'text-white' : 'text-gray-800'}`}>{tier.nameMY}</h3>
              <p className={`text-5xl font-black mb-1 ${tier.highlighted ? 'text-white' : 'text-game-orange'}`}>
                RM {tier.priceMYR}
              </p>
              <p className={`text-sm font-bold mb-6 ${tier.highlighted ? 'text-white/80' : 'text-gray-600'}`}>/bulan</p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`w-full py-4 rounded-2xl font-black text-lg mb-8 transition-all ${
                  tier.highlighted ? 'bg-white text-game-orange' : 'bg-game-orange text-white'
                }`}
              >
                {tier.cta}
              </motion.button>

              <div className={`space-y-3 text-sm font-semibold ${tier.highlighted ? 'text-white' : 'text-gray-700'}`}>
                {tier.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span>{f.includes('✅') ? '✅' : '❌'}</span>
                    <span>{f.replace(/^✅|❌/, '').trim()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-800 mb-12">Soalan Lazim 🤔</h2>
          <div className="space-y-4">
            {[
              { q: 'Adakah selamat untuk anak bermain?', a: '✅ Ya! Tiada iklan, tiada pengumpulan data. Dirancang khusus untuk anak dengan menjaga privasi keluarga.' },
              { q: 'Boleh saya membatalkan langganan kapan saja?', a: '✅ Tentu saja. Pembatalan boleh dilakukan segera, tiada penalti.' },
              { q: 'Adakah ada percubaan percuma?', a: '✅ Paket Percuma memberi anda 5 permainan tanpa kad kredit!' },
              { q: 'Berapa kerap permainan baru ditambah?', a: '✅ Kami menambah 10-20 permainan baru setiap minggu. Anak takkan bosan!' },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200 hover:border-game-orange transition-all">
                <p className="font-black text-gray-800 mb-2">{faq.q}</p>
                <p className="text-gray-700">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-20">
        <p className="font-black">Jom Belajar © 2026. Semua hak terpelihara. ❤️</p>
        <p className="text-gray-400 text-sm mt-2">Belajar sambil bermain, bermain sambil belajar 🎮📚</p>
      </footer>
    </div>
  );
}