import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, Star, User, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { apiCall } from "../../lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
  avatar?: string;
  rating?: number;
  experience?: string;
}

export function Contacto() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        const response = await apiCall("/auth/teachers");
        
        if (response.ok) {
          const data = await response.json();
          setTeachers(data.teachers || []);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setTeachersLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage("");

    try {
      const response = await apiCall("/contact", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormMessage("Mensaje enviado correctamente. Te contactaremos pronto.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
      } else {
        setFormMessage("Error al enviar el mensaje. Intenta nuevamente.");
      }
    } catch (error) {
      setFormMessage("Error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">
            <span className="text-primary">Contacto</span>
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            ¿Tienes preguntas o necesitas más información? Contáctanos y nuestro equipo 
            te ayudará a encontrar la mejor solución para tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gym-dark mb-6">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gym-dark">Dirección</div>
                    <div className="text-gray-600">Av. Principal 123, Santiago, Chile</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gym-dark">Teléfono</div>
                    <div className="text-gray-600">+56 9 1234 5678</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gym-dark">Email</div>
                    <div className="text-gray-600">contacto@htkenter.cl</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-gym-dark">Horario de Atención</div>
                    <div className="text-gray-600">
                      Lunes - Viernes: 8:00 - 20:00<br />
                      Sábados: 9:00 - 14:00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Mapa de ubicación</p>
                <p className="text-sm">Av. Principal 123, Santiago</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gym-dark mb-6">Envíanos un Mensaje</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                />
              </div>
              
              {formMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  formMessage.includes("Error") 
                    ? "bg-red-100 text-red-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {formMessage}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensaje"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Our Teachers Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gym-dark mb-4">
              Nuestros Profesionales
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conoce a nuestro equipo de especialistas certificados que te acompañarán 
              en tu camino hacia una mejor calidad de vida.
            </p>
          </div>

          {teachersLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-gray-600">Cargando profesionales...</p>
            </div>
          ) : teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={teacher.avatar} alt={teacher.firstName} />
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-gym-dark mb-1">
                    {teacher.firstName} {teacher.lastName}
                  </h4>
                  {teacher.specialty && (
                    <p className="text-primary text-sm font-medium mb-2">
                      {teacher.specialty}
                    </p>
                  )}
                  {teacher.rating && (
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{teacher.rating}/5</span>
                    </div>
                  )}
                  {teacher.experience && (
                    <p className="text-xs text-gray-500 mt-2">{teacher.experience}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Información de profesionales no disponible.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
