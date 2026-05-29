import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown, ChevronRight, Search, Users, CreditCard, Smartphone, Baby, Share2, Calendar, Copy, Check, User as UserIcon, Phone, Mail, Edit2, X, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TIER_LABELS = {
  free: { label: 'Percuma', cls: 'bg-gray-300 text-gray-900' },
  asas: { label: 'Asas', cls: 'bg-emerald-300 text-emerald-950' },
  standard: { label: 'Standard', cls: 'bg-sky-300 text-sky-950' },
  keluarga: { label: 'Keluarga', cls: 'bg-violet-300 text-violet-950' },
  premium: { label: 'Premium', cls: 'bg-rose-300 text-rose-950' },
  pro: { label: 'Pro', cls: 'bg-rose-300 text-rose-950' },
};

const STATUS_LABELS = {
  active: { label: '✓ Aktif', cls: 'bg-emerald-300 text-emerald-950' },
  trial: { label: '⏳ Trial', cls: 'bg-sky-300 text-sky-950' },
  incomplete: { label: '⏸ Pending', cls: 'bg-amber-300 text-amber-950' },
  past_due: { label: '⚠ Lewat', cls: 'bg-orange-300 text-orange-950' },
  canceled: { label: '✕ Batal', cls: 'bg-rose-300 text-rose-950' },
};

const RECOVERY_LABELS = {
  not_sent: { label: '—', cls: 'bg-slate-100 text-slate-500', short: '—' },
  sent: { label: '📧 Hantar', cls: 'bg-blue-200 text-blue-900', short: '📧 Hantar' },
  delivered: { label: '✓ Delivered', cls: 'bg-cyan-200 text-cyan-900', short: '✓ Delivered' },
  failed: { label: '⚠ Gagal', cls: 'bg-red-200 text-red-900', short: '⚠ Gagal' },
  recovered: { label: '🎉 Recovered', cls: 'bg-emerald-400 text-emerald-950', short: '🎉 Recovered' },
};

function StatBubble({ icon: Icon, label, value, accent }) {
  return (
    <div className={`rounded-2xl p-3 ${accent}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <p className="text-[10px] font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-base font-black leading-tight">{value}</p>
    </div>
  );
}

function CustomerRow({ customer, expanded, onToggle, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(customer.fullName || '');
  const [editPhone, setEditPhone] = useState(customer.phone || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const tier = TIER_LABELS[customer.tier] || TIER_LABELS.free;
  const status = STATUS_LABELS[customer.status] || STATUS_LABELS.canceled;
  const recovery = RECOVERY_LABELS[customer.abandonedReminderStatus] || RECOVERY_LABELS.not_sent;
  const endDate = customer.currentPeriodEnd ? new Date(customer.currentPeriodEnd) : null;
  const isExpired = endDate && endDate < new Date();
  const daysLeft = endDate ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const referralLink = customer.affiliate
    ? `${window.location.origin}/?ref=${customer.affiliate.referralCode}`
    : null;

  const copyLink = (e) => {
    e.stopPropagation();
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editName.trim()) {
      toast({ title: '⚠️ Nama kosong', description: 'Sila masukkan nama.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await base44.functions.invoke('adminUpdateUser', {
        email: customer.email,
        fullName: editName.trim(),
        phone: editPhone.trim(),
      });
      if (res?.data?.success) {
        toast({ title: '✅ Info dikemas kini', description: 'Nama dan no telefon telah disimpan.' });
        await onUpdate?.();
        setEditMode(false);
      } else {
        const errMsg = res?.data?.error || 'Gagal kemaskini';
        toast({ title: '❌ Gagal', description: errMsg, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: '❌ Gagal kemaskini', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-white/60 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-3 px-3 whitespace-nowrap">
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </td>
        <td className="py-3 px-3 max-w-[220px]">
          <div className="text-xs font-black text-slate-900 truncate">{customer.fullName || <span className="italic font-semibold text-slate-400">Tiada nama</span>}</div>
          <div className="text-[10px] text-slate-500 font-semibold truncate">{customer.email}</div>
          {customer.phone && <div className="text-[10px] text-slate-600 font-semibold truncate">📞 {customer.phone}</div>}
        </td>
        <td className="py-3 px-3 whitespace-nowrap">
          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm ${tier.cls}`}>
            {tier.label}
          </span>
        </td>
        <td className="py-3 px-3 whitespace-nowrap">
          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm ${status.cls}`}>
            {status.label}
          </span>
        </td>
        <td className="py-3 px-3 text-xs text-slate-700 font-bold whitespace-nowrap text-center">{customer.childrenCount}</td>
        <td className="py-3 px-3 text-xs text-slate-700 font-bold whitespace-nowrap text-center">{customer.deviceCount}</td>
        <td className="py-3 px-3 text-xs text-slate-700 font-bold whitespace-nowrap text-center">{customer.creditBalance}</td>
        <td className="py-3 px-3 whitespace-nowrap text-center">
          {customer.affiliate ? (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${customer.affiliate.isActive ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-700'}`}>
              {customer.affiliate.isActive ? '✓' : '✕'} {customer.affiliate.totalReferrals}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold">—</span>
          )}
        </td>
        <td className="py-3 px-3 text-xs text-slate-600 font-semibold whitespace-nowrap">
          {endDate ? (
            <div className="flex flex-col">
              <span className={isExpired ? 'text-red-600 font-bold' : ''}>{endDate.toLocaleDateString('ms-MY')}</span>
              {!isExpired && daysLeft !== null && (
                <span className={`text-[10px] ${daysLeft <= 7 ? 'text-amber-700' : 'text-slate-500'}`}>{daysLeft} hari lagi</span>
              )}
              {isExpired && <span className="text-[10px] text-red-500">Tamat</span>}
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>
        <td className="py-3 px-3 whitespace-nowrap text-center">
          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-black ${recovery.cls}`} title={customer.abandonedReminderSentAt ? `Hantar: ${new Date(customer.abandonedReminderSentAt).toLocaleString('ms-MY')}` : ''}>
            {recovery.short}
          </span>
        </td>
      </tr>

      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={10} className="p-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-gradient-to-br from-violet-50 to-pink-50"
              >
                <div className="p-5 space-y-4">
                  {/* Personal info header — dengan edit option */}
                  <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-violet-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase text-slate-500">Nama Penuh</p>
                        {editMode ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-sm font-black text-slate-900 bg-violet-50 border-2 border-violet-300 rounded-lg px-2 py-1"
                          />
                        ) : (
                          <p className="text-sm font-black text-slate-900 truncate">{customer.fullName || '—'}</p>
                        )}
                      </div>
                      {editMode ? (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={handleSave} disabled={saving} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-60 flex items-center">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => { setEditMode(false); setEditName(customer.fullName || ''); setEditPhone(customer.phone || ''); }} className="p-1.5 bg-slate-300 hover:bg-slate-400 text-slate-900 rounded-lg">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setEditMode(true); }} className="p-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg flex-shrink-0">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-violet-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-500">Email</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <Phone className="w-4 h-4 text-violet-600 flex-shrink-0" />
                       <div className="min-w-0 flex-1">
                         <p className="text-[10px] font-black uppercase text-slate-500">No. Telefon</p>
                         {editMode ? (
                           <input
                             type="text"
                             value={editPhone}
                             onChange={(e) => setEditPhone(e.target.value)}
                             onClick={(e) => e.stopPropagation()}
                             placeholder="e.g. 0123456789"
                             className="w-full text-sm font-black text-slate-900 bg-violet-50 border-2 border-violet-300 rounded-lg px-2 py-1"
                           />
                         ) : (
                           <p className="text-sm font-bold text-slate-800 truncate">{customer.phone || '—'}</p>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatBubble icon={Baby} label="Anak" value={customer.childrenCount} accent="bg-pink-100 text-pink-900" />
                    <StatBubble icon={Smartphone} label="Device" value={customer.deviceCount} accent="bg-sky-100 text-sky-900" />
                    <StatBubble icon={CreditCard} label="Kredit AI" value={customer.creditBalance} accent="bg-amber-100 text-amber-900" />
                    <StatBubble icon={Share2} label="Referral" value={customer.affiliate?.totalReferrals ?? 0} accent="bg-emerald-100 text-emerald-900" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Children */}
                    <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-pink-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Baby className="w-4 h-4 text-pink-600" />
                        <p className="text-xs font-black text-slate-800">Profil Anak</p>
                      </div>
                      {customer.children.length > 0 ? (
                        <ul className="space-y-1">
                          {customer.children.map((c, i) => (
                            <li key={i} className="text-xs text-slate-700 font-semibold flex items-center justify-between">
                              <span>{c.name || '—'}</span>
                              <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-black">
                                {c.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Belum ada profil anak</p>
                      )}
                    </div>

                    {/* Devices */}
                    <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-sky-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-sky-600" />
                        <p className="text-xs font-black text-slate-800">Device Berdaftar</p>
                      </div>
                      {customer.devices.length > 0 ? (
                        <ul className="space-y-1">
                          {customer.devices.map((d, i) => (
                            <li key={i} className="text-xs text-slate-700 font-semibold">
                              <div className="truncate">{d.deviceName}</div>
                              {d.lastSeen && (
                                <div className="text-[10px] text-slate-500">
                                  {new Date(d.lastSeen).toLocaleDateString('ms-MY')}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Tiada device</p>
                      )}
                    </div>

                    {/* Credit & Subscription */}
                    <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <p className="text-xs font-black text-slate-800">Kredit & Langganan</p>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-slate-600">Baki kredit</span><span className="font-black text-slate-900">{customer.creditBalance}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Total dibeli</span><span className="font-black text-slate-900">{customer.creditTotalPurchased}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Total guna</span><span className="font-black text-slate-900">{customer.creditTotalUsed}</span></div>
                        <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between"><span className="text-slate-600">Mula</span><span className="font-black text-slate-900">{customer.currentPeriodStart ? new Date(customer.currentPeriodStart).toLocaleDateString('ms-MY') : '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Tamat</span><span className={`font-black ${isExpired ? 'text-red-600' : 'text-slate-900'}`}>{endDate ? endDate.toLocaleDateString('ms-MY') : '—'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Abandoned Cart Recovery Detail */}
                  {customer.abandonedReminderStatus && customer.abandonedReminderStatus !== 'not_sent' && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 ring-1 ring-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-amber-600" />
                        <p className="text-xs font-black text-slate-800">Abandoned Cart Recovery</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${recovery.cls}`}>
                          {recovery.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Hantar pada</p>
                          <p className="text-xs font-bold text-slate-800">
                            {customer.abandonedReminderSentAt
                              ? new Date(customer.abandonedReminderSentAt).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Status</p>
                          <p className="text-xs font-black text-slate-900">{recovery.label}</p>
                        </div>
                        {customer.recoveredAt && (
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase">Recovered pada</p>
                            <p className="text-xs font-black text-emerald-700">
                              {new Date(customer.recoveredAt).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        )}
                        {customer.abandonedReminderMessageId && (
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-[10px] text-slate-500 font-black uppercase">Resend ID</p>
                            <p className="text-[10px] font-mono text-slate-700 truncate" title={customer.abandonedReminderMessageId}>
                              {customer.abandonedReminderMessageId}
                            </p>
                          </div>
                        )}
                      </div>
                      {customer.abandonedReminderError && (
                        <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-[10px] text-red-700 font-black uppercase mb-0.5">Error</p>
                          <p className="text-[11px] text-red-800 font-mono break-all">{customer.abandonedReminderError}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Affiliate Detail */}
                  {customer.affiliate && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 ring-1 ring-emerald-200">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs font-black text-slate-800">Affiliate / Ejen</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${customer.affiliate.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                            {customer.affiliate.isActive ? 'AKTIF' : 'TIDAK AKTIF'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-yellow-300 text-yellow-900 uppercase">
                            {customer.affiliate.tier}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Kod</p>
                          <p className="text-sm font-mono font-black text-emerald-900">{customer.affiliate.referralCode}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Rujukan</p>
                          <p className="text-sm font-black text-slate-900">{customer.affiliate.totalReferrals}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Total Earned</p>
                          <p className="text-sm font-black text-emerald-700">RM{customer.affiliate.totalEarned.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase">Pending</p>
                          <p className="text-sm font-black text-amber-700">RM{customer.affiliate.pendingBalance.toFixed(2)}</p>
                        </div>
                      </div>

                      {referralLink && (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 truncate">
                            {referralLink}
                          </div>
                          <button
                            onClick={copyLink}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all"
                          >
                            {copied ? <><Check className="w-3.5 h-3.5" /> Disalin</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function CustomerDatabaseTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const refreshData = async () => {
    try {
      const res = await base44.functions.invoke('getCustomerDetails', {});
      if (res?.data?.customers) {
        setCustomers(res.data.customers);
        return;
      }
    } catch (err) {
      console.warn('getCustomerDetails error:', err?.message);
    }
    try {
      const [subs, credits, devices, affiliates, referrals, allUsers] = await Promise.all([
        base44.entities.UserSubscription.list('-created_date', 500),
        base44.entities.UserCredit.list('-updated_date', 500),
        base44.entities.RegisteredDevice.list('-lastSeen', 1000),
        base44.entities.Affiliate.list('-created_date', 500),
        base44.entities.AffiliateReferral.list('-created_date', 1000),
        base44.entities.User.list('-created_date', 500),
      ]);
      const userByEmail = new Map();
      allUsers.forEach(u => { if (u.email) userByEmail.set(u.email.toLowerCase(), u); });
      const creditByEmail = new Map();
      credits.forEach(c => { if (c.userEmail) creditByEmail.set(c.userEmail.toLowerCase(), c); });
      const devicesByEmail = new Map();
      devices.forEach(d => {
        if (!d.userEmail) return;
        const k = d.userEmail.toLowerCase();
        if (!devicesByEmail.has(k)) devicesByEmail.set(k, []);
        devicesByEmail.get(k).push({ id: d.id, deviceName: d.deviceName, lastSeen: d.lastSeen });
      });
      const affiliateByEmail = new Map();
      affiliates.forEach(a => { if (a.userEmail) affiliateByEmail.set(a.userEmail.toLowerCase(), a); });
      const referralCount = new Map();
      referrals.forEach(r => {
        if (!r.affiliateEmail) return;
        const k = r.affiliateEmail.toLowerCase();
        referralCount.set(k, (referralCount.get(k) || 0) + 1);
      });
      const enriched = subs.map(sub => {
        const k = (sub.email || '').toLowerCase();
        const credit = creditByEmail.get(k);
        const userDevices = devicesByEmail.get(k) || [];
        const aff = affiliateByEmail.get(k);
        const u = userByEmail.get(k);
        return {
          id: sub.id,
          email: sub.email,
          fullName: u?.data?.displayName || u?.displayName || u?.full_name || '',
          phone: u?.data?.phone || u?.phone || '',
          tier: sub.tier || 'free',
          status: sub.status || 'active',
          createdDate: sub.created_date,
          currentPeriodEnd: sub.currentPeriodEnd || null,
          currentPeriodStart: sub.currentPeriodStart || null,
          abandonedReminderStatus: sub.abandonedReminderStatus || 'not_sent',
          abandonedReminderSentAt: sub.abandonedReminderSentAt || null,
          abandonedReminderMessageId: sub.abandonedReminderMessageId || null,
          abandonedReminderError: sub.abandonedReminderError || null,
          recoveredAt: sub.recoveredAt || null,
          childrenCount: Array.isArray(sub.children) ? sub.children.length : 0,
          children: Array.isArray(sub.children) ? sub.children.map(c => ({ name: c.name, ageGroup: c.ageGroup })) : [],
          deviceCount: userDevices.length,
          devices: userDevices,
          creditBalance: credit?.balance || 0,
          creditTotalPurchased: credit?.totalPurchased || 0,
          creditTotalUsed: credit?.totalUsed || 0,
          affiliate: aff ? {
            referralCode: aff.referralCode,
            status: aff.status || 'active',
            tier: aff.tier || 'bronze',
            totalReferrals: referralCount.get(k) || 0,
            totalEarned: aff.totalEarned || 0,
            pendingBalance: aff.pendingBalance || 0,
            isActive: aff.status === 'active',
          } : null,
        };
      });
      setCustomers(enriched);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await refreshData();
      setLoading(false);
    };

    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(c => {
      // Sembunyi tier "free" — kita hanya ada 3 pakej berbayar
      if (c.tier === 'free') return false;
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (!q) return true;
      return (
        (c.email || '').toLowerCase().includes(q) ||
        (c.affiliate?.referralCode || '').toLowerCase().includes(q)
      );
    });
  }, [customers, search, tierFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="pro-glass rounded-3xl p-5">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" /> Database Pelanggan
          </h2>
          <p className="text-slate-600 text-xs font-semibold">Detail lengkap setiap pelanggan — klik untuk expand</p>
        </div>
        <span className="text-xs font-black text-purple-900 bg-amber-300 px-3 py-1.5 rounded-full ring-1 ring-amber-200">
          {filtered.length} / {customers.length} pelanggan
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari email atau kod referral..."
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex gap-1 bg-white rounded-xl p-1 ring-1 ring-slate-200">
          {['all', 'asas', 'standard', 'keluarga'].map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${tierFilter === t ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t === 'all' ? 'Semua' : TIER_LABELS[t]?.label || t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="w-8"></th>
                <th className="text-left py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Pelanggan</th>
                <th className="text-left py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Paket</th>
                <th className="text-left py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Status</th>
                <th className="text-center py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Anak</th>
                <th className="text-center py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Device</th>
                <th className="text-center py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Kredit</th>
                <th className="text-center py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider">Affiliate</th>
                <th className="text-left py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider"><Calendar className="w-3.5 h-3.5 inline mr-1" />Tarikh Tamat</th>
                <th className="text-center py-3 px-3 font-black text-slate-700 text-xs uppercase tracking-wider"><Mail className="w-3.5 h-3.5 inline mr-1" />Recovery</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <CustomerRow
                  key={c.id}
                  customer={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onUpdate={refreshData}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-semibold">
                    {customers.length === 0 ? 'Tiada pelanggan lagi.' : 'Tiada pelanggan sepadan dengan tapisan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}