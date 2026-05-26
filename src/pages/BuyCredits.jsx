import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Info, ArrowLeft } from 'lucide-react';
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

    setBusyPkg(pkg.id);
    try {
      const res = await base44.functions.invoke('chipCreditCheckout', {
        packageId: pkg.id,
        email: user.email,
        name: user.full_name || user.email,
        phone: user.phone || '0000000000',
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
    <div className="min-h-screen relative overflow-hidden">

      <AppHeader showBack={true} backTo="/dashboard" title="Beli Kredit AI" />

      <div className="relative max-w-6xl mx-auto px-4 pt-24 md:pt-8 pb-32">
        {/* Back button */}
        <Link
          to="/dashboard"
          className="hidden md:inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/20 text-white/90 hover:text-white hover:bg-slate-900/70 font-black text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>

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
          <CreditBalanceWidget variant="glass" />
        </div>

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
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
              <p className="text-2xl">🎓</p>
              <p className="text-white font-black text-sm mt-1">Pembantu Pembelajaran</p>
              <p className="text-amber-300 text-xs font-black">{CREDIT_COSTS.ai_assistant} kredit / soalan</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
              <p className="text-2xl">📖</p>
              <p className="text-white font-black text-sm mt-1">Penjana Cerita</p>
              <p className="text-amber-300 text-xs font-black">{CREDIT_COSTS.story_generator} kredit / cerita</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-3">
              <p className="text-2xl">📝</p>
              <p className="text-white font-black text-sm mt-1">Penjana BBM</p>
              <p className="text-amber-300 text-xs font-black">{CREDIT_COSTS.bbm_generator} kredit / BBM</p>
            </div>
          </div>
          <p className="text-white text-xs font-bold mt-4">
            💡 Kredit tidak luput. Boleh dipakai bila-bila masa.
          </p>
        </motion.div>
      </div>
    </div>
  );
}