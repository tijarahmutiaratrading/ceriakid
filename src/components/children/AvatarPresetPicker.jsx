import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Grid avatar preset — user boleh pilih dari 8 avatar siap
 * tanpa perlu upload file sendiri.
 */
export default function AvatarPresetPicker({ avatars = [], selectedUrl, onSelect }) {
  if (!avatars.length) return null;

  return (
    <div className="w-full mt-3">
      <p className="text-slate-700 text-[10px] font-black uppercase tracking-wider mb-2">
        Atau pilih avatar siap
      </p>
      <div className="grid grid-cols-4 gap-2">
        {avatars.map((url, i) => {
          const active = selectedUrl === url;
          return (
            <motion.button
              key={url}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(url)}
              className="relative aspect-square rounded-2xl overflow-hidden transition-all"
              style={{
                boxShadow: active
                  ? '0 0 0 3px #ec4899, 0 4px 10px rgba(236,72,153,0.3)'
                  : '0 2px 0 #fde68a',
                background: '#fef9f3',
              }}
              aria-label={`Avatar ${i + 1}`}
              aria-pressed={active}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {active && (
                <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}