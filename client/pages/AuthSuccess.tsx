import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get("token");
      const userString = searchParams.get("user");

      if (token && userString) {
        try {
          // Store token
          localStorage.setItem("authToken", token);

          // Parse user data
          const userData = JSON.parse(decodeURIComponent(userString));

          // Refresh user data to sync with context
          await refreshUser();

          // Redirect to dashboard
          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Auth success error:", error);
          navigate("/login?error=auth_error", { replace: true });
        }
      } else {
        navigate("/login?error=missing_params", { replace: true });
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gym-dark via-slate-900 to-black flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Completando autenticación...</h2>
        <p className="text-gray-400 mt-2">
          Te redirigiremos al dashboard en un momento
        </p>
      </div>
    </div>
  );
}
