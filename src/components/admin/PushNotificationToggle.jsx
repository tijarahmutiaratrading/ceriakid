import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';
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

// Helper: ArrayBuffer → base64url
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function detectDevice() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Device';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}

export default function PushNotificationToggle({ vapidPublicKey }) {
  const { toast } = useToast();
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setSupported(false);
      return;
    }
    setPermission(Notification.permission);
    // Check current subscription
    navigator.serviceWorker.getRegistration('/sw-push.js').then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    }).catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    if (!vapidPublicKey) {
      toast({ title: '⚠️ VAPID public key tiada', description: 'Generate VAPID keys dahulu dan set ke secrets.', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      // Register dedicated push SW (separate scope from PWA sw.js)
      const reg = await navigator.serviceWorker.register('/sw-push.js');
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        toast({ title: '🔕 Permission ditolak', description: 'Sila benarkan notification dari browser settings.', variant: 'destructive' });
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subJson = sub.toJSON();
      console.log('[Push] Subscription created:', subJson);

      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Subscription incomplete — endpoint atau keys hilang');
      }

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

      setSubscribed(true);
      toast({ title: '✅ Notification diaktifkan!', description: 'Anda akan terima notifikasi bila ada order baru.' });
    } catch (err) {
      console.error('Subscribe error:', err);
      toast({ title: '❌ Gagal aktifkan', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      const sub = reg && await reg.pushManager.getSubscription();
      if (sub) {
        await base44.functions.invoke('unsubscribeFromPush', { endpoint: sub.endpoint });
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

  if (!supported) {
    return (
      <div className="rounded-2xl p-4 bg-amber-50 border-2 border-amber-200 text-amber-900 text-sm font-semibold flex items-start gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black">Browser tidak menyokong Push Notifications</p>
          <p className="text-xs mt-1">Sila guna Chrome, Firefox, atau Edge versi terkini.</p>
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
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!subscribed ? (
          <motion.button
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
              whileTap={{ scale: 0.97 }}
              onClick={handleTest}
              disabled={testing}
              className="flex-1 min-w-[120px] py-3 px-4 rounded-xl bg-white text-slate-900 font-black text-sm shadow-md hover:shadow-lg border border-slate-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Hantar Test
            </motion.button>
            <motion.button
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



      {permission === 'denied' && (
        <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Permission ditolak. Buka browser settings → site permissions → benarkan notifications.</span>
        </div>
      )}
    </div>
  );
}