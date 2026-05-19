import React, { useEffect, useState } from 'react';
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

export default function ThankYou() {
  const { user, refreshAuth } = useAuth();
  const [status, setStatus] = useState('checking');
  const [tier, setTier] = useState(new URLSearchParams(window.location.search).get('tier') || '');

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.email) return;
      const subs = await base44.entities.UserSubscription.filter({ email: user.email });
      const active = subs?.find(sub => sub.status === 'active');
      if (active) {
        const activeTier = active.tier || tier;
        setTier(activeTier);
        setStatus('active');
        refreshAuth?.();

        // Fire Purchase pixel — only after subscription confirmed active.
        // Use subscription ID as eventID to dedupe across refreshes.
        const eventID = `purchase_${active.id}`;
        const alreadyFired = localStorage.getItem(`pixel_fired_${eventID}`);
        if (!alreadyFired && window.fbq) {
          const value = activeTier === 'asas' ? 49 : activeTier === 'standard' ? 99 : activeTier === 'keluarga' ? 199 : 0;
          window.fbq('track', 'Purchase', {
            currency: 'MYR',
            value: value,
            content_name: tierLabels[activeTier] || activeTier || 'CeriaKid Plan',
            content_ids: [activeTier],
            content_type: 'product',
          }, { eventID });
          localStorage.setItem(`pixel_fired_${eventID}`, '1');
        }
      } else {
        setStatus('pending');
      }
    };

    checkSubscription();
    const timer = setTimeout(checkSubscription, 4000);
    return () => clearTimeout(timer);
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