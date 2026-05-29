import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Trash2, Palette, Sparkles, Brush, Ruler } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

/**
 * Premium floating toolbar — Procreate × Apple style.
 * Larger touch targets, gloss + soft glow, color-aware preview chips,
 * clearer visual hierarchy with active-state pill highlights.
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
      {/* Outer glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-2 rounded-[2rem] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.18), transparent 70%)',
          filter: 'blur(12px)',
        }}
      />
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative flex items-stretch gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 50%, rgba(245,243,255,0.7) 100%)',
          backdropFilter: 'blur(40px) saturate(220%)',
          WebkitBackdropFilter: 'blur(40px) saturate(220%)',
          boxShadow: '0 32px 80px rgba(76, 29, 149, 0.25), 0 12px 28px rgba(15,23,42,0.15), 0 2px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(15,23,42,0.06) inset, 0 0 0 1px rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
      >
        {/* Glossy top sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[2rem]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 60%, transparent 100%)',
          }}
        />
        {/* Specular highlight line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-[8%] right-[8%] h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,1) 50%, transparent 100%)',
          }}
        />
        {/* Bottom soft shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[2rem]"
          style={{
            background: 'linear-gradient(0deg, rgba(76,29,149,0.08) 0%, transparent 100%)',
          }}
        />

        <div className="relative z-10 flex items-stretch gap-1 sm:gap-1.5 w-full">
          {/* TOOL */}
          <ProToolButton
            active={openPopover === 'tool'}
            isActive={!stickerMode}
            onClick={() => togglePopover('tool')}
            label={tool.label}
            icon={<Brush className="w-3 h-3" />}
            popoverOpen={openPopover === 'tool'}
            popover={
              <Popover wide>
                <PopoverHeader icon={<Brush className="w-3.5 h-3.5" />}>Pilih Alat ({tools.length})</PopoverHeader>
                <div className="grid grid-cols-4 gap-2">
                  {tools.map((t) => {
                    const active = tool.id === t.id && !stickerMode;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { onToolChange(t); setOpenPopover(null); }}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 px-1 py-2 transition-all ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/40 scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'}`}
                        title={t.hint}
                      >
                        <span className="text-2xl leading-none">{t.emoji}</span>
                        <span className="text-[10px] font-black leading-tight text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold mt-3 text-center">{tool.hint}</p>
              </Popover>
            }
          >
            <PreviewChip>
              <span className="text-base sm:text-xl leading-none">{tool.emoji}</span>
            </PreviewChip>
          </ProToolButton>

          {/* SIZE */}
          <ProToolButton
            active={openPopover === 'size'}
            isActive
            onClick={() => togglePopover('size')}
            label={brushSize.label}
            icon={<Ruler className="w-3 h-3" />}
            popoverOpen={openPopover === 'size'}
            popover={
              <Popover>
                <PopoverHeader icon={<Ruler className="w-3.5 h-3.5" />}>Saiz Brush</PopoverHeader>
                <div className="grid grid-cols-4 gap-2">
                  {brushSizes.map((s) => {
                    const active = brushSize.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { onSizeChange(s); setOpenPopover(null); }}
                        className={`flex flex-col items-center justify-center gap-2 py-3.5 rounded-2xl transition-all ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/40 scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        <span className="rounded-full" style={{ width: s.dot, height: s.dot, backgroundColor: active ? '#ffffff' : '#475569' }} />
                        <span className="text-[10px] font-black">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Popover>
            }
          >
            <PreviewChip>
              <span className="inline-block rounded-full bg-slate-800" style={{ width: Math.min(brushSize.dot, 14), height: Math.min(brushSize.dot, 14) }} />
            </PreviewChip>
          </ProToolButton>

          {/* COLOR */}
          {!isEraser && (
            <ProToolButton
              active={openPopover === 'color'}
              isActive
              onClick={() => togglePopover('color')}
              label="Warna"
              icon={<Palette className="w-3 h-3" />}
              popoverOpen={openPopover === 'color'}
              popover={
                <Popover>
                  <PopoverHeader icon={<Palette className="w-3.5 h-3.5" />}>Palet Warna</PopoverHeader>
                  <div className="grid grid-cols-6 gap-2.5">
                    {colors.map((c) => {
                      const active = color === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { onColorChange(c); setOpenPopover(null); }}
                          className="aspect-square rounded-full transition-all hover:scale-110"
                          style={{
                            backgroundColor: c,
                            boxShadow: active
                              ? '0 0 0 3px #ffffff, 0 0 0 5.5px #8b5cf6, 0 6px 16px rgba(139,92,246,0.5)'
                              : '0 1px 3px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(0,0,0,0.1)',
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
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl ring-2 ring-white shadow-md relative overflow-hidden"
                style={{
                  backgroundColor: colorSwatch,
                  boxShadow: `inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.18), 0 3px 8px ${colorSwatch}66`,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl sm:rounded-t-2xl"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35), transparent)' }}
                />
              </div>
            </ProToolButton>
          )}

          {/* STICKER */}
          {showStickers && (
            <ProToolButton
              active={openPopover === 'sticker' || !!stickerMode}
              isActive={!!stickerMode}
              onClick={() => togglePopover('sticker')}
              label={stickerMode ? 'Aktif' : 'Sticker'}
              icon={<Sparkles className="w-3 h-3" />}
              popoverOpen={openPopover === 'sticker'}
              popover={
                <Popover>
                  <PopoverHeader icon={<Sparkles className="w-3.5 h-3.5" />}>Tampal Sticker</PopoverHeader>
                  <p className="text-[11px] text-slate-500 font-semibold mb-2.5">Tekan sticker, kemudian tap canvas.</p>
                  <div className="grid grid-cols-6 gap-2">
                    {stickers.map((s) => {
                      const active = stickerMode === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { onStickerToggle(s); setOpenPopover(null); }}
                          className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center hover:scale-110 ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/40 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Popover>
              }
            >
              <PreviewChip>
                <span className="text-base sm:text-xl leading-none">{stickerMode || '✨'}</span>
              </PreviewChip>
            </ProToolButton>
          )}

          {/* DIVIDER */}
          <div className="self-center w-px h-7 sm:h-9 mx-0.5 sm:mx-1" style={{ background: 'linear-gradient(180deg, transparent, rgba(15,23,42,0.18), transparent)' }} />

          {/* ACTIONS */}
          <ActionButton onClick={onUndo} disabled={!canUndo} label="Undo">
            <Undo2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
          </ActionButton>
          <ActionButton onClick={onClear} label="Kosong" danger>
            <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
          </ActionButton>
          <ActionButton onClick={onSave} label="Simpan" primary>
            <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
          </ActionButton>
        </div>
      </motion.div>
    </div>
  );
}

function PreviewChip({ children }) {
  return (
    <div
      className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-white ring-1 ring-slate-900/8 relative overflow-hidden"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.1)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl sm:rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.7), transparent)' }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function ProToolButton({ active, isActive, onClick, label, icon, children, popover, popoverOpen }) {
  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        title={label}
        className={`group relative flex flex-col items-center justify-center gap-1 w-11 sm:w-[72px] h-11 sm:h-16 rounded-xl sm:rounded-2xl transition-all ${
          active
            ? 'bg-gradient-to-b from-white to-purple-50 ring-1 ring-purple-300/60 shadow-md shadow-purple-500/20'
            : 'hover:bg-white/70'
        }`}
      >
        {children}
        {/* Label visible on sm+ */}
        <span className={`hidden sm:flex items-center gap-1 text-[10px] font-black leading-none mt-0.5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
          <span className="opacity-70">{icon}</span>
          <span className="truncate max-w-[3.5rem] uppercase tracking-wider">{label}</span>
        </span>
        {/* Active dot indicator (mobile) */}
        {active && (
          <span className="sm:hidden absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
        )}
      </motion.button>
      <AnimatePresence>{popoverOpen && popover}</AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, disabled, label, danger, primary, children }) {
  const variant = danger
    ? 'text-red-500 hover:bg-red-500/10 hover:text-red-600 active:bg-red-500/20'
    : primary
    ? 'text-purple-600 hover:bg-purple-500/10 hover:text-purple-700 active:bg-purple-500/20'
    : 'text-slate-700 hover:bg-white/70 hover:text-slate-900 active:bg-white';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center justify-center gap-1 w-10 sm:w-14 h-11 sm:h-16 rounded-xl sm:rounded-2xl transition-all disabled:opacity-25 disabled:cursor-not-allowed ${variant}`}
    >
      {children}
      <span className="hidden sm:inline text-[10px] font-black leading-none uppercase tracking-wider">{label}</span>
    </motion.button>
  );
}

function PopoverHeader({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
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
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-30 ${wide ? 'w-[min(92vw,400px)]' : 'w-[min(88vw,340px)]'} p-4 rounded-3xl`}
      style={{
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(24px) saturate(200%)',
        boxShadow: '0 24px 60px rgba(76,29,149,0.25), 0 8px 20px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
      }}
    >
      {children}
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }} />
    </motion.div>
  );
}