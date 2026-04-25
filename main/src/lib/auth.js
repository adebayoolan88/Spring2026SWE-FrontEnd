const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const ACCESS_TOKEN_KEY = "noteswap_token";
const ID_TOKEN_KEY = "noteswap_id_token";
const REFRESH_TOKEN_KEY = "noteswap_refresh_token";

async function handleApiResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function saveAuthTokensFromResponse(data) {
  if (data?.token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
  }

  if (data?.idToken) {
    localStorage.setItem(ID_TOKEN_KEY, data.idToken);
  }

  if (data?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  }
}

function clearAllAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Signup now goes to your backend.
// Backend will talk to Cognito and decide whether confirmation is required.
export async function signupUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse(response);
}

// Confirm signup through your backend.
export async function confirmSignup(username, code) {
  const response = await fetch(`${API_BASE_URL}/auth/confirm-signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      code,
    }),
  });

  return handleApiResponse(response);
}

// Resend confirmation code through your backend.
export async function resendSignupCode(username) {
  const response = await fetch(`${API_BASE_URL}/auth/resend-signup-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  return handleApiResponse(response);
}

// Login through your backend.
// Backend talks to Cognito, returns tokens, and returns the local app user.
export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleApiResponse(response);
  saveAuthTokensFromResponse(data);
  return data;
}

// Keep this helper because the rest of your app already uses it.
export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse(response);
}

// Client-side logout for now.
export async function logoutUser() {
  clearAllAuthTokens();

  return {
    message: "Logout successful",
  };
}

export function saveToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearStoredToken() {
  clearAllAuthTokens();
}