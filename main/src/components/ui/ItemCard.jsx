import { Heart, ShoppingCart, Star, Tag } from "lucide-react";

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

function ItemCard({ item, onViewItem }) {
  const { price, salePrice, hasValidSalePrice, displayPrice } =
    getDisplayPricing(item);

  return (
    <div className="item-card">
      <div className="item-card__media">
        <img
          src={item.image}
          alt={item.name}
          className="item-card__image"
        />

        <button className="item-card__favorite-btn">
          <Heart className="item-card__icon" />
        </button>

        <div className="item-card__badges">
          <span className="item-card__badge item-card__badge--stock">
            Qty: {item.quantity}
          </span>

          {hasValidSalePrice ? (
            <span className="item-card__badge item-card__badge--sale">
              <Tag className="item-card__badge-icon" />
              Sale
            </span>
          ) : null}

          {item.isFeatured ? (
            <span className="item-card__badge item-card__badge--featured">
              <Star className="item-card__badge-icon" />
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="item-card__content">
        <div className="item-card__header">
          <div>
            <p className="item-card__category">
              {item.category}
            </p>
            <h3 className="item-card__name">
              {item.name}
            </h3>
          </div>

          <div className="item-card__pricing">
            <p
              className={`item-card__price ${
                hasValidSalePrice ? "item-card__price--sale" : ""
              }`}
            >
              {formatMoney(displayPrice)}
            </p>

            {hasValidSalePrice ? (
              <p className="item-card__price-original">
                {formatMoney(price)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="item-card__meta">
          <p className="item-card__condition">
            Condition: {item.condition || "N/A"}
          </p>

          {hasValidSalePrice && salePrice !== null ? (
            <span className="item-card__savings">
              Save {formatMoney(price - salePrice)}
            </span>
          ) : null}
        </div>

        <button
          onClick={() => onViewItem(item)}
          className="item-card__view-btn"
        >
          <ShoppingCart className="item-card__icon" />
          View Item
        </button>
      </div>
    </div>
  );
}

export default ItemCard;
