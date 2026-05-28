import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Trash2, Palette, Sparkles, Brush, Ruler } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

/**
 * Pro floating toolbar overlay untuk canvas Drawing Studio.
 * Style: dark glass macam Procreate/Figma — setiap button ada label + preview.
 * Satu tap = popover muncul TERUS ATAS button yang ditekan.
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
    <div ref={rootRef} className="relative">
      <div
        className="flex items-stretch gap-1 p-1.5 rounded-[1.75rem]"
        style={{
          background: 'linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
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
              <PopoverHeader icon={<Brush className="w-3 h-3" />}>Pilih Alat ({tools.length})</PopoverHeader>
              <div className="grid grid-cols-4 gap-1.5">
                {tools.map((t) => {
                  const active = tool.id === t.id && !stickerMode;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { onToolChange(t); setOpenPopover(null); }}
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'}`}
                      title={t.hint}
                    >
                      <span className="text-2xl leading-none">{t.emoji}</span>
                      <span className="text-[9px] font-bold leading-tight text-center">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">{tool.hint}</p>
            </Popover>
          }
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/10 ring-1 ring-white/10">
            <span className="text-lg leading-none">{tool.emoji}</span>
          </div>
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
              <PopoverHeader icon={<Ruler className="w-3 h-3" />}>Saiz Brush</PopoverHeader>
              <div className="grid grid-cols-4 gap-1.5">
                {brushSizes.map((s) => {
                  const active = brushSize.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { onSizeChange(s); setOpenPopover(null); }}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/10 ring-1 ring-white/10">
            <span className="inline-block rounded-full bg-white" style={{ width: Math.min(brushSize.dot, 16), height: Math.min(brushSize.dot, 16) }} />
          </div>
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
                <PopoverHeader icon={<Palette className="w-3 h-3" />}>Palet Warna</PopoverHeader>
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
                            ? '0 0 0 2.5px #ffffff, 0 0 0 5px #8b5cf6, 0 4px 12px rgba(139,92,246,0.4)'
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
              className="w-7 h-7 rounded-xl ring-1 ring-white/20"
              style={{
                backgroundColor: colorSwatch,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.2)',
              }}
            />
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
                <PopoverHeader icon={<Sparkles className="w-3 h-3" />}>Tampal Sticker</PopoverHeader>
                <p className="text-[11px] text-slate-500 font-medium mb-2">Tekan sticker, kemudian tap canvas.</p>
                <div className="grid grid-cols-6 gap-2">
                  {stickers.map((s) => {
                    const active = stickerMode === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { onStickerToggle(s); setOpenPopover(null); }}
                        className={`aspect-square rounded-2xl text-2xl transition flex items-center justify-center hover:scale-110 ${active ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Popover>
            }
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/10 ring-1 ring-white/10">
              <span className="text-lg leading-none">{stickerMode || '✨'}</span>
            </div>
          </ProToolButton>
        )}

        {/* DIVIDER */}
        <div className="self-center w-px h-8 bg-white/15 mx-0.5" />

        {/* ACTIONS */}
        <ActionButton onClick={onUndo} disabled={!canUndo} label="Undo">
          <Undo2 className="w-4 h-4" />
        </ActionButton>
        <ActionButton onClick={onClear} label="Kosong" danger>
          <Trash2 className="w-4 h-4" />
        </ActionButton>

        {/* SAVE — primary CTA */}
        <button
          type="button"
          onClick={onSave}
          title="Simpan"
          className="ml-0.5 h-12 px-3 sm:px-4 rounded-2xl inline-flex items-center gap-1.5 font-black text-xs sm:text-sm text-white shadow-lg transition hover:scale-[1.03] active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            boxShadow: '0 8px 20px rgba(168,85,247,0.45), 0 1px 0 rgba(255,255,255,0.2) inset',
          }}
        >
          <Download className="w-4 h-4" strokeWidth={2.8} />
          <span className="hidden sm:inline">Simpan</span>
        </button>
      </div>
    </div>
  );
}

function ProToolButton({ active, isActive, onClick, label, icon, children, popover, popoverOpen }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        title={label}
        className={`group relative flex flex-col items-center justify-center gap-0.5 w-14 sm:w-16 h-12 rounded-2xl transition ${
          active ? 'bg-white/15 ring-1 ring-white/25' : 'hover:bg-white/8'
        }`}
      >
        {children}
        <span className={`flex items-center gap-0.5 text-[9px] font-bold leading-none mt-0.5 ${isActive ? 'text-white' : 'text-white/60'}`}>
          <span className="opacity-70">{icon}</span>
          <span className="truncate max-w-[3rem]">{label}</span>
        </span>
      </button>
      <AnimatePresence>{popoverOpen && popover}</AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, disabled, label, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center justify-center gap-0.5 w-12 sm:w-14 h-12 rounded-2xl transition disabled:opacity-25 disabled:cursor-not-allowed ${
        danger ? 'text-red-300 hover:bg-red-500/15 hover:text-red-200' : 'text-white/85 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
      <span className="text-[9px] font-bold leading-none">{label}</span>
    </button>
  );
}

function PopoverHeader({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-2.5">
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
        boxShadow: '0 16px 40px rgba(15,23,42,0.2), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      {children}
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }} />
    </motion.div>
  );
}