import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Trash2, Palette, Sparkles, Brush, Ruler } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

/**
 * Premium dark floating toolbar — Procreate / Figma / Apple Pro inspired.
 * Solid dark bezel with subtle gloss, colored accent pills per tool group,
 * tight typography, popover anchored above each button.
 */
export default function CanvasFloatingToolbar({
  tools,
  brushSizes,
  colors,
  stickers,
  tool,
  brushSize,
  color,
  stickerMode,
  showStickers = true,
  onToolChange,
  onSizeChange,
  onColorChange,
  onStickerToggle,
  onUndo,
  onClear,
  onSave,
  canUndo = false,
}) {
  const [openPopover, setOpenPopover] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!openPopover) return;
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenPopover(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [openPopover]);

  const togglePopover = (key) => setOpenPopover((cur) => (cur === key ? null : key));

  const colorSwatch = tool.id === 'eraser' ? '#fff9f0' : color;
  const isEraser = tool.id === 'eraser';

  return (
    <div ref={rootRef} className="relative max-w-[calc(100vw-1rem)]">
      {/* Soft ambient glow behind the bar — adds depth without being loud */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] blur-2xl opacity-50"
        style={{
          background: 'radial-gradient(60% 80% at 50% 100%, rgba(139,92,246,0.35), transparent 70%)',
        }}
      />

      <div
        className="relative flex items-stretch gap-0.5 sm:gap-1 p-1 sm:p-1.5 rounded-[1.4rem] sm:rounded-[1.75rem] overflow-visible"
        style={{
          background: 'linear-gradient(180deg, #1f1f2e 0%, #15151f 100%)',
          boxShadow:
            '0 24px 60px rgba(0,0,0,0.45), ' +
            '0 8px 20px rgba(0,0,0,0.3), ' +
            'inset 0 1px 0 rgba(255,255,255,0.08), ' +
            'inset 0 -1px 0 rgba(0,0,0,0.5), ' +
            '0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Subtle top specular highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-[12%] right-[12%] h-px rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />

        <div className="relative z-10 flex items-stretch gap-0.5 sm:gap-1 w-full">
          {/* TOOL */}
          <ProToolButton
            active={openPopover === 'tool'}
            isActive={!stickerMode}
            accent="violet"
            onClick={() => togglePopover('tool')}
            label={tool.label}
            icon={<Brush className="w-3 h-3" />}
            popoverOpen={openPopover === 'tool'}
            popover={
              <Popover wide>
                <PopoverHeader icon={<Brush className="w-3 h-3" />} accent="violet">Pilih Alat · {tools.length}</PopoverHeader>
                <div className="grid grid-cols-4 gap-1.5">
                  {tools.map((t) => {
                    const active = tool.id === t.id && !stickerMode;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { onToolChange(t); setOpenPopover(null); }}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition ${active ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40 scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'}`}
                        title={t.hint}
                      >
                        <span className="text-2xl leading-none">{t.emoji}</span>
                        <span className="text-[9px] font-bold leading-tight text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-2.5 text-center">{tool.hint}</p>
              </Popover>
            }
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              <span className="text-sm sm:text-lg leading-none">{tool.emoji}</span>
            </div>
          </ProToolButton>

          {/* SIZE */}
          <ProToolButton
            active={openPopover === 'size'}
            isActive
            accent="sky"
            onClick={() => togglePopover('size')}
            label={brushSize.label}
            icon={<Ruler className="w-3 h-3" />}
            popoverOpen={openPopover === 'size'}
            popover={
              <Popover>
                <PopoverHeader icon={<Ruler className="w-3 h-3" />} accent="sky">Saiz Brush</PopoverHeader>
                <div className="grid grid-cols-4 gap-1.5">
                  {brushSizes.map((s) => {
                    const active = brushSize.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { onSizeChange(s); setOpenPopover(null); }}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition ${active ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/40' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        <span className="rounded-full" style={{ width: s.dot, height: s.dot, backgroundColor: active ? '#ffffff' : '#475569' }} />
                        <span className="text-[10px] font-bold">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Popover>
            }
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              <span className="inline-block rounded-full bg-white" style={{ width: Math.min(brushSize.dot, 14), height: Math.min(brushSize.dot, 14), boxShadow: '0 0 8px rgba(56,189,248,0.5)' }} />
            </div>
          </ProToolButton>

          {/* COLOR */}
          {!isEraser && (
            <ProToolButton
              active={openPopover === 'color'}
              isActive
              accent="pink"
              onClick={() => togglePopover('color')}
              label="Warna"
              icon={<Palette className="w-3 h-3" />}
              popoverOpen={openPopover === 'color'}
              popover={
                <Popover>
                  <PopoverHeader icon={<Palette className="w-3 h-3" />} accent="pink">Palet Warna</PopoverHeader>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((c) => {
                      const active = color === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { onColorChange(c); setOpenPopover(null); }}
                          className="aspect-square rounded-full transition hover:scale-110"
                          style={{
                            backgroundColor: c,
                            boxShadow: active
                              ? '0 0 0 2.5px #ffffff, 0 0 0 5px #ec4899, 0 4px 12px rgba(236,72,153,0.5)'
                              : '0 1px 3px rgba(0,0,0,0.12), inset 0 -1px 2px rgba(0,0,0,0.1)',
                          }}
                          aria-label={`Warna ${c}`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <CustomColorPicker color={color} onChange={onColorChange} />
                  </div>
                </Popover>
              }
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl"
                style={{
                  backgroundColor: colorSwatch,
                  boxShadow:
                    'inset 0 1px 2px rgba(255,255,255,0.4), ' +
                    'inset 0 -1px 2px rgba(0,0,0,0.2), ' +
                    '0 0 0 1.5px rgba(255,255,255,0.95), ' +
                    '0 0 0 2.5px rgba(0,0,0,0.25), ' +
                    '0 4px 10px rgba(0,0,0,0.3)',
                }}
              />
            </ProToolButton>
          )}

          {/* STICKER */}
          {showStickers && (
            <ProToolButton
              active={openPopover === 'sticker' || !!stickerMode}
              isActive={!!stickerMode}
              accent="amber"
              onClick={() => togglePopover('sticker')}
              label={stickerMode ? 'Aktif' : 'Sticker'}
              icon={<Sparkles className="w-3 h-3" />}
              popoverOpen={openPopover === 'sticker'}
              popover={
                <Popover>
                  <PopoverHeader icon={<Sparkles className="w-3 h-3" />} accent="amber">Tampal Sticker</PopoverHeader>
                  <p className="text-[11px] text-slate-500 font-medium mb-2">Tekan sticker, kemudian tap canvas.</p>
                  <div className="grid grid-cols-6 gap-2">
                    {stickers.map((s) => {
                      const active = stickerMode === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { onStickerToggle(s); setOpenPopover(null); }}
                          className={`aspect-square rounded-2xl text-2xl transition flex items-center justify-center hover:scale-110 ${active ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/40 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Popover>
              }
            >
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-sm sm:text-lg leading-none">{stickerMode || '✨'}</span>
              </div>
            </ProToolButton>
          )}

          {/* DIVIDER */}
          <div className="self-center w-px h-7 sm:h-9 mx-0.5 sm:mx-1"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)' }}
          />

          {/* ACTIONS */}
          <ActionButton onClick={onUndo} disabled={!canUndo} label="Undo">
            <Undo2 className="w-4 h-4" />
          </ActionButton>
          <ActionButton onClick={onClear} label="Kosong" danger>
            <Trash2 className="w-4 h-4" />
          </ActionButton>
          <ActionButton onClick={onSave} label="Simpan" primary>
            <Download className="w-4 h-4" />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

const ACCENT_MAP = {
  violet: { dot: '#a78bfa', glow: 'rgba(167,139,250,0.55)' },
  sky: { dot: '#38bdf8', glow: 'rgba(56,189,248,0.55)' },
  pink: { dot: '#f472b6', glow: 'rgba(244,114,182,0.55)' },
  amber: { dot: '#fbbf24', glow: 'rgba(251,191,36,0.55)' },
};

function ProToolButton({ active, isActive, onClick, label, icon, children, popover, popoverOpen, accent = 'violet' }) {
  const a = ACCENT_MAP[accent] || ACCENT_MAP.violet;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        title={label}
        className={`group relative flex flex-col items-center justify-center gap-0.5 w-10 sm:w-16 h-10 sm:h-13 px-1 rounded-xl sm:rounded-2xl transition-all ${
          active ? 'bg-white/10' : 'hover:bg-white/[0.06]'
        }`}
        style={active ? {
          boxShadow: `inset 0 0 0 1px ${a.glow}, 0 0 14px ${a.glow}`,
        } : undefined}
      >
        {children}
        {/* Label visible on sm+ only */}
        <span className="hidden sm:flex items-center gap-0.5 text-[9px] font-bold leading-none mt-1 text-white/65">
          <span className="opacity-70">{icon}</span>
          <span className="truncate max-w-[3.2rem]">{label}</span>
        </span>
        {/* Active dot indicator */}
        {isActive && (
          <span
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ backgroundColor: a.dot, boxShadow: `0 0 6px ${a.glow}` }}
          />
        )}
      </button>
      <AnimatePresence>{popoverOpen && popover}</AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, disabled, label, danger, primary, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center justify-center gap-0.5 w-9 sm:w-14 h-10 sm:h-13 rounded-xl sm:rounded-2xl transition disabled:opacity-25 disabled:cursor-not-allowed ${
        danger
          ? 'text-red-400 hover:bg-red-500/15 hover:text-red-300'
          : primary
            ? 'text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200'
            : 'text-white/75 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      {children}
      <span className="hidden sm:inline text-[9px] font-bold leading-none mt-0.5">{label}</span>
    </button>
  );
}

const HEADER_ACCENT = {
  violet: 'text-violet-600',
  sky: 'text-sky-600',
  pink: 'text-pink-600',
  amber: 'text-amber-600',
};

function PopoverHeader({ icon, children, accent = 'violet' }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] mb-2.5 ${HEADER_ACCENT[accent] || 'text-slate-500'}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

function Popover({ children, wide = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 ${wide ? 'w-[min(92vw,380px)]' : 'w-[min(88vw,340px)]'} p-3 rounded-2xl`}
      style={{
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 20px 50px rgba(15,23,42,0.35), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      {children}
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }} />
    </motion.div>
  );
}