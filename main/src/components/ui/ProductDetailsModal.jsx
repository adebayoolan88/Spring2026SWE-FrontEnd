import { CalendarDays, Package, Star, Tag, X } from "lucide-react";

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

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
  };
}

function ProductDetailsModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  const { price, salePrice, hasValidSalePrice, displayPrice } =
    getDisplayPricing(item);

  return (
    <div
      className="product-details-modal product-details-modal--overlay"
      onClick={onClose}
    >
      <div
        className="product-details-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-details-modal__header">
          <div>
            <div className="product-details-modal__chips">
              <p className="product-details-modal__category">
                {item.category || "Item"}
              </p>

              {hasValidSalePrice ? (
                <span className="product-details-modal__chip product-details-modal__chip--sale">
                  <Tag className="h-3 w-3" />
                  Sale
                </span>
              ) : null}

              {item.isFeatured ? (
                <span className="product-details-modal__chip product-details-modal__chip--featured">
                  <Star className="h-3 w-3" />
                  Featured
                </span>
              ) : null}
            </div>

            <h2 className="product-details-modal__title">
              {item.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="product-details-modal__close-btn"
          >
            <X className="product-details-modal__icon" />
          </button>
        </div>

        <div className="product-details-modal__content">
          <div>
            <div className="product-details-modal__image-wrap">
              <img
                src={item.image}
                alt={item.name}
                className="product-details-modal__image"
              />

              <div className="product-details-modal__floating-chips">
                {hasValidSalePrice ? (
                  <span className="product-details-modal__chip product-details-modal__chip--sale-solid">
                    <Tag className="h-3 w-3" />
                    Sale
                  </span>
                ) : null}

                {item.isFeatured ? (
                  <span className="product-details-modal__chip product-details-modal__chip--featured shadow-sm">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                ) : null}
              </div>
            </div>

            <div className="product-details-modal__description">
              <h3 className="product-details-modal__section-title">
                Description
              </h3>
              <p className="product-details-modal__description-text">
                {item.description || "No description available for this item yet."}
              </p>
            </div>
          </div>

          <div className="product-details-modal__sidebar">
            <div className="product-details-modal__card">
              <p
                className={`product-details-modal__price ${
                  hasValidSalePrice ? "product-details-modal__price--sale" : "product-details-modal__price--default"
                }`}
              >
                {formatMoney(displayPrice)}
              </p>

              {hasValidSalePrice ? (
                <div className="mt-2 product-details-modal__chips">
                  <p className="product-details-modal__price-original">
                    {formatMoney(price)}
                  </p>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold product-details-modal__price--sale">
                    Save {formatMoney(price - salePrice)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="product-details-modal__card">
              <h3 className="product-details-modal__section-title">
                Item Details
              </h3>

              <div className="product-details-modal__details">
                <div className="product-details-modal__detail-row">
                  <span className="product-details-modal__detail-label">
                    <Tag className="h-4 w-4" />
                    Brand
                  </span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.brand || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span className="product-details-modal__detail-label">
                    <Package className="h-4 w-4" />
                    SKU
                  </span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.sku || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Category</span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.category || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Condition</span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.condition || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Quantity</span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.quantity ?? "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Status</span>
                  <span className="font-medium product-details-modal__price--default">
                    {item.availabilityStatus || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row product-details-modal__detail-row--last">
                  <span className="product-details-modal__detail-label">
                    <CalendarDays className="h-4 w-4" />
                    Listed
                  </span>
                  <span className="font-medium product-details-modal__price--default">
                    {formatDate(item.listingDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(item)}
              disabled={item.availabilityStatus !== "available" || Number(item.quantity) <= 0}
              className="product-details-modal__add-btn"
            >
              {item.availabilityStatus !== "available" || Number(item.quantity) <= 0
                ? "Unavailable"
                : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;