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
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        {loading ? (
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Finalizing your order...
            </h1>
            <p className="mt-3 text-slate-500">
              Please wait while we confirm your payment details.
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-500">
              Payment Error
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              We could not confirm your order
            </h1>
            <p className="mt-3 text-slate-600">{error}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
                Payment Successful
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Thank you for your order
              </h1>
              <p className="mt-3 text-slate-500">
                Your test payment was successful and your order has been recorded.
              </p>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order Number
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {formatOrderNumber(orderData?.orderId)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order ID
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {orderData?.orderId}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(orderData?.amounts?.subtotalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Sales Tax</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(orderData?.amounts?.taxAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-slate-900">
                    -{formatMoney(orderData?.amounts?.discountAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 text-base">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatMoney(orderData?.amounts?.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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