import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Edit3, Loader2, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EditGameModal from '@/components/admin/EditGameModal';
import { STORY_KID_SEEDS } from '@/components/admin/StoryKidGenerator';

export default function StoryKidManager({ onToast }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStory, setEditStory] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const loadStories = async () => {
    setLoading(true);
    const data = await base44.entities.Game.filter({ category: 'story', type: 'story_adventure' });
    setStories(data.filter(game => game.gameData?.storyKid).sort((a, b) => (a.order || 0) - (b.order || 0)));
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const togglePublish = async (story) => {
    await base44.entities.Game.update(story.id, { isPublished: !story.isPublished });
    onToast?.(story.isPublished ? '✅ Cerita disembunyikan' : '✅ Cerita diterbitkan');
    loadStories();
  };

  const importDefaultStories = async () => {
    setLoading(true);
    for (let i = 0; i < STORY_KID_SEEDS.length; i++) {
      const story = STORY_KID_SEEDS[i];
      await base44.entities.Game.create({
        title: story.title,
        description: story.moral,
        type: 'story_adventure',
        category: 'story',
        ageGroup: 'prasekolah',
        difficulty: 'easy',
        tier: 'free',
        emoji: story.emoji,
        totalQuestions: story.scenes.length,
        gameData: { storyKid: true, moral: story.moral, scenes: story.scenes },
        isPublished: true,
        status: 'ready',
        order: i,
      });
    }
    onToast?.('✅ 5 Story Kid berjaya diimport');
    loadStories();
  };

  const deleteStory = async (story) => {
    if (!window.confirm(`Padam cerita "${story.title}"?`)) return;
    await base44.entities.Game.delete(story.id);
    onToast?.('✅ Cerita dipadam');
    loadStories();
  };

  const deleteAllStories = async () => {
    if (stories.length === 0) return;
    setConfirmDeleteAll(false);
    setLoading(true);
    for (const story of stories) {
      await base44.entities.Game.delete(story.id);
    }
    onToast?.(`✅ ${stories.length} Story Kid dipadam`);
    loadStories();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-black text-white text-2xl">Story Kid Management</h2>
          <p className="text-white/60 text-sm">Urus cerita, status publish dan kandungan Story Kid.</p>
        </div>
        <div className="flex items-center gap-2">
          {stories.length > 0 && (
            confirmDeleteAll ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-red-500/20 border border-red-400/20">
                <span className="text-red-100 font-black text-xs whitespace-nowrap">Confirm?</span>
                <button onClick={deleteAllStories} disabled={loading} className="px-3 py-1.5 rounded-xl bg-red-500 text-white font-black text-xs">Ya</button>
                <button onClick={() => setConfirmDeleteAll(false)} disabled={loading} className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-black text-xs">Batal</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteAll(true)} disabled={loading} className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-200 font-black text-xs transition-all">
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
            )
          )}
          <button onClick={loadStories} disabled={loading} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-white" /></div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 px-5 rounded-3xl bg-white/10 border border-white/10">
          <p className="text-5xl mb-3">📖</p>
          <p className="text-white font-black">Belum ada Story Kid dalam database</p>
          <p className="text-white/55 text-sm mt-1 mb-5">Cerita di page preview masih data default. Import dahulu untuk manage dalam database.</p>
          <button onClick={importDefaultStories} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-purple-700 font-black shadow-xl">
            <Sparkles className="w-4 h-4" /> Import 5 Story Kid
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => {
            const slideCount = story.gameData?.scenes?.length || story.totalQuestions || 0;
            return (
              <div key={story.id} className="rounded-3xl p-4 bg-white/10 border border-white/15 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl flex-shrink-0">{story.emoji || '📖'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm truncate">{story.title}</p>
                  <p className="text-white/55 text-xs mt-1 truncate">{story.description || story.gameData?.moral || 'Cerita interaktif'}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-1 rounded-full bg-yellow-300/20 text-yellow-200 text-xs font-black">{slideCount} slide</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-black ${story.isPublished ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'}`}>{story.isPublished ? 'Published' : 'Hidden'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to="/story-kid" className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"><BookOpen className="w-4 h-4" /></Link>
                  <button onClick={() => setEditStory(story)} className="p-2 rounded-xl bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => togglePublish(story)} className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20">{story.isPublished ? 'Hide' : 'Show'}</button>
                  <button onClick={() => deleteStory(story)} className="p-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editStory && <EditGameModal game={editStory} onClose={() => setEditStory(null)} onSaved={() => { onToast?.('✅ Story Kid disimpan'); setEditStory(null); loadStories(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}