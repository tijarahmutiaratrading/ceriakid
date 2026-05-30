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
import FamilyHeroCard from '@/components/children/FamilyHeroCard';
import DeleteChildDialog from '@/components/children/DeleteChildDialog';
import AvatarPresetPicker from '@/components/children/AvatarPresetPicker';
import FloatingActionButton from '@/components/ui/FloatingActionButton';

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
  const [deleteTargetId, setDeleteTargetId] = useState(null);
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
    if (!formData.name.trim()) { setError('Sila masukkan nama anak'); return; }

    // Re-fetch latest subscription untuk enforce limit atomically — elak race condition
    // di mana user double-tap atau ada profile yang ditambah dari device lain.
    const subs = await base44.entities.UserSubscription.filter({ email: user.email });
    const sub = subs?.[0];
    const existingChildren = Array.isArray(sub?.children) ? sub.children : [];
    const currentTier = getActiveTier(sub);
    const currentLimit = getTierLimit(currentTier, 'children');

    if (existingChildren.length >= currentLimit) {
      setChildren(existingChildren); // sync UI dengan DB sebenar
      setError(`Maksimum ${currentLimit} anak untuk pelan anda`);
      return;
    }

    const newChild = { id: Date.now(), name: formData.name.trim(), ageGroup: formData.ageGroup, avatarUrl: formData.avatarUrl || '', createdAt: new Date().toISOString() };
    const updated = [...existingChildren, newChild];
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

  const handleDeleteChild = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteChild = async () => {
    if (!deleteTargetId) return;
    const updated = children.filter(c => c.id !== deleteTargetId);
    setChildren(updated);
    setDeleteTargetId(null);
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
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
      style={{ background: '#fafafa' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <AppHeader />

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-32 pt-4">

        {/* PREMIUM HERO — extracted to FamilyHeroCard component */}
        <FamilyHeroCard
          children={children}
          maxCount={MAX_CHILDREN}
          familyStats={familyStats}
          leaderName={leaderName}
          showForm={showForm}
          onAddClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
        />

        {/* Hidden file input for card avatar uploads */}
        <input
          type="file"
          ref={cardFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadingForChildId && handleCardAvatarUpload(e, uploadingForChildId)}
        />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="alert"
              className="mb-4 rounded-xl p-3 text-red-700 text-sm font-semibold bg-red-50 ring-1 ring-red-200"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form — clean Linear/Stripe style */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mb-5 rounded-2xl p-5 bg-white ring-1 ring-slate-200 shadow-sm"
            >
              <p className="text-slate-900 font-black text-base mb-4">{editingId ? 'Ubah Profil Anak' : 'Tambah Anak Baru'}</p>

              {/* Avatar uploader */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span aria-hidden="true">👶</span>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => formFileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-900 hover:bg-slate-800 shadow-md disabled:opacity-60 transition-colors"
                    aria-label="Muat naik gambar avatar"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" strokeWidth={2.5} />}
                  </motion.button>
                </div>
                <input
                  type="file"
                  ref={formFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-label">
                  {formData.avatarUrl ? 'Tekan kamera untuk tukar' : 'Tekan kamera untuk muat naik'}
                </p>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                    className="text-red-600 text-[10px] font-bold mt-1 hover:text-red-700"
                  >
                    Buang gambar
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="child-name" className="block text-[10px] font-bold uppercase tracking-label text-slate-500 mb-1.5">Nama Anak</label>
                <input
                  id="child-name"
                  type="text"
                  placeholder="Contoh: Aisyah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 30) })}
                  maxLength={30}
                  className="w-full px-3.5 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 font-semibold text-sm bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-shadow"
                />
                <p className="text-right text-[10px] font-semibold text-slate-400 mt-1">
                  {formData.name.length}/30
                </p>
              </div>

              {/* Avatar preset picker — quick option tanpa upload */}
              <AvatarPresetPicker
                avatars={AVATARS}
                selectedUrl={formData.avatarUrl}
                onSelect={(url) => setFormData({ ...formData, avatarUrl: url })}
              />
              <div className="mt-4" />

              <p className="text-[10px] font-bold uppercase tracking-label text-slate-500 mb-2">Peringkat Umur</p>
              <div className="grid grid-cols-2 gap-2.5 mb-5" role="radiogroup" aria-label="Peringkat umur">
                {AGE_OPTIONS.map(opt => {
                  const active = formData.ageGroup === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFormData({ ...formData, ageGroup: opt.value })}
                      role="radio"
                      aria-checked={active}
                      className={`py-3 px-2 rounded-xl text-sm flex flex-col items-center gap-0.5 transition-all ${
                        active
                          ? 'bg-slate-900 text-white ring-1 ring-slate-900'
                          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                      <span className="font-black">{opt.label}</span>
                      <span className={`text-[11px] font-semibold ${active ? 'text-white/70' : 'text-slate-500'}`}>{opt.sub}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={editingId ? handleUpdateChild : handleAddChild}
                  className="flex-1 rounded-xl py-2.5 font-black flex items-center justify-center gap-2 text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <Save className="w-4 h-4" strokeWidth={2.5} />
                  {editingId ? 'Simpan' : 'Tambah Anak'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  aria-label="Batal"
                  className="px-4 rounded-xl py-2.5 font-bold flex items-center justify-center text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHILDREN GRID — premium cards via ChildProfileCard */}
        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-10 sm:p-14 text-center bg-white ring-1 ring-slate-200 shadow-sm"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex w-20 h-20 mb-4 rounded-2xl bg-slate-900 items-center justify-center"
            >
              <Users className="w-10 h-10 text-white" strokeWidth={2} />
            </motion.div>
            <p className="text-slate-900 font-black text-xl sm:text-2xl mb-2">Belum ada anak terdaftar</p>
            <p className="text-slate-500 text-sm font-semibold mb-6 max-w-md mx-auto">Daftar profil anak pertama untuk mula track pembelajaran dan progress mereka secara individu.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
              className="inline-flex items-center gap-2 text-white rounded-xl px-5 py-2.5 font-black text-sm bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Daftar Anak Pertama
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

      </div>

      {/* Custom delete confirmation — reliable di mobile/PWA */}
      <DeleteChildDialog
        open={!!deleteTargetId}
        child={children.find(c => c.id === deleteTargetId)}
        onConfirm={confirmDeleteChild}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Mobile FAB — quick add, hanya tunjuk bila ada slot kosong & form belum buka */}
      <FloatingActionButton
        show={!showForm && children.length > 0 && children.length < MAX_CHILDREN}
        label="Tambah Anak"
        onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
      />
    </div>
  );
}