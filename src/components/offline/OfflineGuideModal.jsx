import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Wifi, WifiOff, RefreshCw, CheckCircle2, Plane } from 'lucide-react';

/**
 * Parent-friendly guide explaining how offline mode works.
 * 4 steps: Install → Open with Wifi → Play Offline → Auto-sync.
 */
export default function OfflineGuideModal({ open, onClose }) {
  const steps = [
    {
      icon: Download,
      color: 'from-blue-400 to-cyan-500',
      title: '1. Pasang App ke Skrin Utama',
      desc: 'Bila layari CeriaKid kali pertama, browser akan tanya "Add to Home Screen". Tekan YA — ini buat app boleh dibuka tanpa wifi.',
    },
    {
      icon: Wifi,
      color: 'from-emerald-400 to-teal-500',
      title: '2. Buka Games Dengan Wifi Dulu',
      desc: 'Pastikan ada wifi/data, kemudian buka semua subject yang anak nak main. App akan simpan game secara automatik.',
    },
    {
      icon: WifiOff,
      color: 'from-orange-400 to-amber-500',
      title: '3. Main Offline Bila-Bila',
      desc: 'Di kereta, kampung, atau tempat tiada wifi — anak boleh terus main. Progress disimpan dalam telefon.',
    },
    {
      icon: RefreshCw,
      color: 'from-purple-400 to-pink-500',
      title: '4. Auto-Sync Bila Wifi Kembali',
      desc: 'Bila telefon dapat wifi semula, progress anak akan disync ke akaun secara automatik. Tak perlu buat apa-apa.',
    },
  ];

  const canDo = [
    'Main semua games yang dah dibuka',
    'Lukis di Studio Lukisan',
    'Lihat profil anak',
    'Score & bintang disimpan',
  ];

  const needsInternet = [
    'Cikgu AI (Firdaus, Rosie, Mira, Daniel)',
    'Generate cerita / BBM baru',
    'Buka game subject baru kali pertama',
    'Daftar masuk / log keluar',
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed inset-x-3 top-8 bottom-8 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-12 sm:bottom-12 sm:w-full sm:max-w-xl z-[101] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.96), rgba(49,16,90,0.92), rgba(88,28,135,0.88))', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Plane className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Cara Guna Mode Offline</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Panduan untuk parent</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Steps */}
              <div className="space-y-2.5">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 p-3 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs mb-1">{step.title}</p>
                        <p className="text-white/75 text-[11px] font-semibold leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Can Do vs Needs Internet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="rounded-2xl p-3" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <p className="text-emerald-200 font-black text-[10px] uppercase tracking-wider">Boleh Offline</p>
                  </div>
                  <ul className="space-y-1">
                    {canDo.map((item, i) => (
                      <li key={i} className="text-white/85 text-[11px] font-semibold leading-snug flex gap-1.5">
                        <span className="text-emerald-300 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl p-3" style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wifi className="w-3.5 h-3.5 text-orange-300" />
                    <p className="text-orange-200 font-black text-[10px] uppercase tracking-wider">Perlu Internet</p>
                  </div>
                  <ul className="space-y-1">
                    {needsInternet.map((item, i) => (
                      <li key={i} className="text-white/85 text-[11px] font-semibold leading-snug flex gap-1.5">
                        <span className="text-orange-300 flex-shrink-0">○</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Travel tip */}
              <div className="rounded-2xl p-3" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <p className="text-white/90 text-[11px] font-semibold leading-relaxed">
                  ✈️ <span className="font-black">Tip Perjalanan Jauh:</span> Sehari sebelum balik kampung atau outstation, buka semua subject anak dengan wifi rumah. Lepas tu anak boleh main sepanjang perjalanan tanpa data!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-black text-sm shadow-lg hover:opacity-90 transition-opacity"
              >
                Faham, Terima Kasih!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}