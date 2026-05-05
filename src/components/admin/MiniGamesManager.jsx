import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EditGameModal from '@/components/admin/EditGameModal';

const MINI_GAMES = [
  { id: 'memory', label: 'Memory', emoji: '🧠' },
  { id: 'dragdrop', label: 'Drag & Drop', emoji: '🎯' },
  { id: 'wordbuilder', label: 'Word Builder', emoji: '📝' },
  { id: 'sorting', label: 'Sorting', emoji: '🔄' },
  { id: 'tilematch', label: 'Tile Match', emoji: '🎮' },
  { id: 'story', label: 'Story', emoji: '📖' },
  { id: 'physics', label: 'Physics', emoji: '⚡' },
  { id: 'tracing', label: 'Tracing', emoji: '✏️' },
];

export default function MiniGamesManager({ onToast }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editGame, setEditGame] = useState(null);

  const loadGames = async () => {
    setLoading(true);
    const results = await Promise.all(
      MINI_GAMES.map((game) => base44.entities.Game.filter({ category: game.id }))
    );

    const allGames = results.flat().sort((a, b) => {
      const categoryA = MINI_GAMES.findIndex((game) => game.id === a.category);
      const categoryB = MINI_GAMES.findIndex((game) => game.id === b.category);
      return categoryA - categoryB || (a.order || 0) - (b.order || 0);
    });

    setGames(allGames);
    setLoading(false);
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleTogglePublish = async (game) => {
    await base44.entities.Game.update(game.id, { isPublished: !game.isPublished });
    onToast?.(game.isPublished ? '✅ Mini game disembunyikan' : '✅ Mini game dipaparkan');
    loadGames();
  };

  const handleDelete = async (game) => {
    if (!window.confirm(`Padam mini game "${game.title}"?`)) return;
    await base44.entities.Game.delete(game.id);
    onToast?.('✅ Mini game dipadam');
    loadGames();
  };

  const getMeta = (category) => MINI_GAMES.find((game) => game.id === category) || { label: category, emoji: '🎮' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="p-5 md:p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-black text-white text-lg">🎮 Manage Mini Games</h2>
            <p className="text-white/60 text-xs mt-1">Edit, hide/show atau padam mini games yang sudah dijana.</p>
          </div>
          <button onClick={loadGames} disabled={loading} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-white" /></div>
        ) : games.length === 0 ? (
          <div className="text-center py-10 text-white/60">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm font-bold">Belum ada mini games untuk diurus.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
            {games.map((game) => {
              const meta = getMeta(game.category);
              return (
                <div key={game.id} className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/10">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl flex-shrink-0">{meta.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-black truncate">{game.title || meta.label}</p>
                    <p className="text-white/60 text-xs font-semibold truncate">
                      {meta.label} · {game.ageGroup === 'prasekolah' ? 'Prasekolah' : 'Sekolah Rendah'} · {game.isPublished ? 'Published' : 'Hidden'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditGame(game)} className="p-2 rounded-xl bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 transition-all" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleTogglePublish(game)} className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all" title={game.isPublished ? 'Hide' : 'Show'}>
                      {game.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(game)} className="p-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editGame && (
          <EditGameModal
            game={editGame}
            onClose={() => setEditGame(null)}
            onSaved={() => { onToast?.('✅ Mini game disimpan'); setEditGame(null); loadGames(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}