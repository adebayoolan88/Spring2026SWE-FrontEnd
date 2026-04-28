import { useEffect, useMemo, useState } from "react";
import { getStoredToken } from "../lib/auth";
import { getOrderById } from "../lib/orders";

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

function OrderDetailsPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = useMemo(() => {
    const parts = window.location.pathname.split("/");
    return parts[2];
  }, []);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = getStoredToken();

        if (!token) {
          throw new Error("You must be logged in to view order details.");
        }

        if (!orderId) {
          throw new Error("Missing order ID.");
        }

        const result = await getOrderById(token, orderId);
        setOrder(result.order);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  return (
    <div className="page-order-details min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Loading Order...</h1>
            <p className="mt-3 text-slate-500">
              Please wait while we load your order details.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : !order ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Order Not Found</h1>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Order Details
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {order.orderNumber}
              </h1>
              <p className="mt-3 text-slate-500">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment Status
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {order.paymentStatus}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order Status
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {order.orderStatus}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order ID
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {order.orderId}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Items
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {order.items?.length || 0}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.orderItemId}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                        {item.category}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.brand} • SKU: {item.sku}
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Quantity
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Unit Price
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatMoney(item.unitPrice)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Line Total
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatMoney(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Totals</h2>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(order.subtotalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Sales Tax</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(order.taxAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-slate-900">
                    -{formatMoney(order.discountAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 text-base">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatMoney(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  window.location.href = "/orders";
                }}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to Orders
              </button>

              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Return Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsPage;