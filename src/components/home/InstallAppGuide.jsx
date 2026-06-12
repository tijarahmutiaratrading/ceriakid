import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus, MoreVertical, Apple, ChevronRight, CheckCircle2, MonitorSmartphone, AlertTriangle, Lightbulb, Sparkles, Rocket, WifiOff, Bell } from 'lucide-react';

const DISMISS_KEY = 'install_guide_dismissed_until';

/**
 * Tutorial install PWA — auto-detect platform (iOS/Android), boleh dismiss 7 hari,
 * auto-hide bila app dah dipasang (standalone mode).
 */
export default function InstallAppGuide() {
  const [platform, setPlatform] = useState(null); // 'ios' | 'android' | 'desktop'
  const [showModal, setShowModal] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check kalau sudah dipasang sebagai PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true;
    if (isStandalone) {
      setHidden(true);
      return;
    }

    // Check dismissed-until timestamp
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setHidden(true);
      return;
    }

    // Detect platform
    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setPlatform('ios');
    } else if (/Android/i.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
    setHidden(false);

    // Capture Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = (e) => {
    e?.stopPropagation();
    // Hide for 7 days
    const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, until.toString());
    setHidden(true);
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setHidden(true);
    }
    setDeferredPrompt(null);
  };

  if (hidden) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate rounded-3xl overflow-hidden shadow-xl bg-white/10 backdrop-blur-xl border border-white/15"
        style={{ boxShadow: '0 18px 50px rgba(31, 16, 92, 0.25)' }}
      >
        <div className="relative z-10 p-3.5 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/25 flex items-center justify-center shadow-lg">
              <MonitorSmartphone className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">Pasang CeriaKid sebagai app</p>
              <p className="text-white/60 text-[11px] font-semibold leading-tight">Cepat, offline-ready & full screen.</p>
            </div>
          </div>

          {/* Platform-specific CTA */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setPlatform('ios'); setShowModal(true); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs transition-all ${
                platform === 'ios'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <Apple className="w-3.5 h-3.5" /> iPhone
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setPlatform('android'); deferredPrompt ? handleAndroidInstall() : setShowModal(true); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs transition-all ${
                platform === 'android'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <InstallModal
            platform={platform}
            onClose={() => setShowModal(false)}
            onAndroidInstall={deferredPrompt ? handleAndroidInstall : null}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function InstallModal({ platform, onClose, onAndroidInstall }) {
  const [activeTab, setActiveTab] = useState(platform === 'android' ? 'android' : 'ios');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.96), rgba(88,28,135,0.92), rgba(190,24,93,0.85))',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/30 flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">Pasang CeriaKid</p>
              <p className="text-white/70 text-[11px] font-semibold">Panduan install web app</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-3 border-b border-white/10">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-xs transition-all ${
              activeTab === 'ios' ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Apple className="w-3.5 h-3.5" /> iPhone / iPad
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-xs transition-all ${
              activeTab === 'android' ? 'bg-white text-purple-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Android
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-5 py-4">
          {activeTab === 'ios' ? <IOSInstructions /> : <AndroidInstructions onInstall={onAndroidInstall} />}

          {/* Benefits */}
          <div className="mt-5 p-4 rounded-2xl bg-white/8 border border-white/15">
            <p className="text-white/90 font-black text-xs mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Kelebihan pasang sebagai app:
            </p>
            <ul className="space-y-1.5 text-white/80 text-[11px] font-semibold leading-relaxed">
              <li className="flex items-start gap-2"><Sparkles className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} /> Buka terus dari home screen — tak perlu cari browser</li>
              <li className="flex items-start gap-2"><Rocket className="w-3.5 h-3.5 text-pink-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} /> Loading lebih pantas, full screen tanpa address bar</li>
              <li className="flex items-start gap-2"><WifiOff className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} /> Boleh main game offline (sync auto bila kembali online)</li>
              <li className="flex items-start gap-2"><Bell className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" strokeWidth={2.5} /> Boleh terima notifikasi reminder belajar</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/20">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IOSInstructions() {
  const steps = [
    {
      num: 1,
      title: 'Buka dalam Safari',
      desc: 'Penting! Tutorial ini hanya berfungsi dalam Safari browser. Kalau guna Chrome atau lain, copy URL dan paste dalam Safari dulu.',
      icon: <Apple className="w-5 h-5" />,
    },
    {
      num: 2,
      title: 'Tap butang Share',
      desc: 'Cari ikon "Share" di bahagian bawah skrin (atau atas untuk iPad) — kotak dengan anak panah ke atas.',
      icon: <Share className="w-5 h-5" />,
    },
    {
      num: 3,
      title: 'Pilih "Add to Home Screen"',
      desc: 'Scroll ke bawah dalam menu Share. Tap "Add to Home Screen" atau "Tambah ke Skrin Utama".',
      icon: <Plus className="w-5 h-5" />,
    },
    {
      num: 4,
      title: 'Tap "Add" / "Tambah"',
      desc: 'Pastikan nama "CeriaKid" tertera, kemudian tap "Add" di kanan atas. Selesai! 🎉',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30">
        <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" strokeWidth={2.5} />
        <p className="text-amber-100 text-[11px] font-bold leading-snug">
          iPhone/iPad <span className="font-black">WAJIB guna Safari</span> — Chrome di iOS tak boleh install PWA.
        </p>
      </div>

      {steps.map((step) => (
        <div key={step.num} className="flex gap-3 p-3 rounded-2xl bg-white/8 border border-white/15">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-sm shadow-lg">
            {step.num}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-white">
              {step.icon}
              <p className="font-black text-sm">{step.title}</p>
            </div>
            <p className="text-white/75 text-xs font-semibold leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AndroidInstructions({ onInstall }) {
  const steps = [
    {
      num: 1,
      title: 'Buka dalam Chrome',
      desc: 'Pastikan anda guna Google Chrome. Browser lain mungkin tak ada pilihan install.',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      num: 2,
      title: 'Tap menu 3-titik',
      desc: 'Tap ikon 3-titik (⋮) di kanan atas skrin Chrome.',
      icon: <MoreVertical className="w-5 h-5" />,
    },
    {
      num: 3,
      title: 'Pilih "Install app" / "Tambah ke skrin Laman Utama"',
      desc: 'Scroll dalam menu dan cari "Install app" atau "Add to Home screen". Kadang muncul sebagai "Pasang aplikasi".',
      icon: <Download className="w-5 h-5" />,
    },
    {
      num: 4,
      title: 'Tap "Install" / "Pasang"',
      desc: 'Confirm pemasangan. App akan muncul di skrin utama anda dalam beberapa saat. 🎉',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-3">
      {onInstall && (
        <button
          onClick={onInstall}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 mb-2"
        >
          <Download className="w-5 h-5" /> Pasang Sekarang (Auto)
        </button>
      )}

      {!onInstall && (
        <div className="flex items-center gap-2 mb-3 p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30">
          <Lightbulb className="w-5 h-5 text-blue-300 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-blue-100 text-[11px] font-bold leading-snug">
            Ikut langkah manual di bawah, atau buka semula page ini selepas seketika untuk butang auto-install.
          </p>
        </div>
      )}

      {steps.map((step) => (
        <div key={step.num} className="flex gap-3 p-3 rounded-2xl bg-white/8 border border-white/15">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
            {step.num}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 text-white">
              {step.icon}
              <p className="font-black text-sm">{step.title}</p>
            </div>
            <p className="text-white/75 text-xs font-semibold leading-relaxed">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}