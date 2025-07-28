import { Heart, Target, Users, Award, CheckCircle } from "lucide-react";

export function About() {
  const achievements = [
    "Más de 5 años transformando vidas",
    "Equipo multidisciplinario certificado", 
    "Planes personalizados para cada cliente",
    "Seguimiento continuo y resultados comprobados"
  ];

  const values = [
    {
      icon: Heart,
      title: "Pasión por el Bienestar",
      description: "Cada día trabajamos con dedicación para mejorar la calidad de vida de nuestros clientes."
    },
    {
      icon: Target,
      title: "Objetivos Claros",
      description: "Definimos metas específicas y medibles para garantizar resultados efectivos y duraderos."
    },
    {
      icon: Users,
      title: "Trabajo en Equipo",
      description: "Nuestros especialistas colaboran para brindarte una atención integral y coordinada."
    },
    {
      icon: Award,
      title: "Excelencia Profesional",
      description: "Contamos con profesionales certificados y en constante capacitación en las últimas técnicas."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="section-title text-left">
                Sobre <span className="text-primary">HTK center</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos un centro de salud integral que nace de la visión de brindar atención 
                personalizada y de calidad en las áreas de kinesiología, nutrición y psicología. 
                Nuestro enfoque holístico nos permite abordar tu bienestar desde múltiples perspectivas.
              </p>
              <p className="text-gray-600 leading-relaxed">
                En HTK center creemos que cada persona es única, por eso desarrollamos planes 
                completamente personalizados que se adaptan a tus necesidades, objetivos y estilo de vida. 
                Nuestro equipo multidisciplinario trabaja de manera coordinada para maximizar tus resultados.
              </p>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Clientes Satisfechos</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-gray-600">Tasa de Éxito</div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center text-gym-dark mb-8">
              Nuestros Valores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-gym-dark">{value.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gym-dark mb-4">Nuestra Misión</h3>
            <p className="text-gray-600 leading-relaxed">
              Proporcionar servicios de salud integral de excelencia, combinando kinesiología, 
              nutrición y psicología para mejorar la calidad de vida de nuestros clientes mediante 
              tratamientos personalizados y un enfoque humano y profesional.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gym-dark mb-4">Nuestra Visión</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser reconocidos como el centro de salud integral líder en la región, 
              destacando por nuestra innovación, calidad humana y resultados excepcionales 
              en el bienestar y transformación de vidas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
