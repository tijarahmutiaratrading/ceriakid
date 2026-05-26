import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Banknote, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MIN_PAYOUT = 50;

export default function AffiliatePayoutCard({ affiliate, onRequest, requesting }) {
  const balance = affiliate.pendingBalance || 0;
  const canWithdraw = balance >= MIN_PAYOUT;
  const progressToMin = Math.min(100, (balance / MIN_PAYOUT) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl mb-6 shadow-lg"
    >
      {/* Background */}
      <div className={`absolute inset-0 ${canWithdraw ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500' : 'bg-gradient-to-br from-slate-100 to-slate-50'}`} />
      {canWithdraw && (
        <>
          <div className="absolute top-0 -right-12 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-12 w-48 h-48 rounded-full bg-emerald-300/30 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${canWithdraw ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-200'}`}>
              <Wallet className={`w-6 h-6 sm:w-7 sm:h-7 ${canWithdraw ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${canWithdraw ? 'text-white/80' : 'text-slate-500'}`}>
                  Baki Pendapatan
                </span>
                {canWithdraw && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> SEDIA
                  </span>
                )}
              </div>
              <p className={`text-3xl sm:text-4xl font-black leading-none ${canWithdraw ? 'text-white' : 'text-slate-900'}`}>
                RM{balance.toFixed(2)}
              </p>
              <p className={`text-xs mt-1.5 ${canWithdraw ? 'text-white/80' : 'text-slate-500'}`}>
                {canWithdraw
                  ? '🎉 Boleh withdraw sekarang!'
                  : `Minimum RM${MIN_PAYOUT} untuk withdraw`}
              </p>
            </div>
          </div>

          <Button
            onClick={onRequest}
            disabled={requesting || !canWithdraw}
            className={`font-black px-6 py-6 rounded-xl shadow-xl text-base whitespace-nowrap ${
              canWithdraw
                ? 'bg-white text-emerald-700 hover:bg-white/90'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {requesting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
            ) : (
              <><Banknote className="w-5 h-5 mr-2" /> Request Payout</>
            )}
          </Button>
        </div>

        {/* Progress to min withdraw */}
        {!canWithdraw && balance > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Progress ke minimum withdraw
              </span>
              <span className="font-black text-slate-900">RM{(MIN_PAYOUT - balance).toFixed(2)} lagi</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToMin}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}