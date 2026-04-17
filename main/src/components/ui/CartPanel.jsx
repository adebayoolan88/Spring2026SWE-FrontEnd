import { ShoppingCart, X } from "lucide-react";

function CartPanel({ isOpen, onClose, cartItems = [] }) {
  return (
    <>
      {/* Dark background overlay behind the side panel.
          It only becomes clickable/visible when the cart is open. */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/30 transition ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sliding side panel.
          translate-x-full hides it off-screen when closed. */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header of the cart panel */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shopping Cart</h2>
              <p className="text-sm text-slate-500">
                {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Closes the cart panel */}
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main content area.
            Right now this mostly shows the empty-cart state. */}
        <div className="flex flex-1 flex-col justify-center px-6 py-8">
          {cartItems.length === 0 ? (
            <div className="mx-auto max-w-sm text-center">
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
            // Placeholder for future cart line items.
            <div>Cart items will go here.</div>
          )}
        </div>

        {/* Footer area.
            Checkout is disabled for now since cart logic is not finished. */}
        <div className="border-t border-slate-200 px-6 py-5">
          <button
            disabled
            className="w-full rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
          >
            Checkout
          </button>
        </div>
      </aside>
    </>
  );
}

export default CartPanel;