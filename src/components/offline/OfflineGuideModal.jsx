import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, WifiOff, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Parent-friendly modal explaining how offline mode works.
 * Step-by-step guide with visuals — no technical jargon.
 */
export default function OfflineGuideModal({ open, onClose }) {
  if (!open) return null;

  const steps = [
    {
      n: 1,
      icon: Download,
      color: 'from-blue-400 to-cyan-500',
      title: 'Pasang App ke Skrin Utama',
      desc: 'Buka menu browser → "Add to Home Screen" / "Pasang App". Bila ada ikon CeriaKid di skrin telefon, app akan jalan macam app biasa walaupun tiada internet.',
    },
    {
      n: 2,
      icon: Wifi,
      color: 'from-emerald-400 to-teal-500',
      title: 'Buka Games Dengan Wifi Dulu',
      desc: 'Sambil ada internet, suruh anak buka SEMUA game subject yang nak dimain (Bahasa Melayu, Math, Science, dll). App akan auto-simpan game ke peranti.',
    },
    {
      n: 3,
      icon: WifiOff,
      color: 'from-purple-400 to-fuchsia-500',
      title: 'Main Tanpa Internet',
      desc: 'Bila tiada wifi/data (contoh: dalam kereta, kampung, tempat liputan lemah), anak masih boleh main game yang sudah dibuka. Skor & bintang disimpan dalam peranti.',
    },
    {
      n: 4,
      icon: RefreshCw,
      color: 'from-orange-400 to-pink-500',
      title: 'Auto-Sync Bila Wifi Kembali',
      desc: 'Bila peranti sambung internet semula, semua progress anak akan auto-dihantar ke server. Tak perlu buat apa-apa — automatik!',
    },
  ];

  const canFeatures = [
    { icon: '🎮', text: 'Main semua game yang sudah dibuka' },
    { icon: '⭐', text: 'Kumpul bintang & skor' },
    { icon: '📊', text: 'Progress disimpan dalam peranti' },
    { icon: '🎨', text: 'Studio Lukisan' },
  ];

  const cantFeatures = [
    { icon: '🤖', text: 'Cikgu AI (Firdaus, Rosie, Mira, Daniel)' },
    { icon: '📚', text: 'Story & BBM Generator' },
    { icon: '🏆', text: 'Leaderboard & Cabaran kawan' },
    { icon: '🆕', text: 'Game baru yang belum dibuka' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem]"
          style={{
            background: 'linear-gradient(160deg, rgba(15,23,42,0.98), rgba(49,16,90,0.96), rgba(88,28,135,0.92))',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Drag indicator (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="sticky top-0 z-10 px-5 sm:px-7 pt-4 sm:pt-6 pb-4 flex items-start justify-between gap-3" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7) 70%, transparent)' }}>
            <div className="min-w-0">
              <p className="text-yellow-300 text-[10px] font-black uppercase tracking-[0.22em]">📡 Mode Offline</p>
              <h2 className="text-white text-xl sm:text-2xl font-black mt-1 leading-tight">
                Cara Main Tanpa Internet
              </h2>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mt-1">
                Anak boleh terus belajar walaupun tiada wifi 🎮
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 sm:px-7 pb-8 space-y-5">

            {/* 4-step guide */}
            <div className="space-y-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl p-4 flex items-start gap-3"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg relative`}>
                      <Icon className="w-5 h-5 text-white" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-purple-700 text-[10px] font-black flex items-center justify-center shadow-md">
                        {s.n}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm leading-tight">{s.title}</p>
                      <p className="text-white/75 text-xs font-semibold mt-1.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Boleh / Tak Boleh */}
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Boleh */}
              <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <p className="text-emerald-200 text-[11px] font-black uppercase tracking-wider">Boleh Tanpa Internet</p>
                </div>
                <ul className="space-y-2">
                  {canFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-white text-xs font-semibold">
                      <span className="text-base">{f.icon}</span> {f.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tak boleh */}
              <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-300" />
                  <p className="text-rose-200 text-[11px] font-black uppercase tracking-wider">Perlu Internet</p>
                </div>
                <ul className="space-y-2">
                  {cantFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-white text-xs font-semibold">
                      <span className="text-base">{f.icon}</span> {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tip box */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))', border: '1px solid rgba(251,191,36,0.3)' }}>
              <span className="text-2xl flex-shrink-0">💡</span>
              <div className="min-w-0">
                <p className="text-yellow-200 text-xs font-black uppercase tracking-wider mb-1">Tip Untuk Parent</p>
                <p className="text-white/90 text-xs font-semibold leading-relaxed">
                  Sebelum perjalanan jauh (cuti, balik kampung), buka semua game subject sekali dengan wifi laju. Lepas tu anak boleh main offline sepanjang perjalanan tanpa risau data habis!
                </p>
              </div>
            </div>

            {/* Close button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white text-purple-700 font-black text-sm shadow-xl"
            >
              Faham, Terima Kasih! 👍
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}