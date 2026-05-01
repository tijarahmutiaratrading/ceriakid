import React, { useState, useEffect } from 'react';
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
  const [inviteCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

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

  const shareInviteCode = () => {
    const message = `Mari bermain di Jom Belajar! 🎮 Gunakan kod undangan: ${inviteCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👥</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

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