import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Save, Eye, EyeOff, CheckCircle, Facebook, CreditCard, Webhook, Bell, DollarSign, ShoppingCart, TrendingUp, Clock as ClockIcon, Users2, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AppHeader from '@/components/AppHeader';
import AdminTopHeader from '@/components/admin/AdminTopHeader';
import AdminUnifiedHeader from '@/components/admin/AdminUnifiedHeader';

import SystemHealthPanel from '@/components/admin/SystemHealthPanel';
import LaunchControlPanel from '@/components/admin/LaunchControlPanel';
import AdminAffiliatePanel from '@/components/admin/AdminAffiliatePanel';
import PushNotificationPanel from '@/components/admin/PushNotificationPanel';
import CustomerDatabaseTable from '@/components/admin/CustomerDatabaseTable';
import DateRangeFilter, { isInRange } from '@/components/admin/DateRangeFilter';
import TrafficAnalyticsCard from '@/components/admin/TrafficAnalyticsCard';

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
      <label className="block text-sm font-bold text-slate-800 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
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
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm font-mono bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
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
      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
    />
  );
}

function SectionCard({ icon: Icon, iconBg, title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-slate-200 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-base">{title}</h2>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-slate-200/60 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5">
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-7 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-slate-200/40 rounded-2xl animate-pulse" />
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [settingsTab, setSettingsTab] = useState('pixel');
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl === 'customers') {
      setActiveTab('analytics');
    } else if (tabFromUrl && ['analytics', 'launch', 'health', 'affiliate', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

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

  const loadData = async () => {
    try {
      const [subs, views] = await Promise.all([
        base44.entities.UserSubscription.list().catch(() => []),
        base44.entities.PageView.list('-created_date', 5000).catch(() => []),
      ]);
      setSubscriptions(subs || []);
      setPageViews(views || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
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

  // Filter subs ikut date range (guna created_date)
  const filteredSubs = dateRange === 'all'
    ? subscriptions
    : subscriptions.filter(s => isInRange(s.created_date, dateRange));

  // Revenue calc — ikut filter
  const totalRevenue = filteredSubs
    .filter(s => s.status === 'active' && ['asas', 'standard', 'keluarga'].includes(s.tier))
    .reduce((sum, s) => {
      const price = s.tier === 'asas' ? 49 : s.tier === 'standard' ? 99 : s.tier === 'keluarga' ? 199 : 0;
      return sum + price;
    }, 0);

  const tierBreakdown = {
    asas: filteredSubs.filter(s => s.tier === 'asas').length,
    standard: filteredSubs.filter(s => s.tier === 'standard').length,
    keluarga: filteredSubs.filter(s => s.tier === 'keluarga').length,
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

  const paidCount = tierBreakdown.asas + tierBreakdown.standard + tierBreakdown.keluarga;
  const avgOrderValue = paidCount > 0 ? (totalRevenue / paidCount).toFixed(2) : '0.00';
  const pendingCount = filteredSubs.filter(s => s.status === 'incomplete' || s.status === 'past_due').length;
  const activeCount = filteredSubs.filter(s => s.status === 'active').length;

  // PageView analytics — filter ikut date range
  const filteredViews = dateRange === 'all'
    ? pageViews
    : pageViews.filter(v => isInRange(v.created_date, dateRange));

  const uniqueSessions = new Set(filteredViews.map(v => v.sessionId)).size;
  const totalPageViews = filteredViews.length;

  // Source breakdown — count unique sessions per source
  const sessionsBySource = {};
  const seenSessionsPerSource = {};
  filteredViews.forEach(v => {
    const src = v.source || 'unknown';
    if (!seenSessionsPerSource[src]) seenSessionsPerSource[src] = new Set();
    seenSessionsPerSource[src].add(v.sessionId);
  });
  Object.keys(seenSessionsPerSource).forEach(src => {
    sessionsBySource[src] = seenSessionsPerSource[src].size;
  });

  // Top pages
  const pageCount = {};
  filteredViews.forEach(v => {
    const p = v.path || '/';
    pageCount[p] = (pageCount[p] || 0) + 1;
  });
  const topPages = Object.entries(pageCount)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);

  // Conversion rate: paid orders dalam range / unique visitors dalam range
  const conversionRate = uniqueSessions > 0 ? (paidCount / uniqueSessions) * 100 : 0;

  // Unified KPI strip — sekarang ikut filter
  const kpiStats = [
    { label: 'Revenue', value: `RM${totalRevenue.toFixed(0)}`, sub: `${paidCount} transaksi`, icon: DollarSign, iconColor: 'text-emerald-600' },
    { label: 'Orders', value: filteredSubs.length, sub: 'dalam tempoh', icon: ShoppingCart, iconColor: 'text-violet-600' },
    { label: 'Active', value: activeCount, sub: 'subscription aktif', icon: CheckCircle2, iconColor: 'text-sky-600' },
    { label: 'Pending', value: pendingCount, sub: 'menunggu bayaran', icon: ClockIcon, iconColor: 'text-amber-600' },
  ];

  const settingsTabs = [
    { key: 'pixel', label: 'Facebook Pixel', icon: Facebook },
    { key: 'chip', label: 'Chip Payment', icon: CreditCard },
    { key: 'webhook', label: 'Webhook', icon: Webhook },
    { key: 'push', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen text-foreground" style={{ background: '#fafafa' }}>
      {/* Subtle grid pattern background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <AppHeader showBack={true} backTo="/dashboard" />
      <AdminTopHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-20 pb-32">
          <main className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Unified header: greeting + KPI + tabs */}
                <AdminUnifiedHeader
                  stats={activeTab === 'analytics' ? kpiStats : null}
                  onRefresh={loadData}
                  onClearCache={handleClearCache}
                  clearingCache={clearingCache}
                />

                {/* ═══ ANALYTICS TAB ═══ */}
                {activeTab === 'analytics' && (
                  <>
                    {/* Date filter */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <DateRangeFilter value={dateRange} onChange={setDateRange} />
                      <p className="text-[11px] text-slate-500 font-bold tabular-nums">
                        {filteredSubs.length} order • {uniqueSessions} unique visitor
                      </p>
                    </div>

                    {/* Traffic & Visitor analytics */}
                    <TrafficAnalyticsCard
                      pageViews={totalPageViews}
                      uniqueVisitors={uniqueSessions}
                      conversionRate={conversionRate}
                      paidOrders={paidCount}
                      sourceBreakdown={sessionsBySource}
                      topPages={topPages}
                    />

                    {/* Sales Breakdown — minimal */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-slate-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h2 className="text-base font-black text-slate-900">Jualan Mengikut Pelan</h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Ringkasan prestasi setiap pakej langganan</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 tabular-nums">
                          AOV: <span className="text-slate-900">RM{avgOrderValue}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Asas', price: 'RM49', value: tierBreakdown.asas, color: 'emerald', emoji: '🌱' },
                          { label: 'Standard', price: 'RM99', value: tierBreakdown.standard, color: 'sky', emoji: '⭐' },
                          { label: 'Keluarga', price: 'RM199', value: tierBreakdown.keluarga, color: 'violet', emoji: '👑' },
                        ].map((item, idx) => {
                          const colorMap = {
                            emerald: 'from-emerald-500/10 to-emerald-500/5 ring-emerald-200 text-emerald-700',
                            sky: 'from-sky-500/10 to-sky-500/5 ring-sky-200 text-sky-700',
                            violet: 'from-violet-500/10 to-violet-500/5 ring-violet-200 text-violet-700',
                          };
                          const dotMap = {
                            emerald: 'bg-emerald-500',
                            sky: 'bg-sky-500',
                            violet: 'bg-violet-500',
                          };
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`relative rounded-xl p-4 bg-gradient-to-br ${colorMap[item.color]} ring-1`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${dotMap[item.color]}`} />
                                  <p className="text-xs font-bold text-slate-700">{item.label}</p>
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 tabular-nums">{item.price}</p>
                              </div>
                              <div className="flex items-end justify-between">
                                <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">{item.value}</p>
                                <p className="text-2xl opacity-60">{item.emoji}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Customer Database */}
                    <CustomerDatabaseTable />
                  </>
                )}

                {/* ═══ OTHER TABS ═══ */}
                {activeTab === 'health' && <SystemHealthPanel />}
                {activeTab === 'launch' && <LaunchControlPanel />}
                {activeTab === 'affiliate' && <AdminAffiliatePanel />}

                {/* ═══ SETTINGS TAB ═══ */}
                {activeTab === 'settings' && (
                  <>
                    {/* Settings sub-tabs */}
                    <div className="flex gap-1 p-1 rounded-xl bg-white ring-1 ring-slate-200 overflow-x-auto shadow-sm">
                      {settingsTabs.map(tab => {
                        const Icon = tab.icon;
                        const active = settingsTab === tab.key;
                        return (
                          <button
                            type="button"
                            key={tab.key}
                            onClick={() => setSettingsTab(tab.key)}
                            className={`relative flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
                              active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="settings-tab"
                                className="absolute inset-0 rounded-lg bg-slate-900"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                              />
                            )}
                            <Icon className="relative w-3.5 h-3.5" />
                            <span className="relative">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Facebook Pixel */}
                    {settingsTab === 'pixel' && (
                      <SectionCard
                        icon={Facebook}
                        iconBg="bg-blue-600"
                        title="Meta / Facebook Pixel"
                        subtitle="Tracking FB Ads & conversion events"
                      >
                        <FieldGroup label="Pixel ID" hint="✅ Auto-loaded dari server. Edit untuk update.">
                          <TextInput value={settings.fb_pixel_id} onChange={v => set('fb_pixel_id', v)} placeholder="e.g. 1234567890123" />
                        </FieldGroup>

                        <FieldGroup label="Access Token (Conversions API)" hint="✅ Auto-loaded dari server. Optional — untuk server-side tracking.">
                          <SecretInput value={settings.fb_access_token} onChange={v => set('fb_access_token', v)} placeholder="EAABsbCS1iHg..." />
                        </FieldGroup>

                        <div className="rounded-lg p-3.5 text-xs bg-blue-50 border border-blue-100 text-blue-900">
                          <p className="font-bold mb-1.5 text-blue-700">📌 Cara pasang Pixel ID:</p>
                          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                            <li>Pergi ke <strong>Meta Business Suite → Events Manager</strong></li>
                            <li>Klik <strong>Connect Data Source → Web</strong></li>
                            <li>Pilih <strong>Meta Pixel</strong> → copy Pixel ID</li>
                            <li>Paste di sini dan Save</li>
                          </ol>
                        </div>
                      </SectionCard>
                    )}

                    {/* Chip Payment */}
                    {settingsTab === 'chip' && (
                      <SectionCard
                        icon={CreditCard}
                        iconBg="bg-emerald-600"
                        title="Chip Payment Gateway"
                        subtitle="FPX, kad kredit & e-wallet Malaysia"
                      >
                        <div className="rounded-lg p-3 mb-4 bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs font-bold text-emerald-700">Production Mode — Live payments aktif</p>
                        </div>

                        {loadingSecrets && (
                          <p className="text-xs text-slate-500 mb-3">⏳ Memuat credentials dari server...</p>
                        )}

                        <FieldGroup label="Brand ID" hint="✅ Auto-loaded dari server. Edit untuk update.">
                          <TextInput value={settings.chip_brand_id} onChange={v => set('chip_brand_id', v)} placeholder="abc12345-abcd-1234-abcd-abc123456789" />
                        </FieldGroup>

                        <FieldGroup label="API Key (Secret Key)" hint="✅ Auto-loaded dari server. Edit untuk update.">
                          <SecretInput value={settings.chip_api_key} onChange={v => set('chip_api_key', v)} placeholder="sk_live_..." />
                        </FieldGroup>

                        <div className="rounded-lg p-3.5 text-xs bg-emerald-50 border border-emerald-100 text-emerald-900">
                          <p className="font-bold mb-1.5 text-emerald-700">📌 Cara dapatkan Chip credentials:</p>
                          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                            <li>Log in ke <strong>merchant.chip-in.asia</strong></li>
                            <li>Pergi ke <strong>Settings → Brand</strong> untuk Brand ID</li>
                            <li>Pergi ke <strong>Settings → API Keys</strong> untuk Secret Key</li>
                            <li>Guna Sandbox dulu untuk testing</li>
                          </ol>
                        </div>
                      </SectionCard>
                    )}

                    {/* Webhook */}
                    {settingsTab === 'webhook' && (
                      <SectionCard
                        icon={Webhook}
                        iconBg="bg-purple-600"
                        title="Webhook Settings"
                        subtitle="Receive payment callbacks dari Chip"
                      >
                        <FieldGroup label="Chip Webhook Secret" hint="✅ Auto-loaded dari server. Edit untuk update.">
                          <SecretInput value={settings.chip_webhook_secret} onChange={v => set('chip_webhook_secret', v)} placeholder="whsec_..." />
                        </FieldGroup>

                        <div className="mb-5">
                          <label className="block text-sm font-bold text-slate-800 mb-1">Webhook URL Anda</label>
                          <p className="text-xs text-slate-500 mb-2">Copy URL ini dan paste dalam Chip Dashboard → Settings → Webhooks</p>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-700 break-all overflow-x-auto">
                              https://ceriakid.com/functions/chipWebhook
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('https://ceriakid.com/functions/chipWebhook');
                                toast({ title: '📋 URL disalin!', description: 'Paste dalam Chip Dashboard.' });
                              }}
                              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-[11px] text-amber-700 mt-2 font-semibold">⚠️ Pastikan URL ni yang di-set dalam Chip Dashboard.</p>
                        </div>

                        <div className="rounded-lg p-3.5 text-xs bg-purple-50 border border-purple-100 text-purple-900">
                          <p className="font-bold mb-1.5 text-purple-700">📌 Events yang perlu didaftarkan:</p>
                          <div className="space-y-1">
                            {['payment.paid', 'payment.pending', 'payment.expired', 'payment.cancelled'].map(event => (
                              <div key={event} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                <code className="font-mono">{event}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </SectionCard>
                    )}

                    {settingsTab === 'push' && <PushNotificationPanel />}

                    {/* Compact save button — bukan giant gradient lagi */}
                    {settingsTab !== 'push' && (
                      <div className="flex items-center justify-between gap-3 px-1">
                        <p className="text-[11px] text-slate-500 font-medium">
                          ⚠️ Tetapan disimpan tempatan. Untuk production, gunakan environment variables.
                        </p>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={handleSave}
                          disabled={saving}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all whitespace-nowrap ${
                            saved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                          ) : saved ? (
                            <><CheckCircle className="w-4 h-4" /> Tersimpan</>
                          ) : (
                            <><Save className="w-4 h-4" /> Simpan</>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}