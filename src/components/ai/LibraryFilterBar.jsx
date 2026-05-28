import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable filter + search bar untuk semua AI library.
 *
 * Props:
 * - search: string — current search text
 * - onSearchChange: (val) => void
 * - filters: Array<{ key, label, value, options: [{ value, label }] }>
 *   Setiap filter ialah dropdown.
 * - onFilterChange: (key, value) => void
 * - totalCount: number (jumlah selepas filter)
 * - searchPlaceholder?: string
 */
export default function LibraryFilterBar({
  search = '',
  onSearchChange,
  filters = [],
  onFilterChange,
  totalCount = 0,
  searchPlaceholder = 'Cari...',
}) {
  const hasActiveFilter = search.trim() !== '' || filters.some(f => f.value && f.value !== 'all');

  const clearAll = () => {
    onSearchChange?.('');
    filters.forEach(f => onFilterChange?.(f.key, 'all'));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-3 space-y-2">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-9 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 bg-slate-50"
        />
        {search && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter dropdowns + clear */}
      {(filters.length > 0 || hasActiveFilter) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <select
              key={f.key}
              value={f.value || 'all'}
              onChange={(e) => onFilterChange?.(f.key, e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="all">{f.label}: Semua</option>
              {f.options.map(opt => (
                <option key={opt.value} value={opt.value}>{f.label}: {opt.label}</option>
              ))}
            </select>
          ))}

          {hasActiveFilter && (
            <button
              onClick={clearAll}
              className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 px-2 py-1"
            >
              Reset
            </button>
          )}

          <span className="ml-auto text-[10px] font-black uppercase text-slate-500">
            {totalCount} hasil
          </span>
        </div>
      )}
    </div>
  );
}