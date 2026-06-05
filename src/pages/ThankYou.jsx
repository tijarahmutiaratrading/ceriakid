import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, LayoutDashboard, Home, Sparkles, Coins, GraduationCap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const tierLabels = {
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
};

const TIER_VALUES = { asas: 49, standard: 99, keluarga: 199 };

const packageLabels = {
  starter: 'Pek Permulaan',
  family: 'Pek Keluarga',
  power: 'Pek Power',
};

export default function ThankYou() {
  const { user, refreshAuth } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const urlType = params.get('type'); // 'credit' or undefined (subscription)
  const urlTier = params.get('tier');
  const urlCredits = params.get('credits');
  const urlPackage = params.get('package');

  const isCredit = urlType === 'credit';

  const [status, setStatus] = useState('checking');
  const [tier, setTier] = useState(urlTier || '');
  const pollRef = useRef(null);
  const pollAttempts = useRef(0);

  // Confetti celebration sekali sahaja bila page load
  useEffect(() => {
    const dedupeKey = `confetti_fired_${window.location.search}`;
    if (!sessionStorage.getItem(dedupeKey)) {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#fbbf24', '#ec4899', '#8b5cf6', '#22c55e', '#3b82f6'],
        });
      }, 300);
      sessionStorage.setItem(dedupeKey, '1');
    }
  }, []);

  // Pixel Purchase event — HANYA fire untuk pembelian pakej pertama (subscription baru).
  // SKIP untuk:
  //   - Upgrade pakej (params.upgrade === '1') — bukan customer baru, tak relevan untuk ads tracking
  //   - Beli kredit (type === 'credit') — bukan subscription, tak relevan untuk Purchase event
  //
  // CAPI server-side juga fire dengan eventID YANG SAMA dari fbTracking (stored
  // di UserSubscription semasa checkout) supaya Meta auto-dedup.
  useEffect(() => {
    const isUpgrade = params.get('upgrade') === '1';
    if (isCredit || isUpgrade) return;
    if (!urlTier || !TIER_VALUES[urlTier]) return;
    if (typeof window === 'undefined' || !window.fbq) return;
    const dedupeKey = `purchase_fired_${urlTier}_${window.location.search}`;
    if (sessionStorage.getItem(dedupeKey)) return;

    (async () => {
      // Deterministic eventID dari purchaseId — CAPI server-side juga guna
      // formula sama supaya Meta auto-dedup browser vs server event.
      let eventID = `purchase_${urlTier}_${Date.now()}`;
      try {
        if (user?.email) {
          const subs = await base44.entities.UserSubscription.filter({ email: user.email });
          const sub = subs?.find(s => s.status === 'active');
          if (sub?.stripeCustomerId) {
            eventID = `Purchase_${sub.stripeCustomerId}`;
          }
        }
      } catch { /* fallback to generated eventID */ }

      window.fbq('track', 'Purchase', {
        currency: 'MYR',
        value: TIER_VALUES[urlTier],
        content_name: tierLabels[urlTier] || urlTier,
        content_ids: [urlTier],
        content_type: 'product',
      }, { eventID });
      sessionStorage.setItem(dedupeKey, '1');
    })();
  }, [urlTier, isCredit, user?.email]);

  // Poll subscription status — webhook may take 5-30 seconds.
  // Lepas 4 attempt (12s) masih pending → trigger on-demand verify dengan Chip API
  // supaya tak perlu tunggu webhook lambat / fail.
  useEffect(() => {
    if (isCredit) {
      // Untuk credit, tak perlu poll subscription — terus mark active
      setStatus('active');
      return;
    }

    let verifyTriggered = false;

    const checkSubscription = async () => {
      if (!user?.email) return false;
      try {
        const subs = await base44.entities.UserSubscription.filter({ email: user.email });
        const active = subs?.find(sub => sub.status === 'active');
        if (active) {
          const activeTier = active.tier || tier;
          setTier(activeTier);
          setStatus('active');
          refreshAuth?.();
          return true;
        }
      } catch (e) {
        // ignore — will retry
      }
      return false;
    };

    // On-demand verify dengan Chip API — fallback kalau webhook lambat/fail
    const triggerVerify = async () => {
      if (verifyTriggered) return;
      verifyTriggered = true;
      try {
        await base44.functions.invoke('verifyAndActivatePending', {});
      } catch (_) {
        // Silent fail — kalau gagal, polling teruskan & user boleh manual retry
      }
    };

    const poll = async () => {
      const done = await checkSubscription();
      pollAttempts.current += 1;
      if (done) {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      // Lepas 4 attempt (≈12s) — auto-verify dengan Chip API (silent background)
      if (pollAttempts.current === 4) {
        triggerVerify();
      }
      // 20 attempts × 3s = 60 saat. Chip webhook kadang-kadang lambat sampai 45s.
      if (pollAttempts.current >= 20) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus('pending');
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.email, isCredit]);

  // Title & description berdasarkan jenis pembelian
  const headline = isCredit ? 'Kredit Berjaya Ditambah!' : 'Pembayaran Berjaya!';
  const subline = isCredit
    ? `Terima kasih! ${urlCredits || ''} kredit AI telah ditambah ke akaun anda${urlPackage && packageLabels[urlPackage] ? ` (${packageLabels[urlPackage]})` : ''}. Anda boleh mula guna Cikgu AI sekarang.`
    : `Terima kasih kerana melanggan CeriaKid${tier ? ` pelan ${tierLabels[tier] || tier}` : ''}. Akaun anda sedang diaktifkan secara automatik.`;

  const Icon = isCredit ? Coins : CheckCircle;
  const iconColor = isCredit ? 'text-yellow-300' : 'text-green-300';
  const iconBg = isCredit ? 'bg-yellow-400/20 ring-yellow-300/30' : 'bg-green-400/20 ring-green-300/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 px-4 py-10 flex items-center justify-center font-nunito relative overflow-hidden">
      {/* Floating sparkles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 18 }}
        className="relative w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/10 p-6 md:p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2, damping: 12 }}
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ring-1 ${iconBg} ${iconColor}`}
        >
          <Icon className="h-11 w-11" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          {headline}
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </h1>
        <p className="text-white/70 leading-relaxed mb-6">{subline}</p>

        <div className="rounded-2xl bg-white/10 border border-white/15 p-4 mb-6">
          {status === 'checking' && (
            <p className="text-white/70 font-bold flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Menyemak akaun...
            </p>
          )}
          {status === 'active' && (
            <p className="text-green-200 font-black">
              {isCredit ? '✨ Kredit aktif. Mulakan jana cerita & BBM!' : '✅ Langganan aktif. Anak boleh mula belajar sekarang.'}
            </p>
          )}
          {status === 'pending' && (
            <div className="space-y-3">
              <p className="text-yellow-100 font-bold">Pembayaran diterima. Aktivasi sedang diproses — kadang-kadang ambil masa sehingga 1 minit.</p>
              <button
                onClick={async () => {
                  pollAttempts.current = 0;
                  setStatus('checking');
                  if (pollRef.current) clearInterval(pollRef.current);
                  // Force verify dengan Chip API — bypass webhook delay
                  try {
                    await base44.functions.invoke('verifyAndActivatePending', {});
                  } catch (_) { /* continue to poll */ }
                  const retry = async () => {
                    if (!user?.email) return;
                    const subs = await base44.entities.UserSubscription.filter({ email: user.email });
                    const active = subs?.find(s => s.status === 'active');
                    if (active) {
                      setTier(active.tier || tier);
                      setStatus('active');
                      refreshAuth?.();
                    } else {
                      pollAttempts.current += 1;
                      if (pollAttempts.current >= 20) {
                        if (pollRef.current) clearInterval(pollRef.current);
                        setStatus('pending');
                      }
                    }
                  };
                  retry();
                  pollRef.current = setInterval(retry, 3000);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-black text-white transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Semak Semula
              </button>
            </div>
          )}
        </div>

        {/* Primary CTA: Ke Dashboard — selalu ada */}
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-3.5 font-black text-purple-900 shadow-xl shadow-orange-500/30 hover:scale-[1.02] transition-transform"
          >
            <LayoutDashboard className="h-5 w-5" /> Ke Dashboard
          </Link>
          {isCredit ? (
            <Link
              to="/ai-assistant"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 font-black text-white hover:bg-white/20 transition-colors"
            >
              <GraduationCap className="h-5 w-5" /> Cikgu AI
            </Link>
          ) : (
            <Link
              to="/children-profiles"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 font-black text-white hover:bg-white/20 transition-colors"
            >
              <Sparkles className="h-5 w-5" /> Tambah Anak
            </Link>
          )}
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm font-bold transition-colors"
        >
          <Home className="h-4 w-4" /> Laman Utama
        </Link>
      </motion.div>
    </div>
  );
}