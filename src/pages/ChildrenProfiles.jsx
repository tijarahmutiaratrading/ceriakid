import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, X, Sparkles, Camera, Loader2, Crown, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { getActiveTier, getTierLimit } from '@/lib/tierAccess';
import ChildProfileCard from '@/components/children/ChildProfileCard';
import AddChildCard from '@/components/children/AddChildCard';

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

  // Overall family stats + leader identification
  const { familyStats, leaderName } = useMemo(() => {
    const allGames = Object.values(progressByChild).flat();
    const totalStars = allGames.reduce((sum, g) => sum + (g.bestStars || 0), 0);
    const totalGames = allGames.length;
    const totalPerfect = allGames.filter((g) => g.bestStars === 3).length;

    // Leader = child with highest total stars
    let leader = null;
    let leaderStars = 0;
    children.forEach((c) => {
      const games = progressByChild[c.name] || [];
      const stars = games.reduce((s, g) => s + (g.bestStars || 0), 0);
      if (stars > leaderStars) { leaderStars = stars; leader = c.name; }
    });

    return {
      familyStats: { totalGames, totalStars, totalPerfect },
      leaderName: leaderStars > 0 ? leader : null,
    };
  }, [progressByChild, children]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-8">

        {/* PREMIUM HERO — family stats with leader spotlight */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[2rem] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 30%, #d946ef 65%, #ec4899 100%)',
            boxShadow: '0 30px 80px -20px rgba(139, 92, 246, 0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
          }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/20 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-cyan-300/25 blur-3xl"
            />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />

          {/* Floating sparkle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-4 right-4 text-yellow-200/50"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>

          <div className="relative z-10 p-5 sm:p-6 md:p-7">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  👨‍👩‍👧‍👦
                </motion.div>
                <div className="min-w-0">
                  <p className="text-white/85 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] leading-none">Family Hub</p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mt-1.5 drop-shadow-md">
                    Profil Anak
                  </h1>
                  <p className="text-white/85 text-xs sm:text-sm font-semibold mt-1 drop-shadow flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> {children.length}/{MAX_CHILDREN} anak terdaftar
                  </p>
                </div>
              </div>

              {children.length < MAX_CHILDREN && !showForm && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
                  className="hidden sm:flex items-center gap-2 bg-white text-purple-700 rounded-2xl px-4 py-2.5 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Tambah Anak
                </motion.button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={cardFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadingForChildId && handleCardAvatarUpload(e, uploadingForChildId)}
            />

            {/* Leader spotlight banner — when ada leader */}
            {leaderName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-3 flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-amber-500/20 border border-yellow-300/40 backdrop-blur"
              >
                <Trophy className="w-4 h-4 text-yellow-200 flex-shrink-0" />
                <p className="text-yellow-100 text-xs font-black">
                  🏆 <span className="text-white">{leaderName}</span> sedang memimpin keluarga!
                </p>
              </motion.div>
            )}

            {/* Premium stats grid */}
            {children.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[
                  { label: 'Anak', value: children.length, emoji: '👶', gradient: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/40' },
                  { label: 'Games', value: familyStats.totalGames, emoji: '🎮', gradient: 'from-purple-400 to-fuchsia-500', glow: 'shadow-purple-500/40' },
                  { label: 'Bintang', value: familyStats.totalStars, emoji: '⭐', gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/40' },
                  { label: 'Perfect', value: familyStats.totalPerfect, emoji: '🏆', gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/40' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 200 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="relative rounded-2xl p-3 overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.35)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
                    }}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl mb-2 bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.glow} text-base sm:text-lg`}>
                      {s.emoji}
                    </div>
                    <p className="text-white font-black text-lg sm:text-2xl leading-none drop-shadow">{s.value}</p>
                    <p className="text-white/85 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 truncate">{s.label}</p>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Mobile add button — full width below stats */}
            {children.length < MAX_CHILDREN && !showForm && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
                className="sm:hidden mt-3 w-full flex items-center justify-center gap-2 bg-white text-purple-700 rounded-2xl px-4 py-3 font-black text-sm shadow-xl"
              >
                <Plus className="w-4 h-4" /> Tambah Anak Baru
              </motion.button>
            )}
          </div>
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

        {/* CHILDREN GRID — premium cards via ChildProfileCard */}
        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.8))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl mb-4 inline-block"
            >
              👶
            </motion.div>
            <p className="text-white font-black text-xl sm:text-2xl mb-2 drop-shadow">Belum ada anak terdaftar</p>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">Daftar profil anak pertama untuk mula track pembelajaran dan progress mereka secara individu!</p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-white to-pink-50 text-purple-700 rounded-2xl px-6 py-3 font-black text-sm shadow-2xl"
            >
              <Plus className="w-5 h-5" /> Daftar Anak Pertama
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {children.map((child, idx) => (
              <ChildProfileCard
                key={child.id}
                child={child}
                idx={idx}
                games={progressByChild[child.name] || []}
                avatars={AVATARS}
                isLeader={leaderName === child.name && children.length > 1}
                uploading={uploadingForChildId === child.id}
                onEdit={() => handleEdit(child)}
                onDelete={() => handleDeleteChild(child.id)}
                onUploadAvatar={() => {
                  setUploadingForChildId(child.id);
                  setTimeout(() => cardFileInputRef.current?.click(), 0);
                }}
                onOpenPerformance={() => openChildPerformance(child)}
              />
            ))}

            {/* Add child card — only show when ada slot kosong */}
            {!showForm && children.length < MAX_CHILDREN && (
              <AddChildCard
                canAdd={true}
                currentCount={children.length}
                maxCount={MAX_CHILDREN}
                onAdd={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
              />
            )}
          </div>
        )}

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