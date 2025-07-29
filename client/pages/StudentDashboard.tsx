import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Activity,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { EnhancedUnifiedCalendar } from "../components/EnhancedUnifiedCalendar";
import { TeamsStyleCalendar } from "@/components/TeamsStyleCalendar";

export function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterTime, setFilterTime] = useState("all");

  // Get student info from real user data
  const getStudentInfo = () => {
    if (!user) return null;

    // Calculate plan limits based on plan type
    const getPlanLimits = (plan?: string) => {
      switch (plan?.toLowerCase()) {
        case "plan básico":
        case "basico":
          return { limit: 2, name: "Plan Básico" };
        case "plan pro":
        case "pro":
          return { limit: 3, name: "Plan Pro" };
        case "plan premium":
        case "premium":
          return { limit: 5, name: "Plan Premium" };
        default:
          return { limit: 2, name: user.plan || "Plan Básico" };
      }
    };

    const planInfo = getPlanLimits(user.plan);
    const memberSince = user.memberSince
      ? new Date(user.memberSince).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Enero 2024";

    return {
      name: `${user.firstName} ${user.lastName}`,
      plan: planInfo.name,
      classesThisWeek: myClasses.filter((c) => {
        const classDate = new Date(c.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return (
          classDate >= weekStart &&
          classDate <= weekEnd &&
          c.status !== "cancelled"
        );
      }).length,
      classesLimit: planInfo.limit,
      nextClass: getNextClass(),
      memberSince,
      streak: calculateStreak(),
      totalClasses: myClasses.filter((c) => c.status === "completed").length,
      completionRate: calculateCompletionRate(),
    };
  };

  const getNextClass = () => {
    const upcoming = myClasses
      .filter((c) => new Date(c.date) > new Date() && c.status === "booked")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )[0];

    if (!upcoming) return "Sin clases programadas";

    const date = new Date(upcoming.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateText = "";
    if (date.toDateString() === today.toDateString()) {
      dateText = "Hoy";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateText = "Mañana";
    } else {
      dateText = date.toLocaleDateString("es-ES");
    }

    return `${dateText} ${upcoming.startTime}`;
  };

  const calculateStreak = () => {
    // Simple streak calculation - days with completed classes
    const completedClasses = myClasses
      .filter((c) => c.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (completedClasses.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const classItem of completedClasses) {
      const classDate = new Date(classItem.date);
      classDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - classDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= streak + 1) {
        streak = Math.max(streak, diffDays);
      } else {
        break;
      }
    }

    return Math.max(streak, 1);
  };

  const calculateCompletionRate = () => {
    const totalBooked = myClasses.filter(
      (c) => c.status === "booked" || c.status === "completed",
    ).length;
    const completed = myClasses.filter((c) => c.status === "completed").length;

    if (totalBooked === 0) return 100;
    return Math.round((completed / totalBooked) * 100);
  };

  const studentInfo = getStudentInfo();

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockAvailableClasses = [
      {
        id: "1",
        title: "Entrenamiento Funcional Matutino",
        instructor: {
          name: "Carlos Mendoza",
          rating: 4.9,
          specialties: ["Funcional", "CrossFit"],
        },
        date: "2024-01-16",
        startTime: "08:00",
        endTime: "09:00",
        duration: 60,
        maxCapacity: 15,
        currentCapacity: 12,
        availableSpots: 3,
        location: "Sala Principal",
        type: "functional",
        difficulty: "Intermedio",
        price: "Incluido en plan",
        description:
          "Entrenamiento de alta intensidad que combina fuerza, resistencia y movilidad.",
      },
      {
        id: "2",
        title: "Yoga Flow",
        instructor: {
          name: "Mar��a González",
          rating: 4.8,
          specialties: ["Yoga", "Pilates"],
        },
        date: "2024-01-16",
        startTime: "18:00",
        endTime: "19:00",
        duration: 60,
        maxCapacity: 12,
        currentCapacity: 8,
        availableSpots: 4,
        location: "Sala Zen",
        type: "yoga",
        difficulty: "Principiante",
        price: "Incluido en plan",
        description:
          "Sesión de yoga dinámica perfecta para relajarse después del trabajo.",
      },
      {
        id: "3",
        title: "CrossFit Avanzado",
        instructor: {
          name: "Diego Ramirez",
          rating: 4.9,
          specialties: ["CrossFit", "Musculación"],
        },
        date: "2024-01-17",
        startTime: "19:00",
        endTime: "20:00",
        duration: 60,
        maxCapacity: 10,
        currentCapacity: 10,
        availableSpots: 0,
        location: "Área CrossFit",
        type: "crossfit",
        difficulty: "Avanzado",
        price: "Incluido en plan",
        description: "CrossFit intenso para atletas experimentados.",
      },
      {
        id: "4",
        title: "Pilates Core",
        instructor: {
          name: "María González",
          rating: 4.8,
          specialties: ["Yoga", "Pilates"],
        },
        date: "2024-01-18",
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        maxCapacity: 15,
        currentCapacity: 6,
        availableSpots: 9,
        location: "Sala Zen",
        type: "pilates",
        difficulty: "Intermedio",
        price: "Incluido en plan",
        description: "Fortalecimiento del core y mejora de la flexibilidad.",
      },
    ];

    const mockMyClasses = [
      {
        id: "1",
        title: "Entrenamiento Funcional",
        instructor: "Carlos Mendoza",
        date: "2024-01-16",
        startTime: "08:00",
        endTime: "09:00",
        location: "Sala Principal",
        status: "booked",
        canCancel: true,
      },
      {
        id: "2",
        title: "Yoga Flow",
        instructor: "María González",
        date: "2024-01-15",
        startTime: "18:00",
        endTime: "19:00",
        location: "Sala Zen",
        status: "completed",
        canCancel: false,
        rating: 5,
      },
      {
        id: "3",
        title: "CrossFit",
        instructor: "Diego Ramirez",
        date: "2024-01-13",
        startTime: "19:00",
        endTime: "20:00",
        location: "Área CrossFit",
        status: "completed",
        canCancel: false,
        rating: 4,
      },
    ];

    setAvailableClasses(mockAvailableClasses);
    setMyClasses(mockMyClasses);
  }, []);

  const todayClasses = myClasses.filter(
    (c) => c.date === new Date().toISOString().split("T")[0],
  );
  const upcomingClasses = myClasses.filter(
    (c) => new Date(c.date) > new Date() && c.status === "booked",
  );

  const filteredClasses = availableClasses.filter((classItem) => {
    const matchesType = filterType === "all" || classItem.type === filterType;
    const matchesTime =
      filterTime === "all" ||
      (filterTime === "morning" &&
        parseInt(classItem.startTime.split(":")[0]) < 12) ||
      (filterTime === "afternoon" &&
        parseInt(classItem.startTime.split(":")[0]) >= 12 &&
        parseInt(classItem.startTime.split(":")[0]) < 18) ||
      (filterTime === "evening" &&
        parseInt(classItem.startTime.split(":")[0]) >= 18);
    const matchesDate = classItem.date >= selectedDate;

    return matchesType && matchesTime && matchesDate;
  });

  const handleBookClass = (classItem: any) => {
    if (classItem.availableSpots === 0) {
      alert("Esta clase está llena. ¿Quieres unirte a la lista de espera?");
      return;
    }

    if (
      studentInfo &&
      studentInfo.classesThisWeek >= studentInfo.classesLimit
    ) {
      alert(
        "Has alcanzado el límite de clases para esta semana según tu plan.",
      );
      return;
    }

    setSelectedClass(classItem);
    setIsBookingDialogOpen(true);
  };

  const confirmBooking = () => {
    if (selectedClass) {
      // Add to my classes
      const newBooking = {
        id: selectedClass.id,
        title: selectedClass.title,
        instructor: selectedClass.instructor.name,
        date: selectedClass.date,
        startTime: selectedClass.startTime,
        endTime: selectedClass.endTime,
        location: selectedClass.location,
        status: "booked",
        canCancel: true,
      };

      setMyClasses([...myClasses, newBooking]);

      // Update available spots
      setAvailableClasses(
        availableClasses.map((c) =>
          c.id === selectedClass.id
            ? {
                ...c,
                currentCapacity: c.currentCapacity + 1,
                availableSpots: c.availableSpots - 1,
              }
            : c,
        ),
      );

      setIsBookingDialogOpen(false);
      setSelectedClass(null);
    }
  };

  const handleCancelClass = (classId: string) => {
    if (confirm("¿Estás seguro de que quieres cancelar esta clase?")) {
      setMyClasses(myClasses.filter((c) => c.id !== classId));

      // Update available spots
      setAvailableClasses(
        availableClasses.map((c) =>
          c.id === classId
            ? {
                ...c,
                currentCapacity: c.currentCapacity - 1,
                availableSpots: c.availableSpots + 1,
              }
            : c,
        ),
      );
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      Principiante: "default",
      Intermedio: "secondary",
      Avanzado: "destructive",
    } as const;

    return (
      <Badge variant={variants[difficulty as keyof typeof variants]}>
        {difficulty}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
        return <Badge className="bg-blue-100 text-blue-800">Reservada</Badge>;
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">Completada</Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !studentInfo) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gym-dark mb-4">
            Error de Acceso
          </h2>
          <p className="text-gray-600">
            No se pudo cargar la información del usuario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">¡Hola, {studentInfo.name}!</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  {studentInfo.plan}
                </Badge>
                <span className="text-white/80">
                  {studentInfo.classesThisWeek}/{studentInfo.classesLimit}{" "}
                  clases esta semana
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{studentInfo.streak}</div>
              <div className="text-white/80">días seguidos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progreso Semanal
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentInfo.classesThisWeek}/{studentInfo.classesLimit}
              </div>
              <Progress
                value={
                  (studentInfo.classesThisWeek / studentInfo.classesLimit) * 100
                }
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Completadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentInfo.totalClasses}
              </div>
              <p className="text-xs text-muted-foreground">
                Desde {studentInfo.memberSince}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Asistencia
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentInfo.completionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Excelente constancia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Racha Actual
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentInfo.streak}</div>
              <p className="text-xs text-muted-foreground">días consecutivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Unified Calendar */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <TeamsStyleCalendar></TeamsStyleCalendar>
                <EnhancedUnifiedCalendar
                  showCreateButton={true}
                  showConfigButton={false}
                />
            </div>
            
          

            {/* Available Classes */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Clases Disponibles
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-auto"
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-4 mt-4">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Tipo de clase" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="functional">Funcional</SelectItem>
                          <SelectItem value="yoga">Yoga</SelectItem>
                          <SelectItem value="crossfit">CrossFit</SelectItem>
                          <SelectItem value="pilates">Pilates</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterTime} onValueChange={setFilterTime}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Horario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todo el día</SelectItem>
                          <SelectItem value="morning">Mañana</SelectItem>
                          <SelectItem value="afternoon">Tarde</SelectItem>
                          <SelectItem value="evening">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">{classItem.title}</h3>
                                {getDifficultyBadge(classItem.difficulty)}
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {classItem.instructor.name}
                                </span>
                                <span className="flex items-center">
                                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                  {classItem.instructor.rating}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(classItem.date).toLocaleDateString(
                                    "es-ES",
                                  )}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {classItem.startTime} - {classItem.endTime}
                                </span>
                                <span>{classItem.location}</span>
                              </div>

                              <p className="text-sm text-gray-600 mb-3">
                                {classItem.description}
                              </p>

                              <div className="flex items-center space-x-4">
                                <span className="text-sm">
                                  {classItem.availableSpots > 0 ? (
                                    <span className="text-green-600 font-medium">
                                      {classItem.availableSpots} espacios
                                      disponibles
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-medium">
                                      Clase llena
                                    </span>
                                  )}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {classItem.currentCapacity}/
                                  {classItem.maxCapacity} inscritos
                                </span>
                              </div>
                            </div>

                            <div className="ml-4">
                              <Button
                                className={
                                  classItem.availableSpots > 0
                                    ? "btn-primary"
                                    : "btn-secondary"
                                }
                                onClick={() => handleBookClass(classItem)}
                              >
                                {classItem.availableSpots > 0 ? (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Reservar
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Lista de Espera
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredClasses.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay clases disponibles
                          </h3>
                          <p>
                            Intenta cambiar los filtros o seleccionar otra fecha
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Today's Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayClasses.length > 0 ? (
                      <div className="space-y-3">
                        {todayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="p-3 bg-primary/5 border border-primary/20 rounded-lg"
                          >
                            <div className="font-medium text-sm">
                              {classItem.title}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {classItem.instructor} • {classItem.startTime} •{" "}
                              {classItem.location}
                            </div>
                            <div className="mt-2">
                              {getStatusBadge(classItem.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No tienes clases hoy</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Upcoming Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Próximas Clases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingClasses.slice(0, 3).map((classItem) => (
                        <div
                          key={classItem.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">
                                {classItem.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {new Date(classItem.date).toLocaleDateString(
                                  "es-ES",
                                )}{" "}
                                • {classItem.startTime}
                              </div>
                              <div className="text-xs text-gray-600">
                                {classItem.instructor}
                              </div>
                            </div>
                            {classItem.canCancel && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelClass(classItem.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {upcomingClasses.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No tienes clases reservadas</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Logros Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gym-gold/5 rounded-lg">
                      <Award className="h-6 w-6 text-gym-gold" />
                      <div>
                        <div className="font-medium text-sm">Racha de 12 días</div>
                        <div className="text-xs text-gray-600">¡Increíble!</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                      <div>
                        <div className="font-medium text-sm">Meta Cumplida</div>
                        <div className="text-xs text-gray-600">
                          40 clases completadas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary/5 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-secondary" />
                      <div>
                        <div className="font-medium text-sm">Progreso</div>
                        <div className="text-xs text-gray-600">94% asistencia</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{selectedClass.title}</h3>
                <div className="space-y-1 mt-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Instructor:</span>
                    <span>{selectedClass.instructor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>
                      {new Date(selectedClass.date).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horario:</span>
                    <span>
                      {selectedClass.startTime} - {selectedClass.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ubicación:</span>
                    <span>{selectedClass.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dificultad:</span>
                    <span>{selectedClass.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>{selectedClass.description}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm">
                  <strong>Recordatorio:</strong> Puedes cancelar hasta 2 horas
                  antes del inicio de la clase sin penalización.
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsBookingDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button className="btn-primary" onClick={confirmBooking}>
                  Confirmar Reserva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
