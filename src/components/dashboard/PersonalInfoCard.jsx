import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Loader, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

/**
 * Card untuk edit maklumat peribadi: Nama Penuh & No. Telefon.
 * Email tidak boleh diubah sebab ia identity login.
 */
export default function PersonalInfoCard({ user }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(user?.full_name || '');
    setPhone(user?.phone || '');
  }, [user?.full_name, user?.phone]);

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName.trim(), phone: phone.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.message || 'Gagal menyimpan. Sila cuba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = fullName.trim() !== (user?.full_name || '') || phone.trim() !== (user?.phone || '');

  return (
    <div
      className="rounded-3xl p-5 space-y-4"
      style={{ background: 'rgba(30,30,40,0.35)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      <SectionCardHeader
        icon={User}
        title="Maklumat Peribadi"
        subtitle="Nama, telefon & e-mel akaun anda"
        gradient="from-orange-400 to-pink-500"
      />

      <div className="space-y-4">
        {/* Nama Penuh */}
        <div>
          <label className="flex items-center gap-1.5 text-white/80 text-xs font-black uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5" /> Nama Penuh
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama penuh"
            className="w-full px-4 py-3 rounded-2xl bg-white/95 text-slate-900 font-bold text-sm placeholder-slate-400 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all"
          />
        </div>

        {/* No. Telefon */}
        <div>
          <label className="flex items-center gap-1.5 text-white/80 text-xs font-black uppercase tracking-wider mb-2">
            <Phone className="w-3.5 h-3.5" /> No. Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 0123456789"
            className="w-full px-4 py-3 rounded-2xl bg-white/95 text-slate-900 font-bold text-sm placeholder-slate-400 border-2 border-transparent focus:border-orange-400 focus:outline-none transition-all"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="flex items-center gap-1.5 text-white/80 text-xs font-black uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5" /> E-mel
            <span className="text-white/50 text-[10px] font-bold normal-case tracking-normal">(tidak boleh diubah)</span>
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-2xl bg-white/30 text-white/70 font-bold text-sm cursor-not-allowed"
          />
        </div>

        {error && (
          <p className="text-red-200 text-xs font-bold bg-red-500/20 px-3 py-2 rounded-xl">{error}</p>
        )}

        {/* Save button */}
        <motion.button
          whileHover={{ scale: isDirty && !saving ? 1.02 : 1 }}
          whileTap={{ scale: isDirty && !saving ? 0.97 : 1 }}
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`w-full py-3 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <><Loader className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Tersimpan!</>
          ) : (
            <>💾 Simpan Maklumat</>
          )}
        </motion.button>
      </div>
    </div>
  );
}