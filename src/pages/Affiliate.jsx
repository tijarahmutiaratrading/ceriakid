import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Users, DollarSign, TrendingUp, Wallet, Share2, Loader2, CheckCircle2, Clock, XCircle, Banknote } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import AffiliateRegisterForm from '@/components/affiliate/AffiliateRegisterForm';
import AffiliateStatsGrid from '@/components/affiliate/AffiliateStatsGrid';
import AffiliateTierCard from '@/components/affiliate/AffiliateTierCard';
import AffiliateReferralList from '@/components/affiliate/AffiliateReferralList';
import AffiliatePayoutList from '@/components/affiliate/AffiliatePayoutList';
import AffiliateBankForm from '@/components/affiliate/AffiliateBankForm';

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getAffiliateData', {});
      setData(res.data);
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const copyLink = () => {
    if (!data?.affiliate) return;
    const link = `${window.location.origin}/?ref=${data.affiliate.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: '✅ Link disalin!', description: 'Boleh share dengan kawan-kawan.' });
  };

  const requestPayout = async () => {
    setRequesting(true);
    try {
      const res = await base44.functions.invoke('requestAffiliatePayout', {});
      if (res.data.error) {
        toast({ title: 'Gagal', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '🎉 Berjaya!', description: 'Permintaan payout dihantar. Admin akan proses dalam 3-5 hari bekerja.' });
        load();
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-game-purple" />
      </div>
    );
  }

  if (!data?.isAffiliate) {
    return <AffiliateRegisterForm onSuccess={load} />;
  }

  const { affiliate, referrals, payouts } = data;
  const referralLink = `${window.location.origin}/?ref=${affiliate.referralCode}`;

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-8 mb-6 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <Share2 className="w-6 h-6" />
          <span className="text-sm font-black tracking-wider opacity-90">PROGRAM AFFILIATE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Dapatkan Komisen 💰</h1>
        <p className="text-white/90 mb-2">Share link rujukan anda. Dapat <strong>{affiliate.commissionRateSubscription}%</strong> komisen untuk langganan, <strong>{affiliate.commissionRateCredit}%</strong> untuk kredit AI.</p>
        <p className="text-white/80 text-sm mb-6">🚀 Naik tier untuk komisen lebih tinggi — sehingga <strong>30%</strong> untuk Platinum!</p>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/30">
          <Label className="text-xs font-bold text-white/85 mb-1.5 block">LINK RUJUKAN ANDA</Label>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/95 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-mono break-all">
              {referralLink}
            </div>
            <Button onClick={copyLink} className="bg-white text-purple-600 hover:bg-white/90 font-black shadow-lg">
              <Copy className="w-4 h-4 mr-1" /> Salin
            </Button>
          </div>
          <p className="text-xs text-white/85 mt-2">Kod anda: <strong className="bg-white/25 px-2 py-0.5 rounded">{affiliate.referralCode}</strong></p>
        </div>
      </motion.div>

      {/* Tier card — papar tier semasa & progress ke next level */}
      <AffiliateTierCard affiliate={affiliate} />

      {/* Stats */}
      <AffiliateStatsGrid affiliate={affiliate} />

      {/* Payout action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-6 bg-white border-2 border-emerald-200 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-lg">Withdraw Komisen</h3>
            </div>
            <p className="text-sm text-slate-600">Baki sedia untuk withdraw: <strong className="text-emerald-600">RM{(affiliate.pendingBalance || 0).toFixed(2)}</strong></p>
            <p className="text-xs text-slate-500 mt-0.5">Minimum withdraw: RM50</p>
          </div>
          <Button
            onClick={requestPayout}
            disabled={requesting || (affiliate.pendingBalance || 0) < 50}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-5 rounded-xl shadow-lg disabled:opacity-40"
          >
            {requesting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Banknote className="w-4 h-4 mr-1" />}
            Request Payout
          </Button>
        </div>
      </motion.div>

      {/* Bank info */}
      <AffiliateBankForm affiliate={affiliate} onSuccess={load} />

      {/* Referrals + Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AffiliateReferralList referrals={referrals} />
        <AffiliatePayoutList payouts={payouts} />
      </div>
    </div>
  );
}