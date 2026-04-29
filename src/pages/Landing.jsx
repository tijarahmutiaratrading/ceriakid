import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Globe, Zap, Star, Lightbulb, Target } from 'lucide-react';

export default function Landing() {
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
        <Link to="/pricing">
          <button className="px-6 py-2 rounded-full bg-game-purple text-white font-bold hover:shadow-lg transition-all">
            Lihat Pakej
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Belajar Jadi <span className="bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">Menyenangkan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            200+ permainan interaktif untuk anak prasekolah & sekolah rendah. Belajar Bahasa Melayu, Inggeris, Matematik & Sains dengan cara yang seru! 🎮
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-game-purple text-white rounded-full font-bold flex items-center gap-2 shadow-lg"
              >
                Mulai Sekarang <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
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
        <h2 className="text-4xl font-black text-center mb-12">Kenapa Pilih Jom Belajar?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sparkles, title: '200+ Games', desc: 'Permainan seru untuk semua mata pelajaran' },
            { icon: Users, title: '2 Tahap Umur', desc: 'Prasekolah & Sekolah Rendah dengan konten disesuaikan' },
            { icon: Globe, title: 'Dwibahasa', desc: 'Bahasa Melayu & Inggeris dalam setiap game' },
            { icon: Zap, title: 'Progres Tracking', desc: 'Pantau kemajuan anak dengan dashboard orang tua' },
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
            { name: 'Ibu Siti', kid: 'Amira (5 tahun)', quote: 'Amira sekarang suka belajar! Sebelum ini nak belajar pun susah, tapi dengan permainan ini dia boleh main sambil belajar. Rating 5 bintang! ⭐⭐⭐⭐⭐', emoji: '👩‍👧' },
            { name: 'Pak Ahmad', kid: 'Zain (7 tahun)', quote: 'Dashboard orang tua sangat membantu. Saya boleh lihat kemajuan Zain setiap hari. Lama tak jumpa nilai Matematik dia naik! 📈', emoji: '👨‍👦' },
            { name: 'Ibu Nurul', kid: 'Maya & Hana', quote: 'Pro plan worth it! Dua anak saya boleh main bersama. Suara mereka semakin bagus dalam Bahasa Inggeris. Terima kasih Jom Belajar! 🙏', emoji: '👩‍👧‍👧' },
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
            { icon: Target, title: 'Kurikulum Selaras', desc: 'Dirancang mengikuti Kurikulum Kementerian Pendidikan Malaysia (KBSR)' },
            { icon: Lightbulb, title: 'Terbukti Efektif', desc: '87% ibu bapa nampak peningkatan prestasi akademik dalam 4 minggu' },
            { icon: Users, title: '10,000+ Keluarga', desc: 'Dipercaya oleh ribuan keluarga Malaysia sejak 2024' },
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

      {/* CTA - Parent Focused */}
      <div className="bg-gradient-to-r from-game-purple via-game-pink to-game-orange text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-black">Sibuk? Risau Dengan Prestasi Akademik Anak?</h2>
          <p className="text-lg opacity-95">Jom Belajar memudahkan pembelajaran dengan cara yang seru. Anak seronok belajar = prestasi meningkat. Terbukti oleh 10,000+ keluarga! 🎯</p>
          <div className="flex gap-4 justify-center">
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 bg-white text-game-purple rounded-full font-bold shadow-lg"
              >
                Cubaí Gratis Dulu
              </motion.button>
            </Link>
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-8 py-4 border-2 border-white text-white rounded-full font-bold"
              >
                Lihat Paket Premium
              </motion.button>
            </Link>
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