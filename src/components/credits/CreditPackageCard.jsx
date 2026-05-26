import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';

// Map pkg.color (tailwind gradient classes) → pastel accent hex pairs for the blob glows.
// Falls back gracefully if a colour isn't in the map.
const ACCENT_MAP = {
  'from-emerald-400 to-teal-500': { a: 'rgba(52, 211, 153, 0.45)', b: 'rgba(20, 184, 166, 0.30)', btn: 'from-emerald-500 to-teal-500' },
  'from-blue-400 to-indigo-500':  { a: 'rgba(96, 165, 250, 0.45)', b: 'rgba(99, 102, 241, 0.30)', btn: 'from-blue-500 to-indigo-500' },
  'from-purple-400 to-pink-500':  { a: 'rgba(192, 132, 252, 0.45)', b: 'rgba(236, 72, 153, 0.30)', btn: 'from-purple-500 to-pink-500' },
  'from-amber-400 to-orange-500': { a: 'rgba(251, 191, 36, 0.45)', b: 'rgba(249, 115, 22, 0.30)', btn: 'from-amber-500 to-orange-500' },
  'from-pink-400 to-rose-500':    { a: 'rgba(244, 114, 182, 0.45)', b: 'rgba(244, 63, 94, 0.30)', btn: 'from-pink-500 to-rose-500' },
};
const DEFAULT_ACCENT = { a: 'rgba(251, 191, 36, 0.45)', b: 'rgba(249, 115, 22, 0.30)', btn: 'from-amber-500 to-orange-500' };

export default function CreditPackageCard({ pkg, onBuy, busy }) {
  const totalCredits = pkg.credits + pkg.bonusCredits;
  const priceMYR = (pkg.price / 100).toFixed(0);
  const perCredit = (pkg.price / 100 / totalCredits).toFixed(3);
  const accent = ACCENT_MAP[pkg.color] || DEFAULT_ACCENT;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative overflow-hidden rounded-[1.75rem] p-5 shadow-xl border border-white/35 shadow-amber-950/10 ${pkg.popular ? 'ring-2 ring-amber-300/70' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.10))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Pastel blob accents (matching balance widget feel) */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all group-hover:scale-110"
        style={{ background: accent.a }}
      />
      <div
        className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full blur-3xl"
        style={{ background: accent.b }}
      />
      <div className="pointer-events-none absolute right-1/3 bottom-0 h-20 w-20 rounded-full bg-pink-400/20 blur-2xl" />

      {pkg.popular && (
        <div className="absolute top-3 right-3 z-10 bg-yellow-300 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow">
          ⭐ POPULAR
        </div>
      )}

      <div className="relative z-10">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-inner text-3xl">
          {pkg.emoji}
        </div>
        <h3 className="text-xl font-black mb-1 text-white drop-shadow">{pkg.name}</h3>
        <p className="text-white/85 text-xs font-semibold mb-4 drop-shadow">{pkg.description}</p>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 mb-4 border border-white/30 shadow-sm">
          <p className="text-white/85 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Anda Dapat
          </p>
          <p className="text-3xl font-black leading-tight text-white drop-shadow">{totalCredits} kredit</p>
          {pkg.bonusCredits > 0 && (
            <p className="text-yellow-100 text-xs font-bold drop-shadow">
              {pkg.credits} + {pkg.bonusCredits} bonus 🎁
            </p>
          )}
        </div>

        <div className="space-y-1.5 mb-4">
          {pkg.perks.map((perk, i) => (
            <div key={i} className="flex items-start gap-2 text-xs font-semibold text-white/95 drop-shadow">
              <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-black leading-none text-white drop-shadow-md">RM{priceMYR}</p>
            <p className="text-white/80 text-[10px] font-semibold mt-1 drop-shadow">~RM{perCredit}/kredit</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBuy(pkg)}
          disabled={busy}
          className={`w-full py-3 rounded-2xl bg-gradient-to-r ${accent.btn} text-white font-black text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 border border-white/30`}
        >
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : 'Beli Sekarang'}
        </button>
      </div>
    </motion.div>
  );
}