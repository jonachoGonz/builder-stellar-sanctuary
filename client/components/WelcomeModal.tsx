import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Calendar,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface WelcomeModalProps {
  userName: string;
  userPlan: string;
  isNewUser?: boolean;
}

export function WelcomeModal({
  userName,
  userPlan,
  isNewUser = false,
}: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show welcome modal for new users
    if (isNewUser) {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        setIsOpen(true);
      }
    }
  }, [isNewUser]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const handleGoToDashboard = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            🎉 ¡Bienvenido a HTK center, {userName}!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome message */}
          <div className="text-center">
            <p className="text-lg text-gray-600">
              Tu cuenta ha sido creada exitosamente y ya tienes acceso a tu{" "}
              <span className="font-semibold text-primary">{userPlan}</span>
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Agenda tus Clases</h3>
              </div>
              <p className="text-sm text-gray-600">
                Explora y reserva clases según tu horario y preferencias
              </p>
            </div>

            <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-6 w-6 text-secondary" />
                <h3 className="font-semibold">Profesionales Expertos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Entrena con profesionales certificados y experimentados
              </p>
            </div>

            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="h-6 w-6 text-accent" />
                <h3 className="font-semibold">Sigue tu Progreso</h3>
              </div>
              <p className="text-sm text-gray-600">
                Monitorea tus logros y mantén la motivación alta
              </p>
            </div>

            <div className="p-4 bg-gym-gold/5 rounded-lg border border-gym-gold/20">
              <div className="flex items-center space-x-3 mb-2">
                <LayoutDashboard className="h-6 w-6 text-gym-gold" />
                <h3 className="font-semibold">Tu Dashboard Personal</h3>
              </div>
              <p className="text-sm text-gray-600">
                Control total de tu experiencia fitness en un solo lugar
              </p>
            </div>
          </div>

          {/* Plan details */}
          <div className="bg-gradient-to-r from-primary/10 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              Tu {userPlan} incluye:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  {userPlan === "Plan Pro"
                    ? "3 clases por semana"
                    : "2 clases por semana"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  Acceso a todas las instalaciones
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm">Seguimiento personalizado</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm">App móvil incluida</span>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard" className="flex-1">
              <Button
                className="w-full btn-primary text-lg py-3"
                onClick={handleGoToDashboard}
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Ir a Mi Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleClose}
              className="sm:w-auto px-6"
            >
              Explorar Perfil Primero
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              ¿Necesitas ayuda? Contáctanos por WhatsApp al{" "}
              <a
                href="https://wa.me/56912345678"
                className="text-primary hover:underline"
              >
                +56 9 1234 5678
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
