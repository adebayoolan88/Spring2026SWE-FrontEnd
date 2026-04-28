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
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (isExpired(sale)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Sales
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totals.all}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {totals.active}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-700">
            {totals.inactive}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Expired
          </p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {totals.expired}
          </p>
        </div>
      </div>

      <div className="mt-6 admin-stat-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sale name, description, scope, or discount type..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setFormError("");
              setSuccessMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 btn-primary"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? "Close Form" : "Create Sale"}
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              New Sale
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Create Sale Campaign
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              These sale campaigns are validated during checkout and can apply to the whole store, categories, or selected products.
            </p>
          </div>

          {formError ? (
            <div className="mb-5 flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-5 flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleCreateSale}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Sale Name
                </label>
                <input
                  name="saleName"
                  value={form.saleName}
                  onChange={handleChange}
                  placeholder="Spring Instrument Sale"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Discount for selected listings"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="site_wide">Site-wide</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  required
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 md:mt-7">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500"
                />
                Active
              </label>
            </div>

            {form.saleScope === "category" ? (
              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Select Categories
                </label>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => {
                    const selected = form.categoryIds.includes(category.categoryId);

                    return (
                      <button
                        key={category.categoryId}
                        type="button"
                        onClick={() => handleCategorySelection(category.categoryId)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          selected
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Select Products
                </label>

                <div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {products.map((product) => {
                    const selected = form.productIds.includes(product.productId);

                    return (
                      <button
                        key={product.productId}
                        type="button"
                        onClick={() => handleProductSelection(product.productId)}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          <span className="font-semibold">{product.name}</span>
                          <span className="block text-xs text-slate-500">
                            {product.brand || "No brand"} • {product.category?.name || "N/A"}
                          </span>
                        </span>

                        <span className="text-xs font-semibold">
                          {selected ? "Selected" : formatMoney(product.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Starts At
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ends At
                </label>
                <input
                  name="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setForm(initialForm);
                  setFormError("");
                  setSuccessMessage("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Sale"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading sales...
          </h2>
          <p className="mt-2 text-slate-500">Fetching admin sale data.</p>
        </div>
      ) : pageError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Tags className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            No sales found
          </h2>
          <p className="mt-2 text-slate-500">
            Create a sale campaign to start testing promotional pricing.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sale
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scope
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discount
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSales.map((sale) => (
                  <tr key={sale.sale_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                          <Tags className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {sale.sale_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {sale.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {scopeLabel(sale.sale_scope)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {saleDiscountLabel(sale)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {sale.discount_type}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-500">
                        Starts:{" "}
                        <span className="font-medium text-slate-900">
                          {formatDate(sale.starts_at)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ends:{" "}
                        <span className="font-medium text-slate-900">
                          {formatDate(sale.ends_at)}
                        </span>
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
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