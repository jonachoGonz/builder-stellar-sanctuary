import { Link } from "react-router-dom";
import { Heart, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gym-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">HTK center</span>
            </Link>
            <p className="text-gray-300 text-sm">
              Transformamos vidas a través de la salud integral. Nuestro centro ofrece servicios 
              especializados de kinesiología, nutrición y psicología para tu bienestar total.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces Rápidos</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/#about" className="text-gray-300 hover:text-primary transition-colors">
                Nosotros
              </Link>
              <Link to="/#services" className="text-gray-300 hover:text-primary transition-colors">
                Servicios
              </Link>
              <Link to="/#plans" className="text-gray-300 hover:text-primary transition-colors">
                Planes
              </Link>
              <Link to="/#contact" className="text-gray-300 hover:text-primary transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          {/* Servicios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nuestros Servicios</h3>
            <nav className="flex flex-col space-y-2">
              <span className="text-gray-300">Kinesiología</span>
              <span className="text-gray-300">Nutrición</span>
              <span className="text-gray-300">Psicología</span>
              <span className="text-gray-300">Evaluaciones</span>
              <span className="text-gray-300">Planes Personalizados</span>
            </nav>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">Av. Principal 123, Santiago, Chile</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+56 9 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">contacto@htkenter.cl</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">Lun - Vie: 8:00 - 20:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 HTK center. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-300 hover:text-primary text-sm transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacy" className="text-gray-300 hover:text-primary text-sm transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
