import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getStoredToken } from "../../lib/auth";
import {
  createAdminSale,
  deleteAdminSale,
  getAdminProducts,
  getAdminSales,
  updateAdminSale,
} from "../../lib/admin";

const initialForm = {
  saleName: "",
  description: "",
  saleScope: "site_wide",
  discountType: "percentage",
  discountValue: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  productIds: [],
  categoryIds: [],
};

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "No date set";

  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return "Invalid date";
  }
}

function formatDateTimeForApi(value) {
  if (!value) return null;

  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

function formatDateTimeForInput(value) {
  if (!value) return "";

  try {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function saleDiscountLabel(sale) {
  if (sale.discount_type === "percentage") {
    return `${Number(sale.discount_value || 0)}% off`;
  }

  if (sale.discount_type === "fixed_amount") {
    return `${formatMoney(sale.discount_value)} off`;
  }

  return "Discount";
}

function isExpired(sale) {
  if (!sale.ends_at) return false;
  return new Date(sale.ends_at) <= new Date();
}

function statusLabel(sale) {
  if (!sale.is_active) return "Inactive";
  if (isExpired(sale)) return "Expired";
  return "Active";
}

function statusClass(sale) {
  if (!sale.is_active) {
    return "admin-sales__badge admin-sales__badge--inactive";
  }

  if (isExpired(sale)) {
    return "admin-sales__badge admin-sales__badge--expired";
  }

  return "admin-sales__badge admin-sales__badge--active";
}

function scopeLabel(scope) {
  if (scope === "site_wide") return "Site-wide";
  if (scope === "category") return "Category";
  if (scope === "product") return "Product";
  return scope || "N/A";
}

function AdminSalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);

  const isEditing = Boolean(editingSale);

  const loadPageData = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setLoading(true);
      setPageError("");

      const [salesResult, productsResult] = await Promise.all([
        getAdminSales(token),
        getAdminProducts(token),
      ]);

      setSales(salesResult.sales || []);
      setProducts(productsResult.products || []);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const categories = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      if (product.category?.categoryId && product.category?.name) {
        map.set(product.category.categoryId, product.category.name);
      }
    });

    return Array.from(map.entries())
      .map(([categoryId, name]) => ({
        categoryId: Number(categoryId),
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sales.filter((sale) => {
      if (!showInactive && !sale.is_active) {
        return false;
      }

      const searchableText = [
        sale.sale_name,
        sale.description,
        sale.sale_scope,
        sale.discount_type,
        sale.discount_value,
      ]
        .join(" ")
        .toLowerCase();

      return !normalizedQuery || searchableText.includes(normalizedQuery);
    });
  }, [sales, query, showInactive]);

  const totals = useMemo(() => {
    return {
      all: sales.length,
      visible: filteredSales.length,
      active: sales.filter((sale) => sale.is_active && !isExpired(sale)).length,
      inactive: sales.filter((sale) => !sale.is_active).length,
      expired: sales.filter((sale) => isExpired(sale)).length,
    };
  }, [sales, filteredSales]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingSale(null);
    setShowForm(false);
    setFormError("");
    setSuccessMessage("");
  };

  const handleOpenCreate = () => {
    setForm(initialForm);
    setEditingSale(null);
    setShowForm((prev) => !prev);
    setFormError("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");
  };

  const handleOpenEdit = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
    setFormError("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");

    setForm({
      saleName: sale.sale_name || "",
      description: sale.description || "",
      saleScope: sale.sale_scope || "site_wide",
      discountType: sale.discount_type || "percentage",
      discountValue:
        sale.discount_value === null || sale.discount_value === undefined
          ? ""
          : String(sale.discount_value),
      startsAt: formatDateTimeForInput(sale.starts_at),
      endsAt: formatDateTimeForInput(sale.ends_at),
      isActive: Boolean(sale.is_active),
      productIds: (sale.product_ids || []).map((id) => Number(id)),
      categoryIds: (sale.category_ids || []).map((id) => Number(id)),
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormError("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScopeChange = (e) => {
    const value = e.target.value;

    setFormError("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      saleScope: value,
      productIds: [],
      categoryIds: [],
    }));
  };

  const handleProductSelection = (productId) => {
    setFormError("");
    setSuccessMessage("");

    setForm((prev) => {
      const numericProductId = Number(productId);
      const alreadySelected = prev.productIds.includes(numericProductId);

      return {
        ...prev,
        productIds: alreadySelected
          ? prev.productIds.filter((id) => id !== numericProductId)
          : [...prev.productIds, numericProductId],
      };
    });
  };

  const handleCategorySelection = (categoryId) => {
    setFormError("");
    setSuccessMessage("");

    setForm((prev) => {
      const numericCategoryId = Number(categoryId);
      const alreadySelected = prev.categoryIds.includes(numericCategoryId);

      return {
        ...prev,
        categoryIds: alreadySelected
          ? prev.categoryIds.filter((id) => id !== numericCategoryId)
          : [...prev.categoryIds, numericCategoryId],
      };
    });
  };

  const validateForm = () => {
    const saleName = form.saleName.trim();
    const discountValue = Number(form.discountValue);

    if (!saleName) {
      throw new Error("Sale name is required.");
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Discount value must be greater than 0.");
    }

    if (form.discountType === "percentage" && discountValue > 100) {
      throw new Error("Percentage discount cannot be greater than 100.");
    }

    if (form.saleScope === "product" && form.productIds.length === 0) {
      throw new Error("Select at least one product for a product-specific sale.");
    }

    if (form.saleScope === "category" && form.categoryIds.length === 0) {
      throw new Error("Select at least one category for a category sale.");
    }

    if (form.startsAt && form.endsAt) {
      const startsAt = new Date(form.startsAt);
      const endsAt = new Date(form.endsAt);

      if (endsAt <= startsAt) {
        throw new Error("End date must be after the start date.");
      }
    }
  };

  const buildPayload = () => ({
    saleName: form.saleName.trim(),
    description: form.description.trim() || null,
    saleScope: form.saleScope,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startsAt: formatDateTimeForApi(form.startsAt),
    endsAt: formatDateTimeForApi(form.endsAt),
    isActive: Boolean(form.isActive),
    productIds: form.saleScope === "product" ? form.productIds : [],
    categoryIds: form.saleScope === "category" ? form.categoryIds : [],
  });

  const handleSaveSale = async (e) => {
    e.preventDefault();

    try {
      validateForm();

      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setSaving(true);
      setFormError("");
      setSuccessMessage("");
      setActionError("");
      setActionSuccess("");

      const payload = buildPayload();

      if (isEditing) {
        await updateAdminSale(token, editingSale.sale_id, payload);
        setSuccessMessage("Sale updated successfully.");
      } else {
        await createAdminSale(token, payload);
        setSuccessMessage("Sale created successfully.");
      }

      await loadPageData();

      setTimeout(() => {
        resetForm();
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError(err.message || `Failed to ${isEditing ? "update" : "create"} sale.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateSale = async (sale) => {
    const confirmed = window.confirm(
      `Deactivate sale "${sale.sale_name}"? It will no longer affect storefront pricing.`
    );

    if (!confirmed) return;

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setDeactivatingId(sale.sale_id);
      setActionError("");
      setActionSuccess("");

      await deleteAdminSale(token, sale.sale_id);

      setActionSuccess(`Sale "${sale.sale_name}" deactivated.`);
      await loadPageData();
    } catch (err) {
      console.error(err);
      setActionError(err.message || "Failed to deactivate sale.");
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <AdminLayout
      title="Sales"
      subtitle="Create, edit, and deactivate sale campaigns for products, categories, or the full marketplace."
    >
      <div className="admin-sales__stats-grid">
        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">Total Sales</p>
          <p className="admin-sales__stat-value">{totals.all}</p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">Active</p>
          <p className="admin-sales__stat-value admin-sales__stat-value--green">
            {totals.active}
          </p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">Inactive</p>
          <p className="admin-sales__stat-value admin-sales__stat-value--muted">
            {totals.inactive}
          </p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">Expired</p>
          <p className="admin-sales__stat-value admin-sales__stat-value--red">
            {totals.expired}
          </p>
        </div>
      </div>

      <div className="admin-sales__filters">
        <div className="admin-sales__filters-row">
          <div className="admin-sales__search">
            <Search className="admin-sales__search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sale name, description, scope, or discount type..."
              className="admin-sales__search-input"
            />
          </div>

          <label className="admin-sales__toggle-filter">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="admin-sales__checkbox"
            />
            Show inactive sales
          </label>

          <button onClick={handleOpenCreate} className="admin-sales__create-btn btn-primary">
            <Plus className="admin-sales__icon" />
            {showForm && !isEditing ? "Close Form" : "Create Sale"}
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="admin-sales__alert admin-sales__alert--error admin-sales__alert--spaced">
          <AlertCircle className="admin-sales__alert-icon" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="admin-sales__alert admin-sales__alert--success admin-sales__alert--spaced">
          <CheckCircle2 className="admin-sales__alert-icon" />
          <span>{actionSuccess}</span>
        </div>
      ) : null}

      {showForm ? (
        <div className="admin-sales__create-card">
          <div className="admin-sales__create-header admin-sales__create-header--split">
            <div>
              <p className="admin-sales__eyebrow">
                {isEditing ? "Edit Sale" : "New Sale"}
              </p>
              <h2 className="admin-sales__section-title">
                {isEditing ? "Edit Sale Campaign" : "Create Sale Campaign"}
              </h2>
              <p className="admin-sales__section-subtitle">
                These sale campaigns are validated during checkout and can apply
                to the whole store, categories, or selected products.
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="admin-sales__icon-btn"
                aria-label="Close editor"
              >
                <X className="admin-sales__icon" />
              </button>
            ) : null}
          </div>

          {formError ? (
            <div className="admin-sales__alert admin-sales__alert--error">
              <AlertCircle className="admin-sales__alert-icon" />
              <span>{formError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-sales__alert admin-sales__alert--success">
              <CheckCircle2 className="admin-sales__alert-icon" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form className="admin-sales__form" onSubmit={handleSaveSale}>
            <div className="admin-sales__grid admin-sales__grid--2">
              <div>
                <label className="admin-sales__label">Sale Name</label>
                <input
                  name="saleName"
                  value={form.saleName}
                  onChange={handleChange}
                  placeholder="Spring Instrument Sale"
                  className="admin-sales__input"
                  required
                />
              </div>

              <div>
                <label className="admin-sales__label">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Discount for selected listings"
                  className="admin-sales__input"
                />
              </div>
            </div>

            <div className="admin-sales__grid admin-sales__grid--4">
              <div>
                <label className="admin-sales__label">Sale Scope</label>
                <select
                  name="saleScope"
                  value={form.saleScope}
                  onChange={handleScopeChange}
                  className="admin-sales__input"
                >
                  <option value="site_wide">Site-wide</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label className="admin-sales__label">Discount Type</label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="admin-sales__input"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="admin-sales__label">Discount Value</label>
                <input
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={form.discountType === "percentage" ? "20" : "50.00"}
                  className="admin-sales__input"
                  required
                />
              </div>

              <label className="admin-sales__active-row">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="admin-sales__checkbox"
                />
                Active
              </label>
            </div>

            <div className="admin-sales__grid admin-sales__grid--2">
              <div>
                <label className="admin-sales__label">Starts At</label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="admin-sales__input"
                />
              </div>

              <div>
                <label className="admin-sales__label">Ends At</label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={handleChange}
                  className="admin-sales__input"
                />
              </div>
            </div>

            {form.saleScope === "category" ? (
              <div className="admin-sales__selector-card">
                <p className="admin-sales__selector-title">Select Categories</p>
                <div className="admin-sales__selector-grid">
                  {categories.map((category) => (
                    <label key={category.categoryId} className="admin-sales__selector-option">
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(category.categoryId)}
                        onChange={() => handleCategorySelection(category.categoryId)}
                        className="admin-sales__checkbox"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {form.saleScope === "product" ? (
              <div className="admin-sales__selector-card">
                <p className="admin-sales__selector-title">Select Products</p>
                <div className="admin-sales__product-selector">
                  {products.map((product) => (
                    <label key={product.productId} className="admin-sales__selector-option">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(Number(product.productId))}
                        onChange={() => handleProductSelection(product.productId)}
                        className="admin-sales__checkbox"
                      />
                      <span>
                        {product.name}
                        <span className="admin-sales__selector-muted">
                          {" "}
                          ({product.sku})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="admin-sales__actions">
              <button
                type="button"
                onClick={resetForm}
                className="admin-sales__btn admin-sales__btn--secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="admin-sales__btn admin-sales__btn--primary"
              >
                {saving
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Sale"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-sales__state-card">
          <h2 className="admin-sales__state-title">Loading sales...</h2>
          <p className="admin-sales__state-message">
            Fetching sale campaigns and eligible products.
          </p>
        </div>
      ) : pageError ? (
        <div className="admin-sales__error">{pageError}</div>
      ) : filteredSales.length === 0 ? (
        <div className="admin-sales__state-card admin-sales__state-card--empty">
          <Tags className="admin-sales__empty-icon" />
          <h2 className="admin-sales__state-title admin-sales__state-title--spaced">
            No sales found
          </h2>
          <p className="admin-sales__state-message">
            {showInactive
              ? "No sale campaigns match your current search."
              : "No active sales match your current view. Turn on inactive sales to view deactivated campaigns."}
          </p>
        </div>
      ) : (
        <div className="admin-sales__list">
          {filteredSales.map((sale) => (
            <div key={sale.sale_id} className="admin-sales__sale-card">
              <div className="admin-sales__sale-card-header">
                <div>
                  <div className="admin-sales__sale-title-row">
                    <h3 className="admin-sales__sale-title">{sale.sale_name}</h3>
                    <span className={statusClass(sale)}>{statusLabel(sale)}</span>
                  </div>

                  <p className="admin-sales__sale-description">
                    {sale.description || "No description"}
                  </p>
                </div>

                <div className="admin-sales__row-actions">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sale)}
                    className="admin-sales__action-btn"
                  >
                    <Edit className="admin-sales__action-icon" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeactivateSale(sale)}
                    disabled={!sale.is_active || deactivatingId === sale.sale_id}
                    className="admin-sales__action-btn admin-sales__action-btn--danger"
                  >
                    <Trash2 className="admin-sales__action-icon" />
                    {deactivatingId === sale.sale_id
                      ? "Deactivating..."
                      : "Deactivate"}
                  </button>
                </div>
              </div>

              <div className="admin-sales__meta-grid">
                <div>
                  <p className="admin-sales__meta-label">Scope</p>
                  <p className="admin-sales__meta-value">
                    {scopeLabel(sale.sale_scope)}
                  </p>
                </div>

                <div>
                  <p className="admin-sales__meta-label">Discount</p>
                  <p className="admin-sales__meta-value">
                    {saleDiscountLabel(sale)}
                  </p>
                </div>

                <div>
                  <p className="admin-sales__meta-label">Starts</p>
                  <p className="admin-sales__meta-value">
                    {formatDate(sale.starts_at)}
                  </p>
                </div>

                <div>
                  <p className="admin-sales__meta-label">Ends</p>
                  <p className="admin-sales__meta-value">
                    {formatDate(sale.ends_at)}
                  </p>
                </div>
              </div>

              <div className="admin-sales__association-row">
                {sale.sale_scope === "product" ? (
                  <span>
                    Applies to {(sale.product_ids || []).length} product
                    {(sale.product_ids || []).length === 1 ? "" : "s"}
                  </span>
                ) : sale.sale_scope === "category" ? (
                  <span>
                    Applies to {(sale.category_ids || []).length} categor
                    {(sale.category_ids || []).length === 1 ? "y" : "ies"}
                  </span>
                ) : (
                  <span>Applies to the full marketplace</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSalesPage;