import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

/**
 * 3-step onboarding wizard untuk user baru — boost activation rate.
 * Step 1: Pilih umur anak (KSPK atau KSSR)
 * Step 2: Tambah profil anak pertama (nama)
 * Step 3: Pilih subjek minat (opsional preview)
 *
 * Selepas selesai, tandakan `onboardingCompleted: true` pada User entity.
 */
export default function OnboardingWizard({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState('');
  const [childName, setChildName] = useState('');
  const [interests, setInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;

  const toggleInterest = (subj) => {
    setInterests(prev =>
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Update user → mark onboarding done + save preferences
      await base44.auth.updateMe({
        onboardingCompleted: true,
        onboardingAgeGroup: ageGroup,
        onboardingInterests: interests,
      });

      // Add child profile to UserSubscription
      if (childName.trim() && user?.email) {
        const subs = await base44.entities.UserSubscription.filter({ email: user.email });
        const sub = subs?.[0];
        if (sub) {
          const newChild = {
            id: Date.now(),
            name: childName.trim(),
            ageGroup: ageGroup,
            createdAt: new Date().toISOString(),
          };
          const existingChildren = Array.isArray(sub.children) ? sub.children : [];
          await base44.entities.UserSubscription.update(sub.id, {
            children: [...existingChildren, newChild],
            selectedAgeGroup: ageGroup,
          });
        }
      }

      toast({ title: '🎉 Setup selesai!', description: 'Selamat datang ke CeriaKid!' });
      onComplete?.();
    } catch (err) {
      console.error('Onboarding failed:', err);
      toast({ title: 'Gagal simpan', description: 'Sila cuba lagi.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const canNext =
    (step === 1 && ageGroup) ||
    (step === 2 && childName.trim().length >= 2) ||
    step === 3;

  // Tutup wizard — mark onboarding selesai supaya tak muncul semula.
  // Parent boleh isi profil anak manual di /children-profiles bila-bila masa.
  const handleSkip = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ onboardingCompleted: true });
      onComplete?.();
    } catch (err) {
      console.error('Skip onboarding failed:', err);
      // Tetap close UI walaupun save gagal — supaya tidak block user
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-nunito"
      style={{
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.85))',
        backdropFilter: 'blur(20px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close button — parent boleh skip wizard & isi manual */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving}
          aria-label="Tutup wizard setup"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Progress bar */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-black text-purple-700 uppercase tracking-wider">
                Setup • Langkah {step}/{totalSteps}
              </p>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {Math.round((step / totalSteps) * 100)}%
            </p>
          </div>
          <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={false}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6 min-h-[340px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  Umur anak anda? 👶
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Kami akan susun kandungan ikut umur anak.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      key: 'prasekolah',
                      title: 'Prasekolah (KSPK)',
                      sub: '4–6 Tahun',
                      emoji: '🎨',
                      gradient: 'from-sky-100 to-cyan-100',
                    },
                    {
                      key: 'sekolah_rendah',
                      title: 'Sekolah Rendah (KSSR)',
                      sub: '7–12 Tahun • Darjah 1–6',
                      emoji: '📚',
                      gradient: 'from-pink-100 to-rose-100',
                    },
                  ].map((opt) => (
                    <motion.button
                      key={opt.key}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAgeGroup(opt.key)}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${opt.gradient} border-2 text-left flex items-center gap-4 transition-all ${
                        ageGroup === opt.key
                          ? 'border-purple-500 ring-4 ring-purple-200'
                          : 'border-transparent hover:border-purple-200'
                      }`}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 text-base">{opt.title}</p>
                        <p className="text-xs font-bold text-slate-600">{opt.sub}</p>
                      </div>
                      {ageGroup === opt.key && (
                        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  Siapa nama anak anda? ✨
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Buat profil pertama untuk anak. Boleh tambah lagi kemudian.
                </p>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Contoh: Ahmad, Siti, Aiman..."
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-slate-900 font-bold text-lg placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800 font-semibold">
                    💡 Tip: Anda boleh tambah hingga 4 profil anak (pelan Keluarga).
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-black text-slate-900 mb-1">
                  Subjek minat anak? 🎯
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Pilih satu atau lebih. (Boleh skip kalau tak pasti.)
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'bahasa_melayu', label: 'Bahasa Melayu', emoji: '🇲🇾' },
                    { key: 'english', label: 'English', emoji: '🇬🇧' },
                    { key: 'mathematics', label: 'Matematik', emoji: '🔢' },
                    { key: 'science', label: 'Sains', emoji: '🔬' },
                    { key: 'jawi', label: 'Jawi', emoji: '🕌' },
                    { key: 'general', label: 'Mini Games', emoji: '🎮' },
                  ].map((opt) => {
                    const active = interests.includes(opt.key);
                    return (
                      <motion.button
                        key={opt.key}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleInterest(opt.key)}
                        className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2 transition-all ${
                          active
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-transparent shadow-md'
                            : 'bg-purple-50 text-slate-700 border-purple-100 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-xs font-black">{opt.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 1 ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleBack}
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex items-center gap-1 hover:bg-slate-200 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Balik
            </motion.button>
          ) : (
            <div />
          )}

          <div className="flex-1" />

          {step < totalSteps ? (
            <motion.button
              whileHover={{ scale: canNext ? 1.03 : 1 }}
              whileTap={{ scale: canNext ? 0.96 : 1 }}
              onClick={handleNext}
              disabled={!canNext}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm flex items-center gap-1 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Seterusnya <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleFinish}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm flex items-center gap-1 shadow-lg disabled:opacity-60 transition-all"
            >
              {saving ? 'Menyimpan...' : '🎉 Selesai'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}