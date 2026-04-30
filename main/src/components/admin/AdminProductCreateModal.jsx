import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, X } from "lucide-react";

const initialForm = {
  sku: "",
  productName: "",
  brand: "",
  categoryId: "",
  price: "",
  salePrice: "",
  isOnSale: false,
  isFeatured: false,
  quantity: "1",
  itemType: "used",
  productCondition: "good",
  availabilityStatus: "available",
  productDescription: "",
  imageUrl: "",
};

function AdminProductCreateModal({
  isOpen,
  onClose,
  onSave,
  saving,
  error,
  successMessage,
  categories = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "imageUrl") {
      setImagePreviewFailed(false);
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setForm(initialForm);
    setImagePreviewFailed(false);
    onClose();
  };

  const validateForm = () => {
    if (!form.productName.trim()) {
      return "Product name is required.";
    }

    if (!form.sku.trim()) {
      return "SKU is required.";
    }

    if (!form.categoryId) {
      return "Category is required.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Price must be 0 or higher.";
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      return "Quantity must be 0 or higher.";
    }

    if (form.salePrice !== "" && Number(form.salePrice) < 0) {
      return "Sale price must be 0 or higher.";
    }

    if (form.isOnSale && form.salePrice === "") {
      return "Sale price is required when the product is marked on sale.";
    }

    if (
      form.salePrice !== "" &&
      Number(form.salePrice) > Number(form.price)
    ) {
      return "Sale price should not be higher than the regular price.";
    }

    if (form.imageUrl.trim() && !/^https?:\/\//i.test(form.imageUrl.trim())) {
      return "Image URL must start with http:// or https://.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      onSave(
        {
          validationOnly: true,
          validationError,
        },
        () => {}
      );
      return;
    }

    const payload = {
      sku: form.sku.trim().toUpperCase(),
      productName: form.productName.trim(),
      brand: form.brand.trim() || null,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      salePrice: form.isOnSale
        ? Number(form.salePrice)
        : form.salePrice === ""
          ? null
          : Number(form.salePrice),
      isOnSale: Boolean(form.isOnSale),
      isFeatured: Boolean(form.isFeatured),
      quantity: Number(form.quantity),
      itemType: form.itemType,
      productCondition: form.productCondition,
      availabilityStatus: form.availabilityStatus,
      productDescription: form.productDescription.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
    };

    onSave(payload, () => {
      setForm(initialForm);
      setImagePreviewFailed(false);
    });
  };

  const imagePreviewUrl = form.imageUrl.trim();

  return (
    <div
      className="admin-product-create-modal admin-product-create-modal--overlay"
      onClick={handleClose}
    >
      <div
        className="admin-product-create-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-product-create-modal__header">
          <div>
            <p className="admin-product-create-modal__eyebrow">
              New Product
            </p>
            <h2 className="admin-product-create-modal__title">
              Add Product Listing
            </h2>
            <p className="admin-product-create-modal__subtitle">
              Add a product-specific image URL so this listing does not rely on
              category fallback images.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="admin-product-create-modal__close-btn"
            aria-label="Close product creator"
          >
            <X className="admin-product-create-modal__icon" />
          </button>
        </div>

        <form className="admin-product-create-modal__form" onSubmit={handleSubmit}>
          {error ? (
            <div className="admin-product-create-modal__alert admin-product-create-modal__alert--error">
              <AlertCircle className="admin-product-create-modal__alert-icon" />
              <span>{error}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-product-create-modal__alert admin-product-create-modal__alert--success">
              <CheckCircle2 className="admin-product-create-modal__alert-icon" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <div className="admin-product-create-modal__grid admin-product-create-modal__grid--2">
            <div>
              <label className="admin-product-create-modal__label">
                Product Name
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
                className="admin-product-create-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-create-modal__label">
                SKU
              </label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                className="admin-product-create-modal__input admin-product-create-modal__input--upper"
              />
            </div>
          </div>

          <div className="admin-product-create-modal__grid admin-product-create-modal__grid--2">
            <div>
              <label className="admin-product-create-modal__label">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Yamaha, Fender, etc."
                className="admin-product-create-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-create-modal__label">
                Category
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="admin-product-create-modal__select"
              >
                <option value="">Select category</option>
                {sortedCategories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-product-create-modal__grid admin-product-create-modal__grid--4">
            <div>
              <label className="admin-product-create-modal__label">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="admin-product-create-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-create-modal__label">
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
                className="admin-product-create-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-create-modal__label">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
                className="admin-product-create-modal__input"
              />
            </div>

            <div>
              <label className="admin-product-create-modal__label">
                Status
              </label>
              <select
                name="availabilityStatus"
                value={form.availabilityStatus}
                onChange={handleChange}
                className="admin-product-create-modal__select"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="admin-product-create-modal__grid admin-product-create-modal__grid--2">
            <div>
              <label className="admin-product-create-modal__label">
                Item Type
              </label>
              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="admin-product-create-modal__select"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <label className="admin-product-create-modal__label">
                Condition
              </label>
              <select
                name="productCondition"
                value={form.productCondition}
                onChange={handleChange}
                className="admin-product-create-modal__select"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="admin-product-create-modal__toggle-grid">
            <label className="admin-product-create-modal__toggle-option">
              <span className="admin-product-create-modal__toggle-copy">
                <span className="admin-product-create-modal__toggle-title">
                  On Sale
                </span>
                <span className="admin-product-create-modal__toggle-subtitle">
                  Require and display a sale price
                </span>
              </span>

              <input
                name="isOnSale"
                type="checkbox"
                checked={form.isOnSale}
                onChange={handleChange}
                className="admin-product-create-modal__checkbox"
              />
            </label>

            <label className="admin-product-create-modal__toggle-option">
              <span className="admin-product-create-modal__toggle-copy">
                <span className="admin-product-create-modal__toggle-title">
                  Featured Product
                </span>
                <span className="admin-product-create-modal__toggle-subtitle">
                  Highlight this item in the storefront
                </span>
              </span>

              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleChange}
                className="admin-product-create-modal__checkbox"
              />
            </label>
          </div>

          <div className="admin-product-create-modal__image-section">
            <div>
              <label className="admin-product-create-modal__label">
                Image URL
              </label>
              <input
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className="admin-product-create-modal__input"
              />
              <p className="admin-product-create-modal__help-text">
                Paste a direct image URL. This image will appear on the product
                card and details page. If left blank, the backend can still use a
                category fallback image.
              </p>
            </div>

            <div className="admin-product-create-modal__image-preview">
              {imagePreviewUrl && !imagePreviewFailed ? (
                <img
                  src={imagePreviewUrl}
                  alt={`${form.productName || "Product"} preview`}
                  className="admin-product-create-modal__image"
                  onError={() => setImagePreviewFailed(true)}
                />
              ) : (
                <div className="admin-product-create-modal__image-placeholder">
                  <ImageIcon className="admin-product-create-modal__image-placeholder-icon" />
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
            <label className="admin-product-create-modal__label">
              Description
            </label>
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleChange}
              rows={4}
              className="admin-product-create-modal__textarea"
            />
          </div>

          <div className="admin-product-create-modal__actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="admin-product-create-modal__btn admin-product-create-modal__btn--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-product-create-modal__btn admin-product-create-modal__btn--primary"
            >
              {saving ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProductCreateModal;