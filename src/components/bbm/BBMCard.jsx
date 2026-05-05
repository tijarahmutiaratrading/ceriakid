import React from 'react';
import { motion } from 'framer-motion';
import { Download, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};

const TYPE_LABELS = {
  lembaran_kerja: 'Lembaran Kerja',
  kad_imbasan: 'Kad Imbasan',
  carta: 'Carta',
  slaid_powerpoint: 'Slaid PPT',
  rancangan_pengajaran: 'RPH',
  modul: 'Modul',
  kuiz: 'Kuiz',
  aktiviti: 'Aktiviti',
  permainan_bilik_darjah: 'Permainan',
};

const TYPE_COLORS = {
  lembaran_kerja: 'bg-blue-400/80',
  kad_imbasan: 'bg-pink-400/80',
  carta: 'bg-orange-400/80',
  slaid_powerpoint: 'bg-indigo-400/80',
  rancangan_pengajaran: 'bg-green-400/80',
  modul: 'bg-purple-400/80',
  kuiz: 'bg-red-400/80',
  aktiviti: 'bg-yellow-400/80',
  permainan_bilik_darjah: 'bg-teal-400/80',
};

export default function BBMCard({ resource, locked, onDownload, idx }) {
  const typeColor = TYPE_COLORS[resource.type] || 'bg-gray-400/80';
  const hasFile = true; // always show download — BBMHub generates HTML on-the-fly if no file

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
      className={`rounded-2xl p-4 flex items-start sm:items-center gap-3 sm:gap-4 ${locked ? 'opacity-70' : ''}`}
      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
    >
      {/* Emoji Icon */}
      <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
        {resource.emoji || '📄'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-sm text-white line-clamp-2 leading-tight">{resource.title}</h3>
        <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{resource.description}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${typeColor}`}>
            {TYPE_LABELS[resource.type] || resource.type}
          </span>
          <span className="text-white/60 text-xs font-semibold">{LEVEL_LABELS[resource.level] || resource.level}</span>
          {resource.downloadCount > 0 && (
            <span className="text-white/50 text-xs flex items-center gap-0.5">
              <Download className="w-3 h-3" />{resource.downloadCount}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {locked ? (
          <Link to="/">
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-yellow-300" />
              </div>
              <span className="text-xs text-yellow-300 font-black">Premium</span>
            </div>
          </Link>
        ) : hasFile ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDownload}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"
          >
            <Download className="w-4 h-4 text-purple-600" />
          </motion.button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" title="Fail belum tersedia">
            <span className="text-sm">⏳</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}