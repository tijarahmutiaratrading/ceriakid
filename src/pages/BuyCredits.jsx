import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Info, ArrowLeft, GraduationCap, BookOpen, FileText, Brain, Lightbulb } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import CreditPackageCard from '@/components/credits/CreditPackageCard';
import { CREDIT_PACKAGES, CREDIT_COSTS } from '@/lib/creditPackages';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getStoredReferralCode } from '@/lib/referralTracker';

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
        referralCode: getStoredReferralCode(),
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#fafafa' }}>
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <AppHeader showBack={false} title="Beli Kredit AI" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4 pb-32">
        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mb-4 ml-4 sm:ml-6 px-3.5 py-2 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>

        {/* Status banner */}
        {statusBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 rounded-2xl p-4 flex items-start gap-3 ${
              statusBanner.kind === 'success'
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-red-50 border-2 border-red-300'
            }`}
          >
            {statusBanner.kind === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            <p className="text-slate-900 font-bold text-sm">{statusBanner.msg}</p>
          </motion.div>
        )}

        {/* Hero — clean Stripe style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-6 bg-white ring-1 ring-slate-200 shadow-sm"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Kredit AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Top Up Kredit AI</h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Gunakan kredit untuk akses ciri AI: Pembantu Pembelajaran, Penjana Cerita & BBM Tersuai
          </p>
        </motion.div>

        {/* Current balance */}
        <div className="mb-6">
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
            <h2 className="text-slate-900 font-black text-base">Kos Setiap Ciri AI</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-slate-900 font-black text-sm mt-2">Pembantu Pembelajaran</p>
              <p className="text-slate-700 text-xs font-black">{CREDIT_COSTS.ai_assistant} kredit / soalan</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-slate-900 font-black text-sm mt-2">Penjana Cerita</p>
              <p className="text-slate-700 text-xs font-black">{CREDIT_COSTS.story_generator} kredit / cerita</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-slate-900 font-black text-sm mt-2">Penjana BBM</p>
              <p className="text-slate-700 text-xs font-black">{CREDIT_COSTS.bbm_generator} kredit / BBM</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center shadow-sm">
                <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-slate-900 font-black text-sm mt-2">Kuiz AI</p>
              <p className="text-slate-700 text-xs font-black">{CREDIT_COSTS.quiz_ai} kredit / soalan</p>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-4">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} fill="rgb(252 211 77)" />
            <p className="text-slate-900 text-xs font-bold">
              Kredit tidak luput. Boleh dipakai bila-bila masa.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}