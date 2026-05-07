import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EditGameModal from '@/components/admin/EditGameModal';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

const MINI_GAMES = MINI_GAME_CATEGORIES.map(category => ({
  id: category.id,
  label: category.title,
  emoji: category.emoji,
}));

const TYPE_BY_MODE = {
  memory: 'memory_game',
  dragdrop: 'drag_drop',
  wordbuilder: 'word_builder',
  sorting: 'sorting',
  tilematch: 'tile_match',
  story: 'story_adventure',
  tracing: 'tracing',
  picture_hunt: 'picture_quiz',
  sequence: 'pattern_fill',
  falling_catch: 'counting',
  stacking: 'counting',
  balloon_pop: 'letter_match',
  typing_challenge: 'spelling',
  true_false: 'multiple_choice',
};

const DIFFICULTY_MAP = {
  Mudah: 'easy',
  Sederhana: 'medium',
  Sukar: 'hard',
};

const buildMiniGameRecord = (category, game, index) => ({
  title: game.title,
  description: `${category.title} · ${game.objective || category.objective}`,
  type: TYPE_BY_MODE[game.mode] || 'multiple_choice',
  category: category.id,
  ageGroup: 'prasekolah',
  difficulty: DIFFICULTY_MAP[game.difficulty] || 'easy',
  tier: 'free',
  emoji: game.emoji || category.emoji,
  totalQuestions: Math.max(1, game.items?.length || game.words?.length || game.scenes?.length || game.statements?.length || 3),
  gameData: {
    ...game,
    miniGameBlueprint: true,
    categoryId: category.id,
    categoryTitle: category.title,
    playStyle: game.mode,
    instruction: game.instruction,
  },
  isPublished: true,
  status: 'ready',
  order: index + 1,
});

export default function MiniGamesManager({ onToast }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadGames = async () => {
    setLoading(true);
    const results = await Promise.all(
      MINI_GAMES.map((game) => base44.entities.Game.filter({ category: game.id }))
    );

    const existingGames = results.flat();
    const existingKeys = new Set(existingGames.map(game => `${game.category}-${game.gameData?.id || game.title}`));
    const missingBlueprintRecords = MINI_GAME_CATEGORIES.flatMap(category =>
      category.games
        .filter(game => !existingKeys.has(`${category.id}-${game.id}`))
        .map((game, index) => buildMiniGameRecord(category, game, index))
    );

    if (missingBlueprintRecords.length > 0) {
      await base44.entities.Game.bulkCreate(missingBlueprintRecords);
      onToast?.(`✅ ${missingBlueprintRecords.length} mini games diimport ke manager`);
      const importedResults = await Promise.all(
        MINI_GAMES.map((game) => base44.entities.Game.filter({ category: game.id }))
      );
      results.splice(0, results.length, ...importedResults);
    }

    const allGames = results.flat().sort((a, b) => {
      const categoryA = MINI_GAMES.findIndex((game) => game.id === a.category);
      const categoryB = MINI_GAMES.findIndex((game) => game.id === b.category);
      return categoryA - categoryB || (a.order || 0) - (b.order || 0);
    });

    setGames(allGames);
    setSelectedIds(new Set());
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

  const toggleSelect = (gameId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(gameId) ? next.delete(gameId) : next.add(gameId);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(games.map((game) => game.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Padam ${selectedIds.size} mini games yang dipilih?`)) return;
    for (const gameId of selectedIds) await base44.entities.Game.delete(gameId);
    onToast?.(`✅ ${selectedIds.size} mini games dipadam`);
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
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {games.length > 0 && (
              <>
                <button onClick={selectedIds.size === games.length ? clearSelection : selectAll} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-all">
                  {selectedIds.size === games.length ? 'Clear' : 'Select All'}
                </button>
                <button onClick={deleteSelected} disabled={selectedIds.size === 0} className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 text-xs font-black transition-all disabled:opacity-40">
                  Delete ({selectedIds.size})
                </button>
              </>
            )}
            <button onClick={loadGames} disabled={loading} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
              <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-white" /></div>
        ) : games.length === 0 ? (
          <div className="text-center py-10 text-white/60">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm font-bold">Mini games sedang diimport dari Mini Game Hub...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
            {games.map((game) => {
              const meta = getMeta(game.category);
              return (
                <div key={game.id} className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/10">
                  <button onClick={() => toggleSelect(game.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedIds.has(game.id) ? 'bg-red-500 border-red-300 text-white' : 'border-white/40 text-transparent hover:border-white/70'}`}>
                    ✓
                  </button>
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