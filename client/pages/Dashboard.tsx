import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  // Mock data for user info
  const userInfo = {
    name: "Juan Pérez",
    plan: "Plan Pro",
    classesThisWeek: 2,
    classesLeft: 1,
    nextClass: "Mañana 10:00 AM",
    trainer: "Carlos Mendoza",
  };

  // Mock calendar data
  const mockClasses = [
    {
      id: 1,
      date: "2024-01-15",
      time: "10:00",
      trainer: "Carlos Mendoza",
      type: "Entrenamiento Funcional",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2024-01-17",
      time: "15:30",
      trainer: "María González",
      type: "Yoga",
      status: "pending",
    },
    {
      id: 3,
      date: "2024-01-19",
      time: "09:00",
      trainer: "Diego Ramirez",
      type: "Musculación",
      status: "available",
    },
  ];

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const monthName = currentDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gym-dark">
                ¡Hola, {userInfo.name}!
              </h1>
              <p className="text-gray-600">
                Estás en el {userInfo.plan} - {userInfo.classesLeft} clases
                restantes esta semana
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with user info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen Semanal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Clases esta semana</span>
                  <Badge variant="secondary">
                    {userInfo.classesThisWeek}/3
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Próxima clase</span>
                  <span className="text-sm font-medium">
                    {userInfo.nextClass}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Entrenador</span>
                  <span className="text-sm font-medium">
                    {userInfo.trainer}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Clase
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Mis Objetivos
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progreso
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas Clases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockClasses.slice(0, 3).map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-3 bg-gray-50 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {classItem.type}
                      </span>
                      <Badge
                        variant={
                          classItem.status === "confirmed"
                            ? "default"
                            : classItem.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {classItem.status === "confirmed"
                          ? "Confirmada"
                          : classItem.status === "pending"
                            ? "Pendiente"
                            : "Disponible"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {classItem.trainer} • {classItem.time}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    <Calendar className="h-6 w-6 inline mr-2" />
                    Mi Agenda
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={view === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("week")}
                      >
                        Semana
                      </Button>
                      <Button
                        variant={view === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("month")}
                      >
                        Mes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold capitalize">
                    {monthName}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Week View */}
                {view === "week" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                        (day, index) => (
                          <div
                            key={day}
                            className="text-center text-sm font-medium text-gray-600 p-2"
                          >
                            {day}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day, index) => (
                        <div
                          key={index}
                          className="min-h-32 p-2 bg-gray-50 rounded-lg border-2 border-transparent hover:border-primary/20 cursor-pointer transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {day.getDate()}
                          </div>
                          {/* Mock class slots */}
                          {index === 1 && (
                            <div className="bg-primary/10 text-primary text-xs p-1 rounded mb-1">
                              10:00 Funcional
                            </div>
                          )}
                          {index === 3 && (
                            <div className="bg-secondary/10 text-secondary text-xs p-1 rounded mb-1">
                              15:30 Yoga
                            </div>
                          )}
                          {index === 5 && (
                            <div className="bg-gray-200 text-gray-600 text-xs p-1 rounded mb-1">
                              09:00 Disponible
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Month View Placeholder */}
                {view === "month" && (
                  <div className="text-center py-20">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Vista Mensual
                    </h3>
                    <p className="text-gray-500">
                      La vista mensual estará disponible próximamente
                    </p>
                  </div>
                )}

                {/* Time slots */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg mb-2">
                      <Clock className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm font-medium">Mañana</div>
                    <div className="text-xs text-gray-600">6:00 - 12:00</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-secondary/10 text-secondary p-3 rounded-lg mb-2">
                      <Clock className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm font-medium">Tarde</div>
                    <div className="text-xs text-gray-600">12:00 - 18:00</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-accent/10 text-accent p-3 rounded-lg mb-2">
                      <Clock className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm font-medium">Noche</div>
                    <div className="text-xs text-gray-600">18:00 - 23:00</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-gray-100 text-gray-600 p-3 rounded-lg mb-2">
                      <Plus className="h-6 w-6 mx-auto" />
                    </div>
                    <div className="text-sm font-medium">Agendar</div>
                    <div className="text-xs text-gray-600">Nueva clase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
