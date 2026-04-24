import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

function CartPanel({
  isOpen,
  onClose,
  cartItems = [],
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onCheckout,
  checkoutLoading,
  checkoutError,
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.cartQuantity,
    0
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/30 transition ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shopping Cart</h2>
              <p className="text-sm text-slate-500">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-6 py-6">
          {!currentUser ? (
            <div className="m-auto max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Log in to use your cart</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in or create an account to save items in your cart.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Log In
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSignup();
                  }}
                  className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="m-auto max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Your cart is empty</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add instruments to your cart to see them here.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                              {item.category}
                            </p>
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              ${Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-xl border border-slate-200">
                            <button
                              onClick={() => onDecreaseQuantity(item.id)}
                              className="p-2 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-10 text-center text-sm font-medium text-slate-900">
                              {item.cartQuantity}
                            </span>

                            <button
                              onClick={() => onIncreaseQuantity(item.id)}
                              className="p-2 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            ${(Number(item.price) * item.cartQuantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {checkoutError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </div>
              ) : null}

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-lg font-bold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={onCheckout}
                  disabled={checkoutLoading}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? "Redirecting to Checkout..." : "Checkout"}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default CartPanel;