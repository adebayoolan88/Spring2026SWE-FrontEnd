import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminUserEditModal from "../../components/admin/AdminUserEditModal";
import { getStoredToken } from "../../lib/auth";
import { getAdminUsers, updateAdminUser } from "../../lib/admin";

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_COUNT = 5;

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

function statusClass(isActive) {
  return isActive ? "admin-users__badge admin-users__badge--active" : "admin-users__badge admin-users__badge--inactive";
}

function roleClass(role) {
  return String(role || "").toLowerCase() === "admin" ? "admin-users__badge admin-users__badge--admin" : "admin-users__badge admin-users__badge--customer";
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingUser, setEditingUser] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setLoading(true);
      setPageError("");

      const result = await getAdminUsers(token);
      setUsers(result.users || []);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to load admin users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const searchableText = [
        user.userId,
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.phoneNumber,
        user.address,
        user.role,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      const matchesRole =
        roleFilter === "all" ||
        String(user.role || "").toLowerCase() === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, query, statusFilter, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, roleFilter]);

  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGE_COUNT, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totals = useMemo(() => {
    return {
      all: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
      admins: users.filter(
        (user) => String(user.role || "").toLowerCase() === "admin"
      ).length,
    };
  }, [users]);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setModalError("");
    setModalSuccess("");
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setModalError("");
    setModalSuccess("");
  };

  const handleSaveUser = async (userId, payload) => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      if (!payload.username) {
        throw new Error("Username is required.");
      }

      if (!payload.email) {
        throw new Error("Email is required.");
      }

      setSaving(true);
      setModalError("");
      setModalSuccess("");

      await updateAdminUser(token, userId, payload);

      setModalSuccess("User updated successfully.");

      await loadUsers();

      setTimeout(() => {
        handleCloseEdit();
      }, 500);
    } catch (err) {
      console.error(err);
      setModalError(err.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Users"
      subtitle="View and manage marketplace users, account status, and app-level roles."
    >
      <div className="admin-users__stats-grid">
        <div className="admin-users__stat-card">
          <div className="admin-users__stat-row">
            <div>
              <p className="admin-users__stat-label">
                Total Users
              </p>
              <p className="admin-users__stat-value">
                {totals.all}
              </p>
            </div>
            <div className="admin-users__stat-icon-wrap admin-users__stat-icon-wrap--orange">
              <Users className="admin-users__icon" />
            </div>
          </div>
        </div>

        <div className="admin-users__stat-card">
          <div className="admin-users__stat-row">
            <div>
              <p className="admin-users__stat-label">
                Active
              </p>
              <p className="admin-users__stat-value admin-users__stat-value--green">
                {totals.active}
              </p>
            </div>
            <div className="admin-users__stat-icon-wrap admin-users__stat-icon-wrap--green">
              <UserCheck className="admin-users__icon" />
            </div>
          </div>
        </div>

        <div className="admin-users__stat-card">
          <div className="admin-users__stat-row">
            <div>
              <p className="admin-users__stat-label">
                Inactive
              </p>
              <p className="admin-users__stat-value admin-users__stat-value--red">
                {totals.inactive}
              </p>
            </div>
            <div className="admin-users__stat-icon-wrap admin-users__stat-icon-wrap--red">
              <UserX className="admin-users__icon" />
            </div>
          </div>
        </div>

        <div className="admin-users__stat-card">
          <div className="admin-users__stat-row">
            <div>
              <p className="admin-users__stat-label">
                Admin Role
              </p>
              <p className="admin-users__stat-value admin-users__stat-value--orange">
                {totals.admins}
              </p>
            </div>
            <div className="admin-users__stat-icon-wrap admin-users__stat-icon-wrap--orange">
              <ShieldCheck className="admin-users__icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-users__filters">
        <div className="admin-users__filters-row">
          <div className="admin-users__search">
            <Search className="admin-users__search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, email, phone, role, or address..."
              className="admin-users__search-input"
            />
          </div>

          <div className="admin-users__filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-users__select"
            >
              <option value="all">All statuses</option>
              <option value="active">Active users</option>
              <option value="inactive">Inactive users</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-users__select"
            >
              <option value="all">All roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-users__state-card">
          <h2 className="admin-users__state-title">
            Loading users...
          </h2>
          <p className="admin-users__state-message">Fetching marketplace users.</p>
        </div>
      ) : pageError ? (
        <div className="admin-users__error">
          {pageError}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users__state-card admin-users__state-card--empty">
          <Users className="admin-users__empty-icon" />
          <h2 className="admin-users__state-title admin-users__state-title--spaced">
            No users found
          </h2>
          <p className="admin-users__state-message">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-users__table-card">
            <div className="admin-users__table-wrap">
              <table className="admin-users__table">
                <thead className="admin-users__thead">
                  <tr>
                    <th className="admin-users__th">
                      User
                    </th>
                    <th className="admin-users__th">
                      Contact
                    </th>
                    <th className="admin-users__th">
                      Role
                    </th>
                    <th className="admin-users__th">
                      Orders
                    </th>
                    <th className="admin-users__th">
                      Total Spent
                    </th>
                    <th className="admin-users__th">
                      Status
                    </th>
                    <th className="admin-users__th">
                      Joined
                    </th>
                    <th className="admin-users__th admin-users__th--right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="admin-users__tbody">
                  {paginatedUsers.map((user) => (
                    <tr key={user.userId} className="admin-users__tr">
                      <td className="admin-users__td admin-users__td--primary">
                        <p className="admin-users__text-strong">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.username}
                        </p>
                        <p className="admin-users__text-sub">
                          @{user.username}
                        </p>
                        <p className="admin-users__text-muted">
                          ID: {user.userId}
                        </p>
                      </td>

                      <td className="admin-users__td">
                        <p className="admin-users__text-sm-strong">
                          {user.email}
                        </p>
                        <p className="admin-users__text-sub">
                          {user.phoneNumber || "No phone"}
                        </p>
                      </td>

                      <td className="admin-users__td">
                        <span
                          className={roleClass(
                            user.role
                          )}
                        >
                          {user.role || "customer"}
                        </span>
                      </td>

                      <td className="admin-users__td admin-users__text-sm-strong">
                        {user.orderCount || 0}
                      </td>

                      <td className="admin-users__td admin-users__text-strong">
                        {formatMoney(user.totalSpent)}
                      </td>

                      <td className="admin-users__td">
                        <span
                          className={statusClass(
                            user.isActive
                          )}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="admin-users__td admin-users__text-sm">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="admin-users__td admin-users__td--right">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="admin-users__action-btn"
                        >
                          <Edit className="admin-users__action-icon" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-users__pagination">
            <p className="admin-users__pagination-summary">
              Showing page {currentPage} of {totalPages} •{" "}
              {filteredUsers.length} matching user
              {filteredUsers.length === 1 ? "" : "s"}
            </p>

            <div className="admin-users__pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="admin-users__page-btn"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isActive = currentPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`admin-users__page-btn ${isActive ? "admin-users__page-btn--active" : ""}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="admin-users__page-btn"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <AdminUserEditModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={handleCloseEdit}
        onSave={handleSaveUser}
        saving={saving}
        error={modalError}
        successMessage={modalSuccess}
      />
    </AdminLayout>
  );
}

export default AdminUsersPage;
