import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

export default function CreditPackageCard({ pkg, onBuy, busy }) {
  const totalCredits = pkg.credits + pkg.bonusCredits;
  const priceMYR = (pkg.price / 100).toFixed(0);
  const perCredit = (pkg.price / 100 / totalCredits).toFixed(3);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative rounded-3xl p-5 bg-gradient-to-br ${pkg.color} text-white shadow-xl overflow-hidden ${pkg.popular ? 'ring-4 ring-yellow-300/60' : ''}`}
    >
      {pkg.popular && (
        <div className="absolute top-3 right-3 bg-yellow-300 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow">
          ⭐ POPULAR
        </div>
      )}

      <p className="text-5xl mb-2">{pkg.emoji}</p>
      <h3 className="text-xl font-black mb-1">{pkg.name}</h3>
      <p className="text-white/85 text-xs font-semibold mb-4">{pkg.description}</p>

      <div className="bg-white/15 rounded-2xl p-3 mb-4">
        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Anda Dapat</p>
        <p className="text-3xl font-black leading-tight">{totalCredits} kredit</p>
        {pkg.bonusCredits > 0 && (
          <p className="text-yellow-200 text-xs font-bold">
            {pkg.credits} + {pkg.bonusCredits} bonus 🎁
          </p>
        )}
      </div>

      <div className="space-y-1.5 mb-4">
        {pkg.perks.map((perk, i) => (
          <div key={i} className="flex items-start gap-2 text-xs font-semibold">
            <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{perk}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-3xl font-black leading-none">RM{priceMYR}</p>
          <p className="text-white/70 text-[10px] font-semibold mt-1">~RM{perCredit}/kredit</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBuy(pkg)}
        disabled={busy}
        className="w-full py-3 rounded-2xl bg-white text-gray-900 font-black text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : 'Beli Sekarang'}
      </button>
    </motion.div>
  );
}