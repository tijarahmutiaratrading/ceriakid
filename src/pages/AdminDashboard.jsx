import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Save, Eye, EyeOff, CheckCircle, Settings, Facebook, CreditCard, Webhook, BarChart3, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AppHeader from '@/components/AppHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminQuickStats from '@/components/admin/AdminQuickStats';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminGameManager from '@/pages/AdminGameManager';
import SystemHealthPanel from '@/components/admin/SystemHealthPanel';
import { DollarSign, ShoppingCart, TrendingUp, Clock as ClockIcon, Sparkles, Gamepad2, Activity } from 'lucide-react';

const SETTINGS_KEY = 'admin_app_settings';

const defaultSettings = {
  fb_pixel_id: '364206716624609',
  fb_access_token: '',
  chip_brand_id: '',
  chip_api_key: '',
  chip_webhook_secret: '',
  chip_environment: 'production',
};

function FieldGroup({ label, hint, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-black text-white mb-1.5">{label}</label>
      {hint && <p className="text-xs text-white/70 mb-2.5">{hint}</p>}
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
        className="w-full border border-white/25 rounded-xl px-4 py-3 pr-12 text-sm font-mono bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/55 focus:bg-white/15 transition-all"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
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
      className="w-full border border-white/25 rounded-xl px-4 py-3 text-sm font-mono bg-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/55 focus:bg-white/15 transition-all"
    />
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [gameManagerMounted, setGameManagerMounted] = useState(false);
  const [settingsTab, setSettingsTab] = useState('pixel');

  // Sync activeTab dgn URL ?tab=... (dari hamburger submenu AppHeader)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && ['analytics', 'customers', 'gamemanager', 'health', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Lazy mount Game Manager once user enters the tab — elak fire QC + counts API serentak masa buka admin dashboard
  useEffect(() => {
    if (activeTab === 'gamemanager') setGameManagerMounted(true);
  }, [activeTab]);
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (_) {}
    return defaultSettings;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [secretsLoaded, setSecretsLoaded] = useState(false);
  const [loadingSecrets, setLoadingSecrets] = useState(false);

  // Load semua server secrets bila masuk tab Settings — auto-fill terus dalam input
  useEffect(() => {
    if (activeTab === 'settings' && !secretsLoaded && !loadingSecrets) {
      setLoadingSecrets(true);
      base44.functions.invoke('getAdminSecrets', {})
        .then(res => {
          if (res?.data) {
            const d = res.data;
            setSettings(prev => ({
              ...prev,
              chip_brand_id: d.chip_brand_id || prev.chip_brand_id || '',
              chip_api_key: d.chip_secret_key || prev.chip_api_key || '',
              chip_webhook_secret: d.chip_webhook_secret || prev.chip_webhook_secret || '',
              fb_pixel_id: d.fb_pixel_id || prev.fb_pixel_id || '',
              fb_access_token: d.fb_access_token || prev.fb_access_token || '',
            }));
            setSecretsLoaded(true);
          }
        })
        .catch(err => console.error('Failed to load secrets:', err))
        .finally(() => setLoadingSecrets(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  // NOTE: localStorage load dipindah ke useState initializer supaya tidak override server fetch yang berlaku selepas tab Settings dibuka.

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
    { key: 'customers', label: '👥 Pelanggan', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'gamemanager', label: '🎮 Game Manager', icon: <Gamepad2 className="w-4 h-4" /> },
    { key: 'health', label: '💚 System Health', icon: <Activity className="w-4 h-4" /> },
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
    <div className="min-h-screen relative overflow-hidden text-foreground" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 35%, #4a1d6e 70%, #6b1d52 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-game-purple/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-game-pink/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] bg-game-blue/30 rounded-full blur-3xl" />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-24 md:pt-8 pb-32 lg:flex lg:gap-6">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          <main className="flex-1 min-w-0 space-y-4 md:space-y-5">
        {/* Mobile tab pill (shows current section) */}
        <div className="lg:hidden pro-glass rounded-2xl px-3 py-2 flex items-center justify-between gap-2">
          <p className="text-white/65 text-[10px] font-black uppercase tracking-widest">Section</p>
          <p className="text-white text-sm font-black truncate">
            {tabs.find(t => t.key === activeTab)?.label || 'Dashboard'}
          </p>
        </div>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/40 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-amber-300 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> CeriaKid Analytics</p>
              <h1 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">Dashboard</h1>
              <p className="text-white/90 text-[11px] md:text-sm font-semibold truncate">Pantau prestasi jualan secara realtime</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={loadData} className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-black text-white transition-all flex items-center gap-1.5 ring-1 ring-white/20">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button type="button" onClick={handleClearCache} disabled={clearingCache} className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-black text-white transition-all disabled:opacity-60 flex items-center gap-1.5 ring-1 ring-white/20">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pro-glass rounded-3xl p-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">💳 Jualan Mengikut Pelan</h2>
                  <p className="text-white/85 text-xs font-semibold">Ringkasan prestasi setiap pakej langganan</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {[
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

          </>
        )}

        {/* ═══ CUSTOMERS TAB ═══ */}
        {activeTab === 'customers' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-black text-white">📋 Database Pelanggan</h2>
                <p className="text-white/85 text-xs font-semibold">Senarai pelanggan terkini dan status langganan</p>
              </div>
              <span className="text-xs font-black text-purple-900 bg-amber-300 px-3 py-1.5 rounded-full ring-1 ring-amber-200">{subscriptions.length} pelanggan</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-black text-white/90 text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 font-black text-white/90 text-xs uppercase tracking-wider">Paket</th>
                    <th className="text-left py-3 px-4 font-black text-white/90 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 font-black text-white/90 text-xs uppercase tracking-wider">Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="py-3 px-4 text-xs text-white font-semibold">{sub.email}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                          sub.tier === 'free' ? 'bg-gray-300 text-gray-900' :
                          sub.tier === 'asas' ? 'bg-emerald-300 text-emerald-950' :
                          sub.tier === 'standard' ? 'bg-sky-300 text-sky-950' :
                          sub.tier === 'pro' ? 'bg-rose-300 text-rose-950' :
                          'bg-violet-300 text-violet-950'
                        }`}>
                          {sub.tier === 'free' ? 'Percuma' : sub.tier === 'asas' ? 'Asas' : sub.tier === 'standard' ? 'Standard' : sub.tier === 'pro' ? 'Pro' : 'Keluarga'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                          sub.status === 'active' ? 'bg-emerald-300 text-emerald-950' :
                          sub.status === 'trial' ? 'bg-sky-300 text-sky-950' :
                          sub.status === 'incomplete' ? 'bg-amber-300 text-amber-950' :
                          sub.status === 'past_due' ? 'bg-orange-300 text-orange-950' :
                          'bg-rose-300 text-rose-950'
                        }`}>
                          {sub.status === 'active' ? '✓ Aktif' :
                           sub.status === 'trial' ? '⏳ Trial' :
                           sub.status === 'incomplete' ? '⏸ Pending' :
                           sub.status === 'past_due' ? '⚠ Lewat' :
                           '✕ Batal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-white/80 font-semibold whitespace-nowrap">{new Date(sub.created_date).toLocaleDateString('ms-MY')}</td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-white/70 font-semibold">Tiada pelanggan lagi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ═══ SYSTEM HEALTH TAB ═══ */}
        {activeTab === 'health' && <SystemHealthPanel />}

        {/* ═══ GAME MANAGER TAB (lazy-mounted; kekal mounted lepas first visit) ═══ */}
        {gameManagerMounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeTab === 'gamemanager' ? 1 : 0 }}
            style={{ display: activeTab === 'gamemanager' ? 'block' : 'none' }}
            className="-mx-3 sm:-mx-4 md:-mx-6"
          >
            <AdminGameManager embedded />
          </motion.div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <>
            {/* Settings Sub-tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pro-glass flex gap-2 p-1.5 rounded-2xl overflow-x-auto">
              {settingsTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSettingsTab(tab.key)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all whitespace-nowrap flex items-center justify-center gap-2 ${settingsTab === tab.key ? 'bg-white text-game-purple shadow' : 'text-white/85 hover:bg-white/15'}`}
                >
                  {tab.icon}<span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </motion.div>

            {/* Facebook Pixel */}
            {settingsTab === 'pixel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5 md:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Meta / Facebook Pixel</h2>
                    <p className="text-xs text-white/85 font-semibold">Untuk tracking FB Ads & conversion events</p>
                  </div>
                </div>

                <FieldGroup label="Pixel ID" hint="✅ Auto-loaded dari server. Edit untuk update.">
                  <TextInput value={settings.fb_pixel_id} onChange={v => set('fb_pixel_id', v)} placeholder="e.g. 1234567890123" />
                </FieldGroup>

                <FieldGroup label="Access Token (Conversions API)" hint="✅ Auto-loaded dari server. Optional — untuk server-side tracking.">
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5 md:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Chip Payment Gateway</h2>
                    <p className="text-xs text-white/85 font-semibold">FPX, kad kredit & e-wallet Malaysia</p>
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

                {loadingSecrets && (
                  <p className="text-xs text-white/70 mb-3">⏳ Memuat credentials dari server...</p>
                )}

                <FieldGroup label="Brand ID" hint="✅ Auto-loaded dari server. Edit untuk update.">
                  <TextInput value={settings.chip_brand_id} onChange={v => set('chip_brand_id', v)} placeholder="abc12345-abcd-1234-abcd-abc123456789" />
                </FieldGroup>

                <FieldGroup label="API Key (Secret Key)" hint="✅ Auto-loaded dari server. Edit untuk update.">
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5 md:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg">Webhook Settings</h2>
                    <p className="text-xs text-white/85 font-semibold">Untuk receive payment callbacks dari Chip</p>
                  </div>
                </div>

                <FieldGroup label="Chip Webhook Secret" hint="✅ Auto-loaded dari server. Edit untuk update.">
                  <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                </FieldGroup>

                <div className="mt-2 mb-5">
                  <label className="block text-sm font-black text-white mb-1">Webhook URL Anda</label>
                  <p className="text-xs text-white/70 mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 border-2 border-dashed border-white/25 rounded-xl px-3 py-3 text-xs font-mono text-white/85 break-all overflow-x-auto">
                      {window.location.origin}/api/webhook/chip
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/chip`);
                        toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                      }}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition-all ring-1 ring-white/25"
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
              <p className="text-center text-xs text-white/85 mt-4 font-semibold">⚠️ Tetapan disimpan secara tempatan. Untuk production, gunakan environment variables dalam server.</p>
            </motion.div>
          </>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}