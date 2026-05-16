import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-game-purple font-bold mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Laman Utama
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Terma Penggunaan</h1>
        <p className="text-slate-500 text-sm mb-8">Kemaskini terakhir: 1 Mei 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Penerimaan Terma</h2>
            <p>Dengan menggunakan CeriaKid, anda bersetuju untuk terikat dengan terma ini. Jika anda tidak bersetuju, sila jangan gunakan perkhidmatan kami.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Penggunaan Perkhidmatan</h2>
            <p>CeriaKid adalah platform pembelajaran untuk kanak-kanak. Ibu bapa/penjaga bertanggungjawab ke atas akaun dan aktiviti anak mereka di platform ini.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Langganan & Pembayaran</h2>
            <p>Semua pelan adalah tahunan dan dibayar di hadapan melalui FPX (Chip-In Asia). Langganan tidak akan diperbaharui secara automatik — anda perlu melanggan semula apabila tempoh berakhir.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Dasar Bayaran Balik (Refund Policy)</h2>
            <p>Kami menawarkan <strong>jaminan pulangan wang 7 hari</strong> bagi pembelian pertama:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Permintaan refund mesti dibuat dalam tempoh <strong>7 hari kalendar</strong> selepas tarikh pembayaran.</li>
              <li>Hantar e-mel ke <a href="mailto:support@ceriakid.com" className="text-game-purple font-bold">support@ceriakid.com</a> dengan resit pembayaran dan sebab refund.</li>
              <li>Refund akan diproses dalam tempoh 7–14 hari bekerja melalui kaedah pembayaran asal.</li>
              <li>Selepas 7 hari, bayaran adalah muktamad dan tidak boleh dikembalikan kecuali atas kebijaksanaan kami.</li>
              <li>Refund tidak akan diberikan jika akaun ditamatkan kerana penyalahgunaan platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Had Peranti</h2>
            <p>Setiap pelan mempunyai had bilangan peranti yang dibenarkan. Untuk menukar peranti, sila urus melalui halaman Tetapan.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">6. Kandungan Pengguna</h2>
            <p>Lukisan, nama anak, dan progress yang anda hasilkan kekal milik anda. Kami hanya simpan untuk tujuan menyediakan perkhidmatan.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">7. Penamatan</h2>
            <p>Kami berhak menamatkan akaun yang menyalahgunakan platform. Anda boleh padam akaun anda pada bila-bila masa dengan menghubungi kami.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">8. Had Tanggungjawab</h2>
            <p>CeriaKid disediakan "sebagaimana adanya". Kami tidak menjamin perkhidmatan akan bebas ralat sepenuhnya, walaupun kami berusaha untuk kualiti yang tinggi.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">9. Hubungi Kami</h2>
            <p>Soalan? E-mel <a href="mailto:support@ceriakid.com" className="text-game-purple font-bold">support@ceriakid.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}