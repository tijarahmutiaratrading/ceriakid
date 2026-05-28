import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Crown, Check, Loader, ArrowUp, CheckCircle2 } from 'lucide-react';

// Tier hierarchy — used to determine which packages are upgrades vs current/lower
// Note: premium & pro adalah tier admin/legacy — dianggap setara dengan keluarga (tertinggi)
const TIER_ORDER = ['free', 'asas', 'standard', 'keluarga', 'premium', 'pro'];

const TIER_PRICES = { free: 0, asas: 49, standard: 99, keluarga: 199, premium: 199, pro: 199 };

// Semua pakej yang boleh ditunjuk (free tak masuk sebab tu bukan pakej "naik taraf")
const ALL_TIERS = {
  asas: {
    name: 'asas',
    nameMY: '🌱 Asas',
    priceMYR: 49,
    color: 'from-green-400 to-emerald-500',
    features: [
      '~300 game (50/subjek)',
      '🎁 5 kredit AI percuma',
      'Semua subjek (BM, English, Math, Sains, Jawi, Tamil, Mandarin)',
      'Prasekolah & Sekolah Rendah',
      'Tanpa iklan',
      'Boleh guna offline 📲',
      '1 peranti sahaja',
    ],
  },
  standard: {
    name: 'standard',
    nameMY: '⭐ Standard',
    priceMYR: 99,
    color: 'from-blue-400 to-indigo-500',
    features: [
      '~600 game (100/subjek)',
      '🎁 20 kredit AI percuma',
      'Semua subjek',
      'Prasekolah & Sekolah Rendah',
      'Tanpa iklan',
      'Boleh guna offline 📲',
      'Sehingga 2 peranti',
    ],
  },
  keluarga: {
    name: 'keluarga',
    nameMY: '👑 Keluarga',
    priceMYR: 199,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Akses penuh semua game 🔓',
      '🎁 50 kredit AI percuma',
      'Sehingga 4 profil anak',
      'Semua subjek',
      'Boleh guna offline 📲',
      'Sokongan prioriti',
      'Sehingga 4 peranti',
    ],
    popular: true,
  },
};

const TIER_LABEL = {
  free: '🆓 Percuma',
  asas: '🌱 Asas',
  standard: '⭐ Standard',
  keluarga: '👑 Keluarga',
  premium: '👑 Keluarga',
  pro: '👑 Keluarga',
};

export default function UpgradeTierCard({ currentTier, user }) {
  const [upgrading, setUpgrading] = useState(null); // tier name yang sedang diproses
  const [error, setError] = useState('');
  const [confirmTier, setConfirmTier] = useState(null);

  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const allTierKeys = Object.keys(ALL_TIERS); // ['asas','standard','keluarga']
  // pro/premium/keluarga semua dianggap di pakej tertinggi (Keluarga)
  const isOnTopTier = ['keluarga', 'premium', 'pro'].includes(currentTier);
  const currentLabel = TIER_LABEL[currentTier] || '🆓 Percuma';

  const handleUpgrade = async (tierName) => {
    setError('');
    setUpgrading(tierName);
    try {
      const response = await base44.functions.invoke('chipCheckout', {
        tier: tierName,
        email: user.email,
        name: user.full_name || 'Pengguna',
        phone: user.phone || '60000000000',
        isUpgrade: true,
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
    <div className="rounded-3xl p-5 space-y-4" style={{ background: 'rgba(30,30,40,0.35)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <ArrowUp className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base leading-tight">Semua Pakej</p>
          <p className="text-white/70 text-xs font-semibold">
            Pakej anda sekarang: <span className="text-yellow-300 font-black">{currentLabel}</span>
          </p>
        </div>
      </div>

      {isOnTopTier && (
        <div className="rounded-2xl p-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-300/40 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-white font-black text-sm">Anda di pelan tertinggi!</p>
            <p className="text-white/80 text-xs font-semibold">Terima kasih kerana menyokong CeriaKid 💜</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-3 bg-red-500/20 border border-red-300/40 text-white text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allTierKeys.map((tierKey) => {
          const tier = ALL_TIERS[tierKey];
          const tierIdx = TIER_ORDER.indexOf(tierKey);
          // Kalau user pro/premium → tunjuk keluarga sebagai "current"
          const isCurrent = tierKey === currentTier || (isOnTopTier && tierKey === 'keluarga');
          const isLower = tierIdx <= currentIdx && !isCurrent;
          const isUpgrade = tierIdx > currentIdx && !isCurrent;
          const isProcessing = upgrading === tierKey;

          const currentPrice = TIER_PRICES[currentTier] || 0;
          const proRataPrice = Math.max(tier.priceMYR - currentPrice, 0);
          const savings = isUpgrade ? currentPrice : 0;

          return (
            <motion.div
              key={tier.name}
              whileHover={isUpgrade ? { y: -2 } : {}}
              className={`relative rounded-2xl p-4 bg-gradient-to-br ${tier.color} shadow-lg overflow-hidden ${
                isCurrent ? 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-slate-900/40' : tier.popular ? 'ring-2 ring-yellow-300' : ''
              } ${isLower && !isCurrent ? 'opacity-60' : ''}`}
            >
              {isCurrent && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-950 text-[10px] font-black shadow flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> AKTIF
                </span>
              )}
              {!isCurrent && tier.popular && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-950 text-[10px] font-black shadow">
                  POPULAR
                </span>
              )}
              <p className="font-black text-white text-lg leading-tight">{tier.nameMY}</p>

              {/* Price display — pro-rata for upgrades, full price for current/lower */}
              {isUpgrade ? (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">RM{proRataPrice}</span>
                    <span className="text-white/80 text-xs font-bold">sahaja</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                      <span className="text-white/70 text-[11px] font-bold line-through">RM{tier.priceMYR}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-yellow-300 text-yellow-950 text-[10px] font-black">
                        Jimat RM{savings}
                      </span>
                    </div>
                  )}
                  <p className="text-white/80 text-[11px] font-bold mb-3">Bayar gap sahaja • 1 tahun penuh</p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mt-1 mb-3">
                    <span className="text-2xl font-black text-white">RM{tier.priceMYR}</span>
                    <span className="text-white/80 text-xs font-bold">/ tahun</span>
                  </div>
                </>
              )}

              <ul className="space-y-1.5 mb-4">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-white text-xs font-semibold">
                    <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl bg-white/90 text-slate-900 font-black text-sm shadow-md flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={3} /> Pakej Anda
                </div>
              ) : isLower ? (
                <div className="w-full py-2.5 rounded-xl bg-white/20 text-white/80 font-black text-sm flex items-center justify-center gap-2">
                  Pakej Rendah
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={isProcessing || upgrading !== null}
                  onClick={() => setConfirmTier({ ...tier, proRataPrice, savings })}
                  className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-black text-sm shadow-md hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Memproses...</>
                  ) : (
                    <><Crown className="w-4 h-4" /> Naik Taraf</>
                  )}
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {!isOnTopTier && (
        <p className="text-white/60 text-[11px] text-center leading-relaxed">
          💡 Pro-rata: anda hanya bayar perbezaan harga. Tier baru aktif 1 tahun penuh sebaik bayaran berjaya.
        </p>
      )}

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
                <p className="text-slate-600 text-sm mt-2">Anda akan dicaj <span className="font-black text-slate-900">RM{confirmTier.proRataPrice}</span> sahaja (perbezaan dari pelan semasa).</p>
              </div>

              <div className="rounded-2xl bg-green-50 border border-green-200 p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Harga {confirmTier.nameMY.split(' ').slice(1).join(' ')}</span>
                  <span className="font-black text-slate-900">RM{confirmTier.priceMYR}</span>
                </div>
                {confirmTier.savings > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Tolak pelan semasa</span>
                    <span className="font-black text-green-700">− RM{confirmTier.savings}</span>
                  </div>
                )}
                <div className="border-t border-green-300 pt-1.5 flex justify-between">
                  <span className="text-slate-900 font-black text-sm">Anda bayar</span>
                  <span className="font-black text-green-700 text-sm">RM{confirmTier.proRataPrice}</span>
                </div>
                <p className="text-green-800 text-[11px] font-bold pt-1">✅ Tier baru aktif 1 tahun penuh dari hari pembayaran</p>
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