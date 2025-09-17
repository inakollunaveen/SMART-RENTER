// src/utils/api.ts
export const API_URL = "https://smartrenter1.onrender.com";
// --- Core request helper ---
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if NOT sending FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers,
      credentials: "include",
      ...options,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw {
        message: data?.message || res.statusText,
        status: res.status,
        details: data,
      };
    }

    return data;
  } catch (err) {
    console.error("Network/API request failed:", err);
    throw {
      message: "Network error: Failed to reach server",
      status: 0,
    };
  }
}

// --- Property APIs ---

// Add property with FormData (supports photos)
export async function addProperty(formData: FormData) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/properties`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw {
      message: data?.message || res.statusText,
      status: res.status,
      details: data,
    };
  }
  return data; // { message, property }
}

// Get all approved and available properties (public)
export async function getProperties() {
  const data = await apiRequest("/api/properties");
  return Array.isArray(data) ? data : data?.properties || [];
}

// Get owner’s properties (protected)
export async function getOwnerProperties() {
  const data = await apiRequest("/api/properties/owner/my-properties");
  return Array.isArray(data) ? data : data?.properties || [];
}

// Delete property by ID (protected)
export async function deleteProperty(id: string) {
  return apiRequest(`/api/properties/${id}`, { method: "DELETE" });
}

// Search properties with filters (public)
export async function searchProperties(queryParams: Record<string, string | number | undefined>) {
  const filteredParams: Record<string, string> = {};

  // Only keep non-empty params
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "") filteredParams[key] = String(value);
  });

  const queryString = new URLSearchParams(filteredParams).toString();
  const data = await apiRequest(`/api/properties/search?${queryString}`);
  return Array.isArray(data) ? data : data?.properties || [];
}

// Get single property by ID
export async function getPropertyById(id: string) {
  const data = await apiRequest(`/api/properties/${id}`);
  return data?.property || data;
}

// Update property by ID (protected, supports FormData for photos)
export async function updateProperty(id: string, updates: object | FormData) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  // Only set Content-Type if not FormData
  if (!(updates instanceof FormData)) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}/api/properties/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: updates instanceof FormData ? updates : JSON.stringify(updates),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw {
      message: data?.message || res.statusText,
      status: res.status,
      details: data,
    };
  }
  return data; // { message, property }
}

// Approve or reject property (admin only)
export async function approveProperty(id: string, status: "approved" | "rejected") {
  return apiRequest(`/api/properties/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// Get all pending properties (admin only)
export async function getPendingProperties() {
  const data = await apiRequest("/api/properties/pending");
  return Array.isArray(data) ? data : data?.properties || [];
}
