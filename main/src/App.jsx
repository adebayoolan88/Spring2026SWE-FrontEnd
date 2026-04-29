import React, { useEffect, useMemo, useState } from "react";
import NavBar from "./components/layout/NavBar";
import CategoryNav from "./components/layout/CategoryNav";
import ItemCard from "./components/ui/ItemCard";
import AuthModal from "./components/ui/AuthModal";
import CartPanel from "./components/ui/CartPanel";
import ProductDetailsModal from "./components/ui/ProductDetailsModal";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import MyProfilePage from "./pages/MyProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminDiscountCodesPage from "./pages/admin/AdminDiscountCodesPage";
import AdminSalesPage from "./pages/admin/AdminSalesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import {
  clearStoredToken,
  fetchCurrentUser,
  getStoredToken,
  logoutUser,
} from "./lib/auth";
import {
  createCheckoutSession,
  previewCheckoutPricing,
} from "./lib/payments";
import { checkAdminAccess } from "./lib/admin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
const ITEMS_PER_PAGE = 10;
const MAX_PAGE_COUNT = 5;

const getCartStorageKey = (userId) => `noteswap_cart_${userId}`;

const addItemToCartList = (currentCart, product) => {
  const stockLimit =
    Number(product.quantity) > 0
      ? Number(product.quantity)
      : Number.POSITIVE_INFINITY;

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [authMode, setAuthMode] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [pendingCartItem, setPendingCartItem] = useState(null);

  const [discountCode, setDiscountCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState(null);
  const [discountApplying, setDiscountApplying] = useState(false);
  const [discountApplyError, setDiscountApplyError] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

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
          condition: item.condition || "N/A",
          description: item.description || "",
          brand: item.brand || "",
          availabilityStatus: item.availabilityStatus || "",
          sku: item.sku || "",
          listingDate: item.listingDate || "",
          salePrice:
            item.salePrice === null || item.salePrice === undefined
              ? null
              : Number(item.salePrice),
          isOnSale: Boolean(item.isOnSale),
          isFeatured: Boolean(item.isFeatured),
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
    const verifyAdminAccess = async () => {
      const token = getStoredToken();

      if (!token || !currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        setAdminChecking(true);
        await checkAdminAccess(token);
        setIsAdmin(true);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAdminChecking(false);
      }
    };

    verifyAdminAccess();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.userId) {
      setCartItems([]);
      setDiscountCode("");
      setDiscountPreview(null);
      setDiscountApplyError("");
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

  useEffect(() => {
    setDiscountPreview(null);
    setDiscountApplyError("");
  }, [cartItems]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      clearStoredToken();
      setCurrentUser(null);
      setIsAdmin(false);
      setCartItems([]);
      setPendingCartItem(null);
      setDiscountCode("");
      setDiscountPreview(null);
      setDiscountApplyError("");
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
          Number(item.quantity) > 0
            ? Number(item.quantity)
            : Number.POSITIVE_INFINITY;

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

  const handleDiscountCodeChange = (value) => {
    setDiscountCode(value.toUpperCase());
    setDiscountPreview(null);
    setDiscountApplyError("");
    setCheckoutError("");
  };

  const handleApplyDiscountCode = async () => {
    try {
      if (!currentUser) {
        setCartOpen(false);
        setAuthMode("login");
        return;
      }

      if (!cartItems.length) {
        return;
      }

      const token = getStoredToken();

      if (!token) {
        setCartOpen(false);
        setAuthMode("login");
        return;
      }

      if (!discountCode.trim()) {
        setDiscountApplyError("Enter a discount code first.");
        return;
      }

      setDiscountApplying(true);
      setDiscountApplyError("");
      setCheckoutError("");

      const payload = cartItems.map((item) => ({
        id: item.id,
        quantity: item.cartQuantity,
      }));

      const result = await previewCheckoutPricing(
        token,
        payload,
        discountCode.trim()
      );

      setDiscountPreview(result.pricing || result);
    } catch (err) {
      console.error(err);
      setDiscountPreview(null);
      setDiscountApplyError(err.message || "Failed to apply discount code.");
    } finally {
      setDiscountApplying(false);
    }
  };

  const handleRemoveDiscountCode = () => {
    setDiscountCode("");
    setDiscountPreview(null);
    setDiscountApplyError("");
    setCheckoutError("");
  };

  const handleCheckout = async () => {
    try {
      if (!currentUser) {
        setCartOpen(false);
        setAuthMode("login");
        return;
      }

      if (!cartItems.length) {
        return;
      }

      const token = getStoredToken();

      if (!token) {
        setCartOpen(false);
        setAuthMode("login");
        return;
      }

      setCheckoutLoading(true);
      setCheckoutError("");

      const payload = cartItems.map((item) => ({
        id: item.id,
        quantity: item.cartQuantity,
      }));

      const result = await createCheckoutSession(
        token,
        payload,
        discountCode.trim()
      );

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned");
      }

      window.location.href = result.url;
    } catch (err) {
      console.error(err);
      setCheckoutError(err.message || "Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleClearCartAfterSuccess = () => {
    setCartItems([]);
    setCartOpen(false);
    setDiscountCode("");
    setDiscountPreview(null);
    setDiscountApplyError("");

    if (currentUser?.userId) {
      localStorage.removeItem(getCartStorageKey(currentUser.userId));
    }
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
      results = [...results].sort((a, b) => {
        const aPrice = a.isOnSale && a.salePrice !== null ? a.salePrice : a.price;
        const bPrice = b.isOnSale && b.salePrice !== null ? b.salePrice : b.price;
        return aPrice - bPrice;
      });
    } else if (sortOption === "price-high-low") {
      results = [...results].sort((a, b) => {
        const aPrice = a.isOnSale && a.salePrice !== null ? a.salePrice : a.price;
        const bPrice = b.isOnSale && b.salePrice !== null ? b.salePrice : b.price;
        return bPrice - aPrice;
      });
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

  const currentPath = window.location.pathname;

  if (currentPath === "/checkout/success") {
    if (authChecking) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <h1 className="status-card__title">Loading...</h1>
            <p className="status-card__message">
              Please wait while we prepare your order confirmation.
            </p>
          </div>
        </div>
      );
    }

    return <CheckoutSuccessPage onClearCart={handleClearCartAfterSuccess} />;
  }

  if (currentPath === "/checkout/cancel") {
    return <CheckoutCancelPage />;
  }

  if (currentPath === "/profile") {
    if (authChecking) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <h1 className="status-card__title">Loading...</h1>
            <p className="status-card__message">
              Please wait while we prepare your profile.
            </p>
          </div>
        </div>
      );
    }

    return <MyProfilePage onProfileUpdated={setCurrentUser} />;
  }

  if (currentPath === "/orders") {
    if (authChecking) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <h1 className="status-card__title">Loading...</h1>
            <p className="status-card__message">
              Please wait while we load your orders.
            </p>
          </div>
        </div>
      );
    }

    return <MyOrdersPage />;
  }

  if (currentPath.startsWith("/orders/")) {
    if (authChecking) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <h1 className="status-card__title">Loading...</h1>
            <p className="status-card__message">
              Please wait while we load your order details.
            </p>
          </div>
        </div>
      );
    }

    return <OrderDetailsPage />;
  }

  if (currentPath === "/admin" || currentPath.startsWith("/admin/")) {
    if (authChecking || adminChecking) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <h1 className="status-card__title">Loading...</h1>
            <p className="status-card__message">
              Please wait while we verify admin access.
            </p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="page-shell">
          <div className="status-card">
            <p className="status-card__eyebrow">
              Login Required
            </p>
            <h1 className="status-card__title status-card__title--spaced">
              Admin access requires login
            </h1>
            <p className="status-card__message">
              Please log in with an admin account to continue.
            </p>

            <div className="status-card__actions">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="btn-secondary"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="page-shell">
          <div className="status-card status-card-error">
            <p className="status-card__eyebrow status-card__eyebrow--error">
              Access Denied
            </p>
            <h1 className="status-card__title status-card__title--spaced">
              You are not an admin
            </h1>
            <p className="status-card__message">
              This area is only available to users in the Cognito admin group.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="btn-primary status-card__primary-action"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    if (currentPath === "/admin/products") {
      return <AdminProductsPage />;
    }

    if (currentPath === "/admin/discount-codes") {
      return <AdminDiscountCodesPage />;
    }

    if (currentPath === "/admin/sales") {
      return <AdminSalesPage />;
    }

    if (currentPath === "/admin/orders") {
      return <AdminOrdersPage />;
    }

    if (currentPath === "/admin/users") {
      return <AdminUsersPage />;
    }

    return <AdminDashboardPage />;
  }

  const isOverlayOpen = authMode || cartOpen || selectedItem;

  return (
    <div className="app-shell">
      <div className={isOverlayOpen ? "app-shell__content app-shell__content--overlay" : "app-shell__content"}>
        <NavBar
          onOpenLogin={() => setAuthMode("login")}
          onOpenSignup={() => setAuthMode("signup")}
          onOpenCart={() => setCartOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          isAdmin={isAdmin}
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

        <main className="catalog-main">
          <section className="catalog-main__header">
            <div>
              <p className="catalog-main__eyebrow">
                Items on sale
              </p>
              <h1 className="catalog-main__title">
                {selectedCategory
                  ? `${selectedCategory} Listings`
                  : "Browse current listings"}
              </h1>
            </div>

            <div className="catalog-main__controls">
              <p className="catalog-main__count">
                Showing {displayedItems.length} item
                {displayedItems.length === 1 ? "" : "s"}
              </p>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="catalog-main__sort"
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
            <div className="catalog-main__state-card">
              <h3 className="catalog-main__state-title">Loading...</h3>
              <p className="catalog-main__state-message">
                Please wait while the page finishes loading.
              </p>
            </div>
          ) : productsError ? (
            <div className="catalog-main__state-card catalog-main__state-card--error">
              <h3 className="catalog-main__state-title catalog-main__state-title--error">
                Unable to load products
              </h3>
              <p className="catalog-main__state-message catalog-main__state-message--error">{productsError}</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="catalog-main__state-card catalog-main__state-card--empty">
              <h3 className="catalog-main__state-title">No items found</h3>
              <p className="catalog-main__state-message">
                Try searching for another category or keyword.
              </p>
            </div>
          ) : (
            <>
              <div className="catalog-main__grid">
                {paginatedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onViewItem={setSelectedItem}
                  />
                ))}
              </div>

              <div className="catalog-main__pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="catalog-main__page-btn"
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
                      className={`catalog-main__page-btn ${
                        isActive ? "catalog-main__page-btn--active" : ""
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="catalog-main__page-btn"
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
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        discountCode={discountCode}
        onDiscountCodeChange={handleDiscountCodeChange}
        discountPreview={discountPreview}
        discountApplying={discountApplying}
        discountApplyError={discountApplyError}
        onApplyDiscountCode={handleApplyDiscountCode}
        onRemoveDiscountCode={handleRemoveDiscountCode}
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
