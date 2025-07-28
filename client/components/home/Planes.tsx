import { useState, useEffect } from "react";
import { Check, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { apiCall } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxMonthlyClasses: number;
  totalClasses: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export function Planes() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await apiCall("/plans/active");
        
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans || []);
        } else {
          setError("No se pudieron cargar los planes");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section id="plans" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-gray-600">Cargando planes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            Nuestros <span className="text-primary">Planes</span>
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y objetivos. 
            Todos incluyen seguimiento personalizado y acceso a nuestros especialistas.
          </p>
        </div>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div 
                key={plan._id} 
                className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  plan.isPopular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg text-xs font-medium">
                    <Star className="h-3 w-3 inline mr-1" />
                    Más Popular
                  </div>
                )}

                <div className="p-6">
                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gym-dark mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-primary">${plan.price.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">
                        /{plan.duration === 1 ? 'mes' : `${plan.duration} meses`}
                      </span>
                    </div>
                  </div>

                  {/* Plan details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Clases por mes:</span>
                      <span className="font-medium">{plan.maxMonthlyClasses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Clases totales:</span>
                      <span className="font-medium">{plan.totalClasses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium">
                        {plan.duration === 1 ? '1 mes' : `${plan.duration} meses`}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <h4 className="font-medium text-gym-dark">Incluye:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  {isAuthenticated ? (
                    <Link to="/calendar">
                      <Button 
                        className={`w-full ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        Agendar Cita
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login?tab=register">
                      <Button 
                        className={`w-full ${plan.isPopular ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        Comenzar Ahora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay planes disponibles en este momento.</p>
          </div>
        )}

        {/* Guarantee section */}
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <h3 className="text-xl font-bold text-gym-dark mb-4">
            Garantía de Satisfacción
          </h3>
          <p className="text-gray-600 mb-6">
            Si no estás satisfecho con nuestros servicios en los primeros 30 días, 
            te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/#contact">
              <Button variant="outline">
                Hablar con un Especialista
              </Button>
            </Link>
            <Link to="/#about">
              <Button variant="ghost">
                Conoce Más Sobre Nosotros
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact for custom plans */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Necesitas un plan personalizado? Nuestros especialistas pueden crear uno específico para ti.
          </p>
          <Link to="/#contact">
            <Button variant="outline">
              Solicitar Plan Personalizado
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
