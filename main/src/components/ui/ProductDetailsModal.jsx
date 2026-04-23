import { CalendarDays, Package, Tag, X } from "lucide-react";

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

function ProductDetailsModal({ item, onClose, onAddToCart }) {
  if (!item) return null;

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
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              {item.category || "Item"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{item.name}</h2>
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
            <div className="overflow-hidden rounded-[28px] bg-slate-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-[420px] w-full object-cover"
              />
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Description</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {item.description || "No description available for this item yet."}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-slate-900">
                ${Number(item.price).toFixed(2)}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Item Details</h3>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Brand
                  </span>
                  <span className="font-medium text-slate-900">{item.brand || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span className="inline-flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    SKU
                  </span>
                  <span className="font-medium text-slate-900">{item.sku || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <span>Category</span>
                  <span className="font-medium text-slate-900">{item.category || "N/A"}</span>
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
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;