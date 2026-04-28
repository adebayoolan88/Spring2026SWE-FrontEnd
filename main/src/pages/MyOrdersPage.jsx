import { useEffect, useState } from "react";
import { getStoredToken } from "../lib/auth";
import { getMyOrders } from "../lib/orders";

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

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = getStoredToken();

        if (!token) {
          throw new Error("You must be logged in to view your orders.");
        }

        const result = await getMyOrders(token);
        setOrders(result.orders || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="page-my-orders min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
            Orders
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-3 text-slate-500">
            Review your past purchases and open an order to view more details.
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Loading Orders...</h2>
            <p className="mt-3 text-slate-500">
              Please wait while we fetch your order history.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No orders yet</h2>
            <p className="mt-3 text-slate-500">
              Once you complete a checkout, your order history will appear here.
            </p>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="mt-6 btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Order Number
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {order.orderNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Items
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {order.itemCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatMoney(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {order.paymentStatus}
                    </span>

                    <button
                      onClick={() => {
                        window.location.href = `/orders/${order.orderId}`;
                      }}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="btn-secondary"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;