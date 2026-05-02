import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Users, Edit3, X, Layers, List } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import SubjectSection from '@/components/admin/SubjectSection';
import BulkEditModal from '@/components/admin/BulkEditModal';
import SingleGameEditModal from '@/components/admin/SingleGameEditModal';

const GAME_HUB = [
  { id: 'memory', title: 'Memory Game' },
  { id: 'dragdrop', title: 'Drag & Drop' },
  { id: 'wordbuilder', title: 'Word Builder' },
  { id: 'sorting', title: 'Sorting Game' },
  { id: 'tilematch', title: 'Tile Match' },
  { id: 'story', title: 'Story Adventure' },
  { id: 'physics', title: 'Physics Game' },
  { id: 'tracing', title: 'Tracing Game' },
];

const SUBJECT_CONFIG = [
  { label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
  { label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
  { label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
  { label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
  { label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
  { label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
  { label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
  { label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
];

export default function AdminGameManager() {
  const [gamesBySubject, setGamesBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);
  const [toast, setToast] = useState(null);
  const [bulkModal, setBulkModal] = useState(null); // { label, ageGroup, subject, games }
  const [singleModal, setSingleModal] = useState(null); // { game }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const allGames = await base44.entities.Game.list('-created_date', 500);
      // Group by ageGroup-subject
      const grouped = {};
      for (const g of allGames) {
        const key = `${g.ageGroup}-${g.category}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(g);
      }
      setGamesBySubject(grouped);
    } catch (err) {
      showToast('Gagal load games: ' + err.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  // Bulk save: update totalQuestions/difficulty/tier for all games in a subject
  const handleBulkSave = async ({ ageGroup, subject, totalQuestions, difficulty, tier }) => {
    const key = `${ageGroup}-${subject}`;
    const games = gamesBySubject[key] || [];
    setBulkModal(null);
    showToast('⏳ Updating...', true);
    try {
      await Promise.all(games.map(g =>
        base44.entities.Game.update(g.id, {
          ...(totalQuestions ? { totalQuestions: parseInt(totalQuestions) } : {}),
          ...(difficulty ? { difficulty } : {}),
          ...(tier ? { tier } : {}),
        })
      ));
      showToast(`✅ ${games.length} games dikemas kini!`);
      fetchGames();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    }
  };

  // Single save: update one game
  const handleSingleSave = async (gameId, updates) => {
    setSingleModal(null);
    try {
      await base44.entities.Game.update(gameId, updates);
      showToast('✅ Game dikemas kini!');
      fetchGames();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    }
  };

  const totalGames = Object.values(gamesBySubject).reduce((a, arr) => a + arr.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {bulkModal && (
          <BulkEditModal
            data={bulkModal}
            onSave={handleBulkSave}
            onClose={() => setBulkModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Single Game Edit Modal */}
      <AnimatePresence>
        {singleModal && (
          <SingleGameEditModal
            game={singleModal}
            onSave={handleSingleSave}
            onClose={() => setSingleModal(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900">🎮 Game Manager</h1>
            <p className="text-gray-400 text-sm">Edit games satu-satu atau bulk</p>
          </div>
          <button onClick={fetchGames} disabled={loading} className="p-2.5 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-50 transition-all">
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-indigo-600">{totalGames}</p>
            <p className="text-xs text-gray-400 font-semibold">Total Games dalam DB</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-black text-orange-500">{GAME_HUB.length}</p>
            <p className="text-xs text-gray-400 font-semibold">Hub Mini-Games</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            {SUBJECT_CONFIG.map((cfg, idx) => {
              const key = `${cfg.ageGroup}-${cfg.subject}`;
              const games = gamesBySubject[key] || [];
              return (
                <SubjectSection
                  key={key}
                  idx={idx}
                  label={cfg.label}
                  ageGroup={cfg.ageGroup}
                  subject={cfg.subject}
                  color={cfg.color}
                  games={games}
                  isExpanded={expandedKey === key}
                  onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
                  onBulkEdit={() => setBulkModal({ label: cfg.label, ageGroup: cfg.ageGroup, subject: cfg.subject, games })}
                  onEditGame={(game) => setSingleModal(game)}
                />
              );
            })}

            {/* Game Hub */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-400 p-4 mt-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-black text-gray-900">🎪 Game Hub Mini-Games</p>
                  <p className="text-xs text-gray-400">{GAME_HUB.length} mini-games aktif</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{GAME_HUB.length} games</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GAME_HUB.map(g => (
                  <div key={g.id} className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-800 truncate">{g.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}