import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Percent,
  Plus,
  Search,
  TicketPercent,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getStoredToken } from "../../lib/auth";
import {
  createAdminDiscountCode,
  getAdminDiscountCodes,
} from "../../lib/admin";

const initialForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "0",
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
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

function discountLabel(code) {
  if (code.discount_type === "percentage") {
    return `${Number(code.discount_value || 0)}% off`;
  }

  if (code.discount_type === "fixed_amount") {
    return `${formatMoney(code.discount_value)} off`;
  }

  return "Discount";
}

function isExpired(code) {
  if (!code.expires_at) return false;
  return new Date(code.expires_at) <= new Date();
}

function statusClass(code) {
  if (!code.is_active) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (isExpired(code)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function statusLabel(code) {
  if (!code.is_active) return "Inactive";
  if (isExpired(code)) return "Expired";
  return "Active";
}

function AdminDiscountCodesPage() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDiscountCodes = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setLoading(true);
      setPageError("");

      const result = await getAdminDiscountCodes(token);
      setDiscountCodes(result.discountCodes || []);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to load discount codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscountCodes();
  }, []);

  const filteredCodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return discountCodes.filter((code) => {
      const searchableText = [
        code.code,
        code.description,
        code.discount_type,
        code.discount_value,
        code.minimum_order_amount,
      ]
        .join(" ")
        .toLowerCase();

      return !normalizedQuery || searchableText.includes(normalizedQuery);
    });
  }, [discountCodes, query]);

  const totals = useMemo(() => {
    return {
      all: discountCodes.length,
      active: discountCodes.filter((code) => code.is_active && !isExpired(code)).length,
      inactive: discountCodes.filter((code) => !code.is_active).length,
      expired: discountCodes.filter((code) => isExpired(code)).length,
    };
  }, [discountCodes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormError("");
    setSuccessMessage("");

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const code = form.code.trim();
    const discountValue = Number(form.discountValue);
    const minimumOrderAmount = Number(form.minimumOrderAmount || 0);
    const maxUses = form.maxUses === "" ? null : Number(form.maxUses);

    if (!code) {
      throw new Error("Discount code is required.");
    }

    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      throw new Error("Code can only include letters, numbers, underscores, or dashes.");
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Discount value must be greater than 0.");
    }

    if (form.discountType === "percentage" && discountValue > 100) {
      throw new Error("Percentage discount cannot be greater than 100.");
    }

    if (!Number.isFinite(minimumOrderAmount) || minimumOrderAmount < 0) {
      throw new Error("Minimum order amount cannot be negative.");
    }

    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
      throw new Error("Max uses must be a positive whole number.");
    }

    if (form.startsAt && form.expiresAt) {
      const startsAt = new Date(form.startsAt);
      const expiresAt = new Date(form.expiresAt);

      if (expiresAt <= startsAt) {
        throw new Error("Expiration date must be after the start date.");
      }
    }
  };

  const handleCreateDiscountCode = async (e) => {
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
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumOrderAmount: Number(form.minimumOrderAmount || 0),
        maxUses: form.maxUses === "" ? null : Number(form.maxUses),
        startsAt: formatDateTimeForApi(form.startsAt),
        expiresAt: formatDateTimeForApi(form.expiresAt),
        isActive: Boolean(form.isActive),
      };

      await createAdminDiscountCode(token, payload);

      setSuccessMessage("Discount code created successfully.");
      setForm(initialForm);

      await loadDiscountCodes();

      setTimeout(() => {
        setShowCreateForm(false);
        setSuccessMessage("");
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to create discount code.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout
      title="Discount Codes"
      subtitle="Create and review discount codes that can be applied during checkout."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Codes
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totals.all}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{totals.active}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Inactive
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-700">{totals.inactive}</p>
        </div>

        <div className="admin-stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Expired
          </p>
          <p className="mt-2 text-2xl font-bold text-red-700">{totals.expired}</p>
        </div>
      </div>

      <div className="mt-6 admin-stat-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, description, or discount type..."
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
            {showCreateForm ? "Close Form" : "Create Code"}
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              New Discount
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Create Discount Code
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This code will be validated by the backend during checkout.
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

          <form className="space-y-5" onSubmit={handleCreateDiscountCode}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="WELCOME10"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                  placeholder="10 percent off first order"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
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
                  placeholder={form.discountType === "percentage" ? "10" : "25.00"}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Minimum Order
                </label>
                <input
                  name="minimumOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumOrderAmount}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Max Uses
                </label>
                <input
                  name="maxUses"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxUses}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

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
                  Expires At
                </label>
                <input
                  name="expiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-orange-500"
              />
              Active immediately
            </label>

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
                {creating ? "Creating..." : "Create Discount Code"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading discount codes...
          </h2>
          <p className="mt-2 text-slate-500">Fetching admin discount data.</p>
        </div>
      ) : pageError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <TicketPercent className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            No discount codes found
          </h2>
          <p className="mt-2 text-slate-500">
            Create your first discount code to start testing checkout promotions.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Discount
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Minimum
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uses
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
                {filteredCodes.map((code) => (
                  <tr key={code.discount_code_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                          <Percent className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">{code.code}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {code.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {discountLabel(code)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {code.discount_type}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {formatMoney(code.minimum_order_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {Number(code.uses_count || 0)}
                        {code.max_uses ? ` / ${code.max_uses}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {code.max_uses ? "limited" : "unlimited"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-500">
                        Starts:{" "}
                        <span className="font-medium text-slate-900">
                          {formatDate(code.starts_at)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Expires:{" "}
                        <span className="font-medium text-slate-900">
                          {formatDate(code.expires_at)}
                        </span>
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                          code
                        )}`}
                      >
                        {statusLabel(code)}
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

export default AdminDiscountCodesPage;