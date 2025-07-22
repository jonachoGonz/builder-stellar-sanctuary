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

const API_BASE_URL = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored authentication on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("authToken");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      setUser(data.user);
      localStorage.setItem("authToken", data.token);
    } catch (error: any) {
      throw new Error(error.message || "Error al iniciar sesión");
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
