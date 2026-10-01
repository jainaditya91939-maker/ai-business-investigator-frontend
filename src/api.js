export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export const AI_API_URL =
  import.meta.env.VITE_AI_URL || "http://127.0.0.1:8001";

function addAuthHeaders(options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Don't set Content-Type manually for FormData.
  // Browser needs to create the multipart boundary itself.
  if (
    !(options.body instanceof FormData) &&
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("auth-expired"));
  }

  return response;
}

// Backend API
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const headers = addAuthHeaders(options);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

// AI service API
export async function aiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${AI_API_URL}${path}`;

  const headers = addAuthHeaders(options);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

// Backward compatibility
export const authFetch = apiFetch;