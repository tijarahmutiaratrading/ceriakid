import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Plus, X, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/use-toast';

const categoryLabels = {
  bahasa_melayu: { label: 'Bahasa Melayu', emoji: '🇲🇾' },
  english: { label: 'English', emoji: '🇬🇧' },
  mathematics: { label: 'Matematik', emoji: '🔢' },
  science: { label: 'Sains', emoji: '🔬' },
};

const statusConfig = {
  pending: { label: 'Menunggu', emoji: '⏳', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  active: { label: 'Aktif', emoji: '🎮', bg: 'bg-orange-100', text: 'text-orange-700' },
  completed: { label: 'Selesai', emoji: '✅', bg: 'bg-green-100', text: 'text-green-700' },
};

export default function ChallengesPanel({ onCountChange }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) loadChallenges();
  }, [user?.email]);

  const loadChallenges = async () => {
    try {
      const [myChallenges, opponentChallenges] = await Promise.all([
        base44.entities.FriendChallenge.filter({ createdBy: user.email }),
        base44.entities.FriendChallenge.filter({ opponent: user.email }),
      ]);
      const all = [...(myChallenges || []), ...(opponentChallenges || [])];
      all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setChallenges(all);
      onCountChange?.(all.length);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const deleteChallenge = async (id) => {
    try {
      await base44.entities.FriendChallenge.delete(id);
      setChallenges(prev => {
        const next = prev.filter(c => c.id !== id);
        onCountChange?.(next.length);
        return next;
      });
      toast({ title: '🗑️ Cabaran dipadam' });
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      toast({ title: 'Gagal padam', description: 'Sila cuba lagi.', variant: 'destructive' });
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
      toast({ title: '🎯 Cabaran dihantar!', description: `Kawan anda akan dimaklumkan.` });
    } catch (error) {
      console.error('Failed to create challenge:', error);
      setError('Gagal mencipta cabaran. Cuba lagi.');
      toast({ title: 'Gagal hantar cabaran', description: 'Sila cuba lagi.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* Action Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 p-5 md:p-6 rounded-2xl flex items-center justify-between bg-white ring-1 ring-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl brand-gradient-br flex items-center justify-center shadow-sm flex-shrink-0">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} fill="white" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900 leading-tight">Cabar Kawan</p>
            <p className="text-slate-500 text-xs font-medium mt-0.5">{challenges.length} cabaran</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl brand-gradient-br flex items-center justify-center transition-all shadow-sm"
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
            className="mb-5 rounded-2xl p-5 md:p-6 overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm"
          >
            <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-4">🎯 Cabaran Baru</p>

            <div className="mb-3">
              <p className="text-slate-700 text-xs font-bold mb-1.5">Email Kawan</p>
              <input
                type="email"
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                placeholder="email@kawan.com"
                className="w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold bg-white text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            <div className="mb-4">
              <p className="text-slate-700 text-xs font-bold mb-2">Pilih Subjek</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categoryLabels).map(([cat, { label, emoji }]) => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl py-3 px-3 font-bold text-sm flex items-center gap-2 transition-all ${
                      selectedCategory === cat
                        ? 'brand-gradient text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="text-xs">{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 text-xs font-bold mb-3">⚠️ {error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={createChallenge}
              disabled={creating}
              className="w-full brand-gradient text-white rounded-2xl font-black py-3.5 flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
            >
              {creating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> Hantar Cabaran</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenges List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 md:p-6 bg-white ring-1 ring-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl brand-gradient-br flex items-center justify-center shadow-sm flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-slate-900 text-base leading-tight">Senarai Cabaran</p>
            <p className="text-xs text-slate-500 font-medium">{challenges.length} cabaran semua</p>
          </div>
        </div>

        {challenges.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Belum ada cabaran"
            description="Cabar kawan anda untuk pertandingan subjek yang seronok! Pemenang akan dapat trofi."
            gradient="from-orange-100 to-pink-100"
            iconColor="text-orange-500"
            action={{ label: 'Cabar Kawan Sekarang', emoji: '⚡', onClick: () => setShowForm(true) }}
          />
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
                  className="rounded-xl p-4 bg-slate-50 ring-1 ring-slate-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl shadow-sm">
                        {cat?.emoji || '🎮'}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{cat?.label || challenge.gameCategory}</p>
                        <p className="text-slate-500 text-xs">
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
                          className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100 hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {(challenge.status === 'completed' || challenge.status === 'active') && (
                    <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-200">
                      <div className="flex-1 text-center">
                        <p className="text-slate-500 text-xs mb-0.5">
                          {isCreator ? 'Anda' : challenge.createdBy.split('@')[0]}
                        </p>
                        <p className="text-slate-800 font-black text-xl">{challenge.creatorScore ?? 0}</p>
                        <p className="text-slate-400 text-xs">pts</p>
                      </div>
                      <div className="text-slate-400 font-black text-sm">VS</div>
                      <div className="flex-1 text-center">
                        <p className="text-slate-500 text-xs mb-0.5">
                          {isCreator ? challenge.opponent.split('@')[0] : 'Anda'}
                        </p>
                        <p className="text-slate-800 font-black text-xl">{challenge.opponentScore ?? 0}</p>
                        <p className="text-slate-400 text-xs">pts</p>
                      </div>
                      {challenge.status === 'completed' && challenge.winnerEmail && (
                        <div className="text-center">
                          <Trophy className={`w-5 h-5 mx-auto ${challenge.winnerEmail === user.email ? 'text-yellow-500' : 'text-slate-300'}`} />
                          <p className={`text-xs font-bold mt-0.5 ${challenge.winnerEmail === user.email ? 'text-yellow-600' : 'text-slate-400'}`}>
                            {challenge.winnerEmail === user.email ? 'Menang!' : 'Kalah'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {challenge.dueDate && challenge.status !== 'completed' && (
                    <p className="text-slate-500 text-xs mt-2">
                      Tamat: {new Date(challenge.dueDate).toLocaleDateString('ms-MY')}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}