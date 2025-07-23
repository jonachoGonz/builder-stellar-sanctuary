import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  Award,
  Target,
  Activity,
  Heart,
  TrendingUp,
  LayoutDashboard,
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
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { WelcomeModal } from "../components/WelcomeModal";
import { useAuth, usePermissions } from "../contexts/AuthContext";
import { Star } from "lucide-react";
import { apiCall } from "../lib/api";

export function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { canManageUsers, isStudent, isAdmin, isProfessional } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [realAppointments, setRealAppointments] = useState<any[]>([]);
  const [realStats, setRealStats] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    occupation: "",
    activityLevel: "",
    medicalConditions: "",
    injuries: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Initialize editData with user data when user is loaded
  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        occupation: user.occupation || "",
        activityLevel: user.activityLevel || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        emergencyContactName: user.emergencyContact?.name || "",
        emergencyContactPhone: user.emergencyContact?.phone || "",
      });

      // Load real data for professionals
      if (isProfessional) {
        loadProfessionalData();
      }
    }
  }, [user, isProfessional]);

  const loadProfessionalData = async () => {
    try {
      setDataLoading(true);

      // Load upcoming appointments for this professional
      const appointmentsResponse = await apiCall(`/admin/appointments?professionalId=${user?.id}&status=scheduled&limit=3`);

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setRealAppointments(appointmentsData.data.appointments || []);
      }

      // Load professional stats
      const statsResponse = await apiCall(`/admin/appointments?professionalId=${user?.id}&limit=1000`);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const appointments = statsData.data.appointments || [];

        const stats = {
          totalClassesTaught: appointments.filter(apt => apt.status === 'completed').length,
          totalStudents: new Set(appointments.map(apt => apt.student?._id).filter(Boolean)).size,
          averageRating: 4.7, // This would come from actual rating data
          classesThisMonth: appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            const now = new Date();
            return aptDate.getMonth() === now.getMonth() &&
                   aptDate.getFullYear() === now.getFullYear();
          }).length,
          joinDate: user?.memberSince
            ? new Date(user.memberSince).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })
            : "Enero 2024",
        };

        setRealStats(stats);
      }
    } catch (error) {
      console.error('Error loading professional data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // User stats - can be made dynamic later
  const userStats = {
    classesCompleted: 45,
    totalClasses: 48,
    currentStreak: 12,
    joinDate: user?.memberSince
      ? new Date(user.memberSince).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Enero 2024",
    nextGoal: "50 clases",
    completionRate: 94,
  };

  // Professional stats - for teachers, nutritionists, psychologists
  const professionalStats = {
    totalClassesTaught: 127,
    totalStudents: 35,
    averageRating: 4.7,
    classesThisMonth: 23,
    joinDate: user?.memberSince
      ? new Date(user.memberSince).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Enero 2024",
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      teacher: "Entrenador Personal",
      nutritionist: "Nutricionista",
      psychologist: "Psicólogo",
      admin: "Administrador",
      student: "Estudiante",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Mock upcoming classes for students
  const upcomingClasses = [
    {
      id: 1,
      date: "2024-01-16",
      time: "10:00",
      trainer: "Carlos Mendoza",
      type: "Entrenamiento Funcional",
      location: "Sala Principal",
    },
    {
      id: 2,
      date: "2024-01-18",
      time: "15:30",
      trainer: "María González",
      type: "Yoga",
      location: "Sala Zen",
    },
    {
      id: 3,
      date: "2024-01-20",
      time: "09:00",
      trainer: "Diego Ramirez",
      type: "Musculación",
      location: "Área de Pesas",
    },
  ];

  // Mock upcoming classes for professionals
  const upcomingProfessionalClasses = [
    {
      id: 1,
      className: "Entrenamiento Funcional",
      date: "2024-01-16",
      time: "10:00",
      duration: "60 min",
      student: "Ana García",
      location: "Sala Principal",
    },
    {
      id: 2,
      className: "Consulta Nutricional",
      date: "2024-01-18",
      time: "15:30",
      duration: "45 min",
      student: "Carlos Ruiz",
      location: "Consultorio 2",
    },
    {
      id: 3,
      className: "Sesión de Yoga",
      date: "2024-01-20",
      time: "09:00",
      duration: "90 min",
      student: "María López",
      location: "Sala Zen",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUser({
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        birthDate: editData.birthDate,
        gender: editData.gender as any,
        occupation: editData.occupation,
        activityLevel: editData.activityLevel as any,
        medicalConditions: editData.medicalConditions,
        injuries: editData.injuries,
        emergencyContact:
          editData.emergencyContactName && editData.emergencyContactPhone
            ? {
                name: editData.emergencyContactName,
                phone: editData.emergencyContactPhone,
              }
            : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        occupation: user.occupation || "",
        activityLevel: user.activityLevel || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        emergencyContactName: user.emergencyContact?.name || "",
        emergencyContactPhone: user.emergencyContact?.phone || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted">
      <WelcomeModal
        userName={user.firstName}
        userPlan={user.plan || "Plan Trial"}
        isNewUser={true} // You can make this dynamic based on user registration date
      />
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="bg-white/20 p-6 rounded-full">
              <User className="h-16 w-16" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">
                ¡Bienvenido, {user.firstName} {user.lastName}!
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                  {isProfessional ? getRoleDisplayName(user.role) : (user.plan || "Plan Trial")}
                </Badge>
                {isProfessional && user.specialty && (
                  <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                    {user.specialty}
                  </Badge>
                )}
                <span className="text-white/80">
                  Miembro desde {isProfessional ? professionalStats.joinDate : userStats.joinDate}
                </span>
              </div>
              <p className="text-white/90 mt-2">
                Tu perfil está configurado y listo. ¡Hora de comenzar a
                entrenar!
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard">
                <Button className="bg-white text-primary hover:bg-gray-100 font-semibold">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Ir a Mi Dashboard
                </Button>
              </Link>
              {(isStudent || isAdmin) && (
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Showcase & Dashboard CTA */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Award className="h-6 w-6 mr-2 text-primary" />
                {isProfessional ? `Tu Rol: ${getRoleDisplayName(user.role)}` : `Tu Plan: ${user.plan || "Plan Trial"}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    {isProfessional ? "¿Qué puedes hacer como profesional?" : "¿Qué puedes hacer ahora?"}
                  </h3>
                  <div className="space-y-3">
                    {isProfessional ? (
                      <>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Gestionar tu calendario de clases</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Ver y actualizar información de estudiantes</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Revisar tus estadísticas y evaluaciones</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Programar sesiones con tus estudiantes</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Ver y reservar clases disponibles</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Acceder a tu calendario personal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Revisar tu progreso y estadísticas</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-accent" />
                          <span>Conectar con profesionales expertos</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="text-center">
                    {isProfessional ? (
                      <>
                        <div className="text-3xl font-bold text-primary mb-2">
                          {realStats ? realStats.totalStudents : professionalStats.totalStudents}
                        </div>
                        <div className="text-gray-600">estudiantes activos</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-primary mb-2">
                          {user.plan === "pro"
                            ? "3"
                            : user.plan === "basic"
                              ? "2"
                              : user.plan === "elite"
                                ? "4"
                                : user.plan === "champion"
                                  ? "5"
                                  : "1"}{" "}
                          clases
                        </div>
                        <div className="text-gray-600">por semana</div>
                      </>
                    )}
                  </div>
                  <Link to="/dashboard" className="w-full">
                    <Button className="w-full btn-primary text-lg py-3">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      {isProfessional ? "Ir a Mi Dashboard" : "Comenzar a Entrenar"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Stats */}
          <div className="space-y-6">
            {/* Progress Stats / Professional Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {isProfessional ? "Clases Realizadas" : "Mi Progreso"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isProfessional ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {realStats ? realStats.totalClassesTaught : professionalStats.totalClassesTaught}
                        </div>
                        <div className="text-sm text-gray-600">Total de clases</div>
                      </div>
                      <div className="text-center p-4 bg-secondary/5 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">
                          {realStats ? realStats.totalStudents : professionalStats.totalStudents}
                        </div>
                        <div className="text-sm text-gray-600">Total de alumnos</div>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-accent/5 rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {realStats ? realStats.classesThisMonth : professionalStats.classesThisMonth}
                      </div>
                      <div className="text-sm text-gray-600">Clases este mes</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Clases Completadas</span>
                        <span className="font-medium">
                          {userStats.classesCompleted}/{userStats.totalClasses}
                        </span>
                      </div>
                      <Progress value={userStats.completionRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {userStats.currentStreak}
                        </div>
                        <div className="text-sm text-gray-600">Días seguidos</div>
                      </div>
                      <div className="text-center p-4 bg-secondary/5 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">
                          {userStats.completionRate}%
                        </div>
                        <div className="text-sm text-gray-600">Asistencia</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">
                        Próximo objetivo
                      </div>
                      <div className="font-semibold text-accent">
                        {userStats.nextGoal}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Achievements / Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isProfessional ? (
                    <>
                      <Star className="h-5 w-5 mr-2 text-yellow-400" />
                      Evaluación
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5 mr-2 text-gym-gold" />
                      Logros
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isProfessional ? (
                  <>
                    <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {renderStarRating(realStats ? realStats.averageRating : professionalStats.averageRating)}
                      </div>
                      <div className="text-3xl font-bold text-yellow-600 mb-1">
                        {realStats ? realStats.averageRating.toFixed(1) : professionalStats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Evaluación promedio de estudiantes
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Basado en {realStats ? realStats.totalStudents : professionalStats.totalStudents} evaluaciones
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">95%</div>
                        <div className="text-xs text-gray-600">Satisfacción</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">98%</div>
                        <div className="text-xs text-gray-600">Recomendación</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gym-gold/5 rounded-lg">
                      <Award className="h-6 w-6 text-gym-gold" />
                      <div>
                        <div className="font-medium">Primera Semana</div>
                        <div className="text-sm text-gray-600">
                          Completaste tu primera semana
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                      <div>
                        <div className="font-medium">Meta Cumplida</div>
                        <div className="text-sm text-gray-600">
                          40 clases completadas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary/5 rounded-lg">
                      <Heart className="h-6 w-6 text-secondary" />
                      <div>
                        <div className="font-medium">Constancia</div>
                        <div className="text-sm text-gray-600">
                          10 días consecutivos
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Información Personal
                  </CardTitle>
                  {isEditing && (
                    <Button onClick={handleSave} className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.firstName || "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.lastName || "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Label>
                    <div className="p-3 bg-gray-100 rounded-lg border">
                      {user.email}
                      <span className="text-xs text-gray-500 ml-2">
                        (No editable)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Teléfono
                    </Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.phone || "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Fecha de Nacimiento
                    </Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={editData.birthDate}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.birthDate
                          ? new Date(user.birthDate).toLocaleDateString("es-ES")
                          : "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Ocupación</Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Input
                        id="occupation"
                        value={editData.occupation}
                        onChange={(e) =>
                          handleInputChange("occupation", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.occupation || "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="activityLevel"
                      className="flex items-center"
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Nivel de Actividad
                    </Label>
                    {isEditing && (isStudent || isAdmin) ? (
                      <Select
                        value={editData.activityLevel}
                        onValueChange={(value) =>
                          handleInputChange("activityLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentario</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="very-active">
                            Muy Activo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {user.activityLevel === "sedentary"
                          ? "Sedentario"
                          : user.activityLevel === "active"
                            ? "Activo"
                            : user.activityLevel === "very-active"
                              ? "Muy Activo"
                              : "No especificado"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">
                      {isProfessional ? "Rol / Especialidad" : "Plan Actual"}
                    </Label>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      {isProfessional ? (
                        <>
                          <div className="font-semibold text-primary">
                            {getRoleDisplayName(user.role)}
                          </div>
                          {user.specialty && (
                            <div className="text-sm text-gray-600 mt-1">
                              Especialidad: {user.specialty}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Profesional certificado
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-primary">
                            {user.plan || "Plan Trial"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.plan === "pro"
                              ? "3"
                              : user.plan === "basic"
                                ? "2"
                                : user.plan === "elite"
                                  ? "4"
                                  : user.plan === "champion"
                                    ? "5"
                                    : "1"}{" "}
                            clases por semana
                          </div>
                          {isAdmin && (
                            <div className="text-xs text-gray-500 mt-1">
                              Los administradores pueden cambiar planes desde el
                              dashboard admin
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">
                    Contacto de Emergencia
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Nombre</Label>
                      {isEditing && (isStudent || isAdmin) ? (
                        <Input
                          id="emergencyContactName"
                          value={editData.emergencyContactName}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContactName",
                              e.target.value,
                            )
                          }
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {user.emergencyContact?.name || "No especificado"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Teléfono</Label>
                      {isEditing && (isStudent || isAdmin) ? (
                        <Input
                          id="emergencyContactPhone"
                          value={editData.emergencyContactPhone}
                          onChange={(e) =>
                            handleInputChange(
                              "emergencyContactPhone",
                              e.target.value,
                            )
                          }
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          {user.emergencyContact?.phone || "No especificado"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Próximas Clases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isProfessional ? (
                    (realAppointments.length > 0 ? realAppointments : upcomingProfessionalClasses).map((classItem) => (
                      <div
                        key={classItem.id || classItem._id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">
                            {classItem.title || classItem.className || classItem.type || 'Sesión'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {classItem.duration ? `${classItem.duration} min` : (classItem.duration || '60 min')}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <div className="font-medium">Fecha y Hora:</div>
                            <div>
                              {new Date(classItem.date).toLocaleDateString("es-ES")} • {classItem.startTime || classItem.time}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Estudiante:</div>
                            <div>
                              {classItem.student ?
                                `${classItem.student.firstName} ${classItem.student.lastName}` :
                                classItem.student || 'Por asignar'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Lugar:</span> {classItem.location || 'Por definir'}
                        </div>
                      </div>
                    ))
                  ) : (
                    upcomingClasses.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">{classItem.type}</div>
                          <div className="text-sm text-gray-600">
                            {classItem.trainer} • {classItem.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {new Date(classItem.date).toLocaleDateString("es-ES")}
                          </div>
                          <div className="text-sm text-gray-600">
                            {classItem.time}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    {isProfessional ? "Ver Todo Mi Calendario" : "Ver Todas las Clases"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            {isStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-primary" />
                      Mis Evaluaciones Recientes
                    </div>
                    <Link to="/reviews">
                      <Button variant="outline" size="sm">
                        Ver Todas
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-600">
                    <p className="mb-4">¡Evalúa tus clases completadas para ayudar a mejorar el servicio!</p>
                    <Link to="/reviews">
                      <Button variant="outline">
                        Ver Sistema de Evaluaciones
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {isProfessional && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-primary" />
                      Mis Evaluaciones
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                      Ver Dashboard
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-600">
                    <p className="mb-4">Revisa las evaluaciones de tus estudiantes y mejora tu servicio</p>
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-lg font-medium">4.8</span>
                    </div>
                    <p className="text-sm text-gray-500">Promedio basado en evaluaciones de estudiantes</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
