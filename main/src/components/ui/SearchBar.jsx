import { Search } from "lucide-react";

function SearchBar({ value, onChange }) {
  return (
    // Reusable search bar component.
    // This component takes its value and onChange from a parent so it stays controlled.
    <div className="search-bar flex w-full flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search instruments, categories, or brands..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Visual search button.
          In the current app, live filtering mostly happens as the user types. */}
      <button className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600">
        Search
      </button>
    </div>
  );
}

export default SearchBar;