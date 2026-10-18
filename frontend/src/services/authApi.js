import { API_URL as API_BASE_URL } from "./apiConfig";

async function throwApiError(response) {
  const data = await response.json().catch(() => null);

  const validationMessages = data?.errors
    ? Object.values(data.errors).flat().join(" ")
    : null;

  throw new Error(
    validationMessages ||
      data?.message ||
      data?.detail ||
      data?.title ||
      `Request failed (${response.status}).`
  );
}

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  const data = await response.json();
  return data.csrfToken;
}

async function postAuth(endpoint, body = {}) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwApiError(response);
  }
}

export function register(email, password) {
  return postAuth("register", { email, password });
}

export function login(email, password) {
  return postAuth("login", {
    email,
    password,
    rememberMe: false,
  });
}

export function logout() {
  return postAuth("logout");
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    await throwApiError(response);
  }

  return response.json();
}