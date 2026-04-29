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
    return "admin-discount-codes__badge admin-discount-codes__badge--inactive";
  }

  if (isExpired(code)) {
    return "admin-discount-codes__badge admin-discount-codes__badge--expired";
  }

  return "admin-discount-codes__badge admin-discount-codes__badge--active";
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
      <div className="admin-discount-codes__stats-grid">
        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">
            Total Codes
          </p>
          <p className="admin-discount-codes__stat-value">{totals.all}</p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">
            Active
          </p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--green">{totals.active}</p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">
            Inactive
          </p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--muted">{totals.inactive}</p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">
            Expired
          </p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--red">{totals.expired}</p>
        </div>
      </div>

      <div className="mt-6 admin-discount-codes__stat-card">
        <div className="admin-discount-codes__filters-row">
          <div className="admin-discount-codes__search">
            <Search className="admin-discount-codes__search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code, description, or discount type..."
              className="admin-discount-codes__search-input"
            />
          </div>

          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setFormError("");
              setSuccessMessage("");
            }}
            className="admin-discount-codes__create-btn btn-primary"
          >
            <Plus className="admin-discount-codes__icon" />
            {showCreateForm ? "Close Form" : "Create Code"}
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="admin-discount-codes__create-card">
          <div className="admin-discount-codes__create-header">
            <p className="admin-discount-codes__eyebrow">
              New Discount
            </p>
            <h2 className="admin-discount-codes__section-title">
              Create Discount Code
            </h2>
            <p className="admin-discount-codes__section-subtitle">
              This code will be validated by the backend during checkout.
            </p>
          </div>

          {formError ? (
            <div className="admin-discount-codes__create-header flex gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 admin-discount-codes__icon shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-discount-codes__create-header flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 admin-discount-codes__icon shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form className="admin-discount-codes__form" onSubmit={handleCreateDiscountCode}>
            <div className="admin-discount-codes__grid admin-discount-codes__grid--2">
              <div>
                <label className="admin-discount-codes__label">
                  Code
                </label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="WELCOME10"
                  className="admin-discount-codes__input admin-discount-codes__input--upper"
                  required
                />
              </div>

              <div>
                <label className="admin-discount-codes__label">
                  Description
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="10 percent off first order"
                  className="admin-discount-codes__input"
                />
              </div>
            </div>

            <div className="admin-discount-codes__grid admin-discount-codes__grid--4">
              <div>
                <label className="admin-discount-codes__label">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="admin-discount-codes__input"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="admin-discount-codes__label">
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
                  className="admin-discount-codes__input"
                  required
                />
              </div>

              <div>
                <label className="admin-discount-codes__label">
                  Minimum Order
                </label>
                <input
                  name="minimumOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumOrderAmount}
                  onChange={handleChange}
                  className="admin-discount-codes__input"
                />
              </div>

              <div>
                <label className="admin-discount-codes__label">
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
                  className="admin-discount-codes__input"
                />
              </div>
            </div>

            <div className="admin-discount-codes__grid admin-discount-codes__grid--2">
              <div>
                <label className="admin-discount-codes__label">
                  Starts At
                </label>
                <input
                  name="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={handleChange}
                  className="admin-discount-codes__input"
                />
              </div>

              <div>
                <label className="admin-discount-codes__label">
                  Expires At
                </label>
                <input
                  name="expiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={handleChange}
                  className="admin-discount-codes__input"
                />
              </div>
            </div>

            <label className="admin-discount-codes__active-row">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
                className="admin-discount-codes__icon rounded border-slate-300 text-orange-500"
              />
              Active immediately
            </label>

            <div className="admin-discount-codes__actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setForm(initialForm);
                  setFormError("");
                  setSuccessMessage("");
                }}
                className="admin-discount-codes__btn admin-discount-codes__btn--secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="admin-discount-codes__btn admin-discount-codes__btn--primary"
              >
                {creating ? "Creating..." : "Create Discount Code"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-discount-codes__state-card">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading discount codes...
          </h2>
          <p className="admin-discount-codes__state-message">Fetching admin discount data.</p>
        </div>
      ) : pageError ? (
        <div className="admin-discount-codes__error">
          {pageError}
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="admin-discount-codes__state-card admin-discount-codes__state-card--empty">
          <TicketPercent className="admin-discount-codes__empty-icon" />
          <h2 className="admin-discount-codes__state-title admin-discount-codes__state-title--spaced">
            No discount codes found
          </h2>
          <p className="admin-discount-codes__state-message">
            Create your first discount code to start testing checkout promotions.
          </p>
        </div>
      ) : (
        <div className="admin-discount-codes__table-card">
          <div className="admin-discount-codes__table-wrap">
            <table className="admin-discount-codes__table">
              <thead className="admin-discount-codes__thead">
                <tr>
                  <th className="admin-discount-codes__th">
                    Code
                  </th>
                  <th className="admin-discount-codes__th">
                    Discount
                  </th>
                  <th className="admin-discount-codes__th">
                    Minimum
                  </th>
                  <th className="admin-discount-codes__th">
                    Uses
                  </th>
                  <th className="admin-discount-codes__th">
                    Dates
                  </th>
                  <th className="admin-discount-codes__th">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="admin-discount-codes__tbody">
                {filteredCodes.map((code) => (
                  <tr key={code.discount_code_id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                          <Percent className="admin-discount-codes__icon" />
                        </div>

                        <div>
                          <p className="admin-discount-codes__text-strong">{code.code}</p>
                          <p className="admin-discount-codes__text-sub">
                            {code.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="admin-discount-codes__td">
                      <p className="admin-discount-codes__text-sm-strong">
                        {discountLabel(code)}
                      </p>
                      <p className="admin-discount-codes__text-sub">
                        {code.discount_type}
                      </p>
                    </td>

                    <td className="admin-discount-codes__td admin-discount-codes__text-sm-strong">
                      {formatMoney(code.minimum_order_amount)}
                    </td>

                    <td className="admin-discount-codes__td">
                      <p className="admin-discount-codes__text-sm-strong">
                        {Number(code.uses_count || 0)}
                        {code.max_uses ? ` / ${code.max_uses}` : ""}
                      </p>
                      <p className="admin-discount-codes__text-sub">
                        {code.max_uses ? "limited" : "unlimited"}
                      </p>
                    </td>

                    <td className="admin-discount-codes__td">
                      <p className="admin-discount-codes__text-xs">
                        Starts:{" "}
                        <span className="admin-discount-codes__meta-value">
                          {formatDate(code.starts_at)}
                        </span>
                      </p>
                      <p className="admin-discount-codes__text-sub">
                        Expires:{" "}
                        <span className="admin-discount-codes__meta-value">
                          {formatDate(code.expires_at)}
                        </span>
                      </p>
                    </td>

                    <td className="admin-discount-codes__td">
                      <span
                        className={`admin-discount-codes__badge ${statusClass(
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