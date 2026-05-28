import React, { useState, useEffect } from 'react';

// Hex ↔ RGB helpers
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const rgbToHex = (r, g, b) => {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const isValidHex = (s) => /^#?[0-9a-fA-F]{6}$/.test(s.trim());

/**
 * Custom color picker — RGB sliders + hex input + native color wheel.
 * Real-time sync: tukar slider → hex update, tukar hex → slider update.
 */
export default function CustomColorPicker({ color, onChange }) {
  const [rgb, setRgb] = useState(() => hexToRgb(color));
  const [hexInput, setHexInput] = useState(color);

  // Sync bila parent tukar color (e.g. user click swatch)
  useEffect(() => {
    setRgb(hexToRgb(color));
    setHexInput(color);
  }, [color]);

  const updateChannel = (channel, value) => {
    const next = { ...rgb, [channel]: Number(value) };
    setRgb(next);
    const hex = rgbToHex(next.r, next.g, next.b);
    setHexInput(hex);
    onChange(hex);
  };

  const handleHexChange = (val) => {
    setHexInput(val);
    const clean = val.startsWith('#') ? val : `#${val}`;
    if (isValidHex(clean)) {
      const next = hexToRgb(clean);
      setRgb(next);
      onChange(clean.toLowerCase());
    }
  };

  const channels = [
    { key: 'r', label: 'R', track: `linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))` },
    { key: 'g', label: 'G', track: `linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))` },
    { key: 'b', label: 'B', track: `linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))` },
  ];

  return (
    <div className="rounded-2xl p-3 bg-gradient-to-br from-purple-50 to-pink-50 ring-1 ring-purple-100 space-y-2.5">
      <div className="flex items-center gap-2.5">
        {/* Native color wheel button */}
        <label className="relative cursor-pointer flex-shrink-0">
          <input
            type="color"
            value={color}
            onChange={(e) => handleHexChange(e.target.value)}
            className="sr-only"
          />
          <div
            className="w-12 h-12 rounded-2xl ring-2 ring-white shadow-md"
            style={{ backgroundColor: color }}
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow text-[10px] flex items-center justify-center">🎨</span>
        </label>

        {/* Hex input */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1">Kod Hex</p>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            maxLength={7}
            placeholder="#000000"
            className="w-full px-2.5 py-1.5 rounded-lg bg-white ring-1 ring-slate-200 font-mono text-sm font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* RGB sliders */}
      <div className="space-y-1.5">
        {channels.map((c) => (
          <div key={c.key} className="flex items-center gap-2">
            <span className="w-4 text-[11px] font-black text-slate-700">{c.label}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={rgb[c.key]}
              onChange={(e) => updateChannel(c.key, e.target.value)}
              className="flex-1 h-2.5 rounded-full appearance-none cursor-pointer rgb-slider"
              style={{ background: c.track }}
            />
            <span className="w-8 text-right text-[10px] font-mono font-bold text-slate-600 tabular-nums">{rgb[c.key]}</span>
          </div>
        ))}
      </div>

      <style>{`
        .rgb-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid rgba(0,0,0,0.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
        }
        .rgb-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid rgba(0,0,0,0.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}