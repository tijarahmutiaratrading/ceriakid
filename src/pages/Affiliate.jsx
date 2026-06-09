import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, BarChart3 } from 'lucide-react';
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
import ReferralShareCard from '@/components/affiliate/ReferralShareCard';
import ReferralLinkCard from '@/components/affiliate/ReferralLinkCard';
import AppHeader from '@/components/AppHeader';

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
      <>
        <AppHeader title="Affiliate" />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Memuat dashboard affiliate...</p>
          </div>
        </div>
      </>
    );
  }

  if (!data?.isAffiliate) {
    return <AffiliateRegisterForm onSuccess={load} />;
  }

  const { affiliate, referrals, payouts } = data;
  // SEMUA referral link MESTI guna canonical production domain — tak kira admin/affiliate
  // bukak page ni dari sandbox (app.base44.com), preview, staging, atau ceriakid.com sendiri.
  // Ini elakkan affiliate tersilap share link yang point ke sandbox/preview.
  const referralLink = `https://ceriakid.com/?ref=${affiliate.referralCode}`;

  return (
    <>
      <AppHeader title="Affiliate" theme="light" />
      <div
        className="min-h-screen relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
        style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)' }}
      >
      {/* Floating decorations — CeriaKid vibe (same as Challenges) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>

      <div className="relative p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Hero with referral link & quick share */}
        <AffiliateHero affiliate={affiliate} referralLink={referralLink} />

        {/* Mobile-only referral link card — desktop guna hero side card */}
        <ReferralLinkCard referralLink={referralLink} />

        {/* Viral share card — generate PNG untuk WhatsApp */}
        <ReferralShareCard
          affiliate={affiliate}
          referralLink={referralLink}
          userName={affiliate.fullName || affiliate.userEmail?.split('@')[0]}
        />

        {/* Stats overview */}
        <AffiliateStatsGrid affiliate={affiliate} />

        {/* Tier card — progression */}
        <AffiliateTierCard affiliate={affiliate} />

        {/* Payout action card */}
        <AffiliatePayoutCard affiliate={affiliate} onRequest={requestPayout} requesting={requesting} />

        {/* Bank info form */}
        <AffiliateBankForm affiliate={affiliate} onSuccess={load} />

        {/* Aktiviti & Sejarah — dalam satu card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-white/60 shadow-xl shadow-purple-950/10 p-5 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-slate-900 font-black text-base leading-tight">Aktiviti & Sejarah</p>
              <p className="text-slate-500 text-xs font-semibold">Rujukan dan rekod payout anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AffiliateReferralList referrals={referrals} />
            <AffiliatePayoutList payouts={payouts} />
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}