import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Save, Eye, EyeOff, CheckCircle, Settings, Facebook, CreditCard, Webhook, BarChart3, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AppHeader from '@/components/AppHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminQuickStats from '@/components/admin/AdminQuickStats';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { DollarSign, ShoppingCart, TrendingUp, Clock as ClockIcon, Sparkles } from 'lucide-react';

const SETTINGS_KEY = 'admin_app_settings';

const defaultSettings = {
  fb_pixel_id: '',
  fb_access_token: '',
  chip_brand_id: '',
  chip_api_key: '',
  chip_webhook_secret: '',
  chip_environment: 'production',
};

function FieldGroup({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-black text-slate-800 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-2.5">{hint}</p>}
      {children}
    </div>
  );
}

function SecretInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm font-mono bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white transition-all"
    />
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [settingsTab, setSettingsTab] = useState('pixel');
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }); } catch (_) {}
    }
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.UserSubscription.list();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-black text-slate-700">Akses Ditolak</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active' && s.tier !== 'free')
    .reduce((sum, s) => {
      const price = s.tier === 'asas' ? 49 : s.tier === 'standard' ? 99 : s.tier === 'keluarga' ? 199 : 0;
      return sum + price;
    }, 0);

  const tierBreakdown = {
    free: subscriptions.filter(s => s.tier === 'free').length,
    asas: subscriptions.filter(s => s.tier === 'asas').length,
    standard: subscriptions.filter(s => s.tier === 'standard').length,
    keluarga: subscriptions.filter(s => s.tier === 'keluarga').length,
  };

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaving(false);
    setSaved(true);
    toast({ title: '✅ Tetapan disimpan!', description: 'Semua konfigurasi telah dikemas kini.' });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    sessionStorage.clear();
    toast({ title: '✅ Cache dibersihkan!', description: 'Landing page akan dibuka semula dengan versi terbaru.' });
    setTimeout(() => window.location.replace(`/clear-cache.html?fresh=${Date.now()}`), 800);
  };

  const tabs = [
    { key: 'analytics', label: '📊 Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'settings', label: '⚙️ Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const settingsTabs = [
    { key: 'pixel', label: 'Facebook Pixel', icon: <Facebook className="w-4 h-4" /> },
    { key: 'chip', label: 'Chip Payment', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
  ];

  const paidCount = tierBreakdown.asas + tierBreakdown.standard + tierBreakdown.keluarga;
  const avgOrderValue = paidCount > 0 ? (totalRevenue / paidCount).toFixed(2) : '0.00';
  const pendingCount = subscriptions.filter(s => s.status === 'incomplete' || s.status === 'past_due').length;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-900">
      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-32">
        <div className="flex gap-6 items-start">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

          <main className="flex-1 min-w-0 space-y-5">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">📊</div>
            <div>
              <p className="text-violet-600 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> CeriaKid Analytics</p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">Dashboard</h1>
              <p className="text-slate-500 text-xs md:text-sm font-semibold">Pantau prestasi jualan kau secara realtime</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={loadData} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition-all flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button type="button" onClick={handleClearCache} disabled={clearingCache} className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-black text-slate-700 transition-all disabled:opacity-60 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} /> Cache
            </button>
          </div>
        </motion.div>

        {/* Quick stats row */}
        {activeTab === 'analytics' && (
          <AdminQuickStats
            pending={pendingCount}
            succeeded={activeCount}
            visitorsToday={subscriptions.filter(s => {
              const d = new Date(s.created_date);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length}
            totalVisitors={subscriptions.length}
          />
        )}

        {/* Mobile-only tabs (sidebar handles desktop) */}
        <div className="lg:hidden flex gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-violet-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === 'analytics' && (
          <>
            {/* Vibrant solid-color stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <AdminStatCard icon={DollarSign} color="violet" label="Total Revenue" value={`RM${totalRevenue.toFixed(0)}`} sub={`${paidCount} transaksi`} delay={0} />
              <AdminStatCard icon={ShoppingCart} color="amber" label="Jumlah Orders" value={subscriptions.length} sub="Pembayaran diterima" delay={0.05} />
              <AdminStatCard icon={TrendingUp} color="sky" label="Avg. Order Value" value={`RM${avgOrderValue}`} sub="Per transaksi" delay={0.1} />
              <AdminStatCard icon={ClockIcon} color="rose" label="Pending Revenue" value={pendingCount} sub="order menunggu" delay={0.15} />
            </div>

            {/* Sales Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900">💳 Jualan Mengikut Pelan</h2>
                  <p className="text-slate-500 text-xs font-semibold">Ringkasan prestasi setiap pakej langganan</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                   { label: 'Percuma', value: tierBreakdown.free, icon: '🆓', card: 'from-slate-600 to-slate-800' },
                   { label: 'Asas (RM49)', value: tierBreakdown.asas, icon: '🌱', card: 'from-emerald-500 to-green-600' },
                   { label: 'Standard (RM99)', value: tierBreakdown.standard, icon: '⭐', card: 'from-sky-500 to-blue-600' },
                   { label: 'Keluarga (RM199)', value: tierBreakdown.keluarga, icon: '👑', card: 'from-violet-500 to-purple-600' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`rounded-3xl p-4 md:p-5 text-white shadow-xl shadow-black/20 bg-gradient-to-br ${item.card} border border-white/5 hover:border-white/25 hover:shadow-2xl transition-all relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-4 relative">
                      <p className="text-2xl">{item.icon}</p>
                      <span className="text-[11px] font-black text-white bg-white/18 px-2 py-1 rounded-full">Plan</span>
                    </div>
                    <p className="text-xs font-bold mb-1 text-white/80 relative">{item.label}</p>
                    <p className="text-3xl font-black text-white relative">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer Database */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900">📋 Database Pelanggan</h2>
                  <p className="text-slate-500 text-xs font-semibold">Senarai pelanggan terkini dan status langganan</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-black text-slate-700 text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 font-black text-slate-700 text-xs uppercase tracking-wider">Paket</th>
                      <th className="text-left py-3 px-4 font-black text-slate-700 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 font-black text-slate-700 text-xs uppercase tracking-wider">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.slice(0, 10).map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-xs text-slate-700 font-semibold">{sub.email}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                            sub.tier === 'free' ? 'bg-gray-200 text-gray-700' :
                            sub.tier === 'asas' ? 'bg-green-200 text-green-700' :
                            sub.tier === 'standard' ? 'bg-blue-200 text-blue-700' :
                            sub.tier === 'pro' ? 'bg-red-200 text-red-700' :
                            'bg-purple-200 text-purple-700'
                          }`}>
                            {sub.tier === 'free' ? 'Percuma' : sub.tier === 'asas' ? 'Asas' : sub.tier === 'standard' ? 'Standard' : sub.tier === 'pro' ? 'Pro' : 'Keluarga'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                            sub.status === 'active' ? 'bg-green-200 text-green-700' :
                            sub.status === 'trial' ? 'bg-blue-200 text-blue-700' :
                            sub.status === 'incomplete' ? 'bg-yellow-200 text-yellow-700' :
                            sub.status === 'past_due' ? 'bg-orange-200 text-orange-700' :
                            'bg-red-200 text-red-700'
                          }`}>
                            {sub.status === 'active' ? '✓ Aktif' :
                             sub.status === 'trial' ? '⏳ Trial' :
                             sub.status === 'incomplete' ? '⏸ Pending' :
                             sub.status === 'past_due' ? '⚠ Lewat' :
                             '✕ Batal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-semibold whitespace-nowrap">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-4 text-center font-semibold">Menunjukkan {Math.min(10, subscriptions.length)} daripada {subscriptions.length} pelanggan</p>
              </div>
            </motion.div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <>
            {/* Settings Sub-tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 p-1.5 rounded-2xl overflow-x-auto bg-white border border-slate-200 shadow-sm">
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all whitespace-nowrap flex items-center justify-center gap-2 ${settingsTab === tab.key ? 'bg-violet-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {tab.icon}<span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </motion.div>

            {/* Facebook Pixel */}
            {settingsTab === 'pixel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 md:p-7 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">Meta / Facebook Pixel</h2>
                    <p className="text-xs text-slate-500 font-semibold">Untuk tracking FB Ads & conversion events</p>
                  </div>
                </div>

                <FieldGroup label="Pixel ID" hint="Jumpa di Meta Business → Events Manager → Pixel → Settings.">
                  <TextInput value={settings.fb_pixel_id} onChange={v => set('fb_pixel_id', v)} placeholder="e.g. 1234567890123" />
                </FieldGroup>

                <FieldGroup label="Access Token (Conversions API)" hint="Optional — untuk server-side tracking.">
                  <SecretInput value={settings.fb_access_token} onChange={v => set('fb_access_token', v)} placeholder="EAABsbCS1iHg..." />
                </FieldGroup>

                <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.3)', color: 'rgba(219,234,254,1)' }}>
                  <p className="font-black mb-1 text-blue-300">📌 Cara pasang Pixel ID:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                    <li>Pergi ke <strong>Meta Business Suite → Events Manager</strong></li>
                    <li>Klik <strong>Connect Data Source → Web</strong></li>
                    <li>Pilih <strong>Meta Pixel</strong> → copy Pixel ID</li>
                    <li>Paste di sini dan Save</li>
                  </ol>
                </div>
              </motion.div>
            )}

            {/* Chip Payment */}
            {settingsTab === 'chip' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 md:p-7 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">Chip Payment Gateway</h2>
                    <p className="text-xs text-slate-500 font-semibold">FPX, kad kredit & e-wallet Malaysia</p>
                  </div>
                </div>

                <FieldGroup label="Environment">
                  <div className="flex gap-3">
                    {['production', 'sandbox'].map(env => (
                      <button
                        key={env}
                        onClick={() => set('chip_environment', env)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all capitalize ${
                          settings.chip_environment === env
                            ? env === 'production'
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-yellow-400 text-gray-900 border-yellow-400'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {env === 'production' ? '🟢 Production' : '🟡 Sandbox'}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Brand ID" hint="Format UUID. Jumpa di Chip Dashboard → Settings → Brand.">
                  <TextInput value={settings.chip_brand_id} onChange={v => set('chip_brand_id', v)} placeholder="abc12345-abcd-1234-abcd-abc123456789" />
                </FieldGroup>

                <FieldGroup label="API Key (Secret Key)" hint="JANGAN kongsi dengan sesiapa.">
                  <SecretInput value={settings.chip_api_key} onChange={v => set('chip_api_key', v)} placeholder="sk_live_..." />
                </FieldGroup>

                <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', color: 'rgba(220,252,231,1)' }}>
                  <p className="font-black mb-1 text-green-300">📌 Cara dapatkan Chip credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                    <li>Log in ke <strong>merchant.chip-in.asia</strong></li>
                    <li>Pergi ke <strong>Settings → Brand</strong> untuk Brand ID</li>
                    <li>Pergi ke <strong>Settings → API Keys</strong> untuk Secret Key</li>
                    <li>Guna Sandbox dulu untuk testing</li>
                  </ol>
                </div>
              </motion.div>
            )}

            {/* Webhook */}
            {settingsTab === 'webhook' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 md:p-7 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">Webhook Settings</h2>
                    <p className="text-xs text-slate-500 font-semibold">Untuk receive payment callbacks dari Chip</p>
                  </div>
                </div>

                <FieldGroup label="Chip Webhook Secret" hint="Dijana oleh Chip untuk verify authenticity webhook.">
                  <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                </FieldGroup>

                <div className="mt-2 mb-5">
                  <label className="block text-sm font-black text-slate-800 mb-1">Webhook URL Anda</label>
                  <p className="text-xs text-slate-500 mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-3 py-3 text-xs font-mono text-slate-600 break-all overflow-x-auto">
                      {window.location.origin}/api/webhook/chip
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/chip`);
                        toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all border border-slate-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(168,85,247,0.1)', border: '2px solid rgba(168,85,247,0.3)', color: 'rgba(243,232,255,1)' }}>
                  <p className="font-black mb-1 text-purple-300">📌 Events yang perlu didaftarkan:</p>
                  <div className="space-y-1 text-xs">
                    {['payment.paid', 'payment.pending', 'payment.expired', 'payment.cancelled'].map(event => (
                      <div key={event} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <code className="font-mono">{event}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3 md:py-4 rounded-2xl font-black text-sm md:text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
                  saved
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                ) : saved ? (
                  <><CheckCircle className="w-5 h-5" /> Tersimpan!</>
                ) : (
                  <><Save className="w-5 h-5" /> Simpan Tetapan</>
                )}
              </motion.button>
              <p className="text-center text-xs text-slate-500 mt-4 font-semibold">⚠️ Tetapan disimpan secara tempatan. Untuk production, gunakan environment variables dalam server.</p>
            </motion.div>
          </>
        )}
          </main>
        </div>
        </div>
      </div>
    </div>
  );
}