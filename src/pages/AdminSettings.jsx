import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, Settings, Facebook, CreditCard, Webhook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const SETTINGS_KEY = 'admin_app_settings';

const defaultSettings = {
  // Meta / Facebook Pixel
  fb_pixel_id: '',
  fb_access_token: '',

  // Chip Payment Gateway
  chip_brand_id: '',
  chip_api_key: '',
  chip_webhook_secret: '',
  chip_environment: 'production', // production | sandbox
};

function FieldGroup({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-black text-gray-800 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
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
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm font-mono focus:outline-none focus:border-game-purple transition-all"
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
      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-game-purple transition-all"
    />
  );
}

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('pixel');

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }); } catch (_) {}
    }
  }, []);

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
    { key: 'pixel', label: 'Facebook Pixel', icon: <Facebook className="w-4 h-4" /> },
    { key: 'chip', label: 'Chip Payment', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin-dashboard">
            <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-11 h-11 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 text-game-purple" /> Tetapan Admin
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Pixel tracking, payment gateway & webhook</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white border-2 border-gray-100 rounded-2xl p-1.5 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-game-purple text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── FACEBOOK PIXEL ── */}
        {activeTab === 'pixel' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-7 border-2 border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">Meta / Facebook Pixel</h2>
                <p className="text-xs text-gray-500">Untuk tracking FB Ads & conversion events</p>
              </div>
            </div>

            <FieldGroup
              label="Pixel ID"
              hint="Jumpa di Meta Business → Events Manager → Pixel → Settings. Contoh: 1234567890123"
            >
              <TextInput
                value={settings.fb_pixel_id}
                onChange={v => set('fb_pixel_id', v)}
                placeholder="e.g. 1234567890123"
              />
            </FieldGroup>

            <FieldGroup
              label="Access Token (Conversions API)"
              hint="Optional — untuk server-side tracking. Jumpa di Meta Business → Events Manager → Settings → Conversions API."
            >
              <SecretInput
                value={settings.fb_access_token}
                onChange={v => set('fb_access_token', v)}
                placeholder="EAABsbCS1iHg..."
              />
            </FieldGroup>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
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

        {/* ── CHIP PAYMENT ── */}
        {activeTab === 'chip' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-7 border-2 border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">Chip Payment Gateway</h2>
                <p className="text-xs text-gray-500">FPX, kad kredit & e-wallet Malaysia</p>
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

            <FieldGroup
              label="Brand ID"
              hint="Jumpa di Chip Dashboard → Settings → Brand. Format UUID. Contoh: abc12345-abcd-1234-abcd-abc123456789"
            >
              <TextInput
                value={settings.chip_brand_id}
                onChange={v => set('chip_brand_id', v)}
                placeholder="abc12345-abcd-1234-abcd-abc123456789"
              />
            </FieldGroup>

            <FieldGroup
              label="API Key (Secret Key)"
              hint="Jumpa di Chip Dashboard → Settings → API Keys. JANGAN kongsi dengan sesiapa."
            >
              <SecretInput
                value={settings.chip_api_key}
                onChange={v => set('chip_api_key', v)}
                placeholder="sk_live_..."
              />
            </FieldGroup>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
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

        {/* ── WEBHOOK ── */}
        {activeTab === 'webhook' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-7 border-2 border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Webhook className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-gray-900">Webhook Settings</h2>
                <p className="text-xs text-gray-500">Untuk receive payment callbacks dari Chip</p>
              </div>
            </div>

            <FieldGroup
              label="Chip Webhook Secret"
              hint="Dijana oleh Chip untuk verify authenticity webhook. Jumpa di Chip Dashboard → Settings → Webhooks."
            >
              <SecretInput
                value={settings.chip_webhook_secret}
                onChange={v => set('chip_webhook_secret', v)}
                placeholder="whsec_..."
              />
            </FieldGroup>

            {/* Webhook URL Info */}
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

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-game-purple to-game-blue text-white hover:shadow-xl'
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
          <p className="text-center text-xs text-gray-400 mt-3">⚠️ Tetapan disimpan secara tempatan. Untuk production, gunakan environment variables dalam server.</p>
        </motion.div>
      </div>
    </div>
  );
}