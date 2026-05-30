import React from 'react';
import { Search, X } from 'lucide-react';

export default function DrawerSearchBar({ value, onChange, onClear }) {
  return (
    <div className="px-3 pt-3 pb-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 pointer-events-none" strokeWidth={2.5} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari menu..."
          aria-label="Cari menu"
          className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
          style={{ boxShadow: '0 2px 8px rgba(244, 114, 182, 0.15), 0 0 0 1px rgba(244, 114, 182, 0.15)' }}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Kosongkan carian"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-pink-500 hover:bg-pink-50"
          >
            <X className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}