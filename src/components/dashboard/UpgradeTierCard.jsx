import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Crown, Check, X, Loader, ArrowUp } from 'lucide-react';

// Tier hierarchy — used to filter what's shown as an upgrade option
const TIER_ORDER = ['free', 'asas', 'standard', 'keluarga'];

const UPGRADE_TIERS = {
  asas: {
    name: 'asas',
    nameMY: '🌱 Asas',
    priceMYR: 49,
    perMonth: '4.08',
    color: 'from-green-400 to-emerald-500',
    features: ['50 game', '1 anak', '1 peranti', 'Semua subjek', 'Tanpa iklan'],
  },
  standard: {
    name: 'standard',
    nameMY: '⭐ Standard',
    priceMYR: 99,
    perMonth: '8.25',
    color: 'from-blue-400 to-indigo-500',
    features: ['100 game', '1 anak', '2 peranti', 'Semua subjek', 'Tanpa iklan'],
  },
  keluarga: {
    name: 'keluarga',
    nameMY: '👑 Keluarga',
    priceMYR: 199,
    perMonth: '16.58',
    color: 'from-purple-500 to-pink-500',
    features: ['200 game (tiada kunci)', 'Sehingga 4 anak', '4 peranti', 'Sokongan prioriti'],
    popular: true,
  },
};

export default function UpgradeTierCard({ currentTier, user }) {
  const [upgrading, setUpgrading] = useState(null); // tier name yang sedang diproses
  const [error, setError] = useState('');
  const [confirmTier, setConfirmTier] = useState(null);

  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const upgradeOptions = TIER_ORDER
    .slice(currentIdx + 1)
    .filter((t) => UPGRADE_TIERS[t]);

  // Tiada tier lebih tinggi — user dah di tier tertinggi
  if (upgradeOptions.length === 0) {
    return (
      <div className="rounded-3xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.4)' }}>
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-white font-black text-base">Anda di pelan tertinggi!</p>
        <p className="text-white/70 text-xs font-semibold mt-1">Terima kasih kerana menyokong CeriaKid 💜</p>
      </div>
    );
  }

  const handleUpgrade = async (tierName) => {
    setError('');
    setUpgrading(tierName);
    try {
      const response = await base44.functions.invoke('chipCheckout', {
        tier: tierName,
        email: user.email,
        name: user.full_name || 'Pengguna',
        phone: user.phone || '60000000000',
      });

      const checkoutUrl = response?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Gagal memulakan pembayaran. Sila cuba lagi.');
        setUpgrading(null);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err?.response?.data?.error || 'Ralat semasa naik taraf. Sila cuba lagi.');
      setUpgrading(null);
    }
  };

  return (
    <div className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.4)' }}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <ArrowUp className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div>
          <p className="text-white font-black text-base leading-tight">Naik Taraf Pelan</p>
          <p className="text-white/70 text-xs font-semibold">Tukar ke pelan lebih besar bila-bila masa</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl p-3 bg-red-500/20 border border-red-300/40 text-white text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {upgradeOptions.map((tierKey) => {
          const tier = UPGRADE_TIERS[tierKey];
          const isProcessing = upgrading === tierKey;
          return (
            <motion.div
              key={tier.name}
              whileHover={{ y: -2 }}
              className={`relative rounded-2xl p-4 bg-gradient-to-br ${tier.color} shadow-lg overflow-hidden ${tier.popular ? 'ring-2 ring-yellow-300' : ''}`}
            >
              {tier.popular && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-950 text-[10px] font-black shadow">
                  POPULAR
                </span>
              )}
              <p className="font-black text-white text-lg leading-tight">{tier.nameMY}</p>
              <div className="flex items-baseline gap-1 mt-1 mb-3">
                <span className="text-2xl font-black text-white">RM{tier.priceMYR}</span>
                <span className="text-white/80 text-xs font-bold">/tahun</span>
              </div>
              <p className="text-white/80 text-[11px] font-bold mb-3">≈ RM{tier.perMonth}/bulan</p>

              <ul className="space-y-1.5 mb-4">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-white text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={isProcessing || upgrading !== null}
                onClick={() => setConfirmTier(tier)}
                className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-black text-sm shadow-md hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  <><Crown className="w-4 h-4" /> Naik Taraf</>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-white/60 text-[11px] text-center leading-relaxed">
        💡 Bayaran sekali sahaja untuk 1 tahun. Tier baru aktif sebaik bayaran berjaya.
      </p>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !upgrading && setConfirmTier(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{confirmTier.nameMY.split(' ')[0]}</div>
                <p className="font-black text-slate-900 text-xl">Naik Taraf ke {confirmTier.nameMY.split(' ').slice(1).join(' ')}?</p>
                <p className="text-slate-600 text-sm mt-2">Anda akan diarahkan ke halaman pembayaran FPX untuk membayar <span className="font-black text-slate-900">RM{confirmTier.priceMYR}</span> untuk setahun.</p>
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 mb-4">
                <p className="text-amber-900 text-xs font-bold">⚠️ Nota: Bayaran adalah berasingan untuk pelan baru. Pelan semasa anda akan diganti selepas pembayaran berjaya.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!!upgrading}
                  onClick={() => setConfirmTier(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-slate-700 font-black text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!!upgrading}
                  onClick={() => handleUpgrade(confirmTier.name)}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-sm shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Memproses...</>
                  ) : (
                    <>🔒 Teruskan Bayar</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}