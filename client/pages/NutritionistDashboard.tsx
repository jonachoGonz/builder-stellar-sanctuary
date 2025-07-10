import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  Activity,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
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

export function NutritionistDashboard() {
  const { user, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  // Get nutritionist info from real user data
  const getNutritionistInfo = () => {
    if (!user) return null;

    const stats = {
      totalSessions: appointments.filter((a) => a.status === "completed")
        .length,
      totalStudents: assignedStudents.length,
      upcomingSessions: appointments.filter(
        (a) => new Date(a.date) > new Date(),
      ).length,
      completedThisWeek: appointments.filter((a) => {
        const sessionDate = new Date(a.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return (
          sessionDate >= weekStart &&
          sessionDate <= weekEnd &&
          a.status === "completed"
        );
      }).length,
    };

    return {
      name: `${user.firstName} ${user.lastName}`,
      specialty: user.specialty || "Nutrición Deportiva y Clínica",
      rating: 4.9,
      ...stats,
      memberSince: user.memberSince
        ? new Date(user.memberSince).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })
        : "Enero 2024",
    };
  };

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockAppointments = [
      {
        id: "1",
        studentName: "Juan Pérez",
        type: "first-nutrition",
        title: "Primera Evaluación Nutricional",
        date: "2024-01-16",
        startTime: "09:00",
        endTime: "10:30",
        status: "scheduled",
        notes: "Evaluación inicial - plan para pérdida de peso",
      },
      {
        id: "2",
        studentName: "María Silva",
        type: "nutrition-followup",
        title: "Seguimiento Nutricional",
        date: "2024-01-16",
        startTime: "11:00",
        endTime: "11:45",
        status: "scheduled",
        notes: "Control de progreso - ajuste de macros",
      },
    ];

    const mockStudents = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@email.com",
        plan: "pro",
        startDate: "2024-01-01",
        progress: "Pérdida de 3kg en 2 semanas",
        nextSession: "2024-01-16 09:00",
      },
      {
        id: "2",
        name: "María Silva",
        email: "maria@email.com",
        plan: "elite",
        startDate: "2023-12-15",
        progress: "Mejora en composición corporal",
        nextSession: "2024-01-16 11:00",
      },
    ];

    setAppointments(mockAppointments);
    setAssignedStudents(mockStudents);
  }, []);

  const nutritionistInfo = getNutritionistInfo();

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

  if (!user || !nutritionistInfo) {
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel de Nutrición</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-lg">{nutritionistInfo.name}</span>
                <Badge className="bg-white/20 text-white border-white/30">
                  {nutritionistInfo.specialty}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {nutritionistInfo.totalStudents}
              </div>
              <div className="text-white/80">pacientes activos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sesiones Completadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nutritionistInfo.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                +{nutritionistInfo.completedThisWeek} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nutritionistInfo.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">En seguimiento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas Sesiones
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nutritionistInfo.upcomingSessions}
              </div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Calificación
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ⭐ {nutritionistInfo.rating}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio pacientes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Sesiones de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter(
                    (apt) =>
                      apt.date === new Date().toISOString().split("T")[0],
                  )
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          <p className="text-sm text-gray-600">
                            {appointment.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.startTime} - {appointment.endTime}
                          </p>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.status === "completed"
                            ? "Completada"
                            : "Programada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {appointments.filter(
                  (apt) => apt.date === new Date().toISOString().split("T")[0],
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes sesiones programadas para hoy</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Mis Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedStudents.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-500">
                          Plan: {student.plan}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {student.progress}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Próxima sesión</p>
                        <p className="text-sm font-medium">
                          {student.nextSession}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
