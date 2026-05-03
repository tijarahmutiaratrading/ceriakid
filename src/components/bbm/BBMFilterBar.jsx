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
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.key === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white rounded-xl text-xs font-bold border border-white/30 whitespace-nowrap"
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 min-w-[160px] max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors ${value === opt.key ? 'text-purple-600 font-black bg-purple-50' : 'text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BBMFilterBar({ selectedLevel, setSelectedLevel, selectedSubject, setSelectedSubject, selectedType, setSelectedType }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <FilterDropdown value={selectedLevel} options={LEVELS} onChange={setSelectedLevel} placeholder="Tahap" />
      <FilterDropdown value={selectedSubject} options={SUBJECTS} onChange={setSelectedSubject} placeholder="Subjek" />
      <FilterDropdown value={selectedType} options={TYPES} onChange={setSelectedType} placeholder="Jenis" />
    </div>
  );
}