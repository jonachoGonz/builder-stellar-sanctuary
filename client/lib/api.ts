// API utilities for consistent base URL handling across the application

// Get environment-specific API base URL
export const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For any production deployment (Fly.dev, Netlify, etc.), use same origin
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

// Helper function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    console.warn("Backend health check failed:", error);
    return false;
  }
};

// Helper function to make authenticated API calls with retry logic
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<Response> => {
  const token = localStorage.getItem("authToken");
  const maxRetries = 3;
  const retryDelay = 1000 * (retryCount + 1); // Exponential backoff

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Clone the body to prevent "body stream already read" errors on retry
  let bodyToUse = options.body;
  if (options.body && typeof options.body === "string") {
    bodyToUse = options.body; // String bodies can be reused
  } else if (options.body) {
    // For other body types, we might need to handle differently
    bodyToUse = options.body;
  }

  const mergedOptions: RequestInit = {
    ...options,
    body: bodyToUse,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Add timeout for production environment
    ...(typeof AbortSignal !== "undefined" && AbortSignal.timeout
      ? { signal: AbortSignal.timeout(15000) }
      : {}),
  };

  // Try multiple API base URLs for production environment
  const getUrlsToTry = (endpoint: string) => {
    const baseEndpoint = endpoint.startsWith("http") ? endpoint : endpoint;

    if (
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost")
    ) {
      // For production deployments, try multiple potential backend URLs
      // Try Netlify Functions first, then fallback to direct API path
      return [
        `/.netlify/functions/api${baseEndpoint}`,
        `${window.location.origin}/api${baseEndpoint}`,
      ];
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
    return [url];
  };

  const urlsToTry = getUrlsToTry(endpoint);
  let lastError: Error | null = null;

  for (const url of urlsToTry) {
    try {
      console.log(`🌐 Making API call (attempt ${retryCount + 1}):`, {
        url,
        method: mergedOptions.method || "GET",
        headers: mergedOptions.headers,
        bodyLength: mergedOptions.body
          ? mergedOptions.body.toString().length
          : 0,
      });

      const response = await fetch(url, mergedOptions);

      console.log("📡 API call response:", {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // If successful or client error (not server error), return the response
      if (response.status < 500) {
        return response;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      console.warn(`API call failed for ${url}:`, error.message);
      lastError = error;

      // Check for specific error types
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        // This is typically a network connectivity issue
        console.error("🌐 Network connectivity issue detected");
        lastError = new Error("NETWORK_ERROR: Failed to connect to server");
      } else if (error.name === "AbortError") {
        // Request timeout
        console.error("⏰ Request timeout");
        lastError = new Error("TIMEOUT_ERROR: Request timed out");
      } else if (
        error.message &&
        (error.message.includes("401") || error.message.includes("403"))
      ) {
        // Authentication/authorization error
        console.error("🔒 Authentication error");
        lastError = new Error("AUTH_ERROR: Authentication failed");
        break; // Don't try other URLs for auth errors
      }
    }
  }

  // If all URLs failed and we haven't exceeded max retries, retry with delay
  if (retryCount < maxRetries && lastError) {
    console.log(
      `⏳ Retrying API call in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`,
    );
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    return apiCall(endpoint, options, retryCount + 1);
  }

  // All attempts failed
  console.error(`❌ All API call attempts failed for endpoint: ${endpoint}`);
  throw lastError || new Error("API call failed after all retries");
};
