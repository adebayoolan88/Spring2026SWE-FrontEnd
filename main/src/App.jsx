import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import CategoryNav from "./components/layout/CategoryNav";
import ItemCard from "./components/ui/ItemCard";
import CartPanel from "./components/ui/CartPanel";
import AuthModal from "./components/ui/AuthModal";
import ProductDetailsModal from "./components/ui/ProductDetailsModal";

// Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Deals from "./pages/Deals";
import About from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  logoutUser,
} from "./lib/auth";

// Base URL for backend API calls.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function App() {
  // Main inventory state pulled from the backend.
  const [products, setProducts] = useState([]);

  // Loading and error states for products.
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // Auth state.
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // UI/filter state.
  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  
  // Which product is currently open in the product details modal.
  const [selectedItem, setSelectedItem] = useState(null);

  // Load products from the backend once when the app mounts.
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const response = await fetch(`${API_BASE_URL}/database/products`);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        // Normalize backend data so the UI always has consistent fields.
        const normalizedProducts = data.map((item) => ({
          ...item,
          price: Number(item.price) || 0,
          image:
            item.image ||
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
          category: item.category || "Accessories",
          condition: item.condition || "Unknown",
          description: item.description || "",
          brand: item.brand || "",
          itemType: item.itemType || "",
          availabilityStatus: item.availabilityStatus || "",
          seller: item.seller || "",
          sku: item.sku || "",
          listingDate: item.listingDate || "",
        }));

        setProducts(normalizedProducts);
      } catch (err) {
        console.error(err);
        setProductsError("Could not load inventory from the database.");
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Try to restore the logged-in user from a saved token.
  useEffect(() => {
    const restoreUser = async () => {
      const token = getStoredToken();

      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const result = await fetchCurrentUser(token);
        setCurrentUser(result.user);
      } catch (err) {
        // If token is bad or expired, clear it out.
        clearStoredToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    restoreUser();
  }, []);

  // Logout handler passed into NavBar.
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      clearStoredToken();
      setCurrentUser(null);
    }
  };

  // This memoized list is the final version of products the user sees.
  // It applies search, category filtering, and sorting.
  const displayedItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    let results = products.filter((item) => {
      const matchesSearch =
        !query ||
        [item.name, item.category, item.condition, item.description, item.brand]
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

  // If any overlay is open, blur the main page behind it.
  const isOverlayOpen = authMode || cartOpen || selectedItem;

  // Loading state while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900">Loading...</h3>
          <p className="mt-2 text-slate-500">Please wait while the page finishes loading.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className={isOverlayOpen ? "pointer-events-none select-none blur-[4px]" : ""}>
        <NavBar
          onOpenLogin={() => setAuthMode("login")}
          onOpenSignup={() => setAuthMode("signup")}
          onOpenCart={() => setCartOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <CategoryNav
          items={products}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onSelectCategory={setSelectedCategory}
          onSelectListing={(item) => {
            // Clicking a listing in the dropdown narrows by category and item name.
            setSelectedCategory(item.category);
            setSearchTerm(item.name);
          }}
          onClearCategory={() => {
            // Reset back to full inventory.
            setSelectedCategory("");
            setSearchTerm("");
          }}
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Inventory header section */}
          <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Items on sale
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {selectedCategory ? `${selectedCategory} Listings` : "Browse current listings"}
              </h1>
            </div>

            {/* Count + sorting controls */}
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

          {/* Main content switches between loading, error, empty state, and actual product grid */}
          {productsLoading ? (
            <div className="rounded-[28px] bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Loading...</h3>
              <p className="mt-2 text-slate-500">Please wait while the page finishes loading.</p>
            </div>
          ) : productsError ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-red-700">Unable to load products</h3>
              <p className="mt-2 text-red-600">{productsError}</p>
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
                <ItemCard
                  key={item.id}
                  item={item}
                  onViewItem={setSelectedItem}
                />
              ))}
            </div>
          )}
        </main>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>

        <Footer />
      </div>

      {/* Right-side shopping cart panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />

      {/* Auth modal for login/signup */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
          onAuthSuccess={setCurrentUser}
        />
      )}

      {/* Product details modal for "View Item" */}
      {selectedItem && (
        <ProductDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}