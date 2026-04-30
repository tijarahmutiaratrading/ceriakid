import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AppHeader from '@/components/AppHeader';
import { base44 } from '@/api/base44Client';

export default function ChildrenProfiles() {
  const { user, isAuthenticated } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', ageGroup: 'prasekolah' });
  const [error, setError] = useState('');

  const MAX_CHILDREN = 4;

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      // For now, we'll store children as a local array in UserSubscription data
      // In a real app, you might want a separate Children entity
      const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
        email: user.email
      });
      
      if (subscriptions[0]?.children) {
        setChildren(subscriptions[0].children);
      } else {
        setChildren([]);
      }
    } catch (err) {
      console.error('Error loading children:', err);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const saveChildren = async (updatedChildren) => {
    try {
      const subscriptions = await base44.asServiceRole.entities.UserSubscription.filter({
        email: user.email
      });
      
      if (subscriptions[0]) {
        await base44.asServiceRole.entities.UserSubscription.update(subscriptions[0].id, {
          children: updatedChildren
        });
      }
    } catch (err) {
      console.error('Error saving children:', err);
      setError('Gagal menyimpan profil anak');
    }
  };

  const handleAddChild = async () => {
    if (children.length >= MAX_CHILDREN) {
      setError(`Maksimum ${MAX_CHILDREN} anak yang boleh didaftar`);
      return;
    }

    if (!formData.name.trim()) {
      setError('Sila masukkan nama anak');
      return;
    }

    const newChild = {
      id: Date.now(),
      name: formData.name,
      ageGroup: formData.ageGroup,
      createdAt: new Date().toISOString()
    };

    const updated = [...children, newChild];
    setChildren(updated);
    await saveChildren(updated);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setError('');
  };

  const handleUpdateChild = async () => {
    if (!formData.name.trim()) {
      setError('Sila masukkan nama anak');
      return;
    }

    const updated = children.map(child =>
      child.id === editingId
        ? { ...child, name: formData.name, ageGroup: formData.ageGroup }
        : child
    );

    setChildren(updated);
    await saveChildren(updated);
    setEditingId(null);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setError('');
  };

  const handleDeleteChild = async (id) => {
    const updated = children.filter(child => child.id !== id);
    setChildren(updated);
    await saveChildren(updated);
  };

  const handleEdit = (child) => {
    setEditingId(child.id);
    setFormData({ name: child.name, ageGroup: child.ageGroup });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', ageGroup: 'prasekolah' });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👶</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="max-w-lg mx-auto px-4 py-8 pb-24 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👨‍👩‍👧‍👦</span>
            <h1 className="text-3xl font-black text-gray-800">Profil Anak-anak</h1>
          </div>
          <p className="text-sm text-gray-600 ml-14">{children.length}/{MAX_CHILDREN} anak terdaftar</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 bg-red-100 border border-red-300 rounded-xl p-3 text-red-700 text-sm font-semibold"
          >
            {error}
          </motion.div>
        )}

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 shadow-xl mb-8"
        >
          <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            {editingId ? '✏️ Ubah Anak' : '➕ Tambah Anak Baru'}
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nama anak..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-game-purple focus:outline-none font-semibold text-gray-800 placeholder-gray-400"
            />
            
            <select
              value={formData.ageGroup}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-game-purple focus:outline-none font-semibold text-gray-800"
            >
              <option value="prasekolah">🎨 Prasekolah (3-5 tahun)</option>
              <option value="sekolah_rendah">📚 Sekolah Rendah (6-12 tahun)</option>
            </select>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={editingId ? handleUpdateChild : handleAddChild}
                className="flex-1 bg-gradient-to-r from-game-purple to-purple-600 text-white rounded-2xl py-3 font-black flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Simpan Perubahan' : 'Tambah Anak'}
              </motion.button>
              
              {editingId && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-800 rounded-2xl py-3 font-black flex items-center justify-center gap-2 hover:bg-gray-400 transition-all"
                >
                  <X className="w-4 h-4" />
                  Batal
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Children List */}
        <div className="space-y-4">
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 text-center border-2 border-white/30 shadow-xl"
            >
              <p className="text-lg font-bold text-gray-800 mb-2">Belum ada anak terdaftar</p>
              <p className="text-sm text-gray-600">Tambah anak pertama untuk memulai pembelajaran</p>
            </motion.div>
          ) : (
            children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/40 backdrop-blur-xl rounded-3xl p-5 border-2 border-white/30 shadow-xl flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{child.ageGroup === 'prasekolah' ? '🎨' : '📚'}</span>
                    <div>
                      <p className="font-black text-lg text-gray-800">{child.name}</p>
                      <p className="text-xs text-gray-600 font-semibold">
                        {child.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(child)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteChild(child.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Capacity Info */}
        {children.length > 0 && children.length < MAX_CHILDREN && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-game-blue/10 to-blue-100/50 rounded-2xl p-4 border border-game-blue/20"
          >
            <p className="text-sm text-game-blue font-semibold">
              Boleh tambah {MAX_CHILDREN - children.length} anak lagi ({children.length}/{MAX_CHILDREN})
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}