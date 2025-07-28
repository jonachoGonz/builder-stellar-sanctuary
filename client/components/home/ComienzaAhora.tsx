import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";

export function ComienzaAhora() {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      number: "1",
      title: "Evaluación Inicial",
      description: "Agenda tu primera cita para una evaluación completa y personalizada"
    },
    {
      number: "2", 
      title: "Plan Personalizado",
      description: "Nuestros especialistas crean un plan específico para tus objetivos"
    },
    {
      number: "3",
      title: "Seguimiento Continuo", 
      description: "Te acompañamos en cada paso hacia una vida más saludable"
    }
  ];

  const benefits = [
    "Primera consulta con descuento especial",
    "Plan personalizado sin costo adicional", 
    "Seguimiento durante todo el proceso",
    "Acceso a todos nuestros especialistas",
    "Flexibilidad para cambiar horarios"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-blue-600 to-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                ¿Listo para 
                <span className="block">Transformar tu Vida?</span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Únete a cientos de personas que ya han mejorado su calidad de vida 
                con nuestro enfoque integral. Tu bienestar es nuestra prioridad.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Clientes Felices</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 text-yellow-300 fill-current" />
                  <span className="text-2xl font-bold ml-1">4.9</span>
                </div>
                <div className="text-sm text-blue-200">Calificación</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-blue-200">Especialidades</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link to="/calendar">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                    Agendar Mi Cita
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login?tab=register">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/#contact">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto"
                >
                  Más Información
                </Button>
              </Link>
            </div>

            {/* Urgency Indicator */}
            <div className="flex items-center space-x-2 text-yellow-200">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Oferta especial válida solo este mes</span>
            </div>
          </div>

          {/* Process Steps */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center mb-8">
              Proceso Simple en 3 Pasos
            </h3>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold">{step.title}</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Offer Box */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-bold mb-2">🎉 Oferta Especial</h4>
              <p className="text-blue-100 text-sm mb-4">
                Nuevos clientes reciben 20% de descuento en su primera consulta 
                y evaluación gratuita con nuestros especialistas.
              </p>
              <div className="text-2xl font-bold text-yellow-300">
                Descuento del 20%
              </div>
              <div className="text-xs text-blue-200 mt-1">
                *Válido solo para nuevos clientes
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-blue-100 mb-4">
            ¿Tienes preguntas? Nuestro equipo está aquí para ayudarte
          </p>
          <Link to="/#contact">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Contactar a un Especialista
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
