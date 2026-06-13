import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useUITheme } from '@/lib/UIThemeContext';

const THEMES = [
  {
    id: 'ps5',
    label: 'Sinematik',
    sub: 'Gelap & moden (PS5)',
    preview: 'linear-gradient(135deg, #0a0a12 0%, #7f1d1d 100%)',
    chip: 'Gambar 3D',
  },
  {
    id: 'classic',
    label: 'Klasik Ceria',
    sub: 'Cerah & berwarna',
    preview: 'linear-gradient(135deg, #f5e8ff 0%, #ffd6e8 60%, #d6f0ff 100%)',
    chip: 'Emoji warna-warni',
  },
];

export default function UIThemeSwitcher() {
  const { uiTheme, setUITheme } = useUITheme();

  return (
    <div className="rounded-3xl bg-white shadow-xl border border-white/60 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <Palette className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-slate-900 font-black text-base leading-tight">Tema Paparan</p>
          <p className="text-slate-500 text-xs font-semibold">Pilih gaya rupa app yang anda suka</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((th) => {
          const active = uiTheme === th.id;
          return (
            <motion.button
              key={th.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setUITheme(th.id)}
              className={`relative text-left rounded-2xl p-3 border-2 transition-all ${
                active ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className="w-full h-20 rounded-xl mb-2.5 shadow-inner ring-1 ring-black/5"
                style={{ background: th.preview }}
              />
              <div className="flex items-center justify-between gap-1">
                <p className="text-slate-900 font-black text-sm leading-tight">{th.label}</p>
                {active && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] font-semibold mt-0.5">{th.sub}</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {th.chip}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-slate-400 text-[11px] font-semibold mt-3.5 text-center">
        Tukaran disimpan automatik pada peranti ini
      </p>
    </div>
  );
}