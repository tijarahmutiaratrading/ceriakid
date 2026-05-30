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
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative -mt-16 sm:-mt-20 pt-16 sm:pt-20"
      style={{
        background: 'linear-gradient(180deg, #fef9f3 0%, #fef3c7 30%, #fbcfe8 70%, #c7d2fe 100%)',
      }}
    >
      {/* Floating pastel clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-50" style={{ background: '#fef3c7' }} />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ background: '#fbcfe8' }} />
        <div className="absolute bottom-40 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: '#c7d2fe' }} />
      </div>
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
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 rounded-2xl p-3 text-red-700 text-sm font-bold"
              style={{ background: '#fee2e2', boxShadow: '0 3px 0 #fca5a5' }}>
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
              className="mb-5 rounded-[2rem] p-5"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
                boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
              }}
            >
              <p className="text-slate-800 font-black text-base mb-4">{editingId ? '✏️ Ubah Profil Anak' : '➕ Tambah Anak Baru'}</p>

              {/* Avatar uploader */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 100%)', boxShadow: '0 4px 0 #f9a8d4' }}
                  >
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
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 3px 0 #db2777' }}
                    title="Muat naik gambar"
                  >
                    {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" strokeWidth={3} />}
                  </motion.button>
                </div>
                <input
                  type="file"
                  ref={formFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-wider">
                  {formData.avatarUrl ? 'Tekan kamera untuk tukar' : 'Tekan kamera untuk muat naik'}
                </p>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                    className="text-rose-500 text-[10px] font-black mt-1 hover:text-rose-600"
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
                className="w-full px-4 py-3 rounded-2xl text-slate-800 placeholder-slate-400 font-semibold focus:outline-none mb-3 text-sm"
                style={{ background: '#fef9f3', boxShadow: '0 2px 0 #fde68a inset, 0 0 0 2px #fde68a' }}
              />

              <p className="text-slate-700 text-xs font-black mb-2 uppercase tracking-wider">Peringkat Umur</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {AGE_OPTIONS.map(opt => {
                  const active = formData.ageGroup === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95, y: 2 }}
                      onClick={() => setFormData({ ...formData, ageGroup: opt.value })}
                      className="py-3 rounded-2xl font-bold text-sm flex flex-col items-center gap-1 transition-all"
                      style={active
                        ? { background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777', color: 'white' }
                        : { background: '#fef9f3', boxShadow: '0 3px 0 #fde68a', color: '#475569' }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-black">{opt.label}</span>
                      <span className={`text-xs font-bold ${active ? 'text-white/85' : 'text-slate-500'}`}>{opt.sub}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95, y: 2 }}
                  onClick={editingId ? handleUpdateChild : handleAddChild}
                  className="flex-1 rounded-full py-3 font-black flex items-center justify-center gap-2 text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }}
                >
                  <Save className="w-4 h-4" strokeWidth={3} />
                  {editingId ? 'Simpan' : 'Tambah Anak'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95, y: 2 }}
                  onClick={handleCancel}
                  className="px-4 rounded-full py-3 font-black flex items-center justify-center text-slate-600"
                  style={{ background: '#fef9f3', boxShadow: '0 3px 0 #fde68a' }}
                >
                  <X className="w-4 h-4" strokeWidth={3} />
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
            className="rounded-[2rem] p-10 sm:p-14 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
              boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex w-24 h-24 mb-4 rounded-3xl bg-gradient-to-br from-pink-300 to-rose-400 items-center justify-center shadow-lg"
            >
              <Users className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
            <p className="text-slate-800 font-black text-xl sm:text-2xl mb-2">Belum ada anak terdaftar</p>
            <p className="text-slate-500 text-sm font-bold mb-6 max-w-md mx-auto">Daftar profil anak pertama untuk mula track pembelajaran dan progress mereka secara individu!</p>
            <motion.button
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', ageGroup: 'prasekolah', avatarUrl: '' }); }}
              className="inline-flex items-center gap-2 text-white rounded-full px-6 py-3 font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }}
            >
              <Plus className="w-5 h-5" strokeWidth={3} /> Daftar Anak Pertama
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
    </div>
  );
}