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
  Brain,
  Heart,
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

export function PsychologistDashboard() {
  const { user, isLoading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  // Get psychologist info from real user data
  const getPsychologistInfo = () => {
    if (!user) return null;

    const stats = {
      totalSessions: sessions.filter((s) => s.status === "completed").length,
      totalStudents: assignedStudents.length,
      upcomingSessions: sessions.filter((s) => new Date(s.date) > new Date())
        .length,
      completedThisWeek: sessions.filter((s) => {
        const sessionDate = new Date(s.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return (
          sessionDate >= weekStart &&
          sessionDate <= weekEnd &&
          s.status === "completed"
        );
      }).length,
    };

    return {
      name: `${user.firstName} ${user.lastName}`,
      specialty: user.specialty || "Psicología Deportiva y del Bienestar",
      rating: 4.8,
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
    const mockSessions = [
      {
        id: "1",
        studentName: "Ana García",
        type: "psychology-session",
        title: "Sesión de Apoyo Psicológico",
        date: "2024-01-16",
        startTime: "10:00",
        endTime: "11:00",
        status: "scheduled",
        notes: "Trabajo en autoestima y motivación deportiva",
        priority: "normal",
      },
      {
        id: "2",
        studentName: "Carlos López",
        type: "psychology-session",
        title: "Seguimiento Psicológico",
        date: "2024-01-16",
        startTime: "15:00",
        endTime: "16:00",
        status: "scheduled",
        notes: "Control de ansiedad pre-competencia",
        priority: "high",
      },
    ];

    const mockStudents = [
      {
        id: "1",
        name: "Ana García",
        email: "ana@email.com",
        plan: "elite",
        startDate: "2024-01-01",
        progress: "Mejora significativa en autoconfianza",
        nextSession: "2024-01-16 10:00",
        priority: "normal",
      },
      {
        id: "2",
        name: "Carlos López",
        email: "carlos@email.com",
        plan: "pro",
        startDate: "2023-12-10",
        progress: "Técnicas de relajación implementadas",
        nextSession: "2024-01-16 15:00",
        priority: "high",
      },
    ];

    setSessions(mockSessions);
    setAssignedStudents(mockStudents);
  }, []);

  const psychologistInfo = getPsychologistInfo();

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

  if (!user || !psychologistInfo) {
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panel de Psicología</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-lg">{psychologistInfo.name}</span>
                <Badge className="bg-white/20 text-white border-white/30">
                  {psychologistInfo.specialty}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {psychologistInfo.totalStudents}
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
                {psychologistInfo.totalSessions}
              </div>
              <p className="text-xs text-muted-foreground">
                +{psychologistInfo.completedThisWeek} esta semana
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
                {psychologistInfo.totalStudents}
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
                {psychologistInfo.upcomingSessions}
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
                ⭐ {psychologistInfo.rating}
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio pacientes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Sesiones de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions
                  .filter(
                    (session) =>
                      session.date === new Date().toISOString().split("T")[0],
                  )
                  .map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{session.title}</h4>
                            {session.priority === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                Prioritaria
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {session.studentName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.startTime} - {session.endTime}
                          </p>
                          {session.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {session.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {session.status === "completed"
                            ? "Completada"
                            : "Programada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                {sessions.filter(
                  (session) =>
                    session.date === new Date().toISOString().split("T")[0],
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
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{student.name}</h4>
                          {student.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Prioritario
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-500">
                          Plan: {student.plan}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
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
