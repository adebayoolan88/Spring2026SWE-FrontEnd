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
    <header className="navbar">
      <div className="navbar-inner">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="flex min-w-fit items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-md">
            NS
          </div>
          <div className="text-left">
            <p className="text-xl font-bold tracking-tight text-slate-900">NoteSwap</p>
            <p className="text-xs text-slate-500">Buy. Sell. Play.</p>
          </div>
        </button>

        <div className="flex-1">
          <div className="flex items-center rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 shadow-sm">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search for instruments, brands, and gear"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex min-w-fit items-center gap-3">
          {currentUser ? (
            <>
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 md:inline-flex"
                >
                  <span>
                    Hi, <span className="font-semibold">{displayName}</span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        window.location.href = "/profile";
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        window.location.href = "/orders";
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      My Orders
                    </button>

                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          window.location.href = "/admin";
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-orange-600 transition hover:bg-orange-50"
                      >
                        Admin Panel
                      </button>
                    ) : null}

                    <div className="my-2 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
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
                  className="hidden rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 lg:inline-flex"
                >
                  Admin
                </button>
              ) : null}

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>

              <button
                onClick={onOpenSignup}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-orange-600"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </button>
            </>
          )}

          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center justify-center rounded-2xl bg-orange-500 p-2.5 text-white shadow-md transition hover:bg-orange-600"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavBar;