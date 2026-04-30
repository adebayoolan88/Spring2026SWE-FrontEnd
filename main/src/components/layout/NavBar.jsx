import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogIn,
  Search,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

function NavBar({
  onOpenLogin,
  onOpenSignup,
  onOpenCart,
  onLogout,
  currentUser,
  isAdmin,
  searchTerm,
  setSearchTerm,
  cartCount,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = currentUser?.firstName || currentUser?.username || "User";

  return (
    <header className="nav-bar">
      <div className="nav-bar__inner">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="nav-bar__brand"
        >
          <div className="nav-bar__brand-badge">NS</div>
          <div className="nav-bar__brand-copy">
            <p className="nav-bar__title">NoteSwap</p>
            <p className="nav-bar__tagline">Buy. Sell. Play.</p>
          </div>
        </button>

        <div className="nav-bar__search-wrap">
          <div className="nav-bar__search">
            <Search className="nav-bar__search-icon" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search for instruments, brands, and gear"
              className="nav-bar__search-input"
            />
          </div>
        </div>

        <div className="nav-bar__actions">
          {currentUser ? (
            <>
              <div className="nav-bar__menu-wrap" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="nav-bar__menu-toggle"
                >
                  <span>
                    Hi, <span className="nav-bar__user-name">{displayName}</span>
                  </span>
                  <ChevronDown className="nav-bar__menu-chevron" />
                </button>

                {accountMenuOpen && (
                  <div className="nav-bar__menu-panel">
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        window.location.href = "/profile";
                      }}
                      className="nav-bar__menu-item"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        window.location.href = "/orders";
                      }}
                      className="nav-bar__menu-item"
                    >
                      My Orders
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          window.location.href = "/admin";
                        }}
                        className="nav-bar__menu-item nav-bar__menu-item--admin"
                      >
                        Admin Panel
                      </button>
                    ) : null}

                    <div className="nav-bar__menu-divider" />

                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="nav-bar__menu-item nav-bar__menu-item--danger"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {isAdmin ? (
                <button
                  onClick={() => {
                    window.location.href = "/admin";
                  }}
                  className="nav-bar__admin-cta"
                >
                  Admin
                </button>
              ) : null}

              <button onClick={onLogout} className="nav-bar__logout-mobile">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={onOpenLogin} className="nav-bar__btn nav-bar__btn--ghost">
                <LogIn className="nav-bar__btn-icon" />
                Login
              </button>

              <button onClick={onOpenSignup} className="nav-bar__btn nav-bar__btn--primary">
                <UserPlus className="nav-bar__btn-icon" />
                Sign Up
              </button>
            </>
          )}

          <button onClick={onOpenCart} className="nav-bar__cart-btn">
            <ShoppingCart className="nav-bar__cart-icon" />
            {cartCount > 0 && <span className="nav-bar__cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
