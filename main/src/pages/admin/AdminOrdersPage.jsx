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
    return "admin-orders__badge admin-orders__badge--completed";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "admin-orders__badge admin-orders__badge--pending";
  }

  if (
    normalized === "cancelled" ||
    normalized === "refunded" ||
    normalized === "unpaid"
  ) {
    return "admin-orders__badge admin-orders__badge--cancelled";
  }

  return "admin-orders__badge admin-orders__badge--default";
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
      <div className="admin-orders__stats-grid">
        <div className="admin-orders__stat-card">
          <div className="admin-orders__stat-row">
            <div>
              <p className="admin-orders__stat-label">
                Total Orders
              </p>
              <p className="admin-orders__stat-value">
                {totals.all}
              </p>
            </div>
            <div className="admin-orders__stat-icon-wrap admin-orders__stat-icon-wrap--orange">
              <ReceiptText className="admin-orders__icon" />
            </div>
          </div>
        </div>

        <div className="admin-orders__stat-card">
          <div className="admin-orders__stat-row">
            <div>
              <p className="admin-orders__stat-label">
                Completed
              </p>
              <p className="admin-orders__stat-value admin-orders__stat-value--green">
                {totals.completed}
              </p>
            </div>
            <div className="admin-orders__stat-icon-wrap admin-orders__stat-icon-wrap--green">
              <ShoppingBag className="admin-orders__icon" />
            </div>
          </div>
        </div>

        <div className="admin-orders__stat-card">
          <div className="admin-orders__stat-row">
            <div>
              <p className="admin-orders__stat-label">
                Pending
              </p>
              <p className="admin-orders__stat-value admin-orders__stat-value--orange">
                {totals.pending}
              </p>
            </div>
            <div className="admin-orders__stat-icon-wrap admin-orders__stat-icon-wrap--orange">
              <RefreshCw className="admin-orders__icon" />
            </div>
          </div>
        </div>

        <div className="admin-orders__stat-card">
          <div className="admin-orders__stat-row">
            <div>
              <p className="admin-orders__stat-label">
                Revenue
              </p>
              <p className="admin-orders__stat-value">
                {formatMoney(totals.revenue)}
              </p>
            </div>
            <div className="admin-orders__stat-icon-wrap admin-orders__stat-icon-wrap--muted">
              <DollarSign className="admin-orders__icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-orders__filters">
        <div className="admin-orders__filters-row">
          <div className="admin-orders__search">
            <Search className="admin-orders__search-icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order number, customer, email, status, or amount..."
              className="admin-orders__search-input"
            />
          </div>

          <div className="admin-orders__filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-orders__select"
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
              className="admin-orders__select"
            >
              <option value="date">Sort by order date</option>
              <option value="customer">Sort by customer</option>
              <option value="amount">Sort by dollar amount</option>
              <option value="status">Sort by status</option>
            </select>

            <button
              onClick={toggleDirection}
              className="admin-orders__direction-btn"
            >
              {direction === "asc" ? (
                <>
                  <ArrowUpAZ className="admin-orders__tiny-icon" />
                  Asc
                </>
              ) : (
                <>
                  <ArrowDownAZ className="admin-orders__tiny-icon" />
                  Desc
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="admin-orders__success">
          {statusMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="admin-orders__state-card">
          <h2 className="admin-orders__state-title">
            Loading orders...
          </h2>
          <p className="admin-orders__state-message">Fetching marketplace orders.</p>
        </div>
      ) : pageError ? (
        <div className="admin-orders__error">
          {pageError}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-orders__state-card admin-orders__state-card--empty">
          <ReceiptText className="admin-orders__empty-icon" />
          <h2 className="admin-orders__state-title admin-orders__state-title--spaced">
            No orders found
          </h2>
          <p className="admin-orders__state-message">
            Orders will appear here after customers complete checkout.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-orders__table-card">
            <div className="admin-orders__table-wrap">
              <table className="admin-orders__table">
                <thead className="admin-orders__thead">
                  <tr>
                    <th className="admin-orders__th">
                      Order
                    </th>
                    <th className="admin-orders__th">
                      Customer
                    </th>
                    <th className="admin-orders__th">
                      Date
                    </th>
                    <th className="admin-orders__th">
                      Items
                    </th>
                    <th className="admin-orders__th">
                      Amounts
                    </th>
                    <th className="admin-orders__th">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="admin-orders__tbody">
                  {paginatedOrders.map((order) => (
                    <tr key={order.orderId} className="admin-orders__row">
                      <td className="admin-orders__td">
                        <p className="admin-orders__text-strong">
                          {order.orderNumber}
                        </p>
                        <p className="admin-orders__text-sub">
                          ID: {order.orderId}
                        </p>
                      </td>

                      <td className="admin-orders__td">
                        <p className="admin-orders__text-sm-strong">
                          {order.customer?.name ||
                            order.customer?.username ||
                            "Unknown"}
                        </p>
                        <p className="admin-orders__text-sub">
                          {order.customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="admin-orders__td admin-orders__text-sm">
                        {formatDate(order.orderDate)}
                      </td>

                      <td className="admin-orders__td">
                        <p className="admin-orders__text-sm-strong">
                          {order.itemCount || 0}
                        </p>
                      </td>

                      <td className="admin-orders__td">
                        <p className="admin-orders__text-sm admin-orders__text-strong">
                          {formatMoney(order.totalAmount)}
                        </p>

                        <div className="admin-orders__meta-lines">
                          <p>Subtotal: {formatMoney(order.subtotalAmount)}</p>
                          <p>Tax: {formatMoney(order.taxAmount)}</p>
                          <p>Discount: -{formatMoney(order.discountAmount)}</p>
                        </div>
                      </td>

                      <td className="admin-orders__td">
                        <div className="admin-orders__status-stack">
                          <span className={statusClass(order.orderStatus)}>
                            Order: {order.orderStatus || "N/A"}
                          </span>

                          <span className={statusClass(order.paymentStatus)}>
                            Payment: {order.paymentStatus || "N/A"}
                          </span>

                          <select
                            value={order.orderStatus || "pending"}
                            disabled={updatingOrderId === order.orderId}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.orderId, e.target.value)
                            }
                            className="admin-orders__inline-select"
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

          <div className="admin-orders__pagination-row">
            <p className="admin-orders__pagination-text">
              Showing page {currentPage} of {totalPages} •{" "}
              {filteredOrders.length} matching order
              {filteredOrders.length === 1 ? "" : "s"}
            </p>

            <div className="admin-orders__pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="admin-orders__page-btn"
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
                    className={`admin-orders__page-btn ${
                      isActive ? "admin-orders__page-btn--active" : ""
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
                className="admin-orders__page-btn"
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
