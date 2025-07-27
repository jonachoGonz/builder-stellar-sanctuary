import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiCall } from "../lib/api";

export type UserRole =
  | "admin"
  | "teacher"
  | "student"
  | "nutritionist"
  | "psychologist";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  plan?: string;
  phone?: string;
  avatar?: string;
  birthDate?: string;
  gender?: string;
  occupation?: string;
  activityLevel?: string;
  medicalConditions?: string;
  injuries?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  memberSince?: string;
  isActive?: boolean;

  // Plan management
  planDuration?: number;
  totalClasses?: number;
  usedClasses?: number;
  remainingClasses?: number;
  maxMonthlyClasses?: number;
  planStartDate?: string;
  planEndDate?: string;

  // Professional fields
  assignedStudents?: string[];
  specialty?: string;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  // Optional fields
  gender?: string;
  occupation?: string;
  medicalConditions?: string;
  injuries?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  activityLevel?: string;
}

// Create AuthContext with a default value to prevent undefined errors
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isNewUser: false,
  login: async () => {
    throw new Error("AuthProvider not initialized");
  },
  register: async () => {
    throw new Error("AuthProvider not initialized");
  },
  loginWithGoogle: () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: () => {
    console.warn("Logout called but AuthProvider not initialized");
  },
  updateUser: async () => {
    throw new Error("AuthProvider not initialized");
  },
  refreshUser: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

console.log("🔧 AuthContext API Base URL:", API_BASE_URL);
console.log(
  "🌍 Current hostname:",
  typeof window !== "undefined" ? window.location.hostname : "unknown",
);
console.log(
  "🔗 Current origin:",
  typeof window !== "undefined" ? window.location.origin : "unknown",
);

// Test connectivity to the API server
const testConnectivity = async () => {
  try {
    console.log("🌐 Testing API connectivity...");
    console.log("🔗 API Base URL:", API_BASE_URL);

    // Simple connectivity test - just try the main API path
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(8000), // Longer timeout for deployment
    });

    console.log(`📡 Connectivity test result:`, {
      url: `${API_BASE_URL}/health`,
      status: response.status,
      ok: response.ok,
    });

    // Accept any response that isn't a network error
    return response.status !== undefined;
  } catch (error) {
    console.error("❌ Connectivity test failed:", error);

    // In deployment, sometimes the health endpoint might not exist
    // Try a basic ping to see if server is responding at all
    try {
      const basicTest = await fetch(window.location.origin, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      console.log("ℹ️ Basic server test:", basicTest.status);
      return basicTest.status < 500;
    } catch (basicError) {
      console.error("❌ Basic server test failed:", basicError);
      return false;
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Test connectivity first, then check auth
    const initializeAuth = async () => {
      const isConnected = await testConnectivity();
      if (isConnected) {
        console.log("✅ API connectivity confirmed");
        checkAuth();
      } else {
        console.error("❌ API not reachable, attempting auth check anyway");
        // Still try auth check - connectivity test might give false negatives
        checkAuth();
      }
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        console.log(
          "🔍 Checking auth with token:",
          token.substring(0, 20) + "...",
        );

        const response = await apiCall("/auth/me");

        console.log("📡 Auth check response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log("✅ Auth check successful:", data.user?.email);
        } else {
          console.log("🔓 Token invalid, removing...");
          localStorage.removeItem("authToken");
          // Consume the response body to avoid issues
          try {
            await response.text();
          } catch (e) {
            // Ignore errors from consuming response body
          }
        }
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);

      // Don't remove token if it's just a network error
      if (
        error &&
        error.message &&
        !error.message.includes("Failed to fetch")
      ) {
        localStorage.removeItem("authToken");
      } else {
        console.log("⚠️ Keeping token due to network error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("🔍 Attempting login with:", {
        email,
        apiBaseUrl: API_BASE_URL,
        fullUrl: `${API_BASE_URL}/auth/login`,
        windowLocation:
          typeof window !== "undefined"
            ? {
                hostname: window.location.hostname,
                origin: window.location.origin,
                href: window.location.href,
              }
            : "server-side",
        credentials: { email, password: "***" },
      });

      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Login response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Read response as text first to avoid "body stream already read" error
      const responseText = await response.text();
      console.log("📝 Raw response text:", responseText.substring(0, 500));

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const errorData = JSON.parse(responseText);
          console.error("❌ Login failed - JSON response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error("❌ Login failed - Could not parse JSON response:", {
            status: response.status,
            statusText: response.statusText,
            parseError: parseError.message,
            responseText: responseText.substring(0, 500),
            contentType: response.headers.get("Content-Type"),
          });

          // Use a more user-friendly error message based on status
          if (response.status === 401) {
            errorMessage =
              "Credenciales inválidas. Por favor verifica tu email y contraseña.";
          } else if (response.status === 500) {
            errorMessage = "Error del servidor. Por favor intenta nuevamente.";
          } else if (response.status >= 400 && response.status < 500) {
            errorMessage =
              "Error en la solicitud. Por favor verifica los datos.";
          }
        }

        console.log("🚨 About to throw error:", {
          errorMessage,
          type: typeof errorMessage,
        });
        throw new Error(String(errorMessage));
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Login successful:", {
          userId: data.user?.id,
          email: data.user?.email,
          fullResponse: data,
        });
      } catch (parseError) {
        console.error("❌ Could not parse successful response as JSON:", {
          parseError: parseError.message,
          responseText: responseText.substring(0, 500),
          contentType: response.headers.get("Content-Type"),
        });
        throw new Error("Error al procesar la respuesta del servidor");
      }

      setUser(data.user);
      localStorage.setItem("authToken", data.token);
    } catch (error: any) {
      console.error("🚨 Login error:", error);

      // Extract meaningful error message
      let errorMessage = "Error al iniciar sesión";

      // Handle specific deployment issues
      if (error && error.message) {
        if (
          error.message.includes("Failed to fetch") ||
          error.name === "TypeError"
        ) {
          errorMessage =
            "No se puede conectar al servidor. Por favor verifica tu conexión o intenta más tarde.";
        } else if (
          error.message.includes("timeout") ||
          error.name === "AbortError"
        ) {
          errorMessage =
            "La conexión está tardando demasiado. Por favor intenta nuevamente.";
        } else if (typeof error.message === "string") {
          errorMessage = error.message;
        }
      } else if (error && typeof error === "object") {
        if (error.toString && typeof error.toString === "function") {
          const stringified = error.toString();
          if (stringified !== "[object Object]") {
            errorMessage = stringified;
          }
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Provide more specific error messages based on error type
      if (error?.name === "TypeError" && errorMessage.includes("fetch")) {
        errorMessage =
          "Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.";
      } else if (
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Failed to fetch")
      ) {
        errorMessage =
          "No se puede conectar al servidor. Por favor, recarga la página e intenta nuevamente.";
      }

      console.log("🚨 Final error message:", {
        errorMessage,
        originalError: error,
      });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Could not parse register response as JSON:", parseError);
        throw new Error("Error al procesar la respuesta del servidor");
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      setUser(data.user);
      localStorage.setItem("authToken", data.token);
    } catch (error: any) {
      throw new Error(error.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Check if Google OAuth is available first
      const statusResponse = await apiCall("/auth/google/status");
      const statusData = await statusResponse.json();

      if (!statusData.configured) {
        throw new Error(
          "Autenticación con Google no está configurada completamente. " +
            (statusData.missingConfig?.includes("GOOGLE_CLIENT_SECRET")
              ? "Se requiere configurar el Client Secret de Google."
              : "Configuraci��n de Google OAuth incompleta."),
        );
      }

      // Redirect to Google OAuth
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    try {
      navigate("/");
    } catch (error) {
      // Fallback if navigation fails
      window.location.href = "/";
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await apiCall("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el perfil");
      }

      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || "Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await apiCall("/auth/me");

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isNewUser,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    refreshUser,
  };

  try {
    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  } catch (error) {
    console.error("❌ AuthProvider error:", error);
    // Return a fallback provider in case of errors
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isNewUser: false,
          login: async () => {
            throw new Error("AuthProvider error");
          },
          register: async () => {
            throw new Error("AuthProvider error");
          },
          loginWithGoogle: () => {
            throw new Error("AuthProvider error");
          },
          logout: () => {},
          updateUser: async () => {
            throw new Error("AuthProvider error");
          },
          refreshUser: async () => {
            throw new Error("AuthProvider error");
          },
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Check if we're using the default context (not properly initialized)
  if (context === defaultAuthContext) {
    console.warn(
      "⚠️ Using default AuthContext - AuthProvider may not be properly initialized",
    );
  }

  return context;
}

// Role-based access control helpers
export function usePermissions() {
  const { user } = useAuth();

  return {
    canManageUsers: user?.role === "admin",
    canManageSchedule:
      user?.role === "admin" ||
      user?.role === "teacher" ||
      user?.role === "nutritionist" ||
      user?.role === "psychologist",
    canViewAllClasses: user?.role === "admin",
    canEditOwnSchedule:
      user?.role === "teacher" ||
      user?.role === "nutritionist" ||
      user?.role === "psychologist",
    canBookClasses: user?.role === "student",
    isAdmin: user?.role === "admin",
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    isNutritionist: user?.role === "nutritionist",
    isPsychologist: user?.role === "psychologist",
    isProfessional:
      user?.role === "teacher" ||
      user?.role === "nutritionist" ||
      user?.role === "psychologist",
  };
}
