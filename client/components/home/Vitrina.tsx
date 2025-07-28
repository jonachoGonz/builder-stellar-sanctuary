import { Link } from "react-router-dom";
import { ArrowRight, Star, Users, Award } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";

export function Vitrina() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-gym-dark via-slate-900 to-black flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="hero-text">
                Transforma tu vida con 
                <span className="text-primary block">HTK center</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Centro integral de salud que combina kinesiología, nutrición y psicología 
                para brindarte el bienestar que mereces. Nuestros profesionales certificados 
                te acompañarán en cada paso hacia una vida más saludable.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-gray-300">Clientes Activos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-gray-300">Calificación</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-gray-300">Especialidades</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link to="/calendar">
                  <Button size="lg" className="btn-primary w-full sm:w-auto">
                    Agendar Cita
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login?tab=register">
                  <Button size="lg" className="btn-primary w-full sm:w-auto">
                    Comienza Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/#plans">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-gym-dark w-full sm:w-auto"
                >
                  Ver Planes
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Profesionales Certificados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Atención Personalizada</span>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
              <img 
                src="/api/placeholder/600/400" 
                alt="HTK Center - Centro de Salud Integral"
                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
              />
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gym-dark">4.9/5</div>
                    <div className="text-sm text-gray-600">+200 Reseñas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
