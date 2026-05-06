import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const LEVELS = [
  { key: 'all', label: 'Semua Tahap' },
  { key: 'prasekolah', label: '🎨 Prasekolah' },
  { key: 'darjah_1', label: '📗 Darjah 1' },
  { key: 'darjah_2', label: '📘 Darjah 2' },
  { key: 'darjah_3', label: '📙 Darjah 3' },
  { key: 'darjah_4', label: '📕 Darjah 4' },
  { key: 'darjah_5', label: '📓 Darjah 5' },
  { key: 'darjah_6', label: '🏆 Darjah 6' },
];

const SUBJECTS = [
  { key: 'all', label: 'Semua Subjek' },
  { key: 'bahasa_melayu', label: '🇲🇾 BM' },
  { key: 'english', label: '🇬🇧 English' },
  { key: 'mathematics', label: '🔢 Matematik' },
  { key: 'science', label: '🧪 Sains' },
  { key: 'jawi', label: '🕌 Jawi' },
  { key: 'pendidikan_islam', label: '☪️ P. Islam' },
  { key: 'sejarah', label: '📜 Sejarah' },
  { key: 'bahasa_tamil', label: '🇮🇳 Tamil' },
  { key: 'bahasa_mandarin', label: '🇨🇳 Mandarin' },
];

const TYPES = [
  { key: 'all', label: 'Semua Jenis' },
  { key: 'lembaran_kerja', label: '📄 Lembaran Kerja' },
  { key: 'kad_imbasan', label: '🃏 Kad Imbasan' },
  { key: 'carta', label: '📊 Carta' },
  { key: 'slaid_powerpoint', label: '💻 Slaid PPT' },
  { key: 'rancangan_pengajaran', label: '📋 RPH' },
  { key: 'modul', label: '📚 Modul' },
  { key: 'kuiz', label: '❓ Kuiz' },
  { key: 'aktiviti', label: '🎯 Aktiviti' },
  { key: 'permainan_bilik_darjah', label: '🎮 Permainan' },
];

function FilterDropdown({ value, options, onChange, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      className="min-h-11 px-3 py-2 bg-white/20 text-white rounded-xl text-xs font-bold border border-white/30 whitespace-nowrap outline-none focus:border-white/60"
    >
      {options.map(opt => (
        <option key={opt.key} value={opt.key} className="bg-white text-gray-800 font-semibold">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function BBMFilterBar({ selectedLevel, setSelectedLevel, selectedSubject, setSelectedSubject, selectedType, setSelectedType }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
      <FilterDropdown value={selectedLevel} options={LEVELS} onChange={setSelectedLevel} placeholder="Tahap" />
      <FilterDropdown value={selectedSubject} options={SUBJECTS} onChange={setSelectedSubject} placeholder="Subjek" />
      <FilterDropdown value={selectedType} options={TYPES} onChange={setSelectedType} placeholder="Jenis" />
    </div>
  );
}