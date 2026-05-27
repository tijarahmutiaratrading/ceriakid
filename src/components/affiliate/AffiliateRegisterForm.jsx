import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Sparkles, DollarSign, Users, Loader2, TrendingUp, Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const TIER_PREVIEW = [
  { emoji: '🥉', name: 'Bronze', refs: '0-9', sub: '20%', cred: '15%', color: 'from-orange-400 to-amber-500' },
  { emoji: '🥈', name: 'Silver', refs: '10-29', sub: '22%', cred: '17%', color: 'from-slate-300 to-slate-400' },
  { emoji: '🥇', name: 'Gold', refs: '30-99', sub: '24%', cred: '18%', color: 'from-yellow-400 to-amber-500' },
  { emoji: '💎', name: 'Platinum', refs: '100+', sub: '25%', cred: '20%', color: 'from-cyan-400 to-blue-500' },
];

const BENEFITS = [
  { icon: DollarSign, title: '20-25%', subtitle: 'Komisen Subscription', color: 'from-emerald-500 to-green-400' },
  { icon: Sparkles, title: '15-20%', subtitle: 'Komisen Kredit AI', color: 'from-purple-500 to-pink-400' },
  { icon: TrendingUp, title: 'Lifetime', subtitle: 'Tier tak reset', color: 'from-amber-500 to-orange-400' },
  { icon: Wallet, title: 'Auto', subtitle: 'Bayaran ke bank', color: 'from-blue-500 to-cyan-400' },
];

export default function AffiliateRegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ fullName: '', phone: '', bankName: '', bankAccountNumber: '', bankAccountHolder: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast({ title: 'Tidak lengkap', description: 'Sila isi nama dan telefon.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('registerAffiliate', form);
      if (res.data.error) {
        toast({ title: 'Gagal', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '🎉 Selamat datang!', description: `Kod anda: ${res.data.affiliate.referralCode}` });
        onSuccess?.();
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">

        {/* HERO — Premium dark style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-6 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900" />
          <div className="absolute top-0 -left-20 w-72 h-72 rounded-full bg-pink-500/30 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-20 w-72 h-72 rounded-full bg-orange-500/30 blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative p-6 sm:p-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-wider uppercase">Program Affiliate Premium</span>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Jana{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">income pasif</span>
              <br />dengan share CeriaKid
            </h1>
            <p className="text-white/75 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              Dapat sehingga <strong className="text-amber-300">25% komisen</strong> setiap kali kawan/keluarga anda langgan atau beli kredit AI. Lifetime — tak ada had!
            </p>
          </div>
        </motion.div>

        {/* BENEFITS GRID — match dashboard stats look */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white border border-slate-100 shadow-lg shadow-slate-200/60"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${b.color} opacity-10 blur-2xl`} />
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${b.color} shadow-md`}>
                  <b.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{b.title}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">{b.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TIER PREVIEW — premium dark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative overflow-hidden rounded-3xl mb-6 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="font-black text-amber-300 text-xs uppercase tracking-wider">Sistem Tier Berperingkat</p>
                <p className="text-white/60 text-xs">Lebih banyak rujukan = lebih tinggi komisen</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {TIER_PREVIEW.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="relative overflow-hidden rounded-xl p-3 bg-white/[0.08] backdrop-blur-md border border-white/15"
                >
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${t.color} opacity-30 blur-2xl`} />
                  <div className="relative text-center">
                    <div className="text-3xl mb-1">{t.emoji}</div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[10px] text-white/50 font-bold">{t.refs} rujukan</p>
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-[11px] text-amber-300 font-black">{t.sub}<span className="text-white/40 mx-0.5">/</span>{t.cred}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-white/50 mt-4 text-center">
              ✨ Auto-upgrade bila capai jumlah rujukan • Lifetime — tak reset selamanya
            </p>
          </div>
        </motion.div>

        {/* REGISTRATION FORM — clean & focused */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onSubmit={submit}
          className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 sm:p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-900">Daftar Sebagai Affiliate</h2>
                <p className="text-xs text-slate-500">Isi maklumat untuk mula jana komisen</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Required fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">Nama Penuh *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Siti Aishah binti Ahmad"
                  className="h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
              <div>
                <Label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">Nombor Telefon *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0123456789"
                  className="h-11 rounded-xl border-slate-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Bank section */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-slate-500" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Maklumat Bank</p>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">Opsional</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Anda boleh isi sekarang atau tambah kemudian di dashboard.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600 mb-1 block">Nama Bank</Label>
                  <Input
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="Maybank"
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-600 mb-1 block">No. Akaun</Label>
                  <Input
                    value={form.bankAccountNumber}
                    onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-bold text-slate-600 mb-1 block">Nama Pemegang Akaun</Label>
                  <Input
                    value={form.bankAccountHolder}
                    onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })}
                    placeholder="Mengikut buku bank"
                    className="h-10 rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {['🔒 Selamat & terjamin', '⚡ Setup 1 minit', '💰 Bayaran terus ke bank'].map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black py-6 rounded-xl shadow-xl text-base group"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Daftar Sebagai Affiliate Sekarang
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}