import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Save, Eye, EyeOff, CheckCircle, Settings, Facebook, CreditCard, Webhook, BarChart3, Users, Wallet, Crown, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AppHeader from '@/components/AppHeader';

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
    <div className="mb-6">
      <label className="block text-sm font-black text-slate-800 mb-2">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-3 font-semibold">{hint}</p>}
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
        className="w-full border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm font-mono bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
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
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <p className="text-2xl font-black mb-4">🔒</p>
          <p className="font-bold text-white">Akses Ditolak</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
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

  const tabs = [
    { key: 'analytics', label: '📊 Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'settings', label: '⚙️ Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const settingsTabs = [
    { key: 'pixel', label: 'Facebook Pixel', icon: <Facebook className="w-4 h-4" /> },
    { key: 'chip', label: 'Chip Payment', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden bg-slate-50 text-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -top-40 -right-40 w-[34rem] h-[34rem] bg-blue-200/60 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-violet-200/60 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/70 rounded-full blur-3xl" />
      </div>
      <AppHeader showBack={true} backTo="/admin-dashboard" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-32 space-y-6">
        {/* Header */}
         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 flex items-center gap-5 shadow-xl shadow-slate-200/70">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 blur-2xl" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300"><Activity className="w-7 h-7" /></div>
          <div className="relative min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">CeriaKid Admin</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 truncate tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm md:text-base">Revenue, pelanggan dan konfigurasi platform</p>
          </div>
          <div className="relative ml-auto hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-black text-slate-700">Live Overview</span>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex w-full md:w-auto gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60 overflow-x-auto">
           {tabs.map(tab => (
             <button
               key={tab.key}
               onClick={() => setActiveTab(tab.key)}
               className={`flex-1 md:flex-none py-3 px-6 rounded-xl font-black text-sm transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-slate-950 text-white shadow-lg shadow-slate-300' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}
             >
               {tab.label}
             </button>
           ))}
        </motion.div>

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === 'analytics' && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8"
            >
              {[
                { label: 'Total Pembeli', value: subscriptions.length, icon: '👥' },
                { label: 'Pendapatan (RM)', value: totalRevenue.toFixed(0), icon: '💰' },
                { label: 'Berbayar', value: (tierBreakdown.asas + tierBreakdown.standard + tierBreakdown.keluarga), icon: '💎' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-[1.75rem] p-6 bg-white border border-slate-200 shadow-xl shadow-slate-200/70"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-5">{stat.icon}</div>
                  <p className="text-4xl font-black mb-1 text-slate-950 tracking-tight">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Sales Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-950 mb-4">Jualan Mengikut Pelan</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
                {[
                   { label: 'Percuma', value: tierBreakdown.free, icon: '🆓' },
                   { label: 'Asas (RM49)', value: tierBreakdown.asas, icon: '🌱' },
                   { label: 'Standard (RM99)', value: tierBreakdown.standard, icon: '⭐' },
                   { label: 'Keluarga (RM199)', value: tierBreakdown.keluarga, icon: '👑' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="rounded-[1.5rem] p-5 bg-white border border-slate-200 text-center shadow-lg shadow-slate-200/60"
                  >
                    <p className="text-2xl mb-3">{item.icon}</p>
                    <p className="text-xs font-black mb-1 text-slate-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-3xl font-black text-slate-950">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer Database */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 mb-4">Database Pelanggan</h2>
              <motion.div
               whileHover={{ y: -2 }}
               className="rounded-[1.75rem] bg-white border border-slate-200 p-3 md:p-4 shadow-xl shadow-slate-200/70 overflow-x-auto"
              >
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-4 font-black text-slate-500 text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-4 px-4 font-black text-slate-500 text-xs uppercase tracking-wider">Paket</th>
                      <th className="text-left py-4 px-4 font-black text-slate-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-4 font-black text-slate-500 text-xs uppercase tracking-wider">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.slice(0, 10).map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-bold text-slate-700">{sub.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sub.tier === 'free' ? 'bg-gray-200 text-gray-700' :
                            sub.tier === 'asas' ? 'bg-green-200 text-green-700' :
                            sub.tier === 'standard' ? 'bg-blue-200 text-blue-700' :
                            sub.tier === 'pro' ? 'bg-red-200 text-red-700' :
                            'bg-purple-200 text-purple-700'
                          }`}>
                            {sub.tier === 'free' ? 'Percuma' : sub.tier === 'asas' ? 'Asas' : sub.tier === 'standard' ? 'Standard' : sub.tier === 'pro' ? 'Pro' : 'Keluarga'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                        <td className="py-4 px-4 text-sm font-semibold text-slate-500">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-500 mt-4 text-center font-semibold">Menunjukkan {Math.min(10, subscriptions.length)} daripada {subscriptions.length} pelanggan</p>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <>
            {/* Settings Sub-tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 md:gap-2 mb-5 md:mb-6 p-1.5 rounded-2xl overflow-x-auto bg-white border border-slate-200 shadow-lg shadow-slate-200/60">
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all whitespace-nowrap ${settingsTab === tab.key ? 'bg-slate-950 text-white shadow-lg shadow-slate-300' : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'}`}
                >
                  <span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </motion.div>

            {/* Facebook Pixel */}
            {settingsTab === 'pixel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] bg-white border border-slate-200 p-5 md:p-7 lg:p-8 shadow-xl shadow-slate-200/70 mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-950 text-lg">Meta / Facebook Pixel</h2>
                    <p className="text-xs text-slate-500 font-semibold">Untuk tracking FB Ads & conversion events</p>
                  </div>
                </div>

                <FieldGroup label="Pixel ID" hint="Jumpa di Meta Business → Events Manager → Pixel → Settings.">
                  <TextInput value={settings.fb_pixel_id} onChange={v => set('fb_pixel_id', v)} placeholder="e.g. 1234567890123" />
                </FieldGroup>

                <FieldGroup label="Access Token (Conversions API)" hint="Optional — untuk server-side tracking.">
                  <SecretInput value={settings.fb_access_token} onChange={v => set('fb_access_token', v)} placeholder="EAABsbCS1iHg..." />
                </FieldGroup>

                <div className="mt-6 rounded-2xl p-4 text-sm bg-blue-50 border border-blue-100 text-blue-900">
                  <p className="font-black mb-1 text-blue-700">📌 Cara pasang Pixel ID:</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] bg-white border border-slate-200 p-5 md:p-7 lg:p-8 shadow-xl shadow-slate-200/70 mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-950 text-lg">Chip Payment Gateway</h2>
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

                <div className="mt-6 rounded-2xl p-4 text-sm bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <p className="font-black mb-1 text-emerald-700">📌 Cara dapatkan Chip credentials:</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] bg-white border border-slate-200 p-5 md:p-7 lg:p-8 shadow-xl shadow-slate-200/70 mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-950 text-lg">Webhook Settings</h2>
                    <p className="text-xs text-slate-500 font-semibold">Untuk receive payment callbacks dari Chip</p>
                  </div>
                </div>

                <FieldGroup label="Chip Webhook Secret" hint="Dijana oleh Chip untuk verify authenticity webhook.">
                  <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                </FieldGroup>

                <div className="mt-2 mb-5">
                  <label className="block text-sm font-black text-slate-800 mb-1">Webhook URL Anda</label>
                  <p className="text-xs text-slate-500 font-semibold mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-3 py-3 text-xs font-mono text-slate-600 break-all overflow-x-auto">
                      {window.location.origin}/api/webhook/chip
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/chip`);
                        toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl font-black text-xs transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl p-4 text-sm bg-violet-50 border border-violet-100 text-violet-900">
                  <p className="font-black mb-1 text-violet-700">📌 Events yang perlu didaftarkan:</p>
                  <div className="space-y-1 text-xs">
                    {['payment.paid', 'payment.pending', 'payment.expired', 'payment.cancelled'].map(event => (
                      <div key={event} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
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
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
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
      </div>
    </div>
  );
}