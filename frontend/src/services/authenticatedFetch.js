import { API_URL } from "./apiConfig";

export async function authenticatedFetch(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  const changesData = !["GET", "HEAD", "OPTIONS"].includes(method);

  if (changesData) {
    const csrfResponse = await fetch(`${API_URL}/api/auth/csrf`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!csrfResponse.ok) {
      throw new Error("Unable to prepare the request. Please try again.");
    }

    const { csrfToken } = await csrfResponse.json();
    headers.set("X-CSRF-TOKEN", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Your session has expired. Refresh and log in again.");
  }

  return response;
}