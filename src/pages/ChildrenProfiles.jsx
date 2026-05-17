import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { getActiveTier, getTierLimit } from '@/lib/tierAccess';

const AGE_OPTIONS = [
  { value: 'prasekolah', label: 'Prasekolah', sub: '4–6 tahun', emoji: '🎨' },
  { value: 'sekolah_rendah', label: 'Sekolah Rendah', sub: '7–12 tahun', emoji: '📚' },
];

const AVATARS = ['🐱', '🐶', '🐸', '🦊', '🐼', '🐨', '🦁', '🐯'];

export default function ChildrenProfiles() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', ageGroup: 'prasekolah' });
  const [error, setError] = useState('');

  const MAX_CHILDREN = getTierLimit(userTier, 'children');

  useEffect(() => {
    if (user) {
      loadChildren();
      base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
        setUserTier(getActiveTier(subs?.[0]));
      });
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      const subscriptions = await base44.entities.UserSubscription.filter({ email: user.email });
      setChildren(subscriptions[0]?.children || []);
    } catch (err) {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const saveChildren = async (updatedChildren) => {
    const subscriptions = await base44.entities.UserSubscription.filter({ email: user.email });
    if (subscriptions[0]) {
      await base44.entities.UserSubscription.update(subscriptions[0].id, { children: updatedChildren });
    } else {
      // Create subscription record if doesn't exist
      await base44.entities.UserSubscription.create({ email: user.email, tier: 'free', status: 'active', children: updatedChildren });
    }
  };

  const handleAddChild = async () => {
    if (children.length >= MAX_CHILDREN) { setError(`Maksimum ${MAX_CHILDREN} anak`); return; }
    if (!formData.name.trim()) { setError('Sila masukkan nama anak'); return; }
    const newChild = { id: Date.now(), name: formData.name, ageGroup: formData.ageGroup, createdAt: new Date().toISOString() };
    const updated = [...children, newChild];
    setChildren(updated);
    await saveChildren(updated);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setShowForm(false);
    setError('');
  };

  const handleUpdateChild = async () => {
    if (!formData.name.trim()) { setError('Sila masukkan nama anak'); return; }
    const updated = children.map(c => c.id === editingId ? { ...c, name: formData.name, ageGroup: formData.ageGroup } : c);
    setChildren(updated);
    await saveChildren(updated);
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setError('');
  };

  const handleDeleteChild = async (id) => {
    const updated = children.filter(c => c.id !== id);
    setChildren(updated);
    await saveChildren(updated);
  };

  const handleEdit = (child) => {
    setEditingId(child.id);
    setFormData({ name: child.name, ageGroup: child.ageGroup });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👶</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 md:pl-[17rem] lg:pl-[18rem] pb-32 pt-20 md:pt-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">👨‍👩‍👧‍👦</div>
            <div>
              <h1 className="text-2xl font-black text-white">Profil Anak</h1>
              <p className="text-white/70 text-xs font-semibold">{children.length}/{MAX_CHILDREN} anak terdaftar</p>
            </div>
          </div>
          {children.length < MAX_CHILDREN && !showForm ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah' }); }}
              className="flex items-center gap-2 bg-white text-purple-600 rounded-2xl px-4 py-2.5 font-black text-sm shadow-lg"
            >
              <Plus className="w-4 h-4" /> Tambah
            </motion.button>
          ) : children.length >= MAX_CHILDREN && !['keluarga', 'pro'].includes(userTier) ? (
            <Link to="/">
              <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-2xl px-3 py-2 font-black text-xs shadow-lg">
                👑 Naik Taraf
              </motion.button>
            </Link>
          ) : null}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 bg-red-500/20 border border-red-300/40 rounded-2xl p-3 text-white text-sm font-semibold backdrop-blur">
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-5 rounded-3xl p-5"
              style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              <p className="text-white font-black text-sm mb-4">{editingId ? '✏️ Ubah Profil Anak' : '➕ Tambah Anak Baru'}</p>

              <input
                type="text"
                placeholder="Nama anak..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/30 border border-white/40 text-white placeholder-white/60 font-semibold focus:outline-none focus:bg-white/40 mb-3 text-sm"
              />

              <p className="text-white/80 text-xs font-bold mb-2">Peringkat Umur</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {AGE_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, ageGroup: opt.value })}
                    className={`py-3 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                      formData.ageGroup === opt.value
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    <span className={`text-xs ${formData.ageGroup === opt.value ? 'text-purple-400' : 'text-white/60'}`}>{opt.sub}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={editingId ? handleUpdateChild : handleAddChild}
                  className="flex-1 bg-white text-purple-600 rounded-2xl py-3 font-black flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Simpan' : 'Tambah Anak'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 bg-white/20 text-white rounded-2xl py-3 font-black flex items-center justify-center border border-white/30"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children List */}
        <div className="space-y-3">
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl p-10 text-center"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <div className="text-6xl mb-3">👶</div>
              <p className="text-white font-black text-lg mb-1">Belum ada anak terdaftar</p>
              <p className="text-white/70 text-sm">Tekan "Tambah" untuk daftar profil anak pertama!</p>
            </motion.div>
          ) : (
            children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-3xl p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                  {AVATARS[idx % AVATARS.length]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base leading-tight">{child.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm">{child.ageGroup === 'prasekolah' ? '🎨' : '📚'}</span>
                    <span className="text-white/70 text-xs font-semibold">
                      {child.ageGroup === 'prasekolah' ? 'Prasekolah · 4–6 thn' : 'Sekolah Rendah · 7–12 thn'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(child)}
                    className="w-9 h-9 bg-white/20 text-white rounded-xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteChild(child.id)}
                    className="w-9 h-9 bg-red-500/30 text-white rounded-xl flex items-center justify-center hover:bg-red-500/50 transition-all border border-red-300/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Capacity bar */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <div className="flex justify-between text-white/80 text-xs font-bold mb-2">
              <span>Kapasiti Profil</span>
              <span>{children.length}/{MAX_CHILDREN}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(children.length / MAX_CHILDREN) * 100}%` }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}