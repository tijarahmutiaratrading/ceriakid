import React from 'react';
import { Calendar } from 'lucide-react';

export const DATE_RANGES = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'yesterday', label: 'Semalam' },
  { key: '7days', label: '7 Hari' },
  { key: 'thisMonth', label: 'Bulan Ini' },
  { key: 'lastMonth', label: 'Bulan Lepas' },
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
// PENTING: Base44 SDK return datetime tanpa 'Z' suffix (e.g. "2026-06-05T16:51:59.203000")
// Browser parse ini sebagai LOCAL time bukan UTC — kena tambah 'Z' dulu!
function toDateMY(val) {
  if (!val) return null;
  let str = val instanceof Date ? val.toISOString() : String(val);
  // Kalau tiada timezone suffix, tambah 'Z' supaya parse sebagai UTC
  if (!/[Z+\-]\d*$/.test(str.trim())) str = str.trim() + 'Z';
  const d = new Date(str);
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
    case 'thisMonth': {
      // Bulan semasa: dari hari pertama bulan ini hingga hari ini
      const firstOfMonth = today.slice(0, 8) + '01';
      return dateMY >= firstOfMonth && dateMY <= today;
    }
    case 'lastMonth': {
      // Bulan lepas: dari hari pertama hingga hari terakhir bulan sebelum ini
      const firstOfThisMonth = today.slice(0, 8) + '01';
      const lastOfLastMonth = shiftDate(firstOfThisMonth, -1);
      const firstOfLastMonth = lastOfLastMonth.slice(0, 8) + '01';
      return dateMY >= firstOfLastMonth && dateMY <= lastOfLastMonth;
    }
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