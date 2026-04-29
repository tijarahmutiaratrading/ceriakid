import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function FriendsList() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode] = useState(Math.random().toString(36).substring(2, 8).toUpperCase());

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
      setFriends(friends.filter(f => f.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const shareInviteCode = () => {
    const message = `Mari bermain di Jom Belajar! 🎮 Gunakan kod: ${inviteCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-6xl animate-bounce">👥</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-3xl font-black text-gray-800 mb-8">👥 Kawan-Kawan</h1>

        {/* Invite Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-game-blue to-blue-400 text-white rounded-3xl p-6 mb-6 shadow-lg"
        >
          <p className="text-sm opacity-90 mb-2">Kod Undangan Anda</p>
          <p className="text-4xl font-black mb-4">{inviteCode}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={shareInviteCode}
            className="w-full bg-white text-game-blue rounded-full font-bold py-2 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Kongsi dengan WhatsApp
          </motion.button>
        </motion.div>

        {/* Friends List */}
        {friends.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 text-center border-2 border-amber-200 shadow-lg"
          >
            <p className="text-lg font-bold mb-2">Belum ada kawan</p>
            <p className="text-sm text-gray-600">Kongsi kod undangan anda untuk bermain bersama!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend, idx) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">👤</span>
                  <div>
                    <p className="font-bold text-gray-800">{friend.friendEmail}</p>
                    <p className="text-xs text-gray-600">Ditambah {new Date(friend.acceptedDate).toLocaleDateString('ms-MY')}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFriend(friend.id)}
                  className="p-2 hover:bg-red-100 rounded-full transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}