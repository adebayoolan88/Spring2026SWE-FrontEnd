import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  Tags,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getStoredToken } from "../../lib/auth";
import {
  createAdminSale,
  getAdminProducts,
  getAdminSales,
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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        categoryId,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sales.filter((sale) => {
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
  }, [sales, query]);

  const totals = useMemo(() => {
    return {
      all: sales.length,
      active: sales.filter((sale) => sale.is_active && !isExpired(sale)).length,
      inactive: sales.filter((sale) => !sale.is_active).length,
      expired: sales.filter((sale) => isExpired(sale)).length,
    };
  }, [sales]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormError("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProductSelection = (productId) => {
    setFormError("");
    setSuccessMessage("");

    setForm((prev) => {
      const alreadySelected = prev.productIds.includes(productId);

      return {
        ...prev,
        productIds: alreadySelected
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const handleCategorySelection = (categoryId) => {
    setFormError("");
    setSuccessMessage("");

    setForm((prev) => {
      const alreadySelected = prev.categoryIds.includes(categoryId);

      return {
        ...prev,
        categoryIds: alreadySelected
          ? prev.categoryIds.filter((id) => id !== categoryId)
          : [...prev.categoryIds, categoryId],
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

  const handleCreateSale = async (e) => {
    e.preventDefault();

    try {
      validateForm();

      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setCreating(true);
      setFormError("");
      setSuccessMessage("");

      const payload = {
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
      };

      await createAdminSale(token, payload);

      setSuccessMessage("Sale created successfully.");
      setForm(initialForm);

      await loadPageData();

      setTimeout(() => {
        setShowCreateForm(false);
        setSuccessMessage("");
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to create sale.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout
      title="Sales"
      subtitle="Create and review sale campaigns for products, categories, or the full marketplace."
    >
      <div className="admin-sales__stats-grid">
        <div className="admin-sales__sale-card">
          <p className="admin-sales__stat-label">
            Total Sales
          </p>
          <p className="admin-sales__stat-value">{totals.all}</p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">
            Active
          </p>
          <p className="admin-sales__stat-value admin-sales__stat-value--green">
            {totals.active}
          </p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">
            Inactive
          </p>
          <p className="admin-sales__stat-value admin-sales__stat-value--muted">
            {totals.inactive}
          </p>
        </div>

        <div className="admin-sales__stat-card">
          <p className="admin-sales__stat-label">
            Expired
          </p>
          <p className="admin-sales__stat-value admin-sales__stat-value--red">
            {totals.expired}
          </p>
        </div>
      </div>

      <div className="mt-6 admin-sales__stat-card">
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

          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setFormError("");
              setSuccessMessage("");
            }}
            className="admin-sales__create-btn btn-primary"
          >
            <Plus className="admin-sales__icon" />
            {showCreateForm ? "Close Form" : "Create Sale"}
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="admin-sales__create-card">
          <div className="admin-sales__create-header">
            <p className="admin-sales__eyebrow">
              New Sale
            </p>
            <h2 className="admin-sales__section-title">
              Create Sale Campaign
            </h2>
            <p className="admin-sales__section-subtitle">
              These sale campaigns are validated during checkout and can apply to the whole store, categories, or selected products.
            </p>
          </div>

          {formError ? (
            <div className="admin-sales__create-header flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 admin-sales__icon shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-sales__create-header flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 admin-sales__icon shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form className="admin-sales__form" onSubmit={handleCreateSale}>
            <div className="admin-sales__grid admin-sales__grid--2">
              <div>
                <label className="admin-sales__label">
                  Sale Name
                </label>
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
                <label className="admin-sales__label">
                  Description
                </label>
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
                <label className="admin-sales__label">
                  Sale Scope
                </label>
                <select
                  name="saleScope"
                  value={form.saleScope}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormError("");
                    setSuccessMessage("");
                    setForm((prev) => ({
                      ...prev,
                      saleScope: value,
                      productIds: [],
                      categoryIds: [],
                    }));
                  }}
                  className="admin-sales__input"
                >
                  <option value="site_wide">Site-wide</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label className="admin-sales__label">
                  Discount Type
                </label>
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
                <label className="admin-sales__label">
                  Discount Value
                </label>
                <input
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={form.discountType === "percentage" ? "20" : "25.00"}
                  className="admin-sales__input"
                  required
                />
              </div>

              <label className="admin-sales__active-row md:mt-7">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="admin-sales__icon rounded border-slate-300 text-orange-500"
                />
                Active
              </label>
            </div>

            {form.saleScope === "category" ? (
              <div>
                <label className="admin-sales__label admin-sales__label--spaced">
                  Select Categories
                </label>

                <div className="admin-sales__selection-grid">
                  {categories.map((category) => {
                    const selected = form.categoryIds.includes(category.categoryId);

                    return (
                      <button
                        key={category.categoryId}
                        type="button"
                        onClick={() => handleCategorySelection(category.categoryId)}
                        className={`admin-sales__selection-btn ${
                          selected
                            ? "admin-sales__selection-btn--selected"
                            : ""
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {form.saleScope === "product" ? (
              <div>
                <label className="admin-sales__label admin-sales__label--spaced">
                  Select Products
                </label>

                <div className="admin-sales__selection-list">
                  {products.map((product) => {
                    const selected = form.productIds.includes(product.productId);

                    return (
                      <button
                        key={product.productId}
                        type="button"
                        onClick={() => handleProductSelection(product.productId)}
                        className={`admin-sales__selection-row ${
                          selected
                            ? "admin-sales__selection-btn--selected"
                            : ""
                        }`}
                      >
                        <span>
                          <span className="font-semibold">{product.name}</span>
                          <span className="admin-sales__selection-sub">
                            {product.brand || "No brand"} • {product.category?.name || "N/A"}
                          </span>
                        </span>

                        <span className="admin-sales__selection-meta">
                          {selected ? "Selected" : formatMoney(product.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="admin-sales__grid admin-sales__grid--2">
              <div>
                <label className="admin-sales__label">
                  Starts At
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="admin-sales__input"
                />
              </div>

              <div>
                <label className="admin-sales__label">
                  Ends At
                </label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={handleChange}
                  className="admin-sales__input"
                />
              </div>
            </div>

            <div className="admin-sales__actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setForm(initialForm);
                  setFormError("");
                  setSuccessMessage("");
                }}
                className="admin-sales__btn admin-sales__btn--secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="admin-sales__btn admin-sales__btn--primary"
              >
                {creating ? "Creating..." : "Create Sale"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-sales__state-card">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading sales...
          </h2>
          <p className="admin-sales__state-message">Fetching admin sale data.</p>
        </div>
      ) : pageError ? (
        <div className="admin-sales__error">
          {pageError}
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="admin-sales__state-card admin-sales__state-card--empty">
          <Tags className="admin-sales__empty-icon" />
          <h2 className="admin-sales__state-title admin-sales__state-title--spaced">
            No sales found
          </h2>
          <p className="admin-sales__state-message">
            Create a sale campaign to start testing promotional pricing.
          </p>
        </div>
      ) : (
        <div className="admin-sales__table-card">
          <div className="admin-sales__table-wrap">
            <table className="admin-sales__table">
              <thead className="admin-sales__thead">
                <tr>
                  <th className="admin-sales__th">
                    Sale
                  </th>
                  <th className="admin-sales__th">
                    Scope
                  </th>
                  <th className="admin-sales__th">
                    Discount
                  </th>
                  <th className="admin-sales__th">
                    Dates
                  </th>
                  <th className="admin-sales__th">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="admin-sales__tbody">
                {filteredSales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                          <Tags className="admin-sales__icon" />
                        </div>

                        <div>
                          <p className="admin-sales__text-strong">
                            {sale.sale_name}
                          </p>
                          <p className="admin-sales__text-sub">
                            {sale.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="admin-sales__td">
                      <p className="admin-sales__text-sm-strong">
                        {scopeLabel(sale.sale_scope)}
                      </p>
                    </td>

                    <td className="admin-sales__td">
                      <p className="admin-sales__text-sm-strong">
                        {saleDiscountLabel(sale)}
                      </p>
                      <p className="admin-sales__text-sub">
                        {sale.discount_type}
                      </p>
                    </td>

                    <td className="admin-sales__td">
                      <p className="admin-sales__text-xs">
                        Starts:{" "}
                        <span className="admin-sales__meta-value">
                          {formatDate(sale.starts_at)}
                        </span>
                      </p>
                      <p className="admin-sales__text-sub">
                        Ends:{" "}
                        <span className="admin-sales__meta-value">
                          {formatDate(sale.ends_at)}
                        </span>
                      </p>
                    </td>

                    <td className="admin-sales__td">
                      <span
                        className={`admin-sales__badge ${statusClass(
                          sale
                        )}`}
                      >
                        {statusLabel(sale)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSalesPage;