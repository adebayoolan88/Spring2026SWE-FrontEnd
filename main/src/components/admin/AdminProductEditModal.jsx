import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { getStoredToken } from "../../lib/auth";
import { updateAdminProduct } from "../../lib/admin";

const availabilityOptions = [
  {
    label: "Available",
    value: "available",
  },
  {
    label: "Sold",
    value: "sold",
  },
];

function toFormValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function AdminProductEditModal({ product, onClose, onUpdated }) {
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    price: "",
    salePrice: "",
    isOnSale: false,
    isFeatured: false,
    quantity: "",
    availabilityStatus: "available",
    productDescription: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!product) return;

    setForm({
      productName: product.name || "",
      brand: product.brand || "",
      price: toFormValue(product.price),
      salePrice: toFormValue(product.salePrice),
      isOnSale: Boolean(product.isOnSale),
      isFeatured: Boolean(product.isFeatured),
      quantity: toFormValue(product.quantity),
      availabilityStatus: product.availabilityStatus || "available",
      productDescription: product.description || "",
    });

    setError("");
    setSuccessMessage("");
  }, [product]);

  const currentPrice = Number(form.price) || 0;
  const currentSalePrice = form.salePrice === "" ? null : Number(form.salePrice);

  const salePreview = useMemo(() => {
    if (!form.isOnSale || currentSalePrice === null || currentPrice <= 0) {
      return null;
    }

    const savings = Math.max(currentPrice - currentSalePrice, 0);
    const percentage = currentPrice > 0 ? (savings / currentPrice) * 100 : 0;

    return {
      savings,
      percentage,
    };
  }, [form.isOnSale, currentPrice, currentSalePrice]);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setError("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.productName.trim()) {
      return "Product name is required.";
    }

    if (!form.price || Number(form.price) < 0) {
      return "Price must be 0 or higher.";
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      return "Quantity must be 0 or higher.";
    }

    if (form.isOnSale) {
      if (form.salePrice === "") {
        return "Sale price is required when sale status is enabled.";
      }

      if (Number(form.salePrice) < 0) {
        return "Sale price must be 0 or higher.";
      }

      if (Number(form.salePrice) > Number(form.price)) {
        return "Sale price should not be higher than the regular price.";
      }
    }

    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const validationError = validateForm();

      if (validationError) {
        throw new Error(validationError);
      }

      const token = getStoredToken();

      if (!token) {
        throw new Error("Missing admin token. Please log in again.");
      }

      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        productName: form.productName.trim(),
        brand: form.brand.trim() || null,
        price: Number(form.price),
        salePrice: form.isOnSale ? Number(form.salePrice) : null,
        isOnSale: Boolean(form.isOnSale),
        isFeatured: Boolean(form.isFeatured),
        quantity: Number(form.quantity),
        availabilityStatus: form.availabilityStatus,
        productDescription: form.productDescription.trim() || null,
      };

      await updateAdminProduct(token, product.productId, payload);

      setSuccessMessage("Product updated successfully.");

      if (onUpdated) {
        await onUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Edit Product
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {product.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              SKU: {product.sku || "N/A"} • Seller:{" "}
              {product.seller?.name || product.seller?.username || "Unknown"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5 px-6 py-6" onSubmit={handleSave}>
          {error ? (
            <div className="flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product Name
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Yamaha, Fender, etc."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Regular Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sale Price
              </label>
              <input
                name="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={handleChange}
                disabled={!form.isOnSale}
                placeholder="Optional"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  On Sale
                </span>
                <span className="block text-xs text-slate-500">
                  Show sale price during checkout
                </span>
              </span>
              <input
                name="isOnSale"
                type="checkbox"
                checked={form.isOnSale}
                onChange={handleChange}
                className="h-5 w-5 accent-orange-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Featured
                </span>
                <span className="block text-xs text-slate-500">
                  Highlight item in admin/storefront
                </span>
              </span>
              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleChange}
                className="h-5 w-5 accent-orange-500"
              />
            </label>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Availability
              </label>
              <select
                name="availabilityStatus"
                value={form.availabilityStatus}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {salePreview ? (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              Sale preview: customers save ${salePreview.savings.toFixed(2)} (
              {salePreview.percentage.toFixed(0)}% off).
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product Description
            </label>
            <textarea
              name="productDescription"
              rows={5}
              value={form.productDescription}
              onChange={handleChange}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProductEditModal;