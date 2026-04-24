const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getMyOrders(token) {
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function getOrderById(token, orderId) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}