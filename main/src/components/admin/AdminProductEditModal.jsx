import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Save, X } from "lucide-react";
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
    imageUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

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
      imageUrl: product.imageUrl || product.image || "",
    });

    setError("");
    setSuccessMessage("");
    setImagePreviewFailed(false);
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

    if (name === "imageUrl") {
      setImagePreviewFailed(false);
    }

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

    if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) {
      return "Image URL must start with http:// or https://.";
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
        imageUrl: form.imageUrl.trim() || null,
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

  const imagePreviewUrl = form.imageUrl.trim();

  return (
    <div
      className="admin-product-edit-modal admin-product-edit-modal--overlay"
      onClick={onClose}
    >
      <div
        className="admin-product-edit-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-product-edit-modal__header">
          <div>
            <p className="admin-product-edit-modal__eyebrow">Edit Product</p>
            <h2 className="admin-product-edit-modal__title">{product.name}</h2>
            <p className="admin-product-edit-modal__subtitle">
              SKU: {product.sku || "N/A"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-product-edit-modal__close-btn"
            aria-label="Close product editor"
          >
            <X className="admin-product-edit-modal__icon" />
          </button>
        </div>

        <form className="admin-product-edit-modal__form" onSubmit={handleSave}>
          {error ? (
            <div className="admin-product-edit-modal__alert admin-product-edit-modal__alert--error">
              <AlertCircle className="admin-product-edit-modal__alert-icon" />
              <span>{error}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-product-edit-modal__alert admin-product-edit-modal__alert--success">
              <CheckCircle2 className="admin-product-edit-modal__alert-icon" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <div className="admin-product-edit-modal__grid admin-product-edit-modal__grid--2">
            <div>
              <label className="admin-product-edit-modal__label">
                Product Name
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="admin-product-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-edit-modal__label">Brand</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Yamaha, Fender, etc."
                className="admin-product-edit-modal__input"
              />
            </div>
          </div>

          <div className="admin-product-edit-modal__grid admin-product-edit-modal__grid--3">
            <div>
              <label className="admin-product-edit-modal__label">
                Regular Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="admin-product-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-edit-modal__label">
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
                className="admin-product-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-edit-modal__label">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                className="admin-product-edit-modal__input"
              />
            </div>
          </div>

          <div className="admin-product-edit-modal__grid admin-product-edit-modal__grid--3">
            <label className="admin-product-edit-modal__toggle">
              <span className="admin-product-edit-modal__toggle-copy">
                <span className="admin-product-edit-modal__toggle-title">
                  On Sale
                </span>
                <span className="admin-product-edit-modal__toggle-subtitle">
                  Show sale price during checkout
                </span>
              </span>

              <input
                name="isOnSale"
                type="checkbox"
                checked={form.isOnSale}
                onChange={handleChange}
                className="admin-product-edit-modal__checkbox"
              />
            </label>

            <label className="admin-product-edit-modal__toggle">
              <span className="admin-product-edit-modal__toggle-copy">
                <span className="admin-product-edit-modal__toggle-title">
                  Featured
                </span>
                <span className="admin-product-edit-modal__toggle-subtitle">
                  Highlight item in admin/storefront
                </span>
              </span>

              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleChange}
                className="admin-product-edit-modal__checkbox"
              />
            </label>

            <div>
              <label className="admin-product-edit-modal__label">
                Availability
              </label>
              <select
                name="availabilityStatus"
                value={form.availabilityStatus}
                onChange={handleChange}
                className="admin-product-edit-modal__select"
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
            <div className="admin-product-edit-modal__sale-preview">
              Sale preview: customers save ${salePreview.savings.toFixed(2)} (
              {salePreview.percentage.toFixed(0)}% off).
            </div>
          ) : null}

          <div className="admin-product-edit-modal__image-section">
            <div>
              <label className="admin-product-edit-modal__label">
                Image URL
              </label>
              <input
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className="admin-product-edit-modal__input"
              />
              <p className="admin-product-edit-modal__help-text">
                Paste a direct image URL. This image appears on product cards and
                product details.
              </p>
            </div>

            <div className="admin-product-edit-modal__image-preview">
              {imagePreviewUrl && !imagePreviewFailed ? (
                <img
                  src={imagePreviewUrl}
                  alt={`${form.productName || "Product"} preview`}
                  className="admin-product-edit-modal__image"
                  onError={() => setImagePreviewFailed(true)}
                />
              ) : (
                <div className="admin-product-edit-modal__image-placeholder">
                  <ImageIcon className="admin-product-edit-modal__image-placeholder-icon" />
                  <span>
                    {imagePreviewUrl
                      ? "Image preview unavailable"
                      : "Image preview"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="admin-product-edit-modal__label">
              Product Description
            </label>
            <textarea
              name="productDescription"
              rows={5}
              value={form.productDescription}
              onChange={handleChange}
              className="admin-product-edit-modal__input admin-product-edit-modal__input--textarea"
            />
          </div>

          <div className="admin-product-edit-modal__actions">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="admin-product-edit-modal__btn admin-product-edit-modal__btn--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-product-edit-modal__btn admin-product-edit-modal__btn--primary"
            >
              <Save className="admin-product-edit-modal__icon" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProductEditModal;