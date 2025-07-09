import { Link } from "react-router-dom";
import {
  Dumbbell,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gym-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">HTK center</span>
            </div>
            <p className="text-gray-300 mb-4">
              Transforma tu vida con un enfoque integral de la salud y
              profesionales especializados. Tu mejor versión te espera.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/htk_center"
                className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/56912345678"
                className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/#about"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  to="/#plans"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Planes
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Planes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Planes</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Plan Básico - 2 clases/semana</li>
              <li className="text-gray-300">Plan Pro - 3 clases/semana</li>
              <li className="text-gray-300">Plan Elite - 4 clases/semana</li>
              <li className="text-gray-300">Plan Personalizado - Flexible</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-300">+56994748507</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-300">info@htkcenter.cl</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-gray-300">
                  José Manuel Infante 1956. Ñuñoa, Santiago, Chile
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © 2024 HTK center. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary text-sm">
              Términos y Condiciones
            </a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm">
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
