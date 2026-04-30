import { useEffect, useMemo, useRef, useState } from "react";
import { finalizeOrder } from "../lib/payments";
import { getStoredToken } from "../lib/auth";

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatOrderNumber(orderId) {
  return `NS-${String(orderId).padStart(6, "0")}`;
}

function CheckoutSuccessPage({ onClearCart }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);

  const didFinalize = useRef(false);

  const sessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("session_id");
  }, []);

  useEffect(() => {
    const runFinalize = async () => {
      if (didFinalize.current) return;
      didFinalize.current = true;

      try {
        const token = getStoredToken();

        if (!token) {
          throw new Error("You must be logged in to view this order.");
        }

        if (!sessionId) {
          throw new Error("Missing Stripe session ID.");
        }

        const result = await finalizeOrder(token, sessionId);
        setOrderData(result);

        if (onClearCart) {
          onClearCart();
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to finalize your order.");
      } finally {
        setLoading(false);
      }
    };

    runFinalize();
  }, [sessionId, onClearCart]);

  return (
    <div className="page-checkout-success">
      <div className="checkout-success__container">
        {loading ? (
          <div className="checkout-success__center">
            <p className="checkout-success__eyebrow">
              Checkout
            </p>
            <h1 className="checkout-success__title">
              Finalizing your order...
            </h1>
            <p className="checkout-success__subtitle">
              Please wait while we confirm your payment details.
            </p>
          </div>
        ) : error ? (
          <div className="checkout-success__center">
            <p className="checkout-success__eyebrow checkout-success__eyebrow--error">
              Payment Error
            </p>
            <h1 className="checkout-success__title">
              We could not confirm your order
            </h1>
            <p className="checkout-success__copy">{error}</p>

            <div className="checkout-success__action-row">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="checkout-success__primary-btn"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="checkout-success__center">
              <p className="checkout-success__eyebrow checkout-success__eyebrow--success">
                Payment Successful
              </p>
              <h1 className="checkout-success__title">
                Thank you for your order
              </h1>
              <p className="checkout-success__subtitle">
                Your test payment was successful and your order has been recorded.
              </p>
            </div>

            <div className="checkout-success__summary">
              <h2 className="checkout-success__section-title">Order Summary</h2>

              <div className="checkout-success__meta-grid">
                <div className="checkout-success__meta-card">
                  <p className="checkout-success__meta-label">
                    Order Number
                  </p>
                  <p className="checkout-success__meta-value">
                    {formatOrderNumber(orderData?.orderId)}
                  </p>
                </div>

                <div className="checkout-success__meta-card">
                  <p className="checkout-success__meta-label">
                    Order ID
                  </p>
                  <p className="checkout-success__meta-value">
                    {orderData?.orderId}
                  </p>
                </div>
              </div>

              <div className="checkout-success__totals">
                <div className="checkout-success__total-row">
                  <span className="checkout-success__total-label">Subtotal</span>
                  <span className="checkout-success__total-value">
                    {formatMoney(orderData?.amounts?.subtotalAmount)}
                  </span>
                </div>

                <div className="checkout-success__total-row">
                  <span className="checkout-success__total-label">Sales Tax</span>
                  <span className="checkout-success__total-value">
                    {formatMoney(orderData?.amounts?.taxAmount)}
                  </span>
                </div>

                <div className="checkout-success__total-row">
                  <span className="checkout-success__total-label">Discount</span>
                  <span className="checkout-success__total-value">
                    -{formatMoney(orderData?.amounts?.discountAmount)}
                  </span>
                </div>

                <div className="checkout-success__total-row checkout-success__total-row--grand">
                  <span className="checkout-success__total-value">Total</span>
                  <span className="checkout-success__grand-value">
                    {formatMoney(orderData?.amounts?.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="checkout-success__action-row">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="checkout-success__primary-btn"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutSuccessPage;