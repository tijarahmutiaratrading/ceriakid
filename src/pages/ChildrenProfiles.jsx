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
    >
      {/* Floating decorations — CeriaKid vibe (same as Challenges) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-8 text-4xl opacity-40 animate-pulse">🌈</div>
        <div className="absolute top-40 left-6 text-3xl opacity-30">☁️</div>
        <div className="absolute top-1/3 right-1/4 text-2xl opacity-25">⭐</div>
        <div className="absolute bottom-1/3 left-8 text-3xl opacity-30">💖</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-35">✨</div>
      </div>
      <AppHeader theme="light" />

      <div className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 pt-4">

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
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="alert"
              className="mb-4 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold bg-red-50 border border-red-200 flex items-center gap-2"
            >
              <span className="text-red-500">⚠️</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form — clean SaaS style */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-5 rounded-3xl bg-white shadow-xl border border-white/60 overflow-hidden"
            >
              {/* Form header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-slate-900 font-black text-sm">{editingId ? 'Ubah Profil Anak' : 'Tambah Anak Baru'}</p>
                </div>
                <button onClick={handleCancel} className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Avatar uploader */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-slate-200 flex items-center justify-center text-4xl">
                      {formData.avatarUrl
                        ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                        : <span>👶</span>
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => formFileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-700 flex items-center justify-center text-white disabled:opacity-60 transition-colors"
                      aria-label="Muat naik gambar avatar"
                    >
                      {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 mb-1">Gambar Profil</p>
                    <p className="text-xs text-slate-500 mb-2">Pilih avatar atau muat naik gambar sendiri</p>
                    {formData.avatarUrl && (
                      <button type="button" onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Buang gambar
                      </button>
                    )}
                  </div>
                </div>

                <input type="file" ref={formFileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />

                {/* Avatar preset picker */}
                <AvatarPresetPicker
                  avatars={AVATARS}
                  selectedUrl={formData.avatarUrl}
                  onSelect={(url) => setFormData({ ...formData, avatarUrl: url })}
                />

                {/* Name input */}
                <div>
                  <label htmlFor="child-name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Nama Anak</label>
                  <input
                    id="child-name"
                    type="text"
                    placeholder="Contoh: Aisyah"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 30) })}
                    maxLength={30}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 font-medium text-sm bg-white border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                  />
                  <p className="text-right text-[10px] font-semibold text-slate-400 mt-1">{formData.name.length}/30</p>
                </div>

                {/* Age group */}
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Peringkat Umur</p>
                  <div className="grid grid-cols-2 gap-2.5" role="radiogroup">
                    {AGE_OPTIONS.map(opt => {
                      const active = formData.ageGroup === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, ageGroup: opt.value })}
                          role="radio"
                          aria-checked={active}
                          className={`py-3 px-3 rounded-xl text-sm flex flex-col items-center gap-1 transition-all border-2 ${
                            active
                              ? 'border-purple-500 bg-purple-50 text-purple-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-2xl">{opt.emoji}</span>
                          <span className="font-black text-sm">{opt.label}</span>
                          <span className={`text-[11px] font-semibold ${active ? 'text-purple-600' : 'text-slate-400'}`}>{opt.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={editingId ? handleUpdateChild : handleAddChild}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Simpan Perubahan' : 'Tambah Anak'}
                  </button>
                  <button onClick={handleCancel} className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHILDREN GRID — premium cards via ChildProfileCard */}
        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-12 sm:p-16 text-center bg-white shadow-xl border border-white/60"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-900 font-black text-xl mb-2">Belum ada profil anak</p>
            <p className="text-slate-500 text-sm font-medium mb-6 max-w-sm mx-auto">Daftar profil anak pertama untuk mula track pembelajaran dan progress mereka.</p>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
              className="inline-flex items-center gap-2 text-white rounded-xl px-6 py-2.5 font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Daftar Anak Pertama
            </button>
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