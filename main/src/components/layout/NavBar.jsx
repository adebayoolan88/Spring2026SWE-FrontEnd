import { LogIn, Search, ShoppingCart, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

function NavBar({
  onOpenLogin,
  onOpenSignup,
  onOpenCart,
  onLogout,
  currentUser,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand/logo section */}
        <div className="flex min-w-fit items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-md">
            NS
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">NoteSwap</p>
            <p className="text-xs text-slate-500">Buy. Sell. Play.</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link to="/" className="transition hover:text-slate-900">Home</Link>
          <Link to="/browse" className="transition hover:text-slate-900">Browse</Link>
          <Link to="/deals" className="transition hover:text-slate-900">Deals</Link>
        </nav>

        {/* Search bar */}
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

        {/* Right side actions */}
        <div className="flex min-w-fit items-center gap-3">
          {currentUser ? (
            <>
              {/* If logged in, greet the user */}
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 md:block">
                Hi, <span className="font-semibold">{currentUser.firstName || currentUser.username}</span>
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* If not logged in, show login and signup buttons */}
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

          {/* Cart button stays visible no matter what */}
          <button
            onClick={onOpenCart}
            className="inline-flex items-center justify-center rounded-2xl bg-orange-500 p-2.5 text-white shadow-md transition hover:bg-orange-600"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavBar;