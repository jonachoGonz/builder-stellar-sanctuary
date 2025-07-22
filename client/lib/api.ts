// API utilities for consistent base URL handling across the application

// Get environment-specific API base URL
export const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If we're in production (not localhost), use absolute URL
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost")
  ) {
    return `${window.location.origin}/api`;
  }

  // Default to relative path for local development
  return "/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to make authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    console.log("🌐 Making API call:", {
      url,
      method: mergedOptions.method || "GET",
      headers: mergedOptions.headers,
      bodyLength: mergedOptions.body ? mergedOptions.body.toString().length : 0,
    });

    const response = await fetch(url, mergedOptions);

    console.log("📡 API call response:", {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return response;
  } catch (error: any) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};
