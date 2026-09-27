export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export const AI_API_URL =
  import.meta.env.VITE_AI_URL || "http://127.0.0.1:8001";

export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Let the browser set multipart boundaries for FormData.
  if (!(options.body instanceof FormData) && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-expired"));
  }

  return response;
}
