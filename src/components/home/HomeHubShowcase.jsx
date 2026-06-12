import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CinematicShowcase from '@/components/hub/CinematicShowcase';
import CinematicRail from '@/components/hub/CinematicRail';

// Hub utama app — dipaparkan gaya PS5: showcase besar + rail tile
const HUBS = [
  { key: 'games', to: '/games-hub', emoji: '🎮', title: 'Game Hub', desc: 'Permainan interaktif ikut silibus KSPK & KSSR — belajar sambil main.', badge: 'Utama', accent: '#8b5cf6', metaChips: ['🧠 Edukasi', '⭐ Kutip Bintang'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png' },
  { key: '3m', to: '/3m', emoji: '📚', title: 'Modul 3M', desc: 'Membaca, Menulis & Mengira — asas penting untuk anak menguasai pembelajaran.', badge: 'Asas', accent: '#3b82f6', metaChips: ['📖 Membaca', '✏️ Menulis', '🔢 Mengira'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dd42df217_generated_image.png' },
  { key: 'ai', to: '/ai-hub', emoji: '🤖', title: 'AI Hub', desc: 'Cikgu AI peribadi — tanya soalan, jana kuiz, cerita & bahan bantu belajar.', badge: 'AI', accent: '#6366f1', metaChips: ['💬 Cikgu AI', '❓ Kuiz', '📝 BBM'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2ad5ce117_generated_image.png' },
  { key: 'library', to: '/library', emoji: '📒', title: 'Library Hub', desc: 'Nota ringkas & mind map berwarna ikut silibus — ulangkaji jadi seronok.', badge: 'Nota', accent: '#a855f7', metaChips: ['🗺️ Mind Map', '📌 Nota Ringkas'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cbafc9750_generated_image.png' },
  { key: 'arcade', to: '/arcade', emoji: '🕹️', title: 'Arcade Zone', desc: '10 game arcade santai dengan token nilai murni — main & belajar adab.', badge: 'Santai', accent: '#d946ef', metaChips: ['🏆 High Score', '💎 Nilai Murni'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png' },
  { key: 'drawing', to: '/drawing', emoji: '🎨', title: 'Studio Lukisan', desc: 'Lukis bebas, tracing huruf & nombor — asah kreativiti dan motor halus.', badge: 'Kreatif', accent: '#ec4899', metaChips: ['🖌️ Lukis Bebas', '✍️ Tracing'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1bf081296_generated_image.png' },
  { key: 'story', to: '/story-kid', emoji: '📖', title: 'Story Kid', desc: 'Cerita interaktif dengan pilihan — anak tentukan jalan cerita sendiri.', badge: 'Cerita', accent: '#f59e0b', metaChips: ['🎭 Interaktif', '💡 Moral'], art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71823ab6e_generated_image.png' },
];

export default function HomeHubShowcase() {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const item = HUBS[selected];

  return (
    <div className="relative">
      <div className="relative">
        <CinematicShowcase item={item} playLabel="Buka Hub" onPlay={() => navigate(item.to)} />
        <CinematicRail
          items={HUBS}
          selected={selected}
          onSelect={setSelected}
          onActivate={() => navigate(item.to)}
        />
      </div>
    </div>
  );
}