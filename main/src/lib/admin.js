const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function checkAdminAccess(token) {
  const response = await fetch(`${API_BASE_URL}/admin/health`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function getAdminDashboard(token) {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function getAdminProducts(token) {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function updateAdminProduct(token, productId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAdminUsers(token) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function updateAdminUser(token, userId, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAdminOrders(token, params = {}) {
  const query = new URLSearchParams(params).toString();

  const response = await fetch(
    `${API_BASE_URL}/admin/orders${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse(response);
}

export async function updateAdminOrderStatus(token, orderId, orderStatus) {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderStatus }),
  });

  return handleResponse(response);
}

export async function getAdminDiscountCodes(token) {
  const response = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function createAdminDiscountCode(token, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAdminSales(token) {
  const response = await fetch(`${API_BASE_URL}/admin/sales`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function createAdminSale(token, payload) {
  const response = await fetch(`${API_BASE_URL}/admin/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}