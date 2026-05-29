import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import UserTopHeader from '@/components/UserTopHeader';

export default function Contact() {
  return (
    <div
      className="min-h-screen px-4 pt-20 sm:pt-24 pb-12"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)',
      }}
    >
      <AppHeader />
      <UserTopHeader />
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-game-purple font-bold mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Laman Utama
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Hubungi Kami</h1>
        <p className="text-slate-600 mb-8">Kami sedia membantu. Pilih saluran yang paling sesuai untuk anda.</p>

        <div className="space-y-4">
          <a href="mailto:support@ceriakid.com" className="flex items-center gap-4 p-5 bg-purple-50 rounded-2xl border-2 border-purple-100 hover:bg-purple-100 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-game-purple text-white flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900">Emel</p>
              <p className="text-sm text-slate-600">support@ceriakid.com</p>
              <p className="text-xs text-slate-500 mt-1">Balasan dalam 24 jam pada hari bekerja</p>
            </div>
          </a>

          <a href="https://wa.me/60177844120" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-green-50 rounded-2xl border-2 border-green-100 hover:bg-green-100 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900">WhatsApp</p>
              <p className="text-sm text-slate-600">017-784 4120</p>
              <p className="text-xs text-slate-500 mt-1">Lebih pantas untuk soalan pendek</p>
            </div>
          </a>
        </div>

        <div className="mt-8 p-5 bg-slate-50 rounded-2xl">
          <p className="font-black text-slate-900 mb-2">Soalan Lazim?</p>
          <p className="text-sm text-slate-600 mb-3">Banyak soalan boleh dijawab di seksyen FAQ kami.</p>
          <Link to="/#faq" className="inline-block px-4 py-2 bg-white text-game-purple rounded-full font-bold text-sm border border-purple-200 hover:bg-purple-50">
            Lihat FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}