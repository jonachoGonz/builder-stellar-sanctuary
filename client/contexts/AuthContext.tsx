import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use environment-specific API base URL
const getApiBaseUrl = () => {
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

const API_BASE_URL = getApiBaseUrl();

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
    const response = await fetch(`${API_BASE_URL}/auth/google/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("📡 Connectivity test result:", {
      status: response.status,
      ok: response.ok,
    });
    return response.ok;
  } catch (error) {
    console.error("❌ Connectivity test failed:", error);
    return false;
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
        console.error("❌ API not reachable, skipping auth check");
        setIsLoading(false);
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

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        }
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("🔍 Attempting login with:", {
        email,
        url: `${API_BASE_URL}/auth/login`,
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Login response:", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Login failed:", {
          status: response.status,
          error: errorText,
        });

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`,
          );
        } catch (parseError) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("✅ Login successful:", {
        userId: data.user?.id,
        email: data.user?.email,
      });

      setUser(data.user);
      localStorage.setItem("authToken", data.token);
    } catch (error: any) {
      console.error("🚨 Login error:", error);

      // Provide more specific error messages
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.",
        );
      } else if (
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "No se puede conectar al servidor. Por favor, recarga la página e intenta nuevamente.",
        );
      } else {
        throw new Error(error.message || "Error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

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
      const statusResponse = await fetch(`${API_BASE_URL}/auth/google/status`);
      const statusData = await statusResponse.json();

      if (!statusData.configured) {
        throw new Error(
          "Autenticación con Google no está configurada completamente. " +
            (statusData.missingConfig?.includes("GOOGLE_CLIENT_SECRET")
              ? "Se requiere configurar el Client Secret de Google."
              : "Configuración de Google OAuth incompleta."),
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
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In development, this might happen due to hot reloading
    if (import.meta.env.DEV) {
      console.warn("⚠️ AuthContext not found - using fallback values (likely hot reload issue)");
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isNewUser: false,
        login: async () => { throw new Error("AuthProvider not available"); },
        register: async () => { throw new Error("AuthProvider not available"); },
        loginWithGoogle: () => { throw new Error("AuthProvider not available"); },
        logout: () => { console.warn("Logout called but AuthProvider not available"); },
        updateUser: async () => { throw new Error("AuthProvider not available"); },
        refreshUser: async () => { throw new Error("AuthProvider not available"); },
      };
    }
    throw new Error("useAuth must be used within an AuthProvider");
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
