import React, { useMemo, useState } from "react";
import NavBar from "./components/layout/NavBar";
import SearchBar from "./components/ui/SearchBar";
import ItemCard from "./components/ui/ItemCard";
import AuthModal from "./components/ui/AuthModal";
import { ITEMS } from "./data/items";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);

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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className={authMode ? "pointer-events-none select-none blur-[6px]" : ""}>
        <NavBar
          onOpenLogin={() => setAuthMode("login")}
          onOpenSignup={() => setAuthMode("signup")}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-6 rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-[0_25px_60px_rgba(15,23,42,0.22)] lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-center">
              <span className="mb-4 inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
                Musical marketplace
              </span>

              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Find the gear that matches your sound.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
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
                      <p className="text-sm font-semibold text-orange-500">
                        Featured Listing
                      </p>
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

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}