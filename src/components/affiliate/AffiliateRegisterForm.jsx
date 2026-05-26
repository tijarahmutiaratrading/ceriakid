import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Sparkles, DollarSign, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

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
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 mb-6 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white shadow-2xl text-center"
      >
        <Share2 className="w-12 h-12 mx-auto mb-3" />
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Jadi Affiliate CeriaKid 🚀</h1>
        <p className="text-white/90 max-w-xl mx-auto">Share CeriaKid dengan kawan & keluarga. Dapat komisen setiap kali mereka langgan atau beli kredit AI!</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { icon: DollarSign, title: '20-30% Komisen', desc: 'Subscription' },
          { icon: Sparkles, title: '15-22% Komisen', desc: 'Kredit AI' },
          { icon: Users, title: 'Tanpa Had', desc: 'Refer seramai mungkin' },
        ].map(b => (
          <div key={b.title} className="rounded-2xl p-4 bg-white border-2 border-purple-100 text-center shadow-sm">
            <b.icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="font-black text-slate-900">{b.title}</p>
            <p className="text-xs text-slate-500">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Tier system preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl p-5 mb-6 bg-gradient-to-br from-slate-900 to-purple-900 text-white shadow-xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <p className="font-black text-amber-300 text-sm uppercase tracking-wider">Sistem Tier — Naik Level, Naik Komisen</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji: '🥉', name: 'Bronze', refs: '0-9', sub: '20%', cred: '15%' },
            { emoji: '🥈', name: 'Silver', refs: '10-29', sub: '23%', cred: '17%' },
            { emoji: '🥇', name: 'Gold', refs: '30-99', sub: '26%', cred: '19%' },
            { emoji: '💎', name: 'Platinum', refs: '100+', sub: '30%', cred: '22%' },
          ].map(t => (
            <div key={t.name} className="text-center p-2 rounded-xl bg-white/10 border border-white/20">
              <div className="text-2xl mb-0.5">{t.emoji}</div>
              <p className="text-xs font-black">{t.name}</p>
              <p className="text-[10px] text-white/70">{t.refs} ref</p>
              <p className="text-[10px] text-amber-300 font-bold mt-1">{t.sub}/{t.cred}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/70 mt-3 text-center">Auto-upgrade bila capai jumlah rujukan. Lifetime — tak reset!</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={submit}
        className="rounded-3xl p-6 bg-white shadow-xl border border-purple-100 space-y-4"
      >
        <h2 className="font-black text-xl text-slate-900 mb-2">Daftar Akaun Affiliate</h2>

        <div>
          <Label className="text-sm font-bold text-slate-700">Nama Penuh *</Label>
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="cth: Siti Aishah binti Ahmad" />
        </div>
        <div>
          <Label className="text-sm font-bold text-slate-700">Nombor Telefon *</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="cth: 0123456789" />
        </div>

        <div className="pt-3 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-2">Maklumat Bank (boleh tambah kemudian)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600">Nama Bank</Label>
              <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="cth: Maybank" />
            </div>
            <div>
              <Label className="text-xs text-slate-600">No. Akaun</Label>
              <Input value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} placeholder="cth: 1234567890" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-slate-600">Nama Pemegang Akaun</Label>
              <Input value={form.bankAccountHolder} onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })} placeholder="Mengikut buku bank" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-6 rounded-xl shadow-lg">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Daftar Sebagai Affiliate
        </Button>
      </motion.form>
    </div>
  );
}