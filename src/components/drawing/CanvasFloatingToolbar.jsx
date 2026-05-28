import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Undo2, Trash2 } from 'lucide-react';

/**
 * Floating toolbar overlay untuk canvas Drawing Studio.
 * Sticky di bawah canvas. Satu tap = popover muncul TERUS ATAS button yang ditekan
 * (anchored ke button, bukan center toolbar).
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
  const [openPopover, setOpenPopover] = useState(null); // 'tool' | 'size' | 'color' | 'sticker' | null
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
  const colorBorder = tool.id === 'eraser' ? '1.5px dashed #cbd5e1' : '1.5px solid rgba(0,0,0,0.15)';

  return (
    <div ref={rootRef} className="relative">
      <div
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1.5 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.8) inset, 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        {/* TOOL */}
        <PopoverButton
          active={openPopover === 'tool'}
          onClick={() => togglePopover('tool')}
          label={tool.label}
          popoverOpen={openPopover === 'tool'}
          popover={
            <Popover>
              <PopoverHeader>Pilih Alat</PopoverHeader>
              <div className="grid grid-cols-5 gap-1.5">
                {tools.map((t) => {
                  const active = tool.id === t.id && !stickerMode;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { onToolChange(t); setOpenPopover(null); }}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 transition ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      title={t.hint}
                    >
                      <span className="text-xl leading-none">{t.emoji}</span>
                      <span className="text-[9px] font-bold leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </Popover>
          }
        >
          <span className="text-xl leading-none">{tool.emoji}</span>
        </PopoverButton>

        {/* SIZE */}
        <PopoverButton
          active={openPopover === 'size'}
          onClick={() => togglePopover('size')}
          label={brushSize.label}
          popoverOpen={openPopover === 'size'}
          popover={
            <Popover>
              <PopoverHeader>Saiz Brush</PopoverHeader>
              <div className="grid grid-cols-4 gap-1.5">
                {brushSizes.map((s) => {
                  const active = brushSize.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { onSizeChange(s); setOpenPopover(null); }}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <span className="rounded-full" style={{ width: s.dot, height: s.dot, backgroundColor: active ? '#ffffff' : '#94a3b8' }} />
                      <span className="text-[10px] font-semibold">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </Popover>
          }
        >
          <span className="inline-block rounded-full" style={{ width: brushSize.dot, height: brushSize.dot, backgroundColor: '#0f172a' }} />
        </PopoverButton>

        {/* COLOR */}
        {tool.id !== 'eraser' && (
          <PopoverButton
            active={openPopover === 'color'}
            onClick={() => togglePopover('color')}
            label="Warna"
            popoverOpen={openPopover === 'color'}
            popover={
              <Popover>
                <PopoverHeader>Palet Warna</PopoverHeader>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((c) => {
                    const active = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { onColorChange(c); setOpenPopover(null); }}
                        className="aspect-square rounded-full transition"
                        style={{
                          backgroundColor: c,
                          boxShadow: active
                            ? '0 0 0 2.5px #ffffff, 0 0 0 5px #0f172a, 0 4px 12px rgba(15,23,42,0.18)'
                            : '0 1px 2px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(0,0,0,0.08)',
                        }}
                        aria-label={`Warna ${c}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-3 rounded-2xl p-2 bg-slate-50 ring-1 ring-black/5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-900">Warna custom</p>
                    <p className="text-[10px] text-slate-500">Pilih sebarang warna</p>
                  </div>
                  <div className="w-7 h-7 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
                </div>
              </Popover>
            }
          >
            <span className="inline-block w-5 h-5 rounded-full" style={{ backgroundColor: colorSwatch, border: colorBorder }} />
          </PopoverButton>
        )}

        {/* STICKER */}
        {showStickers && (
          <PopoverButton
            active={openPopover === 'sticker' || !!stickerMode}
            onClick={() => togglePopover('sticker')}
            label="Sticker"
            popoverOpen={openPopover === 'sticker'}
            popover={
              <Popover>
                <PopoverHeader>Tampal Sticker</PopoverHeader>
                <p className="text-[11px] text-slate-500 mb-2">Tekan sticker, kemudian tap canvas untuk tampal.</p>
                <div className="grid grid-cols-6 gap-2">
                  {stickers.map((s) => {
                    const active = stickerMode === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { onStickerToggle(s); setOpenPopover(null); }}
                        className={`aspect-square rounded-2xl text-2xl transition flex items-center justify-center ${active ? 'bg-slate-900 shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Popover>
            }
          >
            <span className="text-xl leading-none">{stickerMode || '✨'}</span>
          </PopoverButton>
        )}

        <span className="w-px h-7 bg-slate-200 mx-0.5 sm:mx-1" />

        {/* ACTIONS */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClear}
          title="Kosongkan"
          className="w-10 h-10 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onSave}
          title="Simpan"
          className="h-10 px-3.5 sm:px-4 rounded-full inline-flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md hover:bg-slate-800 transition"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Simpan</span>
        </button>
      </div>
    </div>
  );
}

function PopoverButton({ active, onClick, label, children, popover, popoverOpen }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        title={label}
        className={`relative flex items-center justify-center w-12 sm:w-14 h-10 rounded-full transition ${active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
      >
        {children}
      </button>
      <AnimatePresence>
        {popoverOpen && popover}
      </AnimatePresence>
    </div>
  );
}

function PopoverHeader({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">{children}</p>;
}

function Popover({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-30 w-[min(88vw,340px)] p-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 12px 32px rgba(15,23,42,0.16), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </motion.div>
  );
}