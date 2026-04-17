import React, { useEffect, useMemo, useState } from "react";
import NavBar from "./components/layout/NavBar";
import CategoryNav from "./components/layout/CategoryNav";
import ItemCard from "./components/ui/ItemCard";
import AuthModal from "./components/ui/AuthModal";
import CartPanel from "./components/ui/CartPanel";

const API_BASE_URL = "http://localhost:5001";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/database/products`);

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        const normalizedProducts = data.map((item) => ({
          ...item,
          price: Number(item.price) || 0,
          image:
            item.image ||
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
          location: item.location || "San Antonio, TX",
          condition: item.condition || "Unknown",
          category: item.category || "Accessories",
        }));

        setProducts(normalizedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load inventory from the database.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayedItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    let results = products.filter((item) => {
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

    if (sortOption === "price-low-high") {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high-low") {
      results = [...results].sort((a, b) => b.price - a.price);
    }

    return results;
  }, [products, searchTerm, selectedCategory, sortOption]);

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
          items={products}
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Showing {displayedItems.length} item{displayedItems.length === 1 ? "" : "s"}
              </p>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none"
              >
                <option value="default">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </section>

          {loading ? (
            <div className="rounded-[28px] bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Loading inventory...</h3>
              <p className="mt-2 text-slate-500">Please wait while products are fetched.</p>
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-red-700">Unable to load products</h3>
              <p className="mt-2 text-red-600">{error}</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No items found</h3>
              <p className="mt-2 text-slate-500">
                Try searching for another category or keyword.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedItems.map((item) => (
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