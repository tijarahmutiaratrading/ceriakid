import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Trash2, Users, Copy, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import EmptyState from '@/components/ui/EmptyState';
import PageLoader from '@/components/PageLoader';
import { toast } from '@/components/ui/use-toast';

export default function FriendsList() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [addMessage, setAddMessage] = useState(null);
  // Stable invite code tied to user email so it doesn't change on re-render
  const inviteCode = useMemo(() => {
    if (!user?.email) return '------';
    // Generate deterministic code from email
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
      hash = (hash * 31 + user.email.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    loadFriends();
  }, [user, isAuthenticated]);

  const loadFriends = async () => {
    try {
      const acceptedFriends = await base44.entities.Friend.filter({
        userEmail: user.email,
        status: 'accepted',
      }) || [];
      setFriends(acceptedFriends);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await base44.entities.Friend.delete(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      toast({ title: '👋 Kawan dibuang' });
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast({ title: 'Gagal buang kawan', description: 'Sila cuba lagi.', variant: 'destructive' });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast({ title: '📋 Kod disalin!', description: `Kongsi ${inviteCode} dengan kawan anda.` });
    setTimeout(() => setCopied(false), 2000);
  };

  const addFriendByCode = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code || code.length < 4) return;
    if (code === inviteCode) {
      setAddMessage({ ok: false, text: 'Itu adalah kod anda sendiri!' });
      return;
    }
    setAddingFriend(true);
    setAddMessage(null);
    try {
      // Find user with this invite code by checking all Friend records or UserSubscription
      // We search all users' generated codes by checking UserSubscription emails
      const allSubs = await base44.entities.UserSubscription.list();
      let friendEmail = null;
      for (const sub of allSubs) {
        if (!sub.email) continue;
        let hash = 0;
        for (let i = 0; i < sub.email.length; i++) {
          hash = (hash * 31 + sub.email.charCodeAt(i)) & 0xffffffff;
        }
        const generatedCode = Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
        if (generatedCode === code) {
          friendEmail = sub.email;
          break;
        }
      }

      if (!friendEmail) {
        setAddMessage({ ok: false, text: 'Kod tidak dijumpai. Sila semak semula.' });
        setAddingFriend(false);
        return;
      }

      // Check if already friends
      const existing = friends.find(f => f.friendEmail === friendEmail);
      if (existing) {
        setAddMessage({ ok: false, text: 'Anda sudah berkawan dengan pengguna ini!' });
        setAddingFriend(false);
        return;
      }

      // Create friendship (both sides)
      await base44.entities.Friend.create({
        userEmail: user.email,
        friendEmail: friendEmail,
        status: 'accepted',
        inviteCode: code,
        acceptedDate: new Date().toISOString(),
      });
      await base44.entities.Friend.create({
        userEmail: friendEmail,
        friendEmail: user.email,
        status: 'accepted',
        inviteCode: inviteCode,
        acceptedDate: new Date().toISOString(),
      });

      setAddMessage({ ok: true, text: `✅ Berjaya! ${friendEmail} telah ditambah sebagai kawan.` });
      toast({ title: '🎉 Kawan baru ditambah!', description: friendEmail });
      setInputCode('');
      loadFriends();
    } catch (err) {
      setAddMessage({ ok: false, text: 'Ralat berlaku. Cuba lagi.' });
      toast({ title: 'Gagal tambah kawan', description: 'Sila cuba lagi.', variant: 'destructive' });
    }
    setAddingFriend(false);
  };

  const shareInviteCode = () => {
    const message = `Mari bermain di Jom Belajar! 🎮 Gunakan kod undangan: ${inviteCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
    >
      {/* Floating decorations — CeriaKid vibe */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pb-32 pt-4 overflow-x-hidden">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center gap-4 bg-white shadow-xl border border-white/60"
        >
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6edd6aa29_generated_image.png"
            alt="Kawan-kawan"
            className="w-14 h-14 rounded-2xl object-cover shadow-lg flex-shrink-0 ring-2 ring-white"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">Kawan-Kawan</h1>
            <p className="text-slate-600 text-xs font-semibold mt-0.5">{friends.length} kawan berdaftar</p>
          </div>
        </motion.div>

        {/* Invite Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 rounded-3xl p-5 bg-white shadow-xl border border-white/60"
        >
          <p className="text-purple-700 text-xs font-black uppercase tracking-wider mb-3">🎫 Kod Undangan Anda</p>

          {/* Code Display */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 rounded-2xl py-4 text-center bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200">
              <p className="text-4xl font-black text-purple-700 tracking-widest">{inviteCode}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCode}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
                copied ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {copied
                ? <Check className="w-5 h-5 text-white" />
                : <Copy className="w-5 h-5 text-white" />
              }
            </motion.button>
          </div>

          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={shareInviteCode}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black py-3.5 flex items-center justify-center gap-2 shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Kongsi via WhatsApp
          </motion.button>
        </motion.div>

        {/* Add Friend by Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-5 rounded-3xl p-5 bg-white shadow-xl border border-white/60"
        >
          <p className="text-purple-700 text-xs font-black uppercase tracking-wider mb-3">➕ Tambah Kawan</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan kod kawan..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 rounded-2xl px-4 py-3 bg-purple-50 text-slate-800 placeholder-slate-400 font-black text-lg tracking-widest border-2 border-purple-200 outline-none focus:border-purple-400 uppercase"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addFriendByCode}
              disabled={addingFriend || inputCode.length < 4}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black shadow-lg disabled:opacity-50 transition-all"
            >
              {addingFriend ? '...' : 'Tambah'}
            </motion.button>
          </div>
          {addMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 text-sm font-bold ${addMessage.ok ? 'text-green-600' : 'text-red-600'}`}
            >
              {addMessage.text}
            </motion.p>
          )}
        </motion.div>

        {/* Friends List — dalam satu card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-5 bg-white shadow-xl border border-white/60"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <p className="text-purple-700 text-xs font-black uppercase tracking-wider">Senarai Kawan</p>
          </div>

          {friends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada kawan"
              description="Kongsi kod undangan anda dengan kawan untuk mula bermain bersama dan cabar antara satu sama lain!"
              gradient="from-purple-100 to-pink-100"
              iconColor="text-purple-500"
              action={{ label: 'Kongsi via WhatsApp', emoji: '💬', onClick: shareInviteCode }}
            />
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {friends.map((friend, idx) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl p-3.5 flex items-center justify-between bg-purple-50/60 border border-purple-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">👤</div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{friend.friendEmail}</p>
                        <p className="text-slate-500 text-xs">
                          Ditambah {friend.acceptedDate ? new Date(friend.acceptedDate).toLocaleDateString('ms-MY') : '-'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFriend(friend.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 hover:bg-red-200 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}