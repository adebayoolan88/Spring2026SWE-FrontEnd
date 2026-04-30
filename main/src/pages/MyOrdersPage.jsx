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
    <div className="page-my-orders">
      <div className="my-orders__container u-card-surface">
        <div className="my-orders__header">
          <p className="my-orders__eyebrow">Orders</p>
          <h1 className="my-orders__title">My Orders</h1>
          <p className="my-orders__subtitle">
            Review your past purchases and open an order to view more details.
          </p>
        </div>

        {loading ? (
          <div className="my-orders__state my-orders__state--center">
            <h2 className="my-orders__state-title">Loading Orders...</h2>
            <p className="my-orders__state-copy">
              Please wait while we fetch your order history.
            </p>
          </div>
        ) : error ? (
          <div className="my-orders__alert my-orders__alert--error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="my-orders__state my-orders__state--empty">
            <h2 className="my-orders__state-title">No orders yet</h2>
            <p className="my-orders__state-copy">
              Once you complete a checkout, your order history will appear here.
            </p>

            <button onClick={() => (window.location.href = "/")} className="btn-primary my-orders__cta">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="my-orders__list">
            {orders.map((order) => (
              <div key={order.orderId} className="my-orders__card u-card-surface u-card-hover">
                <div className="my-orders__card-layout">
                  <div className="my-orders__meta-grid">
                    <div>
                      <p className="my-orders__meta-label">Order Number</p>
                      <p className="my-orders__meta-value">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="my-orders__meta-label">Date</p>
                      <p className="my-orders__meta-value">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p className="my-orders__meta-label">Items</p>
                      <p className="my-orders__meta-value">{order.itemCount}</p>
                    </div>
                    <div>
                      <p className="my-orders__meta-label">Total</p>
                      <p className="my-orders__meta-value">{formatMoney(order.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="my-orders__actions">
                    <span className="my-orders__status-pill">{order.paymentStatus}</span>
                    <button
                      onClick={() => (window.location.href = `/orders/${order.orderId}`)}
                      className="my-orders__details-btn btn-primary"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="my-orders__footer-action">
              <button onClick={() => (window.location.href = "/")} className="btn-secondary">
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
