import {
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function getDisplayPricing(item) {
  const price = Number(item.price) || 0;
  const salePrice =
    item.salePrice === null || item.salePrice === undefined
      ? null
      : Number(item.salePrice);

  const hasValidSalePrice =
    item.isOnSale && salePrice !== null && salePrice >= 0 && salePrice < price;

  return {
    price,
    salePrice,
    hasValidSalePrice,
    displayPrice: hasValidSalePrice ? salePrice : price,
    savings: hasValidSalePrice ? price - salePrice : 0,
  };
}

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
  discountCode,
  onDiscountCodeChange,
  discountPreview,
  discountApplying,
  discountApplyError,
  onApplyDiscountCode,
  onRemoveDiscountCode,
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const { displayPrice } = getDisplayPricing(item);
    return sum + displayPrice * item.cartQuantity;
  }, 0);

  const totalSavings = cartItems.reduce((sum, item) => {
    const { savings } = getDisplayPricing(item);
    return sum + savings * item.cartQuantity;
  }, 0);

  const discountAmount = Number(discountPreview?.discountAmount || 0);
  const estimatedTotal =
    discountPreview?.estimatedTotalAmount !== undefined &&
    discountPreview?.estimatedTotalAmount !== null
      ? Number(discountPreview.estimatedTotalAmount)
      : subtotal;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/30 transition ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-5">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {!currentUser ? (
            <div className="flex min-h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Log in to use your cart
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in or create an account to save items in your cart.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="btn-secondary"
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
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <ShoppingCart className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Your cart is empty
                </h3>
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
            </div>
          ) : (
            <div className="flex min-h-full flex-col">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const {
                    price,
                    salePrice,
                    hasValidSalePrice,
                    displayPrice,
                    savings,
                  } = getDisplayPricing(item);

                  return (
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
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                                  {item.category}
                                </p>

                                {hasValidSalePrice ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                                    <Tag className="h-3 w-3" />
                                    Sale
                                  </span>
                                ) : null}
                              </div>

                              <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                                {item.name}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p
                                  className={`text-sm font-semibold ${
                                    hasValidSalePrice
                                      ? "text-emerald-700"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {formatMoney(displayPrice)}
                                </p>

                                {hasValidSalePrice ? (
                                  <>
                                    <p className="text-xs text-slate-400 line-through">
                                      {formatMoney(price)}
                                    </p>
                                    <p className="text-xs font-medium text-emerald-700">
                                      Save {formatMoney(savings)}
                                    </p>
                                  </>
                                ) : null}
                              </div>
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

                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatMoney(displayPrice * item.cartQuantity)}
                              </p>

                              {hasValidSalePrice && salePrice !== null ? (
                                <p className="text-xs text-slate-400">
                                  {item.cartQuantity} × {formatMoney(salePrice)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {checkoutError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </div>
              ) : null}

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <TicketPercent className="h-4 w-4 text-orange-500" />
                    Discount Code
                  </label>

                  <div className="flex gap-2">
                    <input
                      value={discountCode}
                      onChange={(e) => onDiscountCodeChange(e.target.value)}
                      placeholder="WELCOME10"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />

                    <button
                      type="button"
                      onClick={onApplyDiscountCode}
                      disabled={discountApplying || !discountCode?.trim()}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {discountApplying ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  {discountApplyError ? (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {discountApplyError}
                    </div>
                  ) : null}

                  {discountPreview?.discountCode ? (
                    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <div className="flex items-center justify-between gap-3">
                        <span>
                          Code applied:{" "}
                          <strong>{discountPreview.discountCode}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={onRemoveDiscountCode}
                          className="text-xs font-bold underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {totalSavings > 0 ? (
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Sale savings</span>
                    <span className="font-semibold text-emerald-700">
                      -{formatMoney(totalSavings)}
                    </span>
                  </div>
                ) : null}

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                {discountAmount > 0 ? (
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Discount code</span>
                    <span className="font-semibold text-emerald-700">
                      -{formatMoney(discountAmount)}
                    </span>
                  </div>
                ) : null}

                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Estimated Total</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatMoney(estimatedTotal)}
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
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default CartPanel;