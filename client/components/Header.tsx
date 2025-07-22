import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add error boundary for auth context
  let user = null;
  let isAuthenticated = false;
  let logout = () => {};

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch (error) {
    console.error("Header: AuthContext not available:", error);
    // Fallback to unauthenticated state
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gym-dark">HTK center</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Mi Perfil
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Mi Dashboard
                </Link>
              </>
            ) : (
              // Public navigation
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Inicio
                </Link>
                <Link
                  to="/#plans"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Planes
                </Link>
                <Link
                  to="/#about"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Nosotros
                </Link>
                <Link
                  to="/#contact"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  Contacto
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              // Authenticated user dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.firstName} />
                      <AvatarFallback className="bg-primary text-white">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {user.plan && (
                        <p className="text-xs leading-none text-primary font-medium">
                          {user.plan}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Unauthenticated user buttons
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-primary"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-primary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated && user ? (
                // Authenticated mobile menu
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.firstName} />
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.plan && (
                        <p className="text-xs text-primary font-medium">
                          {user.plan}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Dashboard
                  </Link>
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:text-primary"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </>
              ) : (
                // Unauthenticated mobile menu
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link
                    to="/#plans"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Planes
                  </Link>
                  <Link
                    to="/#about"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nosotros
                  </Link>
                  <Link
                    to="/#contact"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contacto
                  </Link>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:text-primary"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full btn-primary">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Registrarse
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
