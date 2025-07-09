import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    gender: "",
    occupation: "",
    medicalConditions: "",
    injuries: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    activityLevel: "",
    termsAccepted: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Handle login
      console.log("Login attempt:", {
        email: formData.email,
        password: formData.password,
      });
    } else {
      // Handle registration
      setIsVerificationSent(true);
      console.log("Registration attempt:", formData);
    }
  };

  const handleGoogleAuth = () => {
    console.log("Google authentication");
  };

  if (isVerificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gym-dark via-slate-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-accent/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Verifica tu email</CardTitle>
            <CardDescription>
              Te hemos enviado un código de verificación a {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <Input
                placeholder="Código de verificación"
                className="text-center text-lg font-mono"
                maxLength={6}
              />
              <Button className="w-full btn-primary">
                Verificar Código
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsVerificationSent(false)}
                className="w-full"
              >
                Volver al registro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gym-dark via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block text-white space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Bienvenido a <span className="text-primary">FitFlow</span>
            </h1>
            <p className="text-xl text-gray-300">
              Únete a miles de personas que han transformado sus vidas
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">100% Seguro</h3>
                <p className="text-gray-400">Tus datos están protegidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-secondary/10 p-3 rounded-lg">
                <User className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Profesores Expertos</h3>
                <p className="text-gray-400">Entrenadores certificados</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Resultados Garantizados
                </h3>
                <p className="text-gray-400">
                  Ve cambios desde la primera semana
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button
                variant={isLogin ? "default" : "ghost"}
                onClick={() => setIsLogin(true)}
                className={isLogin ? "btn-primary" : ""}
              >
                Iniciar Sesión
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                onClick={() => setIsLogin(false)}
                className={!isLogin ? "btn-primary" : ""}
              >
                Registrarse
              </Button>
            </div>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Inicia Sesión" : "Crea tu Cuenta"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Accede a tu cuenta para continuar"
                : "Completa el formulario para comenzar tu transformación"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con email
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Registration fields */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        className="pl-10"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Optional fields */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900">
                      Información Opcional
                    </h4>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefiero no decir
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Ocupación</Label>
                      <Input
                        id="occupation"
                        placeholder="Ej: Ingeniero, Estudiante, etc."
                        value={formData.occupation}
                        onChange={(e) =>
                          handleInputChange("occupation", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activityLevel">
                        Nivel de Actividad Física
                      </Label>
                      <Select
                        value={formData.activityLevel}
                        onValueChange={(value) =>
                          handleInputChange("activityLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">
                            Sedentario (poco o ningún ejercicio)
                          </SelectItem>
                          <SelectItem value="active">
                            Activo (ejercicio regular)
                          </SelectItem>
                          <SelectItem value="very-active">
                            Muy Activo (ejercicio intenso)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions">Enfermedades</Label>
                      <Input
                        id="medicalConditions"
                        placeholder="Ej: Diabetes, Hipertensión (opcional)"
                        value={formData.medicalConditions}
                        onChange={(e) =>
                          handleInputChange("medicalConditions", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="injuries">Lesiones</Label>
                      <Input
                        id="injuries"
                        placeholder="Ej: Lesión de rodilla, espalda (opcional)"
                        value={formData.injuries}
                        onChange={(e) =>
                          handleInputChange("injuries", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">
                          Contacto de Emergencia
                        </Label>
                        <Input
                          id="emergencyContactName"
                          placeholder="Nombre completo"
                          value={formData.emergencyContactName}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContactName",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">
                          Teléfono de Emergencia
                        </Label>
                        <Input
                          id="emergencyContactPhone"
                          type="tel"
                          placeholder="+56 9 1234 5678"
                          value={formData.emergencyContactPhone}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContactPhone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) =>
                        handleInputChange("termsAccepted", checked as boolean)
                      }
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Acepto los{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline"
                      >
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full btn-primary">
                {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {isLogin && (
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
