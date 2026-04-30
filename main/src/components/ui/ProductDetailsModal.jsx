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
    savings: hasValidSalePrice ? price - salePrice : 0,
  };
}

function getSaleLabel(item) {
  if (!item.saleName) return "Sale";

  if (item.saleSource === "sales_table") {
    if (item.saleScope === "site_wide") {
      return `${item.saleName} • Site-wide sale`;
    }

    if (item.saleScope === "category") {
      return `${item.saleName} • Category sale`;
    }

    if (item.saleScope === "product") {
      return `${item.saleName} • Product sale`;
    }
  }

  return item.saleName;
}

function getSaleDescription(item) {
  if (!item.saleSource || item.saleSource === "product_sale_price") {
    return "This item has been individually marked down.";
  }

  if (item.saleScope === "site_wide") {
    return "This discount is part of an active site-wide sale campaign.";
  }

  if (item.saleScope === "category") {
    return `This discount applies to items in the ${item.category || "selected"} category.`;
  }

  if (item.saleScope === "product") {
    return "This discount is part of an active product-specific sale campaign.";
  }

  return "This item is currently discounted.";
}

function ProductDetailsModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

  const { price, salePrice, hasValidSalePrice, displayPrice, savings } =
    getDisplayPricing(item);

  const saleLabel = getSaleLabel(item);
  const saleDescription = getSaleDescription(item);

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
                  <Tag className="product-details-modal__chip-icon" />
                  Sale
                </span>
              ) : null}

              {item.isFeatured ? (
                <span className="product-details-modal__chip product-details-modal__chip--featured">
                  <Star className="product-details-modal__chip-icon" />
                  Featured
                </span>
              ) : null}
            </div>

            <h2 className="product-details-modal__title">{item.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="product-details-modal__close-btn"
            aria-label="Close product details"
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
                    <Tag className="product-details-modal__chip-icon" />
                    Sale
                  </span>
                ) : null}

                {item.isFeatured ? (
                  <span className="product-details-modal__chip product-details-modal__chip--featured">
                    <Star className="product-details-modal__chip-icon" />
                    Featured
                  </span>
                ) : null}
              </div>
            </div>

            {hasValidSalePrice ? (
              <div className="product-details-modal__sale-callout">
                <div className="product-details-modal__sale-callout-top">
                  <Tag className="product-details-modal__sale-callout-icon" />
                  <div>
                    <p className="product-details-modal__sale-callout-title">
                      {saleLabel}
                    </p>
                    <p className="product-details-modal__sale-callout-text">
                      {saleDescription}
                    </p>
                  </div>
                </div>

                <div className="product-details-modal__sale-callout-bottom">
                  <span>Original: {formatMoney(price)}</span>
                  <span>Now: {formatMoney(displayPrice)}</span>
                  <span>Save {formatMoney(savings)}</span>
                </div>
              </div>
            ) : null}

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
                  hasValidSalePrice
                    ? "product-details-modal__price--sale"
                    : "product-details-modal__price--default"
                }`}
              >
                {formatMoney(displayPrice)}
              </p>

              {hasValidSalePrice ? (
                <div className="product-details-modal__price-row">
                  <p className="product-details-modal__price-original">
                    {formatMoney(price)}
                  </p>

                  <span className="product-details-modal__savings">
                    Save {formatMoney(savings)}
                  </span>
                </div>
              ) : null}
            </div>

            {hasValidSalePrice ? (
              <div className="product-details-modal__card product-details-modal__card--sale">
                <h3 className="product-details-modal__section-title">
                  Active Sale
                </h3>

                <div className="product-details-modal__sale-summary">
                  <p className="product-details-modal__sale-summary-title">
                    {saleLabel}
                  </p>
                  <p className="product-details-modal__sale-summary-text">
                    {saleDescription}
                  </p>

                  {item.saleDiscountType && item.saleDiscountValue !== null ? (
                    <p className="product-details-modal__sale-summary-meta">
                      Discount:{" "}
                      {item.saleDiscountType === "percentage"
                        ? `${Number(item.saleDiscountValue || 0)}% off`
                        : `${formatMoney(item.saleDiscountValue)} off`}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="product-details-modal__card">
              <h3 className="product-details-modal__section-title">
                Item Details
              </h3>

              <div className="product-details-modal__details">
                <div className="product-details-modal__detail-row">
                  <span className="product-details-modal__detail-label">
                    <Tag className="product-details-modal__detail-icon" />
                    Brand
                  </span>
                  <span className="product-details-modal__detail-value">
                    {item.brand || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span className="product-details-modal__detail-label">
                    <Package className="product-details-modal__detail-icon" />
                    SKU
                  </span>
                  <span className="product-details-modal__detail-value">
                    {item.sku || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Category</span>
                  <span className="product-details-modal__detail-value">
                    {item.category || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Condition</span>
                  <span className="product-details-modal__detail-value">
                    {item.condition || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Quantity</span>
                  <span className="product-details-modal__detail-value">
                    {item.quantity ?? "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row">
                  <span>Status</span>
                  <span className="product-details-modal__detail-value">
                    {item.availabilityStatus || "N/A"}
                  </span>
                </div>

                <div className="product-details-modal__detail-row product-details-modal__detail-row--last">
                  <span className="product-details-modal__detail-label">
                    <CalendarDays className="product-details-modal__detail-icon" />
                    Listed
                  </span>
                  <span className="product-details-modal__detail-value">
                    {formatDate(item.listingDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(item)}
              disabled={
                item.availabilityStatus !== "available" ||
                Number(item.quantity) <= 0
              }
              className="product-details-modal__add-btn"
            >
              {item.availabilityStatus !== "available" ||
              Number(item.quantity) <= 0
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