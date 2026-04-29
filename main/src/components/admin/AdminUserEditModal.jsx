import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

function AdminUserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
  saving,
  error,
  successMessage,
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    role: "customer",
    isActive: true,
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role || "customer",
      isActive: user.isActive !== false,
    });
  }, [user]);

  if (!isOpen || !user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      address: form.address.trim() || null,
      role: form.role,
      isActive: Boolean(form.isActive),
    };

    onSave(user.userId, payload);
  };

  return (
    <div
      className="admin-user-edit-modal admin-user-edit-modal--overlay"
      onClick={onClose}
    >
      <div
        className="admin-user-edit-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-user-edit-modal__header">
          <div>
            <p className="admin-user-edit-modal__eyebrow">
              Edit User
            </p>
            <h2 className="admin-user-edit-modal__title">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.username}
            </h2>
            <p className="admin-user-edit-modal__subtitle">
              User ID: {user.userId} • {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="admin-user-edit-modal__close-btn"
          >
            <X className="admin-user-edit-modal__icon" />
          </button>
        </div>

        <form className="admin-user-edit-modal__form" onSubmit={handleSubmit}>
          {error ? (
            <div className="admin-user-edit-modal__alert admin-user-edit-modal__alert--error">
              <AlertCircle className="admin-user-edit-modal__alert-icon" />
              <span>{error}</span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="admin-user-edit-modal__alert admin-user-edit-modal__alert--success">
              <CheckCircle2 className="admin-user-edit-modal__alert-icon" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <div className="admin-user-edit-modal__notice">
            User passwords and Cognito group membership should stay managed through
            Cognito. This panel only updates app database profile fields.
          </div>

          <div className="admin-user-edit-modal__grid admin-user-edit-modal__grid--2">
            <div>
              <label className="admin-user-edit-modal__label">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="admin-user-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-user-edit-modal__label">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="admin-user-edit-modal__input"
              />
            </div>
          </div>

          <div className="admin-user-edit-modal__grid admin-user-edit-modal__grid--2">
            <div>
              <label className="admin-user-edit-modal__label">
                First Name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="admin-user-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-user-edit-modal__label">
                Last Name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="admin-user-edit-modal__input"
              />
            </div>
          </div>

          <div className="admin-user-edit-modal__grid admin-user-edit-modal__grid--2">
            <div>
              <label className="admin-user-edit-modal__label">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="+12105551234"
                className="admin-user-edit-modal__input"
              />
            </div>

            <div>
              <label className="admin-user-edit-modal__label">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="admin-user-edit-modal__input"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-user-edit-modal__label">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="admin-user-edit-modal__input"
            />
          </div>

          <label className="admin-user-edit-modal__active-row">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="admin-user-edit-modal__checkbox"
            />
            Account active
          </label>

          <div className="admin-user-edit-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="admin-user-edit-modal__btn admin-user-edit-modal__btn--secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUserEditModal;