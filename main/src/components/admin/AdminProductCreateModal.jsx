import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

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

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      sku: form.sku.trim().toUpperCase(),
      productName: form.productName.trim(),
      brand: form.brand.trim() || null,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      salePrice: form.salePrice === "" ? null : Number(form.salePrice),
      isOnSale: Boolean(form.isOnSale),
      isFeatured: Boolean(form.isFeatured),
      quantity: Number(form.quantity),
      itemType: form.itemType,
      productCondition: form.productCondition,
      availabilityStatus: form.availabilityStatus,
      productDescription: form.productDescription.trim() || null,
    };

    onSave(payload, () => {
      setForm(initialForm);
    });
  };

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
              Product images are automatically assigned from the selected category.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="admin-product-create-modal__close-btn"
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
                className="admin-product-create-modal__input"
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
                className="admin-product-create-modal__input"
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
                className="admin-product-create-modal__input"
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
                className="admin-product-create-modal__input"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                name="isOnSale"
                type="checkbox"
                checked={form.isOnSale}
                onChange={handleChange}
                className="admin-product-create-modal__checkbox"
              />
              Mark as on sale
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                name="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={handleChange}
                className="admin-product-create-modal__checkbox"
              />
              Featured product
            </label>
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
              className="admin-product-create-modal__input"
            />
          </div>

          <div className="admin-product-create-modal__actions">
            <button
              type="button"
              onClick={handleClose}
              className="admin-product-create-modal__btn admin-product-create-modal__btn--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-product-create-modal__btn admin-product-create-modal__btn--primary admin-product-create-modal__btn--disabled"
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