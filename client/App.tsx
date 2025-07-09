import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import components
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// Import contexts
import { AuthProvider } from "./contexts/AuthContext";

// Import pages
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { AuthSuccess } from "./pages/AuthSuccess";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component for pages with header and footer
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Layout component for auth pages (no header/footer)
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">{children}</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes with header/footer */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />

            {/* Authentication routes with header/footer */}
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Auth />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <Auth />
                </PublicLayout>
              }
            />
            <Route
              path="/auth/success"
              element={
                <AuthLayout>
                  <AuthSuccess />
                </AuthLayout>
              }
            />

            {/* Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <div className="min-h-screen">
                  <Dashboard />
                </div>
              }
            />

            <Route
              path="/profile"
              element={
                <div className="min-h-screen">
                  <Profile />
                </div>
              }
            />

            {/* Legal pages placeholders */}
            <Route
              path="/terms"
              element={
                <PublicLayout>
                  <div className="container mx-auto px-4 py-20">
                    <h1 className="text-4xl font-bold text-gym-dark mb-8">
                      Términos y Condiciones
                    </h1>
                    <div className="prose max-w-none text-gray-600">
                      <p>Términos y condiciones - Contenido próximamente</p>
                    </div>
                  </div>
                </PublicLayout>
              }
            />

            <Route
              path="/privacy"
              element={
                <PublicLayout>
                  <div className="container mx-auto px-4 py-20">
                    <h1 className="text-4xl font-bold text-gym-dark mb-8">
                      Política de Privacidad
                    </h1>
                    <div className="prose max-w-none text-gray-600">
                      <p>Política de privacidad - Contenido próximamente</p>
                    </div>
                  </div>
                </PublicLayout>
              }
            />

            {/* 404 page */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <NotFound />
                </PublicLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
