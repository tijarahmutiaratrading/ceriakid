import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Crown, Check, Loader, ArrowUp, CheckCircle2, Calendar, Clock, AlertCircle, Sprout, Star, Sparkles, Trophy, Heart, User, UserRound, Lock, Lightbulb, AlertTriangle, Hourglass, XCircle, Gift } from 'lucide-react';

// Tier visual config — gradient icon container utk consistency
const TIER_VISUAL = {
  free: { Icon: Sparkles, gradient: 'from-slate-400 to-slate-500', label: 'Percuma' },
  asas: { Icon: Sprout, gradient: 'from-green-400 to-emerald-500', label: 'Asas' },
  standard: { Icon: Star, gradient: 'from-blue-400 to-indigo-500', label: 'Standard' },
  keluarga: { Icon: Crown, gradient: 'from-purple-500 to-pink-500', label: 'Keluarga' },
  premium: { Icon: Crown, gradient: 'from-purple-500 to-pink-500', label: 'Keluarga' },
  pro: { Icon: Crown, gradient: 'from-purple-500 to-pink-500', label: 'Keluarga' },
};

const TierIconBadge = ({ tierKey, size = 'md' }) => {
  const cfg = TIER_VISUAL[tierKey] || TIER_VISUAL.free;
  const dims = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-7 h-7' : 'w-4 h-4';
  return (
    <div className={`${dims} rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
      <cfg.Icon className={`${iconSize} text-white`} strokeWidth={2.5} />
    </div>
  );
};
import { useGameStats, formatGameCount } from '@/hooks/useGameStats';

// Tier hierarchy — used to determine which packages are upgrades vs current/lower
// Note: premium & pro adalah tier admin/legacy — dianggap setara dengan keluarga (tertinggi)
const TIER_ORDER = ['free', 'asas', 'standard', 'keluarga', 'premium', 'pro'];

const TIER_PRICES = { free: 0, asas: 49, standard: 99, keluarga: 199, premium: 199, pro: 199 };

// Semua pakej yang boleh ditunjuk (free tak masuk sebab tu bukan pakej "naik taraf")
// gameLabel adalah dinamik — dijana dari real-time game stats (lihat buildTiers di bawah)
const buildTiers = (stats) => {
  const fmt = (n) => formatGameCount(n);
  const asasCount = stats?.accessibleByTier?.asas;
  const standardCount = stats?.accessibleByTier?.standard;
  const keluargaCount = stats?.accessibleByTier?.keluarga;

  return {
    asas: {
      name: 'asas',
      nameMY: 'Asas',
      priceMYR: 49,
      color: 'from-green-400 to-emerald-500',
      features: [
        asasCount ? `${fmt(asasCount)} game (50/subjek)` : '50 game/subjek',
        '5 kredit AI percuma',
        'Semua subjek (BM, English, Math, Sains, Jawi, Tamil, Mandarin)',
        'Prasekolah & Sekolah Rendah',
        'Tanpa iklan',
        '1 peranti sahaja',
      ],
    },
    standard: {
      name: 'standard',
      nameMY: 'Standard',
      priceMYR: 99,
      color: 'from-blue-400 to-indigo-500',
      features: [
        standardCount ? `${fmt(standardCount)} game (100/subjek)` : '100 game/subjek',
        '20 kredit AI percuma',
        'Semua subjek',
        'Prasekolah & Sekolah Rendah',
        'Tanpa iklan',
        'Boleh guna offline',
        'Sehingga 2 peranti',
      ],
    },
    keluarga: {
      name: 'keluarga',
      nameMY: 'Keluarga',
      priceMYR: 199,
      color: 'from-purple-500 to-pink-500',
      features: [
        keluargaCount ? `Akses penuh ${fmt(keluargaCount)} game` : 'Akses penuh semua game',
        '50 kredit AI percuma',
        'Sehingga 4 profil anak',
        'Semua subjek',
        'Boleh guna offline',
        'Sokongan prioriti',
        'Sehingga 4 peranti',
      ],
      popular: true,
    },
  };
};

const TIER_LABEL = {
  free: 'Percuma',
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
  premium: 'Keluarga',
  pro: 'Keluarga',
};

export default function UpgradeTierCard({ currentTier, user, gender, onGenderChange }) {
  const [upgrading, setUpgrading] = useState(null); // tier name yang sedang diproses
  const [error, setError] = useState('');
  const [confirmTier, setConfirmTier] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const { stats } = useGameStats();

  // Load subscription details (status + tarikh tamat)
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email })
      .then((data) => setSubscription(data?.[0] || null))
      .catch(() => setSubscription(null));
  }, [user?.email]);

  const endDate = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const isExpired = endDate && endDate < new Date();
  const daysRemaining = endDate ? Math.max(Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)), 0) : null;
  const statusInfo = isExpired
    ? { label: 'Langganan Tamat', Icon: AlertTriangle, color: 'text-red-600' }
    : subscription?.status === 'active'
      ? { label: 'Aktif', Icon: CheckCircle2, color: 'text-green-600' }
      : subscription?.status === 'incomplete'
        ? { label: 'Menunggu Bayaran', Icon: Hourglass, color: 'text-amber-600' }
        : currentTier === 'free'
          ? { label: 'Akaun Percuma', Icon: Sparkles, color: 'text-slate-600' }
          : { label: 'Tidak Aktif', Icon: XCircle, color: 'text-slate-500' };

  // Auto-generate tier features dengan real-time game count
  const ALL_TIERS = buildTiers(stats);

  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const allTierKeys = Object.keys(ALL_TIERS); // ['asas','standard','keluarga']
  // pro/premium/keluarga semua dianggap di pakej tertinggi (Keluarga)
  const isOnTopTier = ['keluarga', 'premium', 'pro'].includes(currentTier);
  const currentLabel = TIER_LABEL[currentTier] || 'Percuma';

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
    <div
      className="rounded-3xl p-5 space-y-4"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        boxShadow: '0 8px 24px rgba(251, 207, 232, 0.25)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <ArrowUp className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 font-black text-base leading-tight">Langganan & Pakej</p>
          <p className="text-slate-600 text-xs font-semibold flex items-center gap-1.5">
            Pakej anda sekarang:
            <TierIconBadge tierKey={currentTier} size="sm" />
            <span className="text-orange-600 font-black">{currentLabel}</span>
          </p>
        </div>
      </div>

      {/* Status langganan semasa — papar untuk semua kecuali free tanpa tarikh */}
      {(subscription?.tier && subscription.tier !== 'free') || isExpired ? (
        <div className={`rounded-2xl p-3 border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-100'}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <statusInfo.Icon className={`w-4 h-4 ${statusInfo.color}`} strokeWidth={3} />
              <span className="text-slate-800 font-black text-xs">{statusInfo.label}</span>
            </div>
            {endDate && (
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="w-3 h-3" />
                  {endDate.toLocaleDateString('ms-MY')}
                </span>
                {!isExpired && daysRemaining !== null && (
                  <span className={`flex items-center gap-1 ${daysRemaining <= 7 ? 'text-orange-600' : 'text-slate-600'}`}>
                    <Clock className="w-3 h-3" />
                    {daysRemaining} hari lagi
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Jantina picker — papar hanya kalau parent component pass gender props */}
      {onGenderChange && (
        <div className="rounded-2xl p-3 bg-pink-50/60 border border-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
              <User className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <p className="text-slate-600 text-[11px] font-black uppercase tracking-wider">Jantina</p>
          </div>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            {[
              { value: 'male', label: 'Lelaki', Icon: User },
              { value: 'female', label: 'Perempuan', Icon: UserRound },
            ].map((option) => {
              const active = gender === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onGenderChange(option.value)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${
                    active
                      ? 'brand-gradient text-white shadow-lg'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-purple-300'
                  }`}
                >
                  <option.Icon className="w-4 h-4" strokeWidth={2.5} />
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {isOnTopTier && (
        <div className="rounded-2xl p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-orange-500 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1">
            <p className="text-slate-800 font-black text-sm">Anda di pelan tertinggi!</p>
            <p className="text-slate-600 text-xs font-semibold flex items-center gap-1">
              Terima kasih kerana menyokong CeriaKid
              <Heart className="w-3 h-3 text-pink-500 inline" fill="currentColor" />
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={3} /> {error}
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
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur-sm ring-1 ring-white/40 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const TierIcon = (TIER_VISUAL[tier.name] || TIER_VISUAL.free).Icon;
                    return <TierIcon className="w-5 h-5 text-white" strokeWidth={2.5} />;
                  })()}
                </div>
                <p className="font-black text-white text-lg leading-tight">{tier.nameMY}</p>
              </div>

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
                {tier.features.map((f, i) => {
                  const isGift = /kredit AI percuma/i.test(f);
                  const FeatIcon = isGift ? Gift : Check;
                  return (
                    <li key={i} className="flex items-center gap-1.5 text-white text-xs font-semibold">
                      <FeatIcon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={3} />
                      <span>{f}</span>
                    </li>
                  );
                })}
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
        <p className="text-slate-500 text-[11px] text-center leading-relaxed flex items-center justify-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" strokeWidth={3} />
          Pro-rata: anda hanya bayar perbezaan harga. Tier baru aktif 1 tahun penuh sebaik bayaran berjaya.
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
                <div className="w-16 h-16 mx-auto mb-3">
                  <TierIconBadge tierKey={confirmTier.name} size="lg" />
                </div>
                <p className="font-black text-slate-900 text-xl">Naik Taraf ke {confirmTier.nameMY}?</p>
                <p className="text-slate-600 text-sm mt-2">Anda akan dicaj <span className="font-black text-slate-900">RM{confirmTier.proRataPrice}</span> sahaja (perbezaan dari pelan semasa).</p>
              </div>

              <div className="rounded-2xl bg-green-50 border border-green-200 p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Harga {confirmTier.nameMY}</span>
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
                <p className="text-green-800 text-[11px] font-bold pt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" strokeWidth={3} />
                  Tier baru aktif 1 tahun penuh dari hari pembayaran
                </p>
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
                    <><Lock className="w-4 h-4" strokeWidth={3} /> Teruskan Bayar</>
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