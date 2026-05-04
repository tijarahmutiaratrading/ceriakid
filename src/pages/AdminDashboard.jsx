import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, Settings, Facebook, CreditCard, Webhook, BarChart3, Cog } from 'lucide-react';
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
      <label className="block text-sm font-black text-white mb-2">{label}</label>
      {hint && <p className="text-xs text-white/60 mb-3">{hint}</p>}
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
        className="w-full border border-white/20 rounded-2xl px-4 py-3.5 pr-12 text-sm font-mono bg-white/10 text-white placeholder-white/40 shadow-inner shadow-black/10 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
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
      className="w-full border border-white/20 rounded-2xl px-4 py-3.5 text-sm font-mono bg-white/10 text-white placeholder-white/40 shadow-inner shadow-black/10 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
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
    <div className="min-h-screen pb-32 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <AppHeader showBack={true} backTo="/admin-dashboard" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-32 space-y-7">
        {/* Header */}
         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-7 p-5 md:p-7 rounded-[2rem] flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-2xl shadow-fuchsia-950/30" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-500 flex items-center justify-center text-3xl shadow-xl shadow-purple-950/30">🎛️</div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-[11px] font-black uppercase tracking-wider mb-2">Premium Admin Control</div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight truncate">Admin Dashboard</h1>
              <p className="text-white/75 text-sm">Analytics, settings & configurations dalam satu panel profesional.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:min-w-72">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{subscriptions.length}</p><p className="text-white/60 text-[11px] font-bold">Pelanggan</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">RM{totalRevenue.toFixed(0)}</p><p className="text-white/60 text-[11px] font-bold">Revenue</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">Admin</p><p className="text-white/60 text-[11px] font-bold">Access</p></div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6 p-1.5 rounded-3xl overflow-x-auto shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)' }}>
           {tabs.map(tab => (
             <button
               key={tab.key}
               onClick={() => setActiveTab(tab.key)}
               className={`flex-1 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap px-3 flex items-center justify-center gap-2 ${activeTab === tab.key ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
               >
               {tab.icon}<span>{tab.label}</span>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
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
                  className="rounded-[1.75rem] p-5 md:p-6 text-white shadow-2xl shadow-black/20 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.22)' }}
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
                  <p className="text-4xl mb-4 relative">{stat.icon}</p>
                  <p className="text-4xl font-black mb-1 text-white relative tracking-tight">{stat.value}</p>
                  <p className="text-xs font-black uppercase tracking-wider text-white/70 relative">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Sales Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 md:mb-8">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">💳 Jualan Mengikut Pelan</h2>
                  <p className="text-white/60 text-xs font-semibold">Ringkasan prestasi setiap pakej langganan</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                    className="rounded-3xl p-4 md:p-5 text-white text-center shadow-xl shadow-black/10"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="text-xs font-bold mb-1 text-white/90">{item.label}</p>
                    <p className="text-2xl font-black text-white">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer Database */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">📋 Database Pelanggan</h2>
                  <p className="text-white/60 text-xs font-semibold">Senarai pelanggan terkini dan status langganan</p>
                </div>
              </div>
              <motion.div
               whileHover={{ y: -2 }}
               className="rounded-[1.75rem] p-3 md:p-5 shadow-2xl shadow-black/20 overflow-x-auto"
               style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-white/20">
                      <th className="text-left py-3 px-4 font-black text-white">Email</th>
                      <th className="text-left py-3 px-4 font-black text-white">Paket</th>
                      <th className="text-left py-3 px-4 font-black text-white">Status</th>
                      <th className="text-left py-3 px-4 font-black text-white">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.slice(0, 10).map((sub) => (
                      <tr key={sub.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-xs text-white/90">{sub.email}</td>
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
                        <td className="py-3 px-4 text-xs text-white/80">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-white/70 mt-4 text-center">Menunjukkan {Math.min(10, subscriptions.length)} daripada {subscriptions.length} pelanggan</p>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <>
            {/* Settings Sub-tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 mb-6 p-1.5 rounded-3xl overflow-x-auto shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)' }}>
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap flex items-center justify-center gap-2 ${settingsTab === tab.key ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  {tab.icon}<span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </motion.div>

            {/* Facebook Pixel */}
            {settingsTab === 'pixel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] p-5 md:p-7 lg:p-8 shadow-2xl shadow-black/20 mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Meta / Facebook Pixel</h2>
                    <p className="text-xs text-white/80">Untuk tracking FB Ads & conversion events</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] p-5 md:p-7 lg:p-8 shadow-2xl shadow-black/20 mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Chip Payment Gateway</h2>
                    <p className="text-xs text-white/80">FPX, kad kredit & e-wallet Malaysia</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] p-5 md:p-7 lg:p-8 shadow-2xl shadow-black/20 mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Webhook Settings</h2>
                    <p className="text-xs text-white/80">Untuk receive payment callbacks dari Chip</p>
                  </div>
                </div>

                <FieldGroup label="Chip Webhook Secret" hint="Dijana oleh Chip untuk verify authenticity webhook.">
                  <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                </FieldGroup>

                <div className="mt-2 mb-5">
                  <label className="block text-sm font-black text-white mb-1">Webhook URL Anda</label>
                  <p className="text-xs text-white/80 mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 border-2 border-dashed border-white/20 rounded-xl px-3 py-3 text-xs font-mono text-white/70 break-all overflow-x-auto">
                      {window.location.origin}/api/webhook/chip
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/chip`);
                        toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/20"
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
              <p className="text-center text-xs text-white/70 mt-4">⚠️ Tetapan disimpan secara tempatan. Untuk production, gunakan environment variables dalam server.</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}