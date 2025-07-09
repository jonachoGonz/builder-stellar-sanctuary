import { useState } from "react";
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

export function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { canManageUsers, isStudent, isAdmin } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
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
  useState(() => {
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
  });

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

  // Mock upcoming classes
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
    setEditData({ ...userData });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted">
      <WelcomeModal
        userName={userData.firstName}
        userPlan={userData.plan}
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
                ¡Bienvenido, {userData.firstName} {userData.lastName}!
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                  {userData.plan}
                </Badge>
                <span className="text-white/80">
                  Miembro desde {userStats.joinDate}
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
                Tu Plan: {userData.plan}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    ¿Qué puedes hacer ahora?
                  </h3>
                  <div className="space-y-3">
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
                      <span>Conectar con profesores expertos</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {userData.plan === "Plan Pro" ? "3" : "2"} clases
                    </div>
                    <div className="text-gray-600">por semana</div>
                  </div>
                  <Link to="/dashboard" className="w-full">
                    <Button className="w-full btn-primary text-lg py-3">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Comenzar a Entrenar
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
            {/* Progress Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Mi Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-gym-gold" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.firstName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.lastName}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Teléfono
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.phone}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Fecha de Nacimiento
                    </Label>
                    {isEditing ? (
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
                        {new Date(userData.birthDate).toLocaleDateString(
                          "es-ES",
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Ocupación</Label>
                    {isEditing ? (
                      <Input
                        id="occupation"
                        value={editData.occupation}
                        onChange={(e) =>
                          handleInputChange("occupation", e.target.value)
                        }
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.occupation}
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
                    {isEditing ? (
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
                        {userData.activityLevel === "sedentary"
                          ? "Sedentario"
                          : userData.activityLevel === "active"
                            ? "Activo"
                            : "Muy Activo"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan Actual</Label>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="font-semibold text-primary">
                        {userData.plan}
                      </div>
                      <div className="text-sm text-gray-600">
                        3 clases por semana
                      </div>
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
                      {isEditing ? (
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
                          {userData.emergencyContactName}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Teléfono</Label>
                      {isEditing ? (
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
                          {userData.emergencyContactPhone}
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
                  {upcomingClasses.map((classItem) => (
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
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">Ver Todas las Clases</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
