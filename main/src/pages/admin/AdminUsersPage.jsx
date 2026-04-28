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
  return isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700";
}

function roleClass(role) {
  return String(role || "").toLowerCase() === "admin"
    ? "border-orange-200 bg-orange-50 text-orange-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Users
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totals.all}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {totals.active}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Inactive
              </p>
              <p className="mt-2 text-2xl font-bold text-red-700">
                {totals.inactive}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Admin Role
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-700">
                {totals.admins}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 admin-stat-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, email, phone, role, or address..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="all">All statuses</option>
              <option value="active">Active users</option>
              <option value="inactive">Inactive users</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="all">All roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading users...
          </h2>
          <p className="mt-2 text-slate-500">Fetching marketplace users.</p>
        </div>
      ) : pageError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            No users found
          </h2>
          <p className="mt-2 text-slate-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Orders
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total Spent
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Joined
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.username}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          @{user.username}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          ID: {user.userId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {user.phoneNumber || "No phone"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleClass(
                            user.role
                          )}`}
                        >
                          {user.role || "customer"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {user.orderCount || 0}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {formatMoney(user.totalSpent)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            user.isActive
                          )}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing page {currentPage} of {totalPages} •{" "}
              {filteredUsers.length} matching user
              {filteredUsers.length === 1 ? "" : "s"}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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