import { SearchIcon, XIcon } from "lucide-react";

function SearchBar({ value, onChange, onClear, placeholder = "Search..." }) {
  return (
    <div className="relative mx-4 mb-2">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-8 text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;