import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Info } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import CreditPackageCard from '@/components/credits/CreditPackageCard';
import { CREDIT_PACKAGES, CREDIT_COSTS } from '@/lib/creditPackages';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function BuyCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busyPkg, setBusyPkg] = useState(null);
  const [phone, setPhone] = useState('');
  const [statusBanner, setStatusBanner] = useState(null);

  // Detect ?status=success|failed from Chip redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const credits = params.get('credits');
    if (status === 'success') {
      setStatusBanner({ kind: 'success', msg: `🎉 Pembayaran berjaya! ${credits || ''} kredit telah ditambah ke akaun anda.` });
    } else if (status === 'failed') {
      setStatusBanner({ kind: 'error', msg: 'Pembayaran gagal atau dibatalkan. Sila cuba lagi.' });
    }
  }, []);

  const handleBuy = async (pkg) => {
    if (!user?.email) {
      toast({ title: 'Sila log masuk dahulu', variant: 'destructive' });
      return;
    }
    if (!phone || phone.length < 9) {
      toast({ title: 'Masukkan nombor telefon dahulu', description: 'Diperlukan untuk pembayaran Chip.', variant: 'destructive' });
      return;
    }

    setBusyPkg(pkg.id);
    try {
      const res = await base44.functions.invoke('chipCreditCheckout', {
        packageId: pkg.id,
        email: user.email,
        name: user.full_name || user.email,
        phone,
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error(res.data?.error || 'Tiada checkout URL');
      }
    } catch (e) {
      toast({ title: 'Ralat pembayaran', description: e.message, variant: 'destructive' });
      setBusyPkg(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 35%, #4a1d6e 70%, #6b1d52 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-game-purple/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-game-pink/35 rounded-full blur-3xl" />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" title="Beli Kredit AI" />

      <div className="relative max-w-6xl mx-auto px-4 pt-24 md:pt-8 pb-32">
        {/* Status banner */}
        {statusBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 rounded-2xl p-4 flex items-start gap-3 ${
              statusBanner.kind === 'success'
                ? 'bg-green-500/20 border-2 border-green-300/50'
                : 'bg-red-500/20 border-2 border-red-300/50'
            }`}
          >
            {statusBanner.kind === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />}
            <p className="text-white font-bold text-sm">{statusBanner.msg}</p>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200 text-[11px] font-black uppercase tracking-widest">Kredit AI CeriaKid</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2">Top Up Kredit AI</h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto">
            Gunakan kredit untuk akses ciri AI: Pembantu Pembelajaran, Penjana Cerita & BBM Tersuai
          </p>
        </motion.div>

        {/* Current balance */}
        <div className="mb-6 max-w-md mx-auto">
          <CreditBalanceWidget />
        </div>

        {/* Phone input */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 max-w-md mx-auto pro-glass rounded-2xl p-4">
          <label className="block text-white text-xs font-black mb-2">📱 Nombor Telefon (untuk pembayaran)</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Contoh: 0123456789"
            className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm font-bold focus:outline-none focus:border-white/55"
          />
        </motion.div>

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {CREDIT_PACKAGES.map(pkg => (
            <CreditPackageCard key={pkg.id} pkg={pkg} onBuy={handleBuy} busy={busyPkg === pkg.id} />
          ))}
        </div>

        {/* Pricing info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-glass rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-300" />
            <h2 className="text-white font-black text-base">Kos Setiap Ciri AI</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-2xl">🎓</p>
              <p className="text-white font-black text-sm mt-1">Pembantu Pembelajaran</p>
              <p className="text-amber-300 text-xs font-bold">{CREDIT_COSTS.ai_assistant} kredit / soalan</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-2xl">📖</p>
              <p className="text-white font-black text-sm mt-1">Penjana Cerita</p>
              <p className="text-amber-300 text-xs font-bold">{CREDIT_COSTS.story_generator} kredit / cerita</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-2xl">📝</p>
              <p className="text-white font-black text-sm mt-1">Penjana BBM</p>
              <p className="text-amber-300 text-xs font-bold">{CREDIT_COSTS.bbm_generator} kredit / BBM</p>
            </div>
          </div>
          <p className="text-white/60 text-[11px] mt-4">
            💡 Kredit tidak luput. Boleh dipakai bila-bila masa.
          </p>
        </motion.div>
      </div>
    </div>
  );
}