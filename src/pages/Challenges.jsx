import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Plus, X, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import AppHeader from '@/components/AppHeader';

const categoryLabels = {
  bahasa_melayu: { label: 'Bahasa Melayu', emoji: '🇲🇾' },
  english: { label: 'English', emoji: '🇬🇧' },
  mathematics: { label: 'Matematik', emoji: '🔢' },
  science: { label: 'Sains', emoji: '🔬' },
};

const statusConfig = {
  pending: { label: 'Menunggu', emoji: '⏳', bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  active: { label: 'Aktif', emoji: '🎮', bg: 'bg-orange-500/20', text: 'text-orange-300' },
  completed: { label: 'Selesai', emoji: '✅', bg: 'bg-green-500/20', text: 'text-green-300' },
};

export default function Challenges() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const { ageGroup } = useAgeGroup();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    loadChallenges();
  }, [user, isAuthenticated]);

  const loadChallenges = async () => {
    try {
      const [myChallenges, opponentChallenges] = await Promise.all([
        base44.entities.FriendChallenge.filter({ createdBy: user.email }),
        base44.entities.FriendChallenge.filter({ opponent: user.email }),
      ]);
      const all = [...(myChallenges || []), ...(opponentChallenges || [])];
      // Sort by newest first
      all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setChallenges(all);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id) => {
    try {
      await base44.entities.FriendChallenge.delete(id);
      setChallenges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete challenge:', err);
    }
  };

  const createChallenge = async () => {
    if (!friendEmail.trim() || !selectedCategory) {
      setError('Sila isi email kawan dan pilih subjek.');
      return;
    }
    if (friendEmail.trim() === user.email) {
      setError('Anda tidak boleh cabar diri sendiri!');
      return;
    }
    setError('');
    setCreating(true);
    try {
      const challengeId = Math.random().toString(36).substring(2, 9).toUpperCase();
      await base44.entities.FriendChallenge.create({
        challengeId,
        createdBy: user.email,
        opponent: friendEmail.trim().toLowerCase(),
        gameCategory: selectedCategory,
        status: 'pending',
        creatorScore: 0,
        opponentScore: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setFriendEmail('');
      setSelectedCategory('');
      setShowForm(false);
      await loadChallenges();
    } catch (error) {
      console.error('Failed to create challenge:', error);
      setError('Gagal mencipta cabaran. Cuba lagi.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">⚡</div>
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
          className="mb-5 p-5 rounded-3xl flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">⚡</div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">Cabar Kawan</h1>
              <p className="text-white/70 text-xs font-semibold mt-0.5">{challenges.length} cabaran aktif</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="w-12 h-12 rounded-2xl bg-white/25 hover:bg-white/35 flex items-center justify-center transition-all"
          >
            {showForm ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
          </motion.button>
        </motion.div>

        {/* Create Challenge Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mb-5 rounded-3xl p-5 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-4">🎯 Cabaran Baru</p>

              {/* Friend Email */}
              <div className="mb-3">
                <p className="text-white/70 text-xs font-bold mb-1.5">Email Kawan</p>
                <input
                  type="email"
                  value={friendEmail}
                  onChange={e => setFriendEmail(e.target.value)}
                  placeholder="email@kawan.com"
                  className="w-full rounded-2xl px-4 py-3 text-sm font-semibold bg-white/20 text-white placeholder-white/40 border border-white/30 focus:outline-none focus:border-white/60"
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <p className="text-white/70 text-xs font-bold mb-2">Pilih Subjek</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(categoryLabels).map(([cat, { label, emoji }]) => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-2xl py-3 px-3 font-bold text-sm flex items-center gap-2 transition-all ${
                        selectedCategory === cat
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="text-xs">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-300 text-xs font-bold mb-3">⚠️ {error}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={createChallenge}
                disabled={creating}
                className="w-full bg-white text-purple-600 rounded-2xl font-black py-3.5 flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-all disabled:opacity-60"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Hantar Cabaran</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Challenges List */}
        <div>
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">🏆 Senarai Cabaran</p>

          {challenges.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <p className="text-5xl mb-4">⚡</p>
              <p className="text-white font-black text-lg mb-2">Belum ada cabaran</p>
              <p className="text-white/70 text-sm">Tekan + untuk cabar kawan anda bermain!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge, idx) => {
                const isCreator = challenge.createdBy === user.email;
                const status = statusConfig[challenge.status] || statusConfig.pending;
                const cat = categoryLabels[challenge.gameCategory];

                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                          {cat?.emoji || '🎮'}
                        </div>
                        <div>
                          <p className="font-black text-white text-sm">{cat?.label || challenge.gameCategory}</p>
                          <p className="text-white/60 text-xs">
                            {isCreator ? `→ ${challenge.opponent}` : `← ${challenge.createdBy}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                          {status.emoji} {status.label}
                        </span>
                        {isCreator && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteChallenge(challenge.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-300" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Score Row (if completed or active) */}
                    {(challenge.status === 'completed' || challenge.status === 'active') && (
                      <div className="flex items-center gap-3 mt-2 pt-3 border-t border-white/20">
                        <div className="flex-1 text-center">
                          <p className="text-white/60 text-xs mb-0.5">
                            {isCreator ? 'Anda' : challenge.createdBy.split('@')[0]}
                          </p>
                          <p className="text-white font-black text-xl">{challenge.creatorScore ?? 0}</p>
                          <p className="text-white/40 text-xs">pts</p>
                        </div>
                        <div className="text-white/40 font-black text-sm">VS</div>
                        <div className="flex-1 text-center">
                          <p className="text-white/60 text-xs mb-0.5">
                            {isCreator ? challenge.opponent.split('@')[0] : 'Anda'}
                          </p>
                          <p className="text-white font-black text-xl">{challenge.opponentScore ?? 0}</p>
                          <p className="text-white/40 text-xs">pts</p>
                        </div>
                        {challenge.status === 'completed' && challenge.winnerEmail && (
                          <div className="text-center">
                            <Trophy className={`w-5 h-5 mx-auto ${challenge.winnerEmail === user.email ? 'text-yellow-300' : 'text-white/30'}`} />
                            <p className={`text-xs font-bold mt-0.5 ${challenge.winnerEmail === user.email ? 'text-yellow-300' : 'text-white/40'}`}>
                              {challenge.winnerEmail === user.email ? 'Menang!' : 'Kalah'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Due date */}
                    {challenge.dueDate && challenge.status !== 'completed' && (
                      <p className="text-white/40 text-xs mt-2">
                        Tamat: {new Date(challenge.dueDate).toLocaleDateString('ms-MY')}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}