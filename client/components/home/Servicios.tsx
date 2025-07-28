import { Activity, Utensils, Brain, Star, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function Servicios() {
  const services = [
    {
      icon: Activity,
      title: "Kinesiología",
      subtitle: "Rehabilitación y Bienestar Físico",
      description: "Especialistas en rehabilitación, prevención de lesiones y mejora del rendimiento físico. Utilizamos técnicas avanzadas para tu recuperación y bienestar.",
      features: [
        "Rehabilitación post-lesión",
        "Terapia manual especializada",
        "Ejercicios terapéuticos",
        "Prevención de lesiones",
        "Evaluación postural"
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Utensils,
      title: "Nutrición",
      subtitle: "Alimentación Personalizada",
      description: "Planes nutricionales adaptados a tus objetivos, estilo de vida y condiciones de salud. Educación alimentaria para cambios duraderos.",
      features: [
        "Planes alimentarios personalizados",
        "Educación nutricional",
        "Seguimiento y ajustes",
        "Nutrición deportiva",
        "Manejo de patologías"
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Brain,
      title: "Psicología",
      subtitle: "Bienestar Mental y Emocional",
      description: "Apoyo psicológico profesional para mejorar tu bienestar emocional, manejar el estrés y desarrollar herramientas para una vida plena.",
      features: [
        "Terapia individual",
        "Manejo del estrés",
        "Desarrollo personal",
        "Psicología deportiva",
        "Apoyo emocional"
      ],
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            Nuestros <span className="text-primary">Servicios</span>
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Ofrecemos un enfoque integral para tu bienestar, combinando las mejores prácticas 
            en kinesiología, nutrición y psicología con atención personalizada.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${service.gradient} p-6 text-white`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{service.title}</h3>
                    <p className="text-sm opacity-90">{service.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm opacity-95 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="font-semibold text-gym-dark mb-4">¿Qué incluye?</h4>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                >
                  Más Información
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">¿Necesitas una combinación de servicios?</h3>
          <p className="text-lg mb-6 opacity-90">
            Nuestro enfoque integral combina diferentes especialidades para maximizar tus resultados. 
            Consulta con nuestro equipo para crear un plan personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?tab=register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Evaluación Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/#contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contactar Especialista
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-gray-600">Profesionales Certificados</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-gray-600">Pacientes Atendidos</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-gray-600">Satisfacción del Cliente</div>
          </div>
        </div>
      </div>
    </section>
  );
}
