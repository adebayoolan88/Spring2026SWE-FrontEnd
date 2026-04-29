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
        if (!token) throw new Error("You must be logged in to view order details.");
        if (!orderId) throw new Error("Missing order ID.");
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
    <div className="page-order-details">
      <div className="order-details__container">
        {loading ? (
          <div className="order-details__state order-details__state--center">
            <h1 className="order-details__title">Loading Order...</h1>
            <p className="order-details__subtitle">Please wait while we load your order details.</p>
          </div>
        ) : error ? (
          <div className="order-details__alert order-details__alert--error">{error}</div>
        ) : !order ? (
          <div className="order-details__state order-details__state--center">
            <h1 className="order-details__title">Order Not Found</h1>
          </div>
        ) : (
          <>
            <div className="order-details__header">
              <p className="order-details__eyebrow">Order Details</p>
              <h1 className="order-details__title">{order.orderNumber}</h1>
              <p className="order-details__subtitle">Placed on {formatDate(order.orderDate)}</p>
            </div>

            <div className="order-details__summary-grid">
              <div className="order-details__summary-card"><p className="order-details__label">Payment Status</p><p className="order-details__value">{order.paymentStatus}</p></div>
              <div className="order-details__summary-card"><p className="order-details__label">Order Status</p><p className="order-details__value">{order.orderStatus}</p></div>
              <div className="order-details__summary-card"><p className="order-details__label">Order ID</p><p className="order-details__value">{order.orderId}</p></div>
              <div className="order-details__summary-card"><p className="order-details__label">Items</p><p className="order-details__value">{order.items?.length || 0}</p></div>
            </div>

            <div className="order-details__items">
              {order.items?.map((item) => (
                <div key={item.orderItemId} className="order-details__item-card">
                  <div className="order-details__item-layout">
                    <img src={item.image} alt={item.name} className="order-details__item-image" />
                    <div className="order-details__item-content">
                      <p className="order-details__item-category">{item.category}</p>
                      <h3 className="order-details__item-name">{item.name}</h3>
                      <p className="order-details__item-meta">{item.brand} • SKU: {item.sku}</p>
                      <div className="order-details__item-stats">
                        <div><p className="order-details__label">Quantity</p><p className="order-details__value">{item.quantity}</p></div>
                        <div><p className="order-details__label">Unit Price</p><p className="order-details__value">{formatMoney(item.unitPrice)}</p></div>
                        <div><p className="order-details__label">Line Total</p><p className="order-details__value">{formatMoney(item.lineTotal)}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-details__totals-wrap">
              <h2 className="order-details__section-title">Totals</h2>
              <div className="order-details__totals-card">
                <div className="order-details__total-row"><span className="order-details__total-label">Subtotal</span><span className="order-details__total-value">{formatMoney(order.subtotalAmount)}</span></div>
                <div className="order-details__total-row"><span className="order-details__total-label">Sales Tax</span><span className="order-details__total-value">{formatMoney(order.taxAmount)}</span></div>
                <div className="order-details__total-row"><span className="order-details__total-label">Discount</span><span className="order-details__total-value">-{formatMoney(order.discountAmount)}</span></div>
                <div className="order-details__total-row order-details__total-row--grand"><span className="order-details__grand-label">Total</span><span className="order-details__grand-value">{formatMoney(order.totalAmount)}</span></div>
              </div>
            </div>

            <div className="order-details__actions">
              <button onClick={() => (window.location.href = "/orders")} className="btn-primary">Back to Orders</button>
              <button onClick={() => (window.location.href = "/")} className="btn-secondary">Return Home</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetailsPage;
