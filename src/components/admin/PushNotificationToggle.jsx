import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Loader2, AlertCircle, Send, Smartphone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

// Helper: convert base64url public VAPID key → Uint8Array (required by PushManager.subscribe)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function detectDevice() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('CriOS')) browser = 'Chrome';
  else if (ua.includes('FxiOS')) browser = 'Firefox';
  else if (ua.includes('EdgiOS')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Device';
  if (ua.includes('iPhone')) os = 'iPhone';
  else if (ua.includes('iPad')) os = 'iPad';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

// iOS detection — push notification ONLY works in standalone PWA mode on iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  // iOS Safari: navigator.standalone | Modern browsers: display-mode media query
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export default function PushNotificationToggle({ vapidPublicKey }) {
  const { toast } = useToast();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [needsStandalone, setNeedsStandalone] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Check basic support
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setSupported(false);
      return;
    }

    // iOS PWA gate: kalau iOS tapi bukan dalam standalone mode → push tak akan jadi
    if (isIOS() && !isStandalone()) {
      setNeedsStandalone(true);
      return;
    }

    setPermission(Notification.permission);

    // Check current subscription pada SW utama (sw.js)
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      })
      .catch((err) => {
        console.error('[Push] SW ready check failed:', err);
      });
  }, []);

  const handleSubscribe = async () => {
    if (!vapidPublicKey) {
      toast({ title: '⚠️ VAPID public key tiada', description: 'Generate VAPID keys dahulu dan set ke secrets.', variant: 'destructive' });
      return;
    }

    setBusy(true);
    setDebugInfo('');

    try {
      // Step 1: Pastikan SW utama (sw.js) dah register & ready
      setDebugInfo('1/5 Menunggu service worker...');
      let reg = await navigator.serviceWorker.getRegistration('/');
      if (!reg) {
        // Register kalau belum ada (fallback)
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      }
      await navigator.serviceWorker.ready;

      // Step 2: Request permission (mesti dipanggil dari user gesture)
      setDebugInfo('2/5 Meminta permission...');
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        toast({
          title: '🔕 Permission ditolak',
          description: 'Sila benarkan notification dari iOS Settings → CeriaKid → Notifications.',
          variant: 'destructive',
        });
        setDebugInfo('');
        return;
      }

      // Step 3: Subscribe via PushManager
      setDebugInfo('3/5 Subscribe ke push service...');
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const subJson = sub.toJSON();
      console.log('[Push] Subscription created:', subJson);

      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Subscription incomplete — endpoint atau keys hilang');
      }

      // Step 4: Hantar ke server untuk save
      setDebugInfo('4/5 Save ke server...');
      const saveRes = await base44.functions.invoke('subscribeToPush', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        deviceLabel: detectDevice(),
      });
      console.log('[Push] Server save response:', saveRes);

      if (!saveRes?.data?.success) {
        const errMsg = saveRes?.data?.error || 'Server tolak subscription';
        throw new Error(errMsg);
      }

      // Step 5: Done
      setDebugInfo('5/5 ✅ Berjaya!');
      setSubscribed(true);
      toast({ title: '✅ Notification diaktifkan!', description: 'Anda akan terima notif bila ada order baru.' });
      setTimeout(() => setDebugInfo(''), 2500);
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      const msg = err?.message || String(err);
      setDebugInfo(`❌ Error: ${msg}`);
      toast({ title: '❌ Gagal aktifkan', description: msg, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        try {
          await base44.functions.invoke('unsubscribeFromPush', { endpoint: sub.endpoint });
        } catch (e) {
          console.warn('[Push] server unsubscribe failed:', e?.message);
        }
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast({ title: '🔕 Notification dimatikan', description: 'Anda tidak akan terima push lagi.' });
    } catch (err) {
      console.error('Unsubscribe error:', err);
      toast({ title: '❌ Gagal matikan', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await base44.functions.invoke('sendPushNotification', {
        title: '🧪 Test Notification',
        body: 'Push notification berfungsi! Anda akan terima notif macam ini bila ada order baru.',
        url: '/admin-dashboard?tab=analytics',
        tag: 'test-notif',
      });
      const data = res?.data || {};
      toast({ title: `📤 Test sent`, description: `${data.sent || 0} sent, ${data.failed || 0} failed` });
    } catch (err) {
      toast({ title: '❌ Gagal hantar test', description: err.message, variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  // iOS NEEDS standalone PWA mode
  if (needsStandalone) {
    return (
      <div className="rounded-2xl p-5 bg-amber-50 border-2 border-amber-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-amber-900 text-base">📱 iOS PWA Diperlukan</h3>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">
              Push notification pada iPhone/iPad hanya berfungsi bila app dibuka dari Home Screen.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 text-xs text-slate-800 space-y-2 font-semibold">
          <p className="font-black text-slate-900 mb-2">🪜 Cara setup:</p>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Tap butang <strong>Share</strong> di Safari (kotak dengan panah ↑)</li>
            <li>Scroll & tap <strong>"Add to Home Screen"</strong></li>
            <li>Confirm dengan tap <strong>"Add"</strong></li>
            <li><strong>Tutup Safari</strong> sepenuhnya (swipe up app switcher)</li>
            <li>Buka <strong>CeriaKid</strong> dari icon Home Screen (bukan Safari!)</li>
            <li>Login admin → kembali ke page ini → aktifkan notification</li>
          </ol>
        </div>

        <div className="mt-3 text-xs text-amber-700 bg-amber-100 rounded-lg p-2 font-semibold">
          ⚠️ <strong>Penting:</strong> iOS 16.4+ syarat — push hanya jalan dari PWA installed, bukan Safari biasa.
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="rounded-2xl p-4 bg-amber-50 border-2 border-amber-200 text-amber-900 text-sm font-semibold flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black">Browser tidak menyokong Push Notifications</p>
          <p className="text-xs mt-1">Sila guna Chrome, Firefox, Edge, atau Safari versi terkini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${subscribed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
          {subscribed ? <Bell className="w-6 h-6 text-white" /> : <BellOff className="w-6 h-6 text-white" />}
        </div>
        <div className="flex-1">
          <h3 className="font-black text-slate-900 text-base">Order Push Notifications</h3>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            {subscribed ? '✅ Aktif — anda akan terima notif bila ada order baru' : 'Dapatkan notif real-time bila ada pelanggan bayar'}
          </p>
          {isIOS() && isStandalone() && (
            <p className="text-[10px] text-emerald-700 font-black mt-1">📱 PWA mode dikesan ✓</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!subscribed ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSubscribe}
            disabled={busy}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Aktifkan Notification
          </motion.button>
        ) : (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleTest}
              disabled={testing}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-xl bg-white text-slate-900 font-black text-sm shadow-md hover:shadow-lg border border-slate-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Hantar Test
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleUnsubscribe}
              disabled={busy}
              className="py-3 px-4 rounded-xl bg-rose-100 text-rose-700 font-black text-sm hover:bg-rose-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
              Matikan
            </motion.button>
          </>
        )}
      </div>

      {debugInfo && (
        <div className="mt-3 text-xs bg-slate-900 text-emerald-300 font-mono rounded-lg p-2.5 break-all">
          {debugInfo}
        </div>
      )}

      {permission === 'denied' && (
        <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Permission ditolak. Buka iOS Settings → CeriaKid → Notifications → Allow.</span>
        </div>
      )}
    </div>
  );
}