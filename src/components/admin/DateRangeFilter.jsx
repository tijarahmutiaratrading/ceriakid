import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { startOfTodayMY, addDays } from '@/lib/myTime';

export const DATE_RANGES = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'yesterday', label: 'Semalam' },
  { key: '7days', label: '7 Hari' },
  { key: '30days', label: '30 Hari' },
  { key: 'all', label: 'Semua' },
];

// Helper: get start date for a range key (returns null = no filter)
// Semua range kira ikut waktu Malaysia (MYT / UTC+8) — TIDAK bergantung pada timezone browser.
export function getRangeStart(key) {
  const startOfToday = startOfTodayMY();
  switch (key) {
    case 'today':
      return startOfToday;
    case 'yesterday':
      return addDays(startOfToday, -1);
    case '7days':
      return addDays(startOfToday, -6);
    case '30days':
      return addDays(startOfToday, -29);
    case 'all':
    default:
      return null;
  }
}

export function getRangeEnd(key) {
  if (key === 'yesterday') return startOfTodayMY(); // exclusive end = today 00:00 MYT
  return null;
}

// Check if a Date falls inside the selected range
export function isInRange(date, key) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  const start = getRangeStart(key);
  const end = getRangeEnd(key);
  if (start && d < start) return false;
  if (end && d >= end) return false;
  return true;
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