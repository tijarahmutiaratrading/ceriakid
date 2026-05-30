import React, { useState } from 'react';
import { Banknote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function AffiliateBankForm({ affiliate, onSuccess }) {
  const [form, setForm] = useState({
    bankName: affiliate.bankName || '',
    bankAccountNumber: affiliate.bankAccountNumber || '',
    bankAccountHolder: affiliate.bankAccountHolder || '',
    phone: affiliate.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('updateAffiliateBank', form);
      if (res.data.error) {
        toast({ title: 'Gagal', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '✅ Disimpan!', description: 'Maklumat bank dikemaskini.' });
        onSuccess?.();
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Banknote className="w-5 h-5 text-slate-700" />
        <h3 className="font-black text-slate-900">Maklumat Bank untuk Payout</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-600">Nama Bank</Label>
          <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="cth: Maybank" />
        </div>
        <div>
          <Label className="text-xs text-slate-600">No. Akaun</Label>
          <Input value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} placeholder="cth: 1234567890" />
        </div>
        <div>
          <Label className="text-xs text-slate-600">Nama Pemegang Akaun</Label>
          <Input value={form.bankAccountHolder} onChange={(e) => setForm({ ...form, bankAccountHolder: e.target.value })} placeholder="Mengikut buku bank" />
        </div>
        <div>
          <Label className="text-xs text-slate-600">Telefon</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="cth: 0123456789" />
        </div>
      </div>
      <Button onClick={save} disabled={saving} className="mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Simpan Maklumat
      </Button>
    </div>
  );
}