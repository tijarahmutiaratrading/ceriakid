import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Trash2, Palette, Sparkles, Brush, Ruler } from 'lucide-react';
import CustomColorPicker from './CustomColorPicker';

/**
 * Clean iOS Notes-style floating toolbar.
 * Pure white pill, mono icons, even spacing, no labels under icons.
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
  const isEraser = tool.id === 'eraser';
  const colorSwatch = isEraser ? '#fff9f0' : color;

  return (
    <div ref={rootRef} className="relative max-w-[calc(100vw-1rem)]">
      <div
        className="relative flex items-center gap-1 px-2 py-1.5 rounded-full"
        style={{
          background: '#ffffff',
          boxShadow: '0 8px 24px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06), 0 0 0 0.5px rgba(15,23,42,0.06)',
        }}
      >
        {/* TOOL */}
        <IconButton
          active={openPopover === 'tool'}
          onClick={() => togglePopover('tool')}
          label={tool.label}
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
                      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
          <span className="text-lg leading-none">{tool.emoji}</span>
        </IconButton>

        {/* SIZE */}
        <IconButton
          active={openPopover === 'size'}
          onClick={() => togglePopover('size')}
          label={brushSize.label}
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
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
          <span className="inline-block rounded-full bg-slate-800" style={{ width: Math.min(brushSize.dot, 14), height: Math.min(brushSize.dot, 14) }} />
        </IconButton>

        {/* COLOR */}
        {!isEraser && (
          <IconButton
            active={openPopover === 'color'}
            onClick={() => togglePopover('color')}
            label="Warna"
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
                            ? '0 0 0 2.5px #ffffff, 0 0 0 5px #0f172a, 0 4px 12px rgba(15,23,42,0.3)'
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
            <span
              className="w-5 h-5 rounded-full"
              style={{
                backgroundColor: colorSwatch,
                boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.95), 0 0 0 1px rgba(15,23,42,0.15)',
              }}
            />
          </IconButton>
        )}

        {/* STICKER */}
        {showStickers && (
          <IconButton
            active={openPopover === 'sticker' || !!stickerMode}
            onClick={() => togglePopover('sticker')}
            label="Sticker"
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
                        className={`aspect-square rounded-2xl text-2xl transition flex items-center justify-center hover:scale-110 ${active ? 'bg-slate-900 shadow-md scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Popover>
            }
          >
            <span className="text-lg leading-none">{stickerMode || '✨'}</span>
          </IconButton>
        )}

        {/* DIVIDER */}
        <div className="w-px h-6 bg-slate-200 mx-0.5" />

        {/* ACTIONS */}
        <IconButton onClick={onUndo} disabled={!canUndo} label="Undo">
          <Undo2 className="w-[18px] h-[18px] text-slate-700" strokeWidth={2} />
        </IconButton>
        <IconButton onClick={onClear} label="Kosong" danger>
          <Trash2 className="w-[18px] h-[18px] text-slate-700" strokeWidth={2} />
        </IconButton>
        <IconButton onClick={onSave} label="Simpan">
          <Download className="w-[18px] h-[18px] text-slate-700" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({ active, onClick, label, disabled, danger, children, popover, popoverOpen }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition disabled:opacity-25 disabled:cursor-not-allowed ${
          active ? 'bg-slate-100' : danger ? 'hover:bg-red-50' : 'hover:bg-slate-100'
        }`}
      >
        {children}
      </button>
      <AnimatePresence>{popoverOpen && popover}</AnimatePresence>
    </div>
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
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-white" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }} />
    </motion.div>
  );
}