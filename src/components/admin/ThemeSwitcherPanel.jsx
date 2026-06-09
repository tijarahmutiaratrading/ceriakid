import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { THEME_PRESETS, DEFAULT_THEME, saveTheme } from '@/lib/themeManager';
import { useToast } from '@/components/ui/use-toast';

export default function ThemeSwitcherPanel() {
  const [activeId, setActiveId] = useState(DEFAULT_THEME.id);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.AppTheme.filter({ key: 'active' })
      .then((rows) => {
        if (rows?.[0]?.presetId) setActiveId(rows[0].presetId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (preset) => {
    setSavingId(preset.id);
    try {
      await saveTheme(preset);
      setActiveId(preset.id);
      toast({ title: '🎨 Tema dikemaskini!', description: `Warna app ditukar ke ${preset.label}. Semua pengguna akan nampak warna baharu.` });
    } catch (e) {
      toast({ title: 'Gagal simpan tema', description: e.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-white/60 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-2xl brand-gradient-br flex items-center justify-center shadow-lg flex-shrink-0">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-lg leading-tight">Tema Warna App</h2>
          <p className="text-slate-500 text-xs font-semibold">Pilih warna — terus apply ke seluruh app</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {THEME_PRESETS.map((preset) => {
            const isActive = activeId === preset.id;
            const isSaving = savingId === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(preset)}
                disabled={!!savingId}
                className={`relative rounded-2xl p-3 text-left transition-all border-2 ${
                  isActive ? 'border-slate-900 shadow-lg' : 'border-transparent hover:border-slate-200'
                } bg-slate-50`}
              >
                <div
                  className="h-12 w-full rounded-xl shadow-inner mb-2"
                  style={{ background: `linear-gradient(to right, ${preset.gradientFrom}, ${preset.gradientTo})` }}
                />
                <p className="font-black text-slate-800 text-xs">{preset.label}</p>
                {isActive && !isSaving && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
                {isSaving && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <p className="text-slate-400 text-[11px] font-semibold mt-4 leading-relaxed">
        💡 Tema disimpan secara global. Pengguna mungkin perlu refresh untuk nampak perubahan.
      </p>
    </div>
  );
}