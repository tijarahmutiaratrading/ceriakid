import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import CinematicHub from '@/components/hub/CinematicHub';
import CreditTopUpBar from '@/components/home/CreditTopUpBar';

const AI_CIKGU = [
  {
    key: 'firdaus',
    to: '/ai-assistant',
    title: 'Cikgu Firdaus',
    badge: 'Tutor AI',
    desc: 'Tanya apa sahaja — soalan sekolah, penjelasan topik & bantuan belajar.',
    emoji: '🤖',
    art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/61dba1f3a_generated_image.png',
    accent: '#8b5cf6',
    artPosition: 'top',
    metaChips: ['💬 Chat interaktif', '📚 Semua subjek'],
  },
  {
    key: 'rosie',
    to: '/quiz-ai',
    title: 'Cikgu Rosie',
    badge: 'Penjana Kuiz',
    desc: 'Latih anak dengan kuiz interaktif ikut subjek & tahap.',
    emoji: '❓',
    art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4347879e0_generated_image.png',
    accent: '#0ea5e9',
    artPosition: 'top',
    metaChips: ['❓ Kuiz ikut tahap', '⚡ Jawapan segera'],
  },
  {
    key: 'mira',
    to: '/story-generator',
    title: 'Cikgu Mira',
    badge: 'Pencipta Cerita',
    desc: 'Hasilkan cerita penuh pengajaran moral untuk anak.',
    emoji: '📖',
    art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d2061d998_generated_image.png',
    accent: '#ec4899',
    artPosition: 'top',
    metaChips: ['📖 Cerita moral', '✨ Nama anak sendiri'],
  },
  {
    key: 'daniel',
    to: '/bbm-generator',
    title: 'Cikgu Daniel',
    badge: 'Penjana BBM',
    desc: 'Cipta bahan bantu mengajar — lembaran kerja, nota & lagi.',
    emoji: '📝',
    art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4c8ddef8e_generated_image.png',
    accent: '#10b981',
    artPosition: 'top',
    metaChips: ['📝 Lembaran kerja', '🖨️ Boleh print'],
  },
];

export default function AIHub() {
  return (
    <CinematicHub
      label="AI Hub"
      labelIcon={Sparkles}
      items={AI_CIKGU}
      playLabel="Buka Cikgu AI"
      railLabel="Pilih Cikgu"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 rounded-3xl bg-white p-4 shadow-2xl">
        <CreditTopUpBar />
      </motion.div>
    </CinematicHub>
  );
}