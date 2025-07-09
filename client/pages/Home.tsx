import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  Trophy,
  Heart,
  Star,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Shield,
  MessageCircle,
  Brain,
  Leaf,
  Sparkles,
  HandHeart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function Home() {
  const plans = [
    {
      id: 1,
      name: "Plan Básico",
      classes: "2 clases semanales",
      description: "Ideal para comenzar tu transformación",
      price: "$49.990",
      duration: "por mes",
      popular: false,
      features: [
        "2 sesiones por semana",
        "Seguimiento personalizado",
        "Acceso a app móvil",
        "Plan nutricional básico",
        "Evaluación inicial gratuita",
      ],
    },
    {
      id: 2,
      name: "Plan Pro",
      classes: "3 clases semanales",
      description: "El equilibrio perfecto",
      price: "$69.990",
      duration: "por mes",
      popular: true,
      features: [
        "3 sesiones por semana",
        "Nutricionista incluido",
        "Evaluaciones mensuales",
        "Acceso a psicología",
        "Descuentos en terapias",
      ],
    },
    {
      id: 3,
      name: "Plan Elite",
      classes: "4 clases semanales",
      description: "Para resultados serios",
      price: "$89.990",
      duration: "por mes",
      popular: false,
      features: [
        "4 sesiones por semana",
        "Profesional personal",
        "Plan nutricional premium",
        "Masoterapia incluida",
        "Acceso a todos los servicios",
      ],
    },
    {
      id: 4,
      name: "Plan Personalizado",
      classes: "Flexible",
      description:
        "Ajustamos nuestras clases a tus necesidades y requerimientos",
      price: "Consultar",
      duration: "precio",
      popular: false,
      features: [
        "Horarios flexibles",
        "Equipo profesional exclusivo",
        "Plan totalmente personalizado",
        "Todos los servicios incluidos",
        "Atención prioritaria",
      ],
    },
  ];

  const professionals = [
    {
      name: "Dr. Carlos Mendoza",
      specialty: "Kinesiólogo y Entrenador",
      experience: "8 años",
      certifications: [
        "Licenciado en Kinesiología",
        "Cert. Entrenamiento Funcional",
      ],
      image: "/placeholder.svg",
    },
    {
      name: "María González",
      specialty: "Nutricionista y Yoga",
      experience: "6 años",
      certifications: ["Licenciada en Nutrición", "Instructora Yoga RYT-500"],
      image: "/placeholder.svg",
    },
    {
      name: "Ps. Ana Silva",
      specialty: "Psicóloga Deportiva",
      experience: "7 años",
      certifications: ["Psicóloga Clínica", "Especialista en Deporte"],
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gym-dark via-slate-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="hero-text gradient-primary bg-clip-text text-transparent mb-6">
              Centro de Salud Integral
              <br />
              <span className="text-white">Con Enfoque Personalizado</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Únete a HTK center y descubre un enfoque integral de la salud con
              profesionales especializados y una comunidad comprometida con tu
              bienestar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="#plans">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-gym-dark"
                >
                  Ver Planes
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Section 1: Health Center Showcase */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-gym-dark mb-4">
              Bienvenido a HTK center
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más que un centro de entrenamiento, somos tu aliado integral en el
              camino hacia una vida más saludable y equilibrada en cuerpo, mente
              y espíritu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/placeholder.svg"
                alt="Instalaciones HTK center"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gym-dark mb-2">
                    Enfoque Integral Personalizado
                  </h3>
                  <p className="text-gray-600">
                    Combinamos entrenamiento, kinesiología, nutrición,
                    psicología y terapias complementarias en un plan único para
                    ti.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gym-dark mb-2">
                    Comunidad de Bienestar
                  </h3>
                  <p className="text-gray-600">
                    Forma parte de una comunidad comprometida con el crecimiento
                    personal y el bienestar integral de todos sus miembros.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gym-dark mb-2">
                    Profesionales Especializados
                  </h3>
                  <p className="text-gray-600">
                    Nuestro equipo multidisciplinario de profesionales te
                    acompaña en cada paso de tu transformación integral.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: What Makes Us Special */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-gym-dark mb-4">
              Nuestros Servicios Integrales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra amplia gama de servicios diseñados para tu
              bienestar físico, mental y emocional en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-gym-dark">
                  Entrenamiento y Kinesiología
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Programas de entrenamiento personalizados con enfoque
                  kinesiológico para prevenir lesiones y optimizar tu
                  rendimiento.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl text-gym-dark">
                  Nutrición Saludable y Deportiva
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Planes nutricionales personalizados para deportistas y
                  personas que buscan un estilo de vida saludable y equilibrado.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-accent/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-gym-dark">
                  Psicología
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Apoyo psicológico especializado para fortalecer tu bienestar
                  mental y emocional en tu proceso de transformación.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <HandHeart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-gym-dark">
                  Masoterapia
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Terapias de masajes especializadas para la recuperación
                  muscular, relajación y alivio del estrés.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl text-gym-dark">Yoga</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Clases de yoga para conectar cuerpo, mente y espíritu,
                  mejorando flexibilidad, fuerza y paz interior.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto bg-accent/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-gym-dark">
                  Muay Thai
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Entrenamiento de Muay Thai para desarrollar fuerza,
                  disciplina, técnica y confianza en ti mismo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Plans */}
      <section id="plans" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-gym-dark mb-4">
              Elige Tu Plan Perfecto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planes flexibles diseñados para adaptarse a tu estilo de vida y
              objetivos. Pago mensual, trimestral, semestral o anual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`card-hover relative ${
                  plan.popular
                    ? "border-primary border-2 shadow-2xl scale-105"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-gym-dark">
                    {plan.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {plan.price}
                  </div>
                  <div className="text-gray-600">{plan.duration}</div>
                  <div className="text-lg font-semibold text-secondary">
                    {plan.classes}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-center">
                    {plan.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-accent mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button
                      className={`w-full ${
                        plan.popular ? "btn-primary" : "btn-secondary"
                      }`}
                    >
                      Elegir Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Necesitas un plan personalizado? Contáctanos para opciones
              empresariales y familiares.
            </p>
            <Button variant="outline" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Contactar Asesor
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Location & Professionals */}
      <section id="contact" className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-gym-dark mb-4">
              Ubicación y Profesionales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce a nuestro equipo de expertos y visítanos en nuestra moderna
              instalación.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Location */}
            <div>
              <h3 className="text-2xl font-bold text-gym-dark mb-6">
                Nuestra Ubicación
              </h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">Mapa Interactivo</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">
                      José Manuel Infante 1956. Ñuñoa, Santiago, Chile
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="text-gray-700">
                      <div>Lun - Vie: 6:00 - 23:00</div>
                      <div>Sáb - Dom: 8:00 - 20:00</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-gray-700">+56994748507</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full btn-primary">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en Google Maps
                  </Button>
                </div>
              </div>
            </div>

            {/* Trainers */}
            <div>
              <h3 className="text-2xl font-bold text-gym-dark mb-6">
                Nuestros Profesionales
              </h3>
              <div className="space-y-6">
                {professionals.map((professional, index) => (
                  <Card key={index} className="shadow-lg border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={professional.image}
                          alt={professional.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gym-dark">
                            {professional.name}
                          </h4>
                          <p className="text-primary font-medium">
                            {professional.specialty}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {professional.experience} de experiencia
                          </p>
                          <div className="flex items-center mt-2">
                            {professional.certifications.map(
                              (cert, certIndex) => (
                                <span
                                  key={certIndex}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2"
                                >
                                  {cert}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">5.0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" size="lg">
                  Ver Todos los Profesionales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de personas que ya han transformado sus vidas. ¡Tu
            primera clase es gratis!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4"
              >
                Comenzar Ahora Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
