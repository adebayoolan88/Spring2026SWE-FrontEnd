import React, { useEffect, useMemo, useState } from "react";
import NavBar from "./components/layout/NavBar";
import CategoryNav from "./components/layout/CategoryNav";
import ItemCard from "./components/ui/ItemCard";
import AuthModal from "./components/ui/AuthModal";
import CartPanel from "./components/ui/CartPanel";
import ProductDetailsModal from "./components/ui/ProductDetailsModal";
import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  logoutUser,
} from "./lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const ITEMS_PER_PAGE = 10;
const MAX_PAGE_COUNT = 5;

const getCartStorageKey = (userId) => `noteswap_cart_${userId}`;

const addItemToCartList = (currentCart, product) => {
  const stockLimit =
    Number(product.quantity) > 0 ? Number(product.quantity) : Number.POSITIVE_INFINITY;

  const existingItem = currentCart.find((item) => item.id === product.id);

  if (existingItem) {
    return currentCart.map((item) =>
      item.id === product.id
        ? {
            ...item,
            cartQuantity: Math.min(item.cartQuantity + 1, stockLimit),
          }
        : item
    );
  }

  return [
    ...currentCart,
    {
      ...product,
      cartQuantity: 1,
    },
  ];
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);

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

        const normalizedProducts = data.map((item) => ({
          ...item,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
          image:
            item.image ||
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
          category: item.category || "Accessories",
          condition: "New",
          description: item.description || "",
          brand: item.brand || "",
          availabilityStatus: item.availabilityStatus || "",
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
        clearStoredToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    restoreUser();
  }, []);

  useEffect(() => {
    if (!currentUser?.userId) {
      setCartItems([]);
      return;
    }

    const storedCart = localStorage.getItem(getCartStorageKey(currentUser.userId));

    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.userId) return;

    localStorage.setItem(
      getCartStorageKey(currentUser.userId),
      JSON.stringify(cartItems)
    );
  }, [cartItems, currentUser]);

  useEffect(() => {
    if (!currentUser || !pendingCartItem) return;

    setCartItems((prev) => addItemToCartList(prev, pendingCartItem));
    setPendingCartItem(null);
    setCartOpen(true);
  }, [currentUser, pendingCartItem]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      clearStoredToken();
      setCurrentUser(null);
      setCartItems([]);
      setPendingCartItem(null);
    }
  };

  const handleAddToCart = (product) => {
    if (!currentUser) {
      setPendingCartItem(product);
      setSelectedItem(null);
      setAuthMode("login");
      return;
    }

    setCartItems((prev) => addItemToCartList(prev, product));
    setSelectedItem(null);
    setCartOpen(true);
  };

  const handleIncreaseCartQuantity = (productId) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const stockLimit =
          Number(item.quantity) > 0 ? Number(item.quantity) : Number.POSITIVE_INFINITY;

        return {
          ...item,
          cartQuantity: Math.min(item.cartQuantity + 1, stockLimit),
        };
      })
    );
  };

  const handleDecreaseCartQuantity = (productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, cartQuantity: item.cartQuantity - 1 }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const displayedItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    let results = products.filter((item) => {
      const matchesSearch =
        !query ||
        [item.name, item.category, item.description, item.brand, String(item.quantity)]
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
    } else if (sortOption === "quantity-low-high") {
      results = [...results].sort((a, b) => a.quantity - b.quantity);
    } else if (sortOption === "quantity-high-low") {
      results = [...results].sort((a, b) => b.quantity - a.quantity);
    }

    return results;
  }, [products, searchTerm, selectedCategory, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOption]);

  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGE_COUNT, Math.ceil(displayedItems.length / ITEMS_PER_PAGE))
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayedItems.slice(startIndex, endIndex);
  }, [displayedItems, currentPage]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.cartQuantity, 0),
    [cartItems]
  );

  const isOverlayOpen = authMode || cartOpen || selectedItem;

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
          cartCount={cartCount}
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
                <option value="quantity-low-high">Quantity: Low to High</option>
                <option value="quantity-high-low">Quantity: High to Low</option>
              </select>
            </div>
          </section>

          {productsLoading || authChecking ? (
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
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onViewItem={setSelectedItem}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = currentPage === pageNumber;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOpenLogin={() => setAuthMode("login")}
        onOpenSignup={() => setAuthMode("signup")}
        onIncreaseQuantity={handleIncreaseCartQuantity}
        onDecreaseQuantity={handleDecreaseCartQuantity}
        onRemoveItem={handleRemoveCartItem}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
          onAuthSuccess={setCurrentUser}
        />
      )}

      {selectedItem && (
        <ProductDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}