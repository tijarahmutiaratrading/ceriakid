import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PushNotificationToggle from './PushNotificationToggle';

export default function PushNotificationPanel() {
  const { toast } = useToast();
  const [vapidPublicKey, setVapidPublicKey] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    // Load public key dari secrets via getAdminSecrets
    base44.functions.invoke('getAdminSecrets', {})
      .then(res => {
        if (res?.data?.vapid_public_key) setVapidPublicKey(res.data.vapid_public_key);
      })
      .catch(err => console.error('Failed to load VAPID public key:', err))
      .finally(() => setLoadingKey(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateVapidKeys', {});
      if (res?.data?.success) {
        setGenerated(res.data);
        toast({ title: '✅ VAPID keys generated!', description: 'Copy & paste ke secrets, kemudian refresh.' });
      } else {
        toast({ title: '❌ Gagal generate', description: res?.data?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: '❌ Error', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({ title: `📋 ${label} disalin!` });
  };

  return (
    <div className="space-y-5">
      {/* VAPID Setup Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5 md:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg">VAPID Keys</h2>
            <p className="text-xs text-slate-600 font-semibold">Diperlukan untuk Web Push API berfungsi</p>
          </div>
        </div>

        {loadingKey ? (
          <p className="text-sm text-slate-600">⏳ Memuat status...</p>
        ) : vapidPublicKey ? (
          <div className="rounded-xl p-4 bg-green-50 border-2 border-green-200 text-green-900 text-sm font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black">VAPID keys sudah dikonfigurasi ✅</p>
              <p className="text-xs mt-1 font-mono break-all opacity-80">Public key: {vapidPublicKey.substring(0, 24)}...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl p-4 bg-amber-50 border-2 border-amber-200 text-amber-900 text-sm font-semibold">
              <p className="font-black mb-1">⚠️ VAPID keys belum di-set</p>
              <p className="text-xs">Klik butang di bawah untuk generate keys, kemudian copy ke secrets app.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate VAPID Keys
            </motion.button>
          </div>
        )}

        {generated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <div className="rounded-xl p-4 bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">VAPID_PUBLIC_KEY</p>
                <button onClick={() => copy(generated.publicKey, 'Public key')} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-xs font-mono break-all opacity-90">{generated.publicKey}</p>
            </div>
            <div className="rounded-xl p-4 bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">VAPID_PRIVATE_KEY</p>
                <button onClick={() => copy(generated.privateKey, 'Private key')} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <p className="text-xs font-mono break-all opacity-90">{generated.privateKey}</p>
            </div>
            <div className="rounded-xl p-4 bg-blue-50 border-2 border-blue-200 text-blue-900 text-xs">
              <p className="font-black mb-2">📌 Langkah seterusnya:</p>
              <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                <li>Pergi ke Dashboard → Settings → Environment Variables (secrets)</li>
                <li>Tambah <code className="font-mono bg-blue-100 px-1 rounded">VAPID_PUBLIC_KEY</code> dengan value di atas</li>
                <li>Tambah <code className="font-mono bg-blue-100 px-1 rounded">VAPID_PRIVATE_KEY</code> dengan value di atas</li>
                <li>Tambah <code className="font-mono bg-blue-100 px-1 rounded">VAPID_SUBJECT</code> dengan value <code className="font-mono">mailto:admin@yourdomain.com</code></li>
                <li>Refresh page ini, dan aktifkan notification di bawah</li>
              </ol>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Subscribe Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PushNotificationToggle vapidPublicKey={vapidPublicKey} />
      </motion.div>
    </div>
  );
}