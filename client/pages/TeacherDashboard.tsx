import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
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
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

export function TeacherDashboard() {
  const { user, isLoading } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get teacher specialties based on user role and specialty
  const getTeacherSpecialties = () => {
    if (!user) return [];

    const specialtyMapping = {
      teacher: ["Fitness", "Personal Training"],
      nutritionist: ["Nutrition", "Diet Planning"],
      psychologist: ["Psychology", "Mental Health"],
    };

    const baseSpecialties =
      specialtyMapping[user.role as keyof typeof specialtyMapping] || [];

    // Add user's specific specialty if it exists
    if (user.specialty && !baseSpecialties.includes(user.specialty)) {
      baseSpecialties.push(user.specialty);
    }

    return baseSpecialties;
  };

  // Get professional info from real user data
  const getProfessionalInfo = () => {
    if (!user) return null;

    const calculateStats = () => {
      const totalClasses = classes.filter(
        (c) => c.status === "completed",
      ).length;
      const uniqueStudents = new Set(
        classes.flatMap((c) => c.students?.map((s: any) => s.id) || []),
      ).size;

      return {
        totalClasses,
        totalStudents: uniqueStudents,
        upcomingClasses: classes.filter((c) => new Date(c.date) > new Date())
          .length,
        completedThisWeek: classes.filter((c) => {
          const classDate = new Date(c.date);
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return (
            classDate >= weekStart &&
            classDate <= weekEnd &&
            c.status === "completed"
          );
        }).length,
      };
    };

    const stats = calculateStats();

    return {
      name: `${user.firstName} ${user.lastName}`,
      specialties: getTeacherSpecialties(),
      rating: 4.8, // Default rating - could be calculated from class ratings
      totalClasses: stats.totalClasses,
      totalStudents: stats.totalStudents,
      upcomingClasses: stats.upcomingClasses,
      completedThisWeek: stats.completedThisWeek,
      maxClassesPerDay: 6,
      maxStudentsPerClass: 15,
      memberSince: user.memberSince
        ? new Date(user.memberSince).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })
        : "Enero 2024",
    };
  };

  const getProfessionalSpecialties = () => {
    // Default specialties - in a real app, this would come from user profile
    const defaultSpecialties = [
      "Entrenamiento Funcional",
      "CrossFit",
      "Musculación",
    ];

    // Could be based on the types of classes this teacher has created
    const classTypes = [...new Set(classes.map((c) => c.type || "functional"))];
    const typeMapping: { [key: string]: string } = {
      functional: "Entrenamiento Funcional",
      crossfit: "CrossFit",
      yoga: "Yoga",
      pilates: "Pilates",
      cardio: "Cardio",
      strength: "Musculación",
    };

    const specialties = classTypes.map(
      (type) => typeMapping[type] || "Entrenamiento General",
    );

    return specialties.length > 0 ? specialties : defaultSpecialties;
  };

  const teacherInfo = getProfessionalInfo();

  // Load real data from API
  useEffect(() => {
    if (user) {
      loadAppointments();
      loadStudents();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/admin/appointments?professionalId=${user?.id}&limit=100`);

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data.appointments || []);

        // Transform appointments to classes format
        const transformedClasses = data.data.appointments?.map((apt: any) => ({
          id: apt._id,
          title: apt.title || apt.type || 'Sesión',
          date: apt.date.split('T')[0],
          startTime: apt.startTime,
          endTime: apt.endTime,
          duration: apt.duration || 60,
          location: apt.location || 'Por definir',
          status: apt.status,
          students: apt.student ? [apt.student] : [],
          notes: apt.notes,
        })) || [];

        setClasses(transformedClasses);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await apiCall('/admin/users?role=student&limit=100');

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data.users || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Generate weekly schedule grid
  useEffect(() => {
    const weekSchedule = [];
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const times = ["08:00", "10:00", "16:00", "18:00", "20:00"];

    days.forEach((day, dayIndex) => {
      times.forEach((time) => {
        const hasClass = classes.some(c => {
          const classDate = new Date(c.date);
          const currentDate = new Date();
          const dayDiff = (classDate.getDay() + 6) % 7; // Monday = 0
          return dayDiff === dayIndex && c.startTime === time;
        });

        weekSchedule.push({
          day,
          dayIndex,
          time,
          isBlocked: false, // Will be loaded from user preferences
          hasClass,
          classTitle: hasClass ? classes.find(c => {
            const classDate = new Date(c.date);
            const dayDiff = (classDate.getDay() + 6) % 7;
            return dayDiff === dayIndex && c.startTime === time;
          })?.title : '',
        });
      });
    });

    setSchedule(weekSchedule);
  }, [classes]);

  const today = new Date().toISOString().split('T')[0];
  const todayClasses = classes.filter(
    (c) => c.date === today && c.status === "scheduled",
  );
  const upcomingClasses = classes.filter(
    (c) =>
      new Date(c.date) > new Date(today) && c.status === "scheduled",
  );

  const stats = {
    todayClasses: todayClasses.length,
    weeklyClasses: classes.filter((c) => c.status === "scheduled").length,
    totalStudents: classes.reduce((acc, c) => acc + c.currentCapacity, 0),
    averageCapacity: Math.round(
      (classes.reduce((acc, c) => acc + c.currentCapacity, 0) /
        classes.reduce((acc, c) => acc + c.maxCapacity, 0)) *
        100,
    ),
  };

  const handleCreateClass = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      const response = await apiCall('/admin/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointmentData,
          professionalId: user?.id,
        }),
      });

      if (response.ok) {
        await loadAppointments(); // Reload appointments
        setIsCreateDialogOpen(false);
      } else {
        console.error('Error creating appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = (classItem: any) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };

  const handleBlockTime = (scheduleItem: any) => {
    setSchedule(
      schedule.map((item) =>
        item.day === scheduleItem.day && item.time === scheduleItem.time
          ? { ...item, isBlocked: !item.isBlocked }
          : item,
      ),
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case "in-progress":
        return <Badge className="bg-green-100 text-green-800">En Curso</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completada</Badge>;
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

  if (!user || !teacherInfo) {
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gym-dark">
                ¡Hola, {teacherInfo.name}!
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-secondary/10 text-secondary">
                  {teacherInfo.specialties.join(" • ")}
                </Badge>
                <span className="text-gray-600">
                  ⭐ {teacherInfo.rating} • {teacherInfo.totalClasses} clases
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="btn-primary" onClick={handleCreateClass}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Clase
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayClasses}</div>
              <p className="text-xs text-muted-foreground">
                Próxima a las {todayClasses[0]?.startTime || "--:--"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Semana
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyClasses}</div>
              <p className="text-xs text-muted-foreground">
                Máximo {teacherInfo.maxClassesPerDay} por día
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estudiantes Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                En clases programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ocupación Promedio
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageCapacity}%</div>
              <p className="text-xs text-muted-foreground">
                De capacidad máxima
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Gestión de Horarios
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Bloquea o desbloquea horarios según tu disponibilidad
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  {/* Header */}
                  <div className="font-medium text-sm"></div>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-sm"
                      >
                        {day}
                      </div>
                    ),
                  )}

                  {/* Time slots */}
                  {["08:00", "10:00", "16:00", "18:00", "20:00"].map((time) => (
                    <div key={time} className="contents">
                      <div className="text-sm font-medium py-2">{time}</div>
                      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                        const scheduleItem = schedule.find(
                          (s) => s.time === time && s.dayIndex === dayIndex,
                        );
                        return (
                          <button
                            key={`${time}-${dayIndex}`}
                            onClick={() =>
                              scheduleItem && handleBlockTime(scheduleItem)
                            }
                            className={`h-12 border rounded-md text-xs font-medium transition-colors ${
                              scheduleItem?.isBlocked
                                ? "bg-red-100 border-red-300 text-red-700"
                                : scheduleItem?.hasClass
                                  ? "bg-green-100 border-green-300 text-green-700"
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {scheduleItem?.isBlocked
                              ? "Bloqueado"
                              : scheduleItem?.hasClass
                                ? "Clase"
                                : "Libre"}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center space-x-6 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                    <span>Con clase</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                    <span>Bloqueado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Classes */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Clases de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{classItem.title}</h3>
                          <p className="text-sm text-gray-600">
                            {classItem.startTime} - {classItem.endTime} •{" "}
                            {classItem.location}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm">
                              {classItem.currentCapacity}/
                              {classItem.maxCapacity} estudiantes
                            </span>
                            {classItem.waitingList.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {classItem.waitingList.length} en espera
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(classItem.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClass(classItem)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {todayClasses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tienes clases programadas para hoy
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-primary"
                  onClick={handleCreateClass}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Clase
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Bloquear Horario
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Estudiantes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Mis Estadísticas
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle>Próximas Clases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingClasses.slice(0, 3).map((classItem) => (
                  <div key={classItem.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm">{classItem.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(classItem.date).toLocaleDateString("es-ES")} •{" "}
                      {classItem.startTime}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs">
                        {classItem.currentCapacity}/{classItem.maxCapacity}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {classItem.location}
                      </Badge>
                    </div>
                  </div>
                ))}
                {upcomingClasses.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No hay clases pr��ximas
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Calificación promedio</span>
                  <span className="font-semibold">⭐ {teacherInfo.rating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Clases completadas</span>
                  <span className="font-semibold">
                    {teacherInfo.totalClasses}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estudiantes únicos</span>
                  <span className="font-semibold">
                    {teacherInfo.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tasa de asistencia</span>
                  <span className="font-semibold">92%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Clase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título de la Clase</Label>
                <Input id="title" placeholder="Ej: Entrenamiento Funcional" />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Clase</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functional">
                      Entrenamiento Funcional
                    </SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="strength">Musculación</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la clase..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="startTime">Hora Inicio</Label>
                <Input id="startTime" type="time" />
              </div>
              <div>
                <Label htmlFor="duration">Duración (min)</Label>
                <Input id="duration" type="number" placeholder="60" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidad Máxima</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="15"
                  max={teacherInfo.maxStudentsPerClass}
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sala" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Sala Principal</SelectItem>
                    <SelectItem value="crossfit">Área CrossFit</SelectItem>
                    <SelectItem value="yoga">Sala Zen</SelectItem>
                    <SelectItem value="weights">Área de Pesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button className="btn-primary">Crear Clase</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gestionar Clase</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Detalles de la Clase</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="editTitle">Título</Label>
                      <Input
                        id="editTitle"
                        defaultValue={selectedClass.title}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editDate">Fecha</Label>
                      <Input
                        id="editDate"
                        type="date"
                        defaultValue={selectedClass.date}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="editStartTime">Inicio</Label>
                        <Input
                          id="editStartTime"
                          type="time"
                          defaultValue={selectedClass.startTime}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEndTime">Fin</Label>
                        <Input
                          id="editEndTime"
                          type="time"
                          defaultValue={selectedClass.endTime}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Estudiantes Inscritos</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedClass.students.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{student.name}</span>
                        <Button size="sm" variant="outline">
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectedClass.waitingList.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">
                        Lista de Espera
                      </h4>
                      <div className="space-y-2">
                        {selectedClass.waitingList.map((student: any) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                          >
                            <span className="text-sm">{student.name}</span>
                            <Button size="sm" variant="outline">
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button variant="outline" className="text-destructive">
                  Cancelar Clase
                </Button>
                <Button className="btn-primary">Guardar Cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
