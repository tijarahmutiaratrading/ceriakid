import React from 'react';
import { GraduationCap } from 'lucide-react';
import CinematicHub from '@/components/hub/CinematicHub';
import { TIGA_M_CATEGORIES } from '@/lib/tigaMBlueprints';

// Art Pixar 3D baru per modul 3M
const ART = {
  membaca: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ab1e98aae_generated_image.png',
  menulis: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a20cbdced_generated_image.png',
  mengira: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d8aadf405_generated_image.png',
};

const ACCENT = { membaca: '#3b82f6', menulis: '#10b981', mengira: '#f59e0b' };

export default function TigaMHub() {
  const items = TIGA_M_CATEGORIES.map((c) => ({
    key: c.id,
    title: c.title,
    desc: c.objective,
    emoji: c.emoji,
    art: ART[c.id],
    accent: ACCENT[c.id] || '#8b5cf6',
    badge: 'Modul 3M',
    to: `/3m/${c.id}`,
    metaChips: [`🎮 ${c.games.length} game`, '📚 Konstruk LINUS'],
  }));

  return (
    <CinematicHub
      label="Modul 3M"
      labelIcon={GraduationCap}
      items={items}
      playLabel="Mula Belajar"
      railLabel="Pilih Modul"
    >
      <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
        <h3 className="font-black text-white/90 text-sm mb-1.5">🎓 Membaca · Menulis · Mengira</h3>
        <p className="text-white/70 text-xs font-bold leading-relaxed">
          Kemahiran asas literasi & numerasi untuk Prasekolah dan Darjah Rendah, mengikut konstruk LINUS.
        </p>
      </div>
    </CinematicHub>
  );
}