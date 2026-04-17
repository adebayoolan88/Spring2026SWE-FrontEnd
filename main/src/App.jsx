import React, { useMemo, useState } from "react";
import NavBar from "./components/layout/NavBar";
import CategoryNav from "./components/layout/CategoryNav";
import ItemCard from "./components/ui/ItemCard";
import AuthModal from "./components/ui/AuthModal";
import CartPanel from "./components/ui/CartPanel";
import { ITEMS } from "./data/items";

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return ITEMS.filter((item) => {
      const matchesSearch =
        !query ||
        [item.name, item.category, item.location, item.condition]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        !selectedCategory ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const isOverlayOpen = authMode || cartOpen;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className={isOverlayOpen ? "pointer-events-none select-none blur-[4px]" : ""}>
        <NavBar
          onOpenLogin={() => setAuthMode("login")}
          onOpenSignup={() => setAuthMode("signup")}
          onOpenCart={() => setCartOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <CategoryNav
          items={ITEMS}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onSelectCategory={setSelectedCategory}
          onSelectListing={(item) => {
            setSelectedCategory(item.category);
            setSearchTerm(item.name);
          }}
          onClearCategory={() => {
            setSelectedCategory("");
            setSearchTerm("");
          }}
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Items on sale
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {selectedCategory ? `${selectedCategory} Listings` : "Browse current listings"}
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Showing {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
            </p>
          </section>

          {filteredItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No items found</h3>
              <p className="mt-2 text-slate-500">
                Try searching for another category or keyword.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />

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