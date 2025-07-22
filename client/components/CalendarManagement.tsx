import { useState, useEffect } from "react";
import { AppointmentModal } from "./AppointmentModal";
import { apiCall } from "../lib/api";
import {
  Calendar,
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

export function CalendarManagement() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [filters, setFilters] = useState({
    student: "all",
    professional: "all",
    type: "all",
    status: "all",
  });
  const [students, setStudents] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  useEffect(() => {
    loadAppointments();
    loadUsers();
  }, [currentDate, viewMode, filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        dateFrom: startOfWeek.toISOString().split("T")[0],
        dateTo: endOfWeek.toISOString().split("T")[0],
        ...(filters.student && filters.student !== "all" && { studentId: filters.student }),
        ...(filters.professional && filters.professional !== "all" && { professionalId: filters.professional }),
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.status !== "all" && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data.appointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Load students
      const studentsResponse = await fetch(
        "/api/admin/users?role=student&limit=100",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.data.users);
      }

      // Load professionals
      const professionalsResponse = await fetch("/api/admin/users?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (professionalsResponse.ok) {
        const professionalsData = await professionalsResponse.json();
        const professionalUsers = professionalsData.data.users.filter(
          (user: any) =>
            ["teacher", "nutritionist", "psychologist"].includes(user.role),
        );
        setProfessionals(professionalUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setModalMode("create");
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setModalMode("edit");
    setIsAppointmentModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await loadAppointments();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    try {
      const token = localStorage.getItem("authToken");
      const isEdit = modalMode === "edit" && selectedAppointment;

      const url = isEdit
        ? `/api/admin/appointments/${selectedAppointment._id}`
        : "/api/admin/appointments";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la cita");
      }

      await loadAppointments();
    } catch (error: any) {
      throw new Error(error.message || "Error al guardar la cita");
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "personal-training":
        return "bg-purple-100 text-purple-800";
      case "nutrition-followup":
        return "bg-orange-100 text-orange-800";
      case "psychology-session":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const weekDays = getWeekDays();
  const startOfWeek = weekDays[0];
  const endOfWeek = weekDays[6];

  return (
    <div className="space-y-6">
      {/* Header with Navigation and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Gestión de Citas
            </CardTitle>
            <Button onClick={handleCreateAppointment} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {startOfWeek.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {endOfWeek.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={loadAppointments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-4">
            <Select
              value={filters.student}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, student: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estudiante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estudiantes</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.professional}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, professional: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por profesional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los profesionales</SelectItem>
                {professionals.map((professional) => (
                  <SelectItem key={professional._id} value={professional._id}>
                    {professional.firstName} {professional.lastName} (
                    {professional.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de cita" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="personal-training">
                  Entrenamiento Personal
                </SelectItem>
                <SelectItem value="nutrition-followup">
                  Seguimiento Nutricional
                </SelectItem>
                <SelectItem value="psychology-session">
                  Sesión de Psicología
                </SelectItem>
                <SelectItem value="trial-class">Clase de Prueba</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no-show">No asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando citas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-7 border-l">
              {/* Day Headers */}
              {weekDays.map((day, index) => (
                <div key={index} className="border-r border-b p-4 bg-gray-50">
                  <div className="font-medium text-sm">
                    {day.toLocaleDateString("es-ES", { weekday: "long" })}
                  </div>
                  <div className="text-lg font-bold">{day.getDate()}</div>
                </div>
              ))}

              {/* Day Contents */}
              {weekDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day);
                return (
                  <div key={index} className="border-r min-h-[300px] p-2">
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="p-2 rounded-md border bg-white hover:shadow-sm cursor-pointer group"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge className={getTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAppointment(appointment);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAppointment(appointment._id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-sm font-medium truncate">
                            {appointment.title}
                          </div>

                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {appointment.student?.firstName}{" "}
                              {appointment.student?.lastName}
                            </div>
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {appointment.professional?.firstName}{" "}
                              {appointment.professional?.lastName}
                            </div>
                            {appointment.location && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {appointment.location}
                              </div>
                            )}
                          </div>

                          <Badge
                            className={`text-xs mt-1 ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status === "scheduled" && "Programada"}
                            {appointment.status === "completed" && "Completada"}
                            {appointment.status === "cancelled" && "Cancelada"}
                            {appointment.status === "no-show" && "No asistió"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
        mode={modalMode}
      />
    </div>
  );
}
