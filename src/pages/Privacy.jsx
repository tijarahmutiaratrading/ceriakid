import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-game-purple font-bold mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Laman Utama
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Dasar Privasi</h1>
        <p className="text-slate-500 text-sm mb-8">Patuh PDPA Malaysia 2010 · Kemaskini: 1 Mei 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Maklumat Yang Kami Kumpul</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nama ibu bapa, e-mel, nombor telefon (untuk akaun & pembayaran)</li>
              <li>Nama panggilan anak & tahap umur (untuk profil pembelajaran)</li>
              <li>Progress pembelajaran (markah, game dimainkan)</li>
              <li>Maklumat peranti untuk had peranti (browser, OS)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Bagaimana Kami Guna Maklumat</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Menyediakan perkhidmatan pembelajaran</li>
              <li>Memproses pembayaran melalui Chip-In Asia (FPX)</li>
              <li>Memantau & memperbaiki kualiti game</li>
              <li>Menghantar maklumat penting tentang akaun anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Anak Di Bawah Umur</h2>
            <p>Kami TIDAK mengumpul maklumat peribadi anak secara langsung. Hanya nama panggilan & progress pembelajaran disimpan, didaftarkan oleh ibu bapa.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Perkongsian Data</h2>
            <p>Kami TIDAK menjual data anda. Data hanya dikongsi dengan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chip-In Asia (pemproses pembayaran)</li>
              <li>Pembekal infrastruktur (Base44/penyedia awan)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Keselamatan Data</h2>
            <p>Kami menggunakan enkripsi HTTPS dan praktik keselamatan industri. Walau bagaimanapun, tiada sistem yang 100% selamat.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">6. Hak Anda (PDPA)</h2>
            <p>Anda berhak untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mengakses data anda</li>
              <li>Membetulkan data yang tidak tepat</li>
              <li>Memadam akaun & data anda</li>
              <li>Menarik balik persetujuan</li>
            </ul>
            <p className="mt-2">Hubungi <a href="mailto:support@ceriakid.com" className="text-game-purple font-bold">support@ceriakid.com</a> untuk sebarang permintaan.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">7. Cookies & Storan Tempatan</h2>
            <p>Kami guna localStorage untuk menyimpan progress offline dan token sesi. Tiada cookies tracking pihak ketiga.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">8. Hubungi Kami</h2>
            <p>E-mel: <a href="mailto:support@ceriakid.com" className="text-game-purple font-bold">support@ceriakid.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}