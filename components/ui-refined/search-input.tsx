'use client';

import React, { memo } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchInput = memo(function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  className = '',
  ...props
}: SearchInputProps) {
  function handleClear() {
    onChange('');
    if (onClear) onClear();
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        {...props}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
});
export default SearchInput;
