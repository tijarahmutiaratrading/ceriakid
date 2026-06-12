import React from 'react';
import { Gamepad2 } from 'lucide-react';
import CinematicHub from '@/components/hub/CinematicHub';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

// Art Pixar 3D + warna accent per kategori
const THEMES = {
  memory_master:    { accent: '#6366f1', tag: 'Memori',  art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e17eafa6e_generated_image.png' },
  logic_puzzles:    { accent: '#a855f7', tag: 'Logik',   art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0068e716c_generated_image.png' },
  speed_focus:      { accent: '#f43f5e', tag: 'Pantas',  art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f373e003a_generated_image.png' },
  pattern_genius:   { accent: '#fb923c', tag: 'Corak',   art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fc39444a8_generated_image.png' },
  maze_adventure:   { accent: '#10b981', tag: 'Jelajah', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a62133ee7_generated_image.png' },
  creative_builder: { accent: '#0ea5e9', tag: 'Kreatif', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1db6c7f99_generated_image.png' },
  problem_solver:   { accent: '#4f46e5', tag: 'Selesai', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c9fb0c0de_generated_image.png' },
  brain_training:   { accent: '#ec4899', tag: 'Latih',   art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3a1cfe5d2_generated_image.png' },
};

const CATEGORY_EMOJIS = {
  memory_master: '🧠', logic_puzzles: '🧩', speed_focus: '⚡', pattern_genius: '🎨',
  maze_adventure: '🗺️', creative_builder: '🎭', problem_solver: '💡', brain_training: '🎯',
};

export default function GamesHub() {
  const items = MINI_GAME_CATEGORIES
    .filter((c) => (c.games || []).length > 0)
    .map((c) => {
      const theme = THEMES[c.id] || { accent: '#8b5cf6', tag: 'Main', art: null };
      return {
        key: c.id,
        title: c.title,
        desc: c.objective,
        emoji: CATEGORY_EMOJIS[c.id] || '🎮',
        art: theme.art,
        accent: theme.accent,
        badge: theme.tag,
        to: `/mini-games/${c.id}`,
        metaChips: [`🎮 ${(c.games || []).length} games`, '⭐ 3 tahap'],
      };
    });

  return (
    <CinematicHub
      label="Genius Mini Games"
      labelIcon={Gamepad2}
      items={items}
      playLabel="Jom Main!"
      railLabel="Pilih Kategori"
    >
      <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
        <h3 className="font-black text-white/90 text-sm mb-1.5">💡 Tips Ibu Bapa</h3>
        <p className="text-white/70 text-xs font-bold leading-relaxed">
          Main 10-15 minit sehari untuk asah daya ingatan, fokus, dan kemahiran selesai masalah!
        </p>
      </div>
    </CinematicHub>
  );
}