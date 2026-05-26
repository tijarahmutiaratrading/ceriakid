import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2, LayoutDashboard, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const tierLabels = {
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
};

const TIER_VALUES = { asas: 49, standard: 99, keluarga: 199 };

export default function ThankYou() {
  const { user, refreshAuth } = useAuth();
  const [status, setStatus] = useState('checking');
  const [tier, setTier] = useState(new URLSearchParams(window.location.search).get('tier') || '');
  const pollRef = useRef(null);
  const pollAttempts = useRef(0);

  useEffect(() => {
    // Fire Purchase pixel — uses URL tier param so we don't wait for webhook/auth.
    // Dedupe via sessionStorage so refresh doesn't double-fire.
    const urlTier = new URLSearchParams(window.location.search).get('tier');
    if (urlTier && TIER_VALUES[urlTier] && typeof window !== 'undefined' && window.fbq) {
      const dedupeKey = `purchase_fired_${urlTier}_${window.location.search}`;
      if (!sessionStorage.getItem(dedupeKey)) {
        const eventID = `purchase_${urlTier}_${Date.now()}`;
        window.fbq('track', 'Purchase', {
          currency: 'MYR',
          value: TIER_VALUES[urlTier],
          content_name: tierLabels[urlTier] || urlTier,
          content_ids: [urlTier],
          content_type: 'product',
        }, { eventID });
        sessionStorage.setItem(dedupeKey, '1');
      }
    }
  }, []);

  useEffect(() => {
    // Poll subscription status — webhook may take 5-30 seconds.
    // Retry every 3s up to 10 times (~30s total) before giving up.
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

    const poll = async () => {
      const done = await checkSubscription();
      pollAttempts.current += 1;
      if (done) {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      if (pollAttempts.current >= 10) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus('pending');
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 px-4 py-10 flex items-center justify-center font-nunito">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/10 p-6 md:p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-2xl"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-400/20 text-green-300 ring-1 ring-green-300/30">
          <CheckCircle className="h-11 w-11" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Pembayaran Berjaya!</h1>
        <p className="text-white/70 leading-relaxed mb-6">
          Terima kasih kerana melanggan CeriaKid{tier ? ` pelan ${tierLabels[tier] || tier}` : ''}. Akaun anda sedang diaktifkan secara automatik.
        </p>

        <div className="rounded-2xl bg-white/10 border border-white/15 p-4 mb-6">
          {status === 'checking' && (
            <p className="text-white/70 font-bold flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Menyemak langganan...
            </p>
          )}
          {status === 'active' && <p className="text-green-200 font-black">Langganan aktif. Anak boleh mula belajar sekarang.</p>}
          {status === 'pending' && <p className="text-yellow-100 font-bold">Pembayaran diterima. Jika akses belum aktif, tunggu sebentar dan refresh dashboard.</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-purple-800 shadow-lg">
            <LayoutDashboard className="h-4 w-4" /> Ke Dashboard
          </Link>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-black text-white">
            <Home className="h-4 w-4" /> Laman Utama
          </Link>
        </div>
      </motion.div>
    </div>
  );
}