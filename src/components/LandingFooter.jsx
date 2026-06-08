import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10">
          {/* Brand Section */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-game-pink to-game-purple rounded-xl flex items-center justify-center text-xl font-black">
                🎮
              </div>
              <div>
                <p className="font-black text-lg text-white">CeriaKid</p>
                <p className="text-xs text-slate-400 font-semibold">Belajar + Bermain + Gembira</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Koleksi terbesar bahan pembelajaran digital untuk anak-anak Malaysia. Dari pra-sekolah hingga Tahun 6, semua dalam satu platform.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-game-pink transition-colors flex items-center justify-center group"
              >
                <Facebook className="w-4 h-4 text-slate-300 group-hover:text-white" strokeWidth={2.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-game-pink transition-colors flex items-center justify-center group"
              >
                <Instagram className="w-4 h-4 text-slate-300 group-hover:text-white" strokeWidth={2.5} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-game-pink transition-colors flex items-center justify-center group"
              >
                <Youtube className="w-4 h-4 text-slate-300 group-hover:text-white" strokeWidth={2.5} />
              </a>
            </div>
          </div>

          {/* Produk */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Produk</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/games-hub" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Game Interaktif
                </Link>
              </li>
              <li>
                <Link to="/bbm-generator" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  BBM Generator
                </Link>
              </li>
              <li>
                <Link to="/story-generator" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Story Generator
                </Link>
              </li>
              <li>
                <Link to="/quiz-ai" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Quiz AI
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Cikgu AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Syarikat */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Syarikat</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link to="/affiliate" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Program Afiliasi
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Terma & Syarat
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-300 hover:text-game-pink transition-colors text-sm">
                  Dasar Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubungi */}
          <div>
            <h3 className="font-black text-white mb-4 text-sm uppercase tracking-wider">Hubungi</h3>
            <ul className="space-y-2.5">
              <li>
                <p className="text-slate-300 text-sm">📧 hello@ceriakid.com</p>
              </li>
              <li>
                <p className="text-slate-300 text-sm">📱 +60 3-XXXX XXXX</p>
              </li>
              <li>
                <p className="text-slate-300 text-sm">🏢 Kuala Lumpur, Malaysia</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-6 sm:pt-8">
          <p className="text-center text-slate-400 text-xs sm:text-sm">
            © {currentYear} CeriaKid. Semua hak dilindungi. | Diperbuat dengan ❤️ untuk pendidikan anak Malaysia.
          </p>
        </div>
      </div>
    </footer>
  );
}