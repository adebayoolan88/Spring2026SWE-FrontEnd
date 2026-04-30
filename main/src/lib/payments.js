const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Preview checkout pricing before creating a Stripe session.
// Used by the cart Apply button for discount codes.
export async function previewCheckoutPricing(token, cartItems, discountCode = "") {
  const response = await fetch(`${API_BASE_URL}/payments/preview-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cartItems,
      discountCode: discountCode?.trim() || "",
    }),
  });

  return handleResponse(response);
}

// Starts a Stripe Checkout Session by sending the current cart to the backend.
// The backend validates the cart, creates the order, applies sales/discounts,
// and returns a Stripe Checkout URL.
export async function createCheckoutSession(token, cartItems, discountCode = "") {
  const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cartItems,
      discountCode: discountCode?.trim() || "",
    }),
  });

  return handleResponse(response);
}

// Finalizes an order after Stripe redirects back to the success page.
// For this school-project flow, the frontend success page calls this route
// instead of relying on Stripe webhooks.
export async function finalizeOrder(token, sessionId) {
  const response = await fetch(`${API_BASE_URL}/payments/finalize-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  return handleResponse(response);
}