import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, TrendingUp, Star, Gamepad2, ChevronRight, Sparkles, Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { getActiveTier, getTierLimit } from '@/lib/tierAccess';

const AGE_OPTIONS = [
  { value: 'prasekolah', label: 'Prasekolah', sub: '4–6 tahun', emoji: '🎨' },
  { value: 'sekolah_rendah', label: 'Sekolah Rendah', sub: '7–12 tahun', emoji: '📚' },
];

const AVATARS = [
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3df7477bd_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a716e8427_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cc2c8d491_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/8a9bbc813_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1255ecf00_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/208266350_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fcff737ee_generated_image.png',
  'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/980a2e0ce_generated_image.png',
];

export default function ChildrenProfiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshChildren, setSelectedChild } = useSelectedChild() || {};
  const [children, setChildren] = useState([]);
  const [progressByChild, setProgressByChild] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', ageGroup: 'prasekolah', avatarUrl: '' });
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingForChildId, setUploadingForChildId] = useState(null);
  const formFileInputRef = useRef(null);
  const cardFileInputRef = useRef(null);

  const MAX_CHILDREN = getTierLimit(userTier, 'children');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [subs, progressData] = await Promise.all([
        base44.entities.UserSubscription.filter({ email: user.email }),
        base44.entities.ChildGameProgress.filter({ userEmail: user.email }).catch(() => []),
      ]);
      setChildren(subs[0]?.children || []);
      setUserTier(getActiveTier(subs?.[0]));

      // Group progress by childName
      const grouped = {};
      (progressData || []).forEach(p => {
        if (!grouped[p.childName]) grouped[p.childName] = [];
        grouped[p.childName].push(p);
      });
      setProgressByChild(grouped);
    } catch (err) {
      setChildren([]);
      setProgressByChild({});
    } finally {
      setLoading(false);
    }
  };

  const saveChildren = async (updatedChildren) => {
    const subscriptions = await base44.entities.UserSubscription.filter({ email: user.email });
    if (subscriptions[0]) {
      await base44.entities.UserSubscription.update(subscriptions[0].id, { children: updatedChildren });
    } else {
      await base44.entities.UserSubscription.create({ email: user.email, tier: 'free', status: 'active', children: updatedChildren });
    }
    // Refresh global context supaya semua page (Prestasi, Dashboard) sync
    if (refreshChildren) await refreshChildren();
  };

  const handleAddChild = async () => {
    if (children.length >= MAX_CHILDREN) { setError(`Maksimum ${MAX_CHILDREN} anak`); return; }
    if (!formData.name.trim()) { setError('Sila masukkan nama anak'); return; }
    const newChild = { id: Date.now(), name: formData.name.trim(), ageGroup: formData.ageGroup, avatarUrl: formData.avatarUrl || '', createdAt: new Date().toISOString() };
    const updated = [...children, newChild];
    setChildren(updated);
    await saveChildren(updated);
    setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' });
    setShowForm(false);
    setError('');
  };

  const handleUpdateChild = async () => {
    if (!formData.name.trim()) { setError('Sila masukkan nama anak'); return; }
    const updated = children.map(c => c.id === editingId ? { ...c, name: formData.name.trim(), ageGroup: formData.ageGroup, avatarUrl: formData.avatarUrl || '' } : c);
    setChildren(updated);
    await saveChildren(updated);
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' });
    setError('');
  };

  // Upload avatar untuk form (anak baru / sedang edit)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Saiz gambar terlalu besar (maks 5MB)'); return; }
    setUploadingAvatar(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatarUrl: file_url }));
    } catch (err) {
      setError('Gagal muat naik gambar. Cuba lagi.');
    } finally {
      setUploadingAvatar(false);
      if (formFileInputRef.current) formFileInputRef.current.value = '';
    }
  };

  // Upload avatar terus dari card (tukar gambar tanpa buka form)
  const handleCardAvatarUpload = async (e, childId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Saiz gambar terlalu besar (maks 5MB)'); return; }
    setUploadingForChildId(childId);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = children.map(c => c.id === childId ? { ...c, avatarUrl: file_url } : c);
      setChildren(updated);
      await saveChildren(updated);
    } catch (err) {
      setError('Gagal muat naik gambar. Cuba lagi.');
    } finally {
      setUploadingForChildId(null);
      if (cardFileInputRef.current) cardFileInputRef.current.value = '';
    }
  };

  const handleDeleteChild = async (id) => {
    const child = children.find(c => c.id === id);
    const ok = window.confirm(`Padam profil "${child?.name || 'anak'}"? Progress pembelajaran anak ini akan kekal dalam sistem tetapi profil tidak akan kelihatan lagi.`);
    if (!ok) return;
    const updated = children.filter(c => c.id !== id);
    setChildren(updated);
    await saveChildren(updated);
  };

  const handleEdit = (child) => {
    setEditingId(child.id);
    setFormData({ name: child.name, ageGroup: child.ageGroup, avatarUrl: child.avatarUrl || '' });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' });
    setError('');
  };

  const openChildPerformance = (child) => {
    if (setSelectedChild) setSelectedChild(child);
    navigate('/parent-dashboard');
  };

  // Compute stats per child
  const computeChildStats = (childName) => {
    const games = progressByChild[childName] || [];
    const totalGames = games.length;
    const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
    const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
    return { totalGames, totalStars, avgStars };
  };

  // Overall family stats
  const familyStats = useMemo(() => {
    const allGames = Object.values(progressByChild).flat();
    const totalStars = allGames.reduce((sum, g) => sum + (g.bestStars || 0), 0);
    return { totalGames: allGames.length, totalStars };
  }, [progressByChild]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-8">

        {/* Hero Header — premium gradient with family stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-6 rounded-3xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(88,28,135,0.85), rgba(190,24,93,0.75))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {/* Decorative sparkle */}
          <div className="absolute top-3 right-3 text-yellow-300/40">
            <Sparkles className="w-12 h-12" />
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl shadow-inner ring-1 ring-white/20 flex-shrink-0">👨‍👩‍👧‍👦</div>
              <div className="min-w-0">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.18em] leading-none">Family Hub</p>
                <h1 className="text-2xl font-black text-white drop-shadow mt-1 truncate">Profil Anak</h1>
                <p className="text-white/80 text-xs font-semibold mt-0.5">{children.length}/{MAX_CHILDREN} anak terdaftar</p>
              </div>
            </div>

            {children.length < MAX_CHILDREN && !showForm ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah' }); }}
                className="flex items-center gap-2 bg-white text-purple-600 rounded-2xl px-4 py-2.5 font-black text-sm shadow-lg flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah
              </motion.button>
            ) : children.length >= MAX_CHILDREN && !['keluarga', 'pro'].includes(userTier) ? (
              <Link to="/" className="flex-shrink-0">
                <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-yellow-400 text-yellow-900 rounded-2xl px-3 py-2 font-black text-xs shadow-lg">
                  👑 Naik Taraf
                </motion.button>
              </Link>
            ) : null}
          </div>

          {/* Hidden file input untuk card upload (re-used antara semua card) */}
          <input
            type="file"
            ref={cardFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadingForChildId && handleCardAvatarUpload(e, uploadingForChildId)}
          />

          {/* Mini family stats — only when ada anak */}
          {children.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Anak', value: children.length, emoji: '👶' },
                { label: 'Permainan', value: familyStats.totalGames, emoji: '🎮' },
                { label: 'Bintang', value: familyStats.totalStars, emoji: '⭐' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-2.5 text-center backdrop-blur" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <p className="text-lg leading-none">{s.emoji}</p>
                  <p className="text-white font-black text-lg leading-tight mt-1">{s.value}</p>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
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
              style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <p className="text-white font-black text-sm mb-4 drop-shadow">{editingId ? '✏️ Ubah Profil Anak' : '➕ Tambah Anak Baru'}</p>

              {/* Avatar uploader */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center text-5xl shadow-inner ring-2 ring-white/30 overflow-hidden">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>👶</span>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => formFileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-lg ring-2 ring-purple-300 disabled:opacity-60"
                    title="Muat naik gambar"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </motion.button>
                </div>
                <input
                  type="file"
                  ref={formFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <p className="text-white/70 text-[10px] font-bold mt-2 uppercase tracking-wider">
                  {formData.avatarUrl ? 'Tekan kamera untuk tukar' : 'Tekan kamera untuk muat naik'}
                </p>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                    className="text-red-300 text-[10px] font-bold mt-1 hover:text-red-200"
                  >
                    Buang gambar
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Nama anak..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/25 text-white placeholder-white/50 font-semibold focus:outline-none focus:bg-white/15 focus:border-white/60 mb-3 text-sm"
              />

              <p className="text-white/85 text-xs font-bold mb-2">Peringkat Umur</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {AGE_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, ageGroup: opt.value })}
                    className={`py-3 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all ${
                      formData.ageGroup === opt.value
                        ? 'bg-white text-purple-700 shadow-lg'
                        : 'bg-white/10 text-white border border-white/25'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                    <span className={`text-xs ${formData.ageGroup === opt.value ? 'text-purple-500' : 'text-white/70'}`}>{opt.sub}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={editingId ? handleUpdateChild : handleAddChild}
                  className="flex-1 bg-white text-purple-700 rounded-2xl py-3 font-black flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Simpan' : 'Tambah Anak'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 bg-white/10 text-white rounded-2xl py-3 font-black flex items-center justify-center border border-white/25"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children List — premium cards with progress preview */}
        <div className="grid sm:grid-cols-2 gap-3">
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sm:col-span-2 rounded-3xl p-10 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <div className="text-6xl mb-3">👶</div>
              <p className="text-white font-black text-lg mb-1 drop-shadow">Belum ada anak terdaftar</p>
              <p className="text-white/80 text-sm">Tekan "Tambah" untuk daftar profil anak pertama!</p>
            </motion.div>
          ) : (
            children.map((child, idx) => {
              const stats = computeChildStats(child.name);
              const hasPlayed = stats.totalGames > 0;
              return (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-3xl p-4 flex flex-col gap-3 relative overflow-hidden group"
                  style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.82), rgba(88,28,135,0.74))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
                >
                  {/* Top row: avatar + info + actions */}
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl shadow-inner ring-1 ring-white/20 overflow-hidden">
                        <img
                          src={child.avatarUrl || AVATARS[idx % AVATARS.length]}
                          alt={child.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setUploadingForChildId(child.id);
                          setTimeout(() => cardFileInputRef.current?.click(), 0);
                        }}
                        disabled={uploadingForChildId === child.id}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-md ring-2 ring-purple-300 disabled:opacity-60"
                        title="Tukar gambar"
                      >
                        {uploadingForChildId === child.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                      </motion.button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-base leading-tight truncate">{child.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm">{child.ageGroup === 'prasekolah' ? '🎨' : '📚'}</span>
                        <span className="text-white/80 text-xs font-semibold truncate">
                          {child.ageGroup === 'prasekolah' ? 'Prasekolah · 4–6 thn' : 'Sekolah Rendah · 7–12 thn'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(child)}
                        className="w-9 h-9 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/25"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteChild(child.id)}
                        className="w-9 h-9 bg-red-500/30 text-white rounded-xl flex items-center justify-center hover:bg-red-500/50 transition-all border border-red-300/30"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Stats preview — synced dari ChildGameProgress */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                    <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <Gamepad2 className="w-3.5 h-3.5 text-cyan-300 mx-auto mb-0.5" />
                      <p className="text-white font-black text-sm leading-none">{stats.totalGames}</p>
                      <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mt-0.5">Main</p>
                    </div>
                    <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <Star className="w-3.5 h-3.5 text-yellow-300 mx-auto mb-0.5 fill-yellow-300" />
                      <p className="text-white font-black text-sm leading-none">{stats.totalStars}</p>
                      <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mt-0.5">Bintang</p>
                    </div>
                    <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-300 mx-auto mb-0.5" />
                      <p className="text-white font-black text-sm leading-none">{stats.avgStars}</p>
                      <p className="text-white/70 text-[9px] font-bold uppercase tracking-wider mt-0.5">Purata</p>
                    </div>
                  </div>

                  {/* CTA — Lihat Prestasi */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openChildPerformance(child)}
                    className={`w-full rounded-2xl py-2.5 font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                      hasPlayed
                        ? 'bg-white text-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
                    }`}
                  >
                    {hasPlayed ? (
                      <>Lihat Prestasi <ChevronRight className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Belum main game · Mula main <ChevronRight className="w-3.5 h-3.5" /></>
                    )}
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Capacity bar */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.78), rgba(88,28,135,0.7))', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <div className="flex justify-between text-white/90 text-xs font-bold mb-2">
              <span>Kapasiti Profil</span>
              <span>{children.length}/{MAX_CHILDREN}</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
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