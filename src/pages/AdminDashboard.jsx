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
      <label className="block text-sm font-black text-gray-900 mb-2">{label}</label>
      {hint && <p className="text-xs text-gray-600 mb-3">{hint}</p>}
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
        className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 pr-12 text-sm font-mono focus:outline-none focus:border-game-purple focus:bg-amber-50 transition-all"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
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
      className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-game-purple focus:bg-amber-50 transition-all"
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
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black mb-4">🔒</p>
          <p className="font-bold">Akses Ditolak</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const totalRevenue = subscriptions
    .filter(s => s.tier !== 'free')
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
    <div className="min-h-screen bg-pattern">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-5xl">🎛️</div>
            <h1 className="text-5xl font-black text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600 text-sm font-semibold ml-20">Analytics, Settings & Configurations</p>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3 mb-10 bg-white border-2 border-amber-200 rounded-2xl p-2 shadow-lg">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-game-purple to-game-pink text-white shadow-md'
                  : 'text-gray-700 hover:bg-amber-50'
              }`}
            >
              {tab.icon} {tab.label}
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
              className="grid grid-cols-3 gap-5 mb-12"
            >
              {[
                { label: 'Total Pembeli', value: subscriptions.length, icon: '👥', gradient: 'from-game-blue to-cyan-400', bgColor: 'bg-blue-50' },
                { label: 'Pendapatan (RM)', value: totalRevenue.toFixed(0), icon: '💰', gradient: 'from-game-green to-emerald-400', bgColor: 'bg-green-50' },
                { label: 'Berbayar', value: (tierBreakdown.asas + tierBreakdown.standard + tierBreakdown.keluarga), icon: '💎', gradient: 'from-game-purple to-pink-400', bgColor: 'bg-purple-50' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-lg border-2 border-white/40`}
                >
                  <p className="text-4xl mb-3">{stat.icon}</p>
                  <p className="text-4xl font-black mb-2">{stat.value}</p>
                  <p className="text-sm font-bold opacity-95">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Sales Breakdown */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-6">💳 Jualan Mengikut Pelan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Percuma', value: tierBreakdown.free, icon: '🆓', gradient: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-100' },
                  { label: 'Asas (RM49)', value: tierBreakdown.asas, icon: '🌱', gradient: 'from-game-green to-emerald-500', bgColor: 'bg-green-100' },
                  { label: 'Standard (RM99)', value: tierBreakdown.standard, icon: '⭐', gradient: 'from-game-blue to-cyan-500', bgColor: 'bg-blue-100' },
                  { label: 'Keluarga (RM199)', value: tierBreakdown.keluarga, icon: '👑', gradient: 'from-game-purple to-pink-500', bgColor: 'bg-purple-100' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-6 text-white text-center border-2 border-white/40 shadow-lg`}
                  >
                    <p className="text-4xl mb-3">{item.icon}</p>
                    <p className="text-sm font-bold mb-2">{item.label}</p>
                    <p className="text-4xl font-black">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer Database */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-black text-gray-900 mb-6">📋 Database Pelanggan</h2>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg overflow-x-auto"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-amber-300">
                      <th className="text-left py-3 px-4 font-black text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-black text-gray-900">Paket</th>
                      <th className="text-left py-3 px-4 font-black text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-black text-gray-900">Tarikh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.slice(0, 10).map((sub) => (
                      <tr key={sub.id} className="border-b border-amber-100 hover:bg-amber-50 transition-colors">
                        <td className="py-3 px-4 text-xs text-gray-700">{sub.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sub.tier === 'free' ? 'bg-gray-200 text-gray-700' :
                            sub.tier === 'asas' ? 'bg-green-200 text-green-700' :
                            sub.tier === 'standard' ? 'bg-blue-200 text-blue-700' :
                            'bg-purple-200 text-purple-700'
                          }`}>
                            {sub.tier === 'free' ? 'Percuma' : sub.tier === 'asas' ? 'Asas' : sub.tier === 'standard' ? 'Standard' : 'Keluarga'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sub.status === 'active' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                          }`}>
                            {sub.status === 'active' ? '✓ Aktif' : '✕ Batal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-4 text-center">Menunjukkan {Math.min(10, subscriptions.length)} daripada {subscriptions.length} pelanggan</p>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <>
            {/* Settings Sub-tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mb-10 bg-white border-2 border-amber-200 rounded-2xl p-2 shadow-lg">
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    settingsTab === tab.key
                      ? 'bg-gradient-to-r from-game-purple to-game-pink text-white shadow-md'
                      : 'text-gray-700 hover:bg-amber-50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Facebook Pixel */}
            {settingsTab === 'pixel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border-2 border-amber-200 shadow-lg mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">Meta / Facebook Pixel</h2>
                    <p className="text-xs text-gray-600">Untuk tracking FB Ads & conversion events</p>
                  </div>
                </div>

                <FieldGroup label="Pixel ID" hint="Jumpa di Meta Business → Events Manager → Pixel → Settings.">
                  <TextInput value={settings.fb_pixel_id} onChange={v => set('fb_pixel_id', v)} placeholder="e.g. 1234567890123" />
                </FieldGroup>

                <FieldGroup label="Access Token (Conversions API)" hint="Optional — untuk server-side tracking.">
                  <SecretInput value={settings.fb_access_token} onChange={v => set('fb_access_token', v)} placeholder="EAABsbCS1iHg..." />
                </FieldGroup>

                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-black mb-1">📌 Cara pasang Pixel ID:</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border-2 border-amber-200 shadow-lg mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">Chip Payment Gateway</h2>
                    <p className="text-xs text-gray-600">FPX, kad kredit & e-wallet Malaysia</p>
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

                <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-sm text-green-800">
                  <p className="font-black mb-1">📌 Cara dapatkan Chip credentials:</p>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border-2 border-amber-200 shadow-lg mb-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-lg">Webhook Settings</h2>
                    <p className="text-xs text-gray-600">Untuk receive payment callbacks dari Chip</p>
                  </div>
                </div>

                <FieldGroup label="Chip Webhook Secret" hint="Dijana oleh Chip untuk verify authenticity webhook.">
                  <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                </FieldGroup>

                <div className="mt-2 mb-5">
                  <label className="block text-sm font-black text-gray-800 mb-1">Webhook URL Anda</label>
                  <p className="text-xs text-gray-500 mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-xs font-mono text-gray-600 break-all">
                      {window.location.origin}/api/webhook/chip
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/chip`);
                        toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-sm text-purple-800">
                  <p className="font-black mb-1">📌 Events yang perlu didaftarkan:</p>
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
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
                  saved
                    ? 'bg-gradient-to-r from-game-green to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-game-purple to-game-pink text-white hover:shadow-xl'
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
              <p className="text-center text-xs text-gray-600 mt-4">⚠️ Tetapan disimpan secara tempatan. Untuk production, gunakan environment variables dalam server.</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}