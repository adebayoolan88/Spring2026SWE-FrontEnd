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
    <div className="item-card group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur">
          <Heart className="h-4 w-4" />
        </button>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            Qty: {item.quantity}
          </span>

          {hasValidSalePrice ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Tag className="h-3 w-3" />
              Sale
            </span>
          ) : null}

          {item.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              <Star className="h-3 w-3" />
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              {item.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              {item.name}
            </h3>
          </div>

          <div className="text-right">
            <p
              className={`text-lg font-bold ${
                hasValidSalePrice ? "text-emerald-700" : "text-slate-900"
              }`}
            >
              {formatMoney(displayPrice)}
            </p>

            {hasValidSalePrice ? (
              <p className="text-xs font-medium text-slate-400 line-through">
                {formatMoney(price)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-500">
            Condition: {item.condition || "N/A"}
          </p>

          {hasValidSalePrice && salePrice !== null ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Save {formatMoney(price - salePrice)}
            </span>
          ) : null}
        </div>

        <button
          onClick={() => onViewItem(item)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <ShoppingCart className="h-4 w-4" />
          View Item
        </button>
      </div>
    </div>
  );
}

export default ItemCard;