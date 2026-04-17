// Base backend URL.
// If VITE_API_BASE_URL exists in the frontend environment, use that.
// Otherwise default to localhost.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Key used to store JWT in localStorage.
const TOKEN_KEY = "noteswap_token";

// Shared headers for JSON requests.
const jsonHeaders = {
  "Content-Type": "application/json",
};

// Central helper for handling API responses.
// If the server returns an error, throw a readable message.
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Sends signup data to the backend.
export async function signupUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// Sends login data to the backend.
export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// Uses the JWT to ask the backend who the current user is.
export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

// Tells the backend the user is logging out.
// In this version, the frontend still clears the stored token manually too.
export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: jsonHeaders,
  });

  return handleResponse(response);
}

// Save token after login/signup
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Read stored token on app startup
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Remove token on logout or auth failure
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}