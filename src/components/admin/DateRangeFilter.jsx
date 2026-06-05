import React from 'react';
import { Calendar } from 'lucide-react';

export const DATE_RANGES = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'yesterday', label: 'Semalam' },
  { key: '7days', label: '7 Hari' },
  { key: '30days', label: '30 Hari' },
  { key: 'all', label: 'Semua' },
];

// Dapat tarikh hari ini dalam Malaysia (MYT = UTC+8), format YYYY-MM-DD
function getTodayMY() {
  const myt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return myt.toISOString().slice(0, 10);
}

// Tolak/tambah hari dari tarikh YYYY-MM-DD string
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Convert timestamp ke tarikh MYT (YYYY-MM-DD)
function toDateMY(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return null;
  const myt = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return myt.toISOString().slice(0, 10);
}

// Check sama ada timestamp jatuh dalam range yang dipilih
export function isInRange(val, key) {
  if (key === 'all') return true;
  // Kalau tiada nilai, masukkan dalam semua range supaya tak hilang
  if (!val) return true;
  const dateMY = toDateMY(val);
  if (!dateMY) return true;

  const today = getTodayMY();
  const yesterday = shiftDate(today, -1);

  switch (key) {
    case 'today':
      return dateMY === today;
    case 'yesterday':
      return dateMY === yesterday;
    case '7days':
      return dateMY >= shiftDate(today, -6) && dateMY <= today;
    case '30days':
      return dateMY >= shiftDate(today, -29) && dateMY <= today;
    default:
      return true;
  }
}

// Eksport untuk debug
export function getTodayMYDebug() {
  return getTodayMY();
}
export function toDateMYDebug(val) {
  return toDateMY(val);
}

export default function DateRangeFilter({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
        <Calendar className="w-3.5 h-3.5" />
        <span>Tempoh</span>
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
        {DATE_RANGES.map(r => {
          const active = value === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onChange(r.key)}
              className={`relative px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}