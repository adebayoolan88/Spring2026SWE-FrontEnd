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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                {item.category || "Item"}
              </p>

              {hasValidSalePrice ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  <Tag className="h-3 w-3" />
                  Sale
                </span>
              ) : null}

              {item.isFeatured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  <Star className="h-3 w-3" />
                  Featured
                </span>
              ) : null}
            </div>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {item.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="relative overflow-hidden rounded-[28px] bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-[420px] w-full object-cover"
              />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
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

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Description
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                {item.description || "No description available for this item yet."}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="admin-stat-card">
              <p
                className={`text-3xl font-bold ${
                  hasValidSalePrice ? "text-emerald-700" : "text-slate-900"
                }`}
              >
                {formatMoney(displayPrice)}
              </p>

              {hasValidSalePrice ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-400 line-through">
                    {formatMoney(price)}
                  </p>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Save {formatMoney(price - salePrice)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="admin-stat-card">
              <h3 className="text-lg font-semibold text-slate-900">
                Item Details
              </h3>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Brand
                  </span>
                  <span className="font-medium text-slate-900">
                    {item.brand || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="inline-flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    SKU
                  </span>
                  <span className="font-medium text-slate-900">
                    {item.sku || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span>Category</span>
                  <span className="font-medium text-slate-900">
                    {item.category || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span>Condition</span>
                  <span className="font-medium text-slate-900">
                    {item.condition || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span>Quantity</span>
                  <span className="font-medium text-slate-900">
                    {item.quantity ?? "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span>Status</span>
                  <span className="font-medium text-slate-900">
                    {item.availabilityStatus || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Listed
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatDate(item.listingDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(item)}
              disabled={item.availabilityStatus !== "available" || Number(item.quantity) <= 0}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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