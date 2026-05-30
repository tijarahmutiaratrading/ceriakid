import React from 'react';
import { Search, X } from 'lucide-react';

export default function DrawerSearchBar({ value, onChange, onClear }) {
  return (
    <div className="px-3 pt-3 pb-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari menu..."
          aria-label="Cari menu"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold placeholder-white/45 focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Kosongkan carian"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}