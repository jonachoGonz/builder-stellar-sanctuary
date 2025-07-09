import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  plan?: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          // In a real app, you'd validate the token with your backend
          // For now, we'll mock a user
          const mockUser: User = {
            id: "1",
            email: "user@fitflow.cl",
            firstName: "Usuario",
            lastName: "Demo",
            role: "student",
            plan: "Plan Pro",
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock API call - replace with real authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Determine role based on email for demo purposes
      let role: UserRole = "student";
      if (email.includes("admin")) role = "admin";
      else if (email.includes("teacher") || email.includes("profesor"))
        role = "teacher";

      const mockUser: User = {
        id: "1",
        email,
        firstName: email.includes("admin")
          ? "Admin"
          : email.includes("teacher")
            ? "Profesor"
            : "Usuario",
        lastName: "Demo",
        role,
        plan: role === "student" ? "Plan Pro" : undefined,
      };

      setUser(mockUser);
      localStorage.setItem("authToken", "mock-token-123");
    } catch (error) {
      throw new Error("Credenciales inválidas");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock API call - replace with real registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "student",
        plan: "Plan Prueba", // Default to trial plan
        phone: userData.phone,
      };

      setUser(newUser);
      localStorage.setItem("authToken", "mock-token-123");
    } catch (error) {
      throw new Error("Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with real update
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (error) {
      throw new Error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
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
    canManageSchedule: user?.role === "admin" || user?.role === "teacher",
    canViewAllClasses: user?.role === "admin",
    canEditOwnSchedule: user?.role === "teacher",
    canBookClasses: user?.role === "student",
    isAdmin: user?.role === "admin",
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
  };
}
