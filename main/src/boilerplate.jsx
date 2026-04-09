import React, { useMemo, useState } from "react";
import { Search, MapPin, Heart, ShoppingCart, LogIn, UserPlus } from "lucide-react";

const ITEMS = [
  {
    id: 1,
    name: "Fender Stratocaster",
    category: "Guitar",
    price: 1199,
    location: "New York, NY",
    condition: "Excellent",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Martin Acoustic Guitar",
    category: "Guitar",
    price: 899,
    location: "Austin, TX",
    condition: "Very Good",
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Roland RD-2000 Keyboard",
    category: "Keyboard",
    price: 1699,
    location: "Chicago, IL",
    condition: "Excellent",
    image:
      "https://images.unsplash.com/photo-1514119412350-e174d90d280e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Pearl Drum Set",
    category: "Drums",
    price: 549,
    location: "Nashville, TN",
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Shure SM7B Microphone",
    category: "Audio",
    price: 399,
    location: "Los Angeles, CA",
    condition: "New",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Yamaha MODX8",
    category: "Keyboard",
    price: 1099,
    location: "Seattle, WA",
    condition: "New",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80",
  },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-500 px-3 py-2 text-lg font-bold text-white shadow-sm">
            NS
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">NoteSwap</p>
            <p className="text-xs text-slate-500">Buy. Sell. Play.</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#" className="transition hover:text-slate-900">Browse</a>
          <a href="#" className="transition hover:text-slate-900">Sell</a>
          <a href="#" className="transition hover:text-slate-900">Deals</a>
          <a href="#" className="transition hover:text-slate-900">Blog</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <LogIn className="h-4 w-4" />
            Login
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600">
            <UserPlus className="h-4 w-4" />
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search instruments, categories, or brands..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <button className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600">
        Search
      </button>
    </div>
  );
}

function ItemCard({ item }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm">
          <Heart className="h-4 w-4" />
        </button>
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {item.condition}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              {item.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h3>
          </div>
          <p className="text-lg font-bold text-slate-900">${item.price}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          <ShoppingCart className="h-4 w-4" />
          View Item
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return ITEMS;

    return ITEMS.filter((item) =>
      [item.name, item.category, item.location, item.condition]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-8 rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-12 text-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              Musical marketplace
            </span>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Find the gear that matches your sound.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Browse instruments, compare listings, and discover great deals from musicians across the country.
            </p>

            <div className="mt-8 max-w-3xl">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-[28px] bg-white p-5 text-slate-900">
                <div className="mb-4 h-64 overflow-hidden rounded-[24px] bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80"
                    alt="Featured instrument"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-orange-500">Featured Listing</p>
                    <h2 className="text-xl font-bold">Gibson Les Paul Studio</h2>
                    <p className="mt-1 text-sm text-slate-500">Used • Verified Seller</p>
                  </div>
                  <p className="text-2xl font-bold">$1,099</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Items on sale
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Browse current listings
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Showing {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No items found</h3>
              <p className="mt-2 text-slate-500">
                Try searching for guitars, drums, keyboards, or another keyword.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
