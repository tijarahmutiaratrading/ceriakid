import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import AffiliateRegisterForm from '@/components/affiliate/AffiliateRegisterForm';
import AffiliateHero from '@/components/affiliate/AffiliateHero';
import AffiliateStatsGrid from '@/components/affiliate/AffiliateStatsGrid';
import AffiliateTierCard from '@/components/affiliate/AffiliateTierCard';
import AffiliatePayoutCard from '@/components/affiliate/AffiliatePayoutCard';
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
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Memuat dashboard affiliate...</p>
        </div>
      </div>
    );
  }

  if (!data?.isAffiliate) {
    return <AffiliateRegisterForm onSuccess={load} />;
  }

  const { affiliate, referrals, payouts } = data;
  // Always use production domain for shareable referral links (not sandbox/preview URLs)
  const isProd = typeof window !== 'undefined' && /ceriakid\.com/i.test(window.location.hostname);
  const baseUrl = isProd ? window.location.origin : 'https://ceriakid.com';
  const referralLink = `${baseUrl}/?ref=${affiliate.referralCode}`;

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto pt-20 md:pt-8">
        {/* Hero with referral link & quick share */}
        <AffiliateHero affiliate={affiliate} referralLink={referralLink} />

        {/* Stats overview */}
        <AffiliateStatsGrid affiliate={affiliate} />

        {/* Tier card — progression */}
        <AffiliateTierCard affiliate={affiliate} />

        {/* Payout action card */}
        <AffiliatePayoutCard affiliate={affiliate} onRequest={requestPayout} requesting={requesting} />

        {/* Bank info form */}
        <AffiliateBankForm affiliate={affiliate} onSuccess={load} />

        {/* Section divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mt-8 mb-4"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">📊 Aktiviti & Sejarah</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </motion.div>

        {/* Referrals + Payouts history */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AffiliateReferralList referrals={referrals} />
          <AffiliatePayoutList payouts={payouts} />
        </div>
      </div>
    </div>
  );
}