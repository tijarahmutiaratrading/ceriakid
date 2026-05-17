import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Trash2, Users, Copy, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';

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
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
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
      setInputCode('');
      loadFriends();
    } catch (err) {
      setAddMessage({ ok: false, text: 'Ralat berlaku. Cuba lagi.' });
    }
    setAddingFriend(false);
  };

  const shareInviteCode = () => {
    const message = `Mari bermain di Jom Belajar! 🎮 Gunakan kod undangan: ${inviteCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👥</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24 overflow-x-hidden">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">👥</div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">Kawan-Kawan</h1>
            <p className="text-white/70 text-xs font-semibold mt-0.5">{friends.length} kawan berdaftar</p>
          </div>
        </motion.div>

        {/* Invite Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">🎫 Kod Undangan Anda</p>

          {/* Code Display */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 rounded-2xl py-4 text-center" style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)' }}>
              <p className="text-4xl font-black text-white tracking-widest">{inviteCode}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyCode}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                copied ? 'bg-green-500' : 'bg-white/25 hover:bg-white/35'
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
            className="w-full bg-white text-purple-600 rounded-2xl font-black py-3.5 flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-all"
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
          className="mb-5 rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">➕ Tambah Kawan</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan kod kawan..."
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 rounded-2xl px-4 py-3 bg-white/20 text-white placeholder-white/40 font-black text-lg tracking-widest border border-white/30 outline-none focus:border-white/60 uppercase"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={addFriendByCode}
              disabled={addingFriend || inputCode.length < 4}
              className="px-5 py-3 rounded-2xl bg-white text-purple-600 font-black shadow-lg disabled:opacity-50 transition-all"
            >
              {addingFriend ? '...' : 'Tambah'}
            </motion.button>
          </div>
          {addMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 text-sm font-bold ${addMessage.ok ? 'text-green-300' : 'text-red-300'}`}
            >
              {addMessage.text}
            </motion.p>
          )}
        </motion.div>

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">👤 Senarai Kawan</p>

          {friends.length === 0 ? (
            <div
              className="rounded-3xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <p className="text-5xl mb-4">🤷</p>
              <p className="text-white font-black text-lg mb-2">Belum ada kawan</p>
              <p className="text-white/70 text-sm">Kongsi kod undangan anda untuk bermain bersama kawan-kawan!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {friends.map((friend, idx) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl p-4 flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center text-2xl">👤</div>
                      <div>
                        <p className="font-black text-white text-sm">{friend.friendEmail}</p>
                        <p className="text-white/60 text-xs">
                          Ditambah {friend.acceptedDate ? new Date(friend.acceptedDate).toLocaleDateString('ms-MY') : '-'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFriend(friend.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
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