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
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Import contexts
import { AuthProvider } from "./contexts/AuthContext";

// Import pages
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { AuthSuccess } from "./pages/AuthSuccess";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Profile } from "./pages/Profile";
import { Calendar } from "./pages/Calendar";
import CalendarioCompletoPage from "./pages/CalendarioCompleto";
import { Reviews } from "./pages/Reviews";
import Diagnostic from "./pages/Diagnostic";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component for pages with header and footer
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <ErrorBoundary
      fallback={
        <div className="bg-white border-b p-4 text-center">
          <span className="text-gray-600">
            Navigation temporarily unavailable
          </span>
        </div>
      }
    >
      <Header />
    </ErrorBoundary>
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
        <ScrollToTop />
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
                  <Header />
                  <Dashboard />
                </div>
              }
            />

            <Route
              path="/admin"
              element={
                <div className="min-h-screen">
                  <Header />
                  <AdminDashboard />
                </div>
              }
            />

            <Route
              path="/profile"
              element={
                <div className="min-h-screen">
                  <Header />
                  <Profile />
                </div>
              }
            />

            <Route
              path="/calendar"
              element={
                <div className="min-h-screen">
                  <Header />
                  <Calendar />
                </div>
              }
            />

            {/* New comprehensive calendar */}
            <Route
              path="/agenda"
              element={
                <div className="min-h-screen">
                  <Header />
                  <CalendarioCompletoPage />
                </div>
              }
            />

            {/* Reviews page */}
            <Route
              path="/reviews"
              element={
                <div className="min-h-screen">
                  <Header />
                  <Reviews />
                </div>
              }
            />

            {/* Diagnostic route for debugging */}
            <Route
              path="/diagnostic"
              element={
                <PublicLayout>
                  <Diagnostic />
                </PublicLayout>
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

// Prevent double mounting in development
const rootElement = document.getElementById("root")!;

// Check if root already exists (for hot reloading)
let root = (rootElement as any)._reactRoot;
if (!root) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
}

root.render(<App />);
