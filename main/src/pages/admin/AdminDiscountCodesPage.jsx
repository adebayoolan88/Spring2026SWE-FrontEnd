import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Percent,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getStoredToken } from "../../lib/auth";
import {
  createAdminDiscountCode,
  deleteAdminDiscountCode,
  getAdminDiscountCodes,
  updateAdminDiscountCode,
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
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);

  const isEditing = Boolean(editingCode);

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
      if (!showInactive && !code.is_active) {
        return false;
      }

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
  }, [discountCodes, query, showInactive]);

  const totals = useMemo(() => {
    return {
      all: discountCodes.length,
      visible: filteredCodes.length,
      active: discountCodes.filter((code) => code.is_active && !isExpired(code))
        .length,
      inactive: discountCodes.filter((code) => !code.is_active).length,
      expired: discountCodes.filter((code) => isExpired(code)).length,
    };
  }, [discountCodes, filteredCodes]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingCode(null);
    setShowForm(false);
    setFormError("");
    setSuccessMessage("");
  };

  const handleOpenCreate = () => {
    setForm(initialForm);
    setEditingCode(null);
    setShowForm((prev) => !prev);
    setFormError("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");
  };

  const handleOpenEdit = (code) => {
    setEditingCode(code);
    setShowForm(true);
    setFormError("");
    setSuccessMessage("");
    setActionError("");
    setActionSuccess("");

    setForm({
      code: code.code || "",
      description: code.description || "",
      discountType: code.discount_type || "percentage",
      discountValue:
        code.discount_value === null || code.discount_value === undefined
          ? ""
          : String(code.discount_value),
      minimumOrderAmount:
        code.minimum_order_amount === null ||
        code.minimum_order_amount === undefined
          ? "0"
          : String(code.minimum_order_amount),
      maxUses:
        code.max_uses === null || code.max_uses === undefined
          ? ""
          : String(code.max_uses),
      startsAt: formatDateTimeForInput(code.starts_at),
      expiresAt: formatDateTimeForInput(code.expires_at),
      isActive: Boolean(code.is_active),
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

  const buildPayload = () => ({
    code: form.code.trim().toUpperCase(),
    description: form.description.trim() || null,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minimumOrderAmount: Number(form.minimumOrderAmount || 0),
    maxUses: form.maxUses === "" ? null : Number(form.maxUses),
    startsAt: formatDateTimeForApi(form.startsAt),
    expiresAt: formatDateTimeForApi(form.expiresAt),
    isActive: Boolean(form.isActive),
  });

  const handleSaveDiscountCode = async (e) => {
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
        await updateAdminDiscountCode(
          token,
          editingCode.discount_code_id,
          payload
        );
        setSuccessMessage("Discount code updated successfully.");
      } else {
        await createAdminDiscountCode(token, payload);
        setSuccessMessage("Discount code created successfully.");
      }

      await loadDiscountCodes();

      setTimeout(() => {
        resetForm();
      }, 700);
    } catch (err) {
      console.error(err);
      setFormError(
        err.message ||
          `Failed to ${isEditing ? "update" : "create"} discount code.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateDiscountCode = async (code) => {
    const confirmed = window.confirm(
      `Deactivate discount code "${code.code}"? It will no longer be usable at checkout.`
    );

    if (!confirmed) return;

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setDeactivatingId(code.discount_code_id);
      setActionError("");
      setActionSuccess("");

      await deleteAdminDiscountCode(token, code.discount_code_id);

      setActionSuccess(`Discount code "${code.code}" deactivated.`);
      await loadDiscountCodes();
    } catch (err) {
      console.error(err);
      setActionError(err.message || "Failed to deactivate discount code.");
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <AdminLayout
      title="Discount Codes"
      subtitle="Create, edit, and deactivate discount codes that can be applied during checkout."
    >
      <div className="admin-discount-codes__stats-grid">
        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">Total Codes</p>
          <p className="admin-discount-codes__stat-value">{totals.all}</p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">Active</p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--green">
            {totals.active}
          </p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">Inactive</p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--muted">
            {totals.inactive}
          </p>
        </div>

        <div className="admin-discount-codes__stat-card">
          <p className="admin-discount-codes__stat-label">Expired</p>
          <p className="admin-discount-codes__stat-value admin-discount-codes__stat-value--red">
            {totals.expired}
          </p>
        </div>
      </div>

      <div className="admin-discount-codes__filters">
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

          <label className="admin-discount-codes__toggle-filter">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="admin-discount-codes__checkbox"
            />
            Show inactive codes
          </label>

          <button
            onClick={handleOpenCreate}
            className="admin-discount-codes__create-btn btn-primary"
          >
            <Plus className="admin-discount-codes__icon" />
            {showForm && !isEditing ? "Close Form" : "Create Code"}
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="admin-discount-codes__alert admin-discount-codes__alert--error admin-discount-codes__alert--spaced">
          <AlertCircle className="admin-discount-codes__alert-icon" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="admin-discount-codes__alert admin-discount-codes__alert--success admin-discount-codes__alert--spaced">
          <CheckCircle2 className="admin-discount-codes__alert-icon" />
          <span>{actionSuccess}</span>
        </div>
      ) : null}

      {showForm ? (
        <div className="admin-discount-codes__create-card">
          <div className="admin-discount-codes__create-header admin-discount-codes__create-header--split">
            <div>
              <p className="admin-discount-codes__eyebrow">
                {isEditing ? "Edit Discount" : "New Discount"}
              </p>
              <h2 className="admin-discount-codes__section-title">
                {isEditing ? "Edit Discount Code" : "Create Discount Code"}
              </h2>
              <p className="admin-discount-codes__section-subtitle">
                {isEditing
                  ? "Update this discount code's value, status, limits, or dates."
                  : "This code will be validated by the backend during checkout."}
              </p>
            </div>

            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="admin-discount-codes__icon-btn"
                aria-label="Close editor"
              >
                <X className="admin-discount-codes__icon" />
              </button>
            ) : null}
          </div>

          {formError ? (
            <div className="admin-discount-codes__alert admin-discount-codes__alert--error">
              <AlertCircle className="admin-discount-codes__alert-icon" />
              <span>{formError}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-discount-codes__alert admin-discount-codes__alert--success">
              <CheckCircle2 className="admin-discount-codes__alert-icon" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form
            className="admin-discount-codes__form"
            onSubmit={handleSaveDiscountCode}
          >
            <div className="admin-discount-codes__grid admin-discount-codes__grid--2">
              <div>
                <label className="admin-discount-codes__label">Code</label>
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
                <label className="admin-discount-codes__label">Max Uses</label>
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
                className="admin-discount-codes__checkbox"
              />
              Active
            </label>

            <div className="admin-discount-codes__actions">
              <button
                type="button"
                onClick={resetForm}
                className="admin-discount-codes__btn admin-discount-codes__btn--secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="admin-discount-codes__btn admin-discount-codes__btn--primary"
              >
                {saving
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Discount Code"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="admin-discount-codes__state-card">
          <h2 className="admin-discount-codes__state-title">
            Loading discount codes...
          </h2>
          <p className="admin-discount-codes__state-message">
            Fetching admin discount data.
          </p>
        </div>
      ) : pageError ? (
        <div className="admin-discount-codes__error">{pageError}</div>
      ) : filteredCodes.length === 0 ? (
        <div className="admin-discount-codes__state-card admin-discount-codes__state-card--empty">
          <TicketPercent className="admin-discount-codes__empty-icon" />
          <h2 className="admin-discount-codes__state-title admin-discount-codes__state-title--spaced">
            No discount codes found
          </h2>
          <p className="admin-discount-codes__state-message">
            {showInactive
              ? "No discount codes match your current search."
              : "No active discount codes match your current view. Turn on inactive codes to view deactivated codes."}
          </p>
        </div>
      ) : (
        <div className="admin-discount-codes__table-card">
          <div className="admin-discount-codes__table-wrap">
            <table className="admin-discount-codes__table">
              <thead className="admin-discount-codes__thead">
                <tr>
                  <th className="admin-discount-codes__th">Code</th>
                  <th className="admin-discount-codes__th">Discount</th>
                  <th className="admin-discount-codes__th">Minimum</th>
                  <th className="admin-discount-codes__th">Uses</th>
                  <th className="admin-discount-codes__th">Dates</th>
                  <th className="admin-discount-codes__th">Status</th>
                  <th className="admin-discount-codes__th admin-discount-codes__th--right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="admin-discount-codes__tbody">
                {filteredCodes.map((code) => (
                  <tr
                    key={code.discount_code_id}
                    className="admin-discount-codes__tr"
                  >
                    <td className="admin-discount-codes__td admin-discount-codes__td--primary">
                      <div className="admin-discount-codes__entity">
                        <div className="admin-discount-codes__entity-icon-wrap">
                          <Percent className="admin-discount-codes__icon" />
                        </div>
                        <div>
                          <p className="admin-discount-codes__code">
                            {code.code}
                          </p>
                          <p className="admin-discount-codes__muted">
                            {code.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="admin-discount-codes__td">
                      <p className="admin-discount-codes__strong">
                        {discountLabel(code)}
                      </p>
                      <p className="admin-discount-codes__muted">
                        {code.discount_type}
                      </p>
                    </td>

                    <td className="admin-discount-codes__td">
                      {formatMoney(code.minimum_order_amount)}
                    </td>

                    <td className="admin-discount-codes__td">
                      {code.uses_count || 0}
                      {code.max_uses ? ` / ${code.max_uses}` : " / unlimited"}
                    </td>

                    <td className="admin-discount-codes__td">
                      <p className="admin-discount-codes__muted">
                        Starts: {formatDate(code.starts_at)}
                      </p>
                      <p className="admin-discount-codes__muted">
                        Ends: {formatDate(code.expires_at)}
                      </p>
                    </td>

                    <td className="admin-discount-codes__td">
                      <span className={statusClass(code)}>
                        {statusLabel(code)}
                      </span>
                    </td>

                    <td className="admin-discount-codes__td admin-discount-codes__td--right">
                      <div className="admin-discount-codes__row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(code)}
                          className="admin-discount-codes__action-btn"
                        >
                          <Edit className="admin-discount-codes__action-icon" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeactivateDiscountCode(code)}
                          disabled={!code.is_active || deactivatingId === code.discount_code_id}
                          className="admin-discount-codes__action-btn admin-discount-codes__action-btn--danger"
                        >
                          <Trash2 className="admin-discount-codes__action-icon" />
                          {deactivatingId === code.discount_code_id
                            ? "Deactivating..."
                            : "Deactivate"}
                        </button>
                      </div>
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