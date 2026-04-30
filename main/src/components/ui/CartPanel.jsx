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

function getSaleLabel(item) {
  if (!item.saleName) return "Sale";

  if (item.saleSource === "sales_table") {
    if (item.saleScope === "site_wide") {
      return `${item.saleName} • Site-wide`;
    }

    if (item.saleScope === "category") {
      return `${item.saleName} • Category`;
    }

    if (item.saleScope === "product") {
      return `${item.saleName} • Product`;
    }
  }

  return item.saleName;
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
        className={`cart-panel__backdrop ${
          isOpen ? "cart-panel__backdrop--open" : "cart-panel__backdrop--closed"
        }`}
      />

      <aside
        className={`cart-panel__drawer ${
          isOpen ? "cart-panel__drawer--open" : "cart-panel__drawer--closed"
        }`}
      >
        <div className="cart-panel__header">
          <div className="cart-panel__header-group">
            <div className="cart-panel__header-icon-wrap">
              <ShoppingCart className="cart-panel__icon" />
            </div>
            <div>
              <h2 className="cart-panel__title">Shopping Cart</h2>
              <p className="cart-panel__subtitle">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cart-panel__close-btn"
            aria-label="Close cart"
          >
            <X className="cart-panel__tiny-icon" />
          </button>
        </div>

        <div className="cart-panel__body">
          {!currentUser ? (
            <div className="cart-panel__empty-wrap">
              <div className="cart-panel__empty-card">
                <div className="cart-panel__empty-icon-wrap">
                  <ShoppingCart className="cart-panel__empty-icon" />
                </div>
                <h3 className="cart-panel__empty-title">
                  Log in to use your cart
                </h3>
                <p className="cart-panel__empty-text">
                  Sign in or create an account to save items in your cart.
                </p>

                <div className="cart-panel__empty-actions">
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
                    className="cart-panel__btn cart-panel__btn--primary"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-panel__empty-wrap">
              <div className="cart-panel__empty-card">
                <div className="cart-panel__empty-icon-wrap">
                  <ShoppingCart className="cart-panel__empty-icon" />
                </div>
                <h3 className="cart-panel__empty-title">
                  Your cart is empty
                </h3>
                <p className="cart-panel__empty-text">
                  Add instruments to your cart to see them here.
                </p>
                <button
                  onClick={onClose}
                  className="cart-panel__btn cart-panel__btn--primary cart-panel__btn--spaced"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-panel__content">
              <div className="cart-panel__list">
                {cartItems.map((item) => {
                  const {
                    price,
                    salePrice,
                    hasValidSalePrice,
                    displayPrice,
                    savings,
                  } = getDisplayPricing(item);

                  const saleLabel = getSaleLabel(item);

                  return (
                    <div key={item.id} className="cart-panel__item">
                      <div className="cart-panel__item-row">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="cart-panel__item-image"
                        />

                        <div className="cart-panel__item-main">
                          <div className="cart-panel__item-top">
                            <div>
                              <div className="cart-panel__chips">
                                <p className="cart-panel__category">
                                  {item.category}
                                </p>

                                {hasValidSalePrice ? (
                                  <span className="cart-panel__sale-chip">
                                    <Tag className="cart-panel__chip-icon" />
                                    Sale
                                  </span>
                                ) : null}
                              </div>

                              <h3 className="cart-panel__item-name">
                                {item.name}
                              </h3>

                              <div className="cart-panel__price-row">
                                <p
                                  className={`cart-panel__unit-price ${
                                    hasValidSalePrice
                                      ? "cart-panel__unit-price--sale"
                                      : ""
                                  }`}
                                >
                                  {formatMoney(displayPrice)}
                                </p>

                                {hasValidSalePrice ? (
                                  <>
                                    <p className="cart-panel__unit-price-original">
                                      {formatMoney(price)}
                                    </p>
                                    <p className="cart-panel__unit-savings">
                                      Save {formatMoney(savings)}
                                    </p>
                                  </>
                                ) : null}
                              </div>

                              {hasValidSalePrice ? (
                                <div className="cart-panel__sale-note">
                                  <Tag className="cart-panel__chip-icon" />
                                  <span>{saleLabel}</span>
                                </div>
                              ) : null}
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="cart-panel__remove-btn"
                              title="Remove item"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="cart-panel__tiny-icon" />
                            </button>
                          </div>

                          <div className="cart-panel__qty-row">
                            <div className="cart-panel__qty-controls">
                              <button
                                onClick={() => onDecreaseQuantity(item.id)}
                                className="cart-panel__qty-btn"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <Minus className="cart-panel__tiny-icon" />
                              </button>

                              <span className="cart-panel__qty-value">
                                {item.cartQuantity}
                              </span>

                              <button
                                onClick={() => onIncreaseQuantity(item.id)}
                                className="cart-panel__qty-btn"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <Plus className="cart-panel__tiny-icon" />
                              </button>
                            </div>

                            <div className="cart-panel__item-total">
                              <p className="cart-panel__value">
                                {formatMoney(displayPrice * item.cartQuantity)}
                              </p>

                              {hasValidSalePrice && salePrice !== null ? (
                                <p className="cart-panel__muted-small">
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
                <div className="cart-panel__error">{checkoutError}</div>
              ) : null}

              <div className="cart-panel__summary">
                <div className="cart-panel__discount-box">
                  <label className="cart-panel__discount-label">
                    <TicketPercent className="cart-panel__tiny-icon" />
                    Discount Code
                  </label>

                  <div className="cart-panel__discount-row">
                    <input
                      value={discountCode}
                      onChange={(e) => onDiscountCodeChange(e.target.value)}
                      placeholder="WELCOME10"
                      className="cart-panel__discount-input"
                    />

                    <button
                      type="button"
                      onClick={onApplyDiscountCode}
                      disabled={discountApplying || !discountCode?.trim()}
                      className="cart-panel__apply-btn"
                    >
                      {discountApplying ? "Applying..." : "Apply"}
                    </button>
                  </div>

                  {discountApplyError ? (
                    <div className="cart-panel__discount-msg cart-panel__discount-msg--error">
                      {discountApplyError}
                    </div>
                  ) : null}

                  {discountPreview?.discountCode ? (
                    <div className="cart-panel__discount-msg cart-panel__discount-msg--success">
                      <div className="cart-panel__discount-actions">
                        <span>
                          Code applied:{" "}
                          <strong>{discountPreview.discountCode}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={onRemoveDiscountCode}
                          className="cart-panel__remove-discount"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {totalSavings > 0 ? (
                  <div className="cart-panel__line">
                    <span className="cart-panel__muted">Sale savings</span>
                    <span className="cart-panel__value--good">
                      -{formatMoney(totalSavings)}
                    </span>
                  </div>
                ) : null}

                <div className="cart-panel__line">
                  <span className="cart-panel__muted">Subtotal</span>
                  <span className="cart-panel__value">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                {discountAmount > 0 ? (
                  <div className="cart-panel__line">
                    <span className="cart-panel__muted">Discount code</span>
                    <span className="cart-panel__value--good">
                      -{formatMoney(discountAmount)}
                    </span>
                  </div>
                ) : null}

                <div className="cart-panel__line cart-panel__line--total">
                  <span className="cart-panel__muted">Estimated Total</span>
                  <span className="cart-panel__title">
                    {formatMoney(estimatedTotal)}
                  </span>
                </div>

                <button
                  onClick={onCheckout}
                  disabled={checkoutLoading}
                  className="cart-panel__checkout-btn"
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