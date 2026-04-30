const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getCurrentUserProfile(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function updateCurrentUserProfile(token, payload) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}