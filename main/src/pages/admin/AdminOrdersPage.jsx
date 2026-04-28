import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  DollarSign,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getStoredToken } from "../../lib/auth";
import { getAdminOrders, updateAdminOrderStatus } from "../../lib/admin";

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

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "paid" ||
    normalized === "delivered"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "refunded" ||
    normalized === "unpaid"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [direction, setDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const loadOrders = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setLoading(true);
      setPageError("");

      const result = await getAdminOrders(token, {
        sortBy,
        direction,
      });

      setOrders(result.orders || []);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to load admin orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [sortBy, direction]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const searchableText = [
        order.orderNumber,
        order.orderId,
        order.orderStatus,
        order.paymentStatus,
        order.customer?.name,
        order.customer?.username,
        order.customer?.email,
        order.totalAmount,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        String(order.orderStatus || "").toLowerCase() === statusFilter ||
        String(order.paymentStatus || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, sortBy, direction]);

  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGE_COUNT, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const totals = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0
    );

    return {
      all: orders.length,
      completed: orders.filter(
        (order) => String(order.orderStatus || "").toLowerCase() === "completed"
      ).length,
      pending: orders.filter(
        (order) => String(order.orderStatus || "").toLowerCase() === "pending"
      ).length,
      revenue: totalRevenue,
    };
  }, [orders]);

  const toggleDirection = () => {
    setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleUpdateOrderStatus = async (orderId, orderStatus) => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setUpdatingOrderId(orderId);
      setPageError("");
      setStatusMessage("");

      await updateAdminOrderStatus(token, orderId, orderStatus);

      setStatusMessage(`Order ${orderId} updated to ${orderStatus}.`);

      await loadOrders();

      setTimeout(() => {
        setStatusMessage("");
      }, 2500);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="View placed orders, order history, customer details, and order totals."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Orders
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totals.all}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <ReceiptText className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Completed
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {totals.completed}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pending
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-700">
                {totals.pending}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Revenue
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatMoney(totals.revenue)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <DollarSign className="h-5 w-5" />
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
              placeholder="Search by order number, customer, email, status, or amount..."
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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="date">Sort by order date</option>
              <option value="customer">Sort by customer</option>
              <option value="amount">Sort by dollar amount</option>
              <option value="status">Sort by status</option>
            </select>

            <button
              onClick={toggleDirection}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {direction === "asc" ? (
                <>
                  <ArrowUpAZ className="h-4 w-4" />
                  Asc
                </>
              ) : (
                <>
                  <ArrowDownAZ className="h-4 w-4" />
                  Desc
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading orders...
          </h2>
          <p className="mt-2 text-slate-500">Fetching marketplace orders.</p>
        </div>
      ) : pageError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <ReceiptText className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            No orders found
          </h2>
          <p className="mt-2 text-slate-500">
            Orders will appear here after customers complete checkout.
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
                      Order
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Items
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amounts
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {order.orderId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {order.customer?.name ||
                            order.customer?.username ||
                            "Unknown"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatDate(order.orderDate)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {order.itemCount || 0}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          {formatMoney(order.totalAmount)}
                        </p>

                        <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                          <p>Subtotal: {formatMoney(order.subtotalAmount)}</p>
                          <p>Tax: {formatMoney(order.taxAmount)}</p>
                          <p>Discount: -{formatMoney(order.discountAmount)}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                              order.orderStatus
                            )}`}
                          >
                            Order: {order.orderStatus || "N/A"}
                          </span>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                              order.paymentStatus
                            )}`}
                          >
                            Payment: {order.paymentStatus || "N/A"}
                          </span>

                          <select
                            value={order.orderStatus || "pending"}
                            disabled={updatingOrderId === order.orderId}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.orderId, e.target.value)
                            }
                            className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
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
              {filteredOrders.length} matching order
              {filteredOrders.length === 1 ? "" : "s"}
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
    </AdminLayout>
  );
}

export default AdminOrdersPage;