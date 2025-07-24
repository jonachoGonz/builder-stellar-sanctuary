import { useState, useEffect } from "react";
import { useAuth, usePermissions } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Block,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { ProfessionalConfigModal } from "./ProfessionalConfigModal";

interface CalendarProps {
  viewMode?: "week" | "month" | "day";
  showCreateButton?: boolean;
  showConfigButton?: boolean;
  className?: string;
}

interface TimeSlot {
  day: string;
  dayIndex: number;
  time: string;
  isBlocked: boolean;
  hasClass: boolean;
  classTitle: string;
  appointment?: any;
  canEdit: boolean;
}

export function UnifiedCalendar({
  viewMode = "week",
  showCreateButton = true,
  showConfigButton = true,
  className = "",
}: CalendarProps) {
  const { user } = useAuth();
  const { isAdmin, isProfessional, isStudent } = usePermissions();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAppointments(), loadUsers()]);
      generateScheduleGrid();
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      // Get week range
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        dateFrom: startOfWeek.toISOString().split("T")[0],
        dateTo: endOfWeek.toISOString().split("T")[0],
        limit: "100",
      });

      // Add role-specific filters
      if (isProfessional && !isAdmin) {
        params.append("professionalId", user!.id);
      } else if (isStudent) {
        params.append("studentId", user!.id);
      }

      const response = await apiCall(`/admin/appointments?${params}`);

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data.appointments || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const loadUsers = async () => {
    try {
      if (isProfessional || isAdmin) {
        // Load students
        const studentsResponse = await apiCall(
          "/admin/users?role=student&limit=100",
        );
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData.data.users || []);
        }
      }

      if (isAdmin) {
        // Load professionals
        const professionalsResponse = await apiCall("/admin/users?limit=100");
        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json();
          const professionalUsers = professionalsData.data.users.filter(
            (u: any) =>
              ["teacher", "nutritionist", "psychologist"].includes(u.role),
          );
          setProfessionals(professionalUsers);
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const generateScheduleGrid = () => {
    const grid: TimeSlot[] = [];

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((time) => {
        // Find appointment for this slot
        const appointment = appointments.find((apt) => {
          const aptDate = new Date(apt.date);
          const dayDiff = (aptDate.getDay() + 6) % 7; // Monday = 0
          return dayDiff === dayIndex && apt.startTime === time;
        });

        // Determine if user can edit this slot
        let canEdit = false;
        if (isAdmin) {
          canEdit = true;
        } else if (isProfessional && appointment) {
          canEdit = appointment.professional._id === user?.id;
        } else if (isStudent && appointment) {
          canEdit = appointment.student._id === user?.id;
        } else if (isProfessional && !appointment) {
          canEdit = true; // Can create new appointments
        }

        grid.push({
          day,
          dayIndex,
          time,
          isBlocked: false, // Will be loaded from user preferences
          hasClass: !!appointment,
          classTitle: appointment?.title || appointment?.type || "",
          appointment,
          canEdit,
        });
      });
    });

    setSchedule(grid);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.canEdit) return;

    if (slot.hasClass && slot.appointment) {
      // Edit existing appointment
      setSelectedAppointment(slot.appointment);
      setIsEditModalOpen(true);
    } else if (isProfessional || isAdmin) {
      // Create new appointment
      setIsCreateModalOpen(true);
    }
  };

  const handleBlockTime = async (slot: TimeSlot) => {
    if (!isProfessional && !isAdmin) return;

    // Toggle blocked status
    const updatedSchedule = schedule.map((s) =>
      s.day === slot.day && s.time === slot.time
        ? { ...s, isBlocked: !s.isBlocked }
        : s,
    );
    setSchedule(updatedSchedule);

    // TODO: Save blocked times to server
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      const response = await apiCall("/admin/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await loadAppointments();
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (config: any) => {
    try {
      setLoading(true);
      const response = await apiCall("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setIsConfigModalOpen(false);
        alert("Configuración guardada exitosamente");
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall(`/admin/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        await loadAppointments();
        setIsEditModalOpen(false);
        alert("Cita cancelada exitosamente");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("Error al cancelar la cita");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = (appointment: any) => {
    // Close current modal and open create modal with appointment data
    setIsEditModalOpen(false);
    // TODO: Open create modal in edit mode
    alert("Funcionalidad de edición próximamente disponible");
  };

  const getSlotStyles = (slot: TimeSlot) => {
    if (slot.isBlocked) {
      return "bg-red-100 border-red-300 text-red-700 cursor-not-allowed";
    } else if (slot.hasClass) {
      return "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer";
    } else if (slot.canEdit) {
      return "bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer";
    } else {
      return "bg-gray-50 border-gray-200 cursor-default";
    }
  };

  const getSlotContent = (slot: TimeSlot) => {
    if (slot.isBlocked) return "Bloqueado";
    if (slot.hasClass) return slot.classTitle;
    if (slot.canEdit) return "Disponible";
    return "No disponible";
  };

  const formatWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })} - ${endOfWeek.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-600">Cargando calendario...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Calendario
                {isStudent && " - Mis Clases"}
                {isProfessional && " - Mi Agenda"}
                {isAdmin && " - Gestión General"}
              </CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{formatWeekRange()}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoy
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showCreateButton && (isProfessional || isAdmin) && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              )}
              {showConfigButton && isProfessional && (
                <Button
                  variant="outline"
                  onClick={() => setIsConfigModalOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Cargando...</p>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-8 gap-2">
            {/* Header row */}
            <div className="font-medium text-sm"></div>
            {days.map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={time} className="contents">
                <div className="text-sm font-medium py-2 px-2 text-right">
                  {time}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const slot = schedule.find(
                    (s) => s.time === time && s.dayIndex === dayIndex,
                  );

                  return (
                    <div key={`${time}-${dayIndex}`} className="relative">
                      <button
                        onClick={() => slot && handleSlotClick(slot)}
                        onContextMenu={(e) => {
                          if (slot && isProfessional) {
                            e.preventDefault();
                            handleBlockTime(slot);
                          }
                        }}
                        className={`w-full h-12 border rounded-md text-xs font-medium transition-colors ${
                          slot
                            ? getSlotStyles(slot)
                            : "bg-gray-50 border-gray-200"
                        }`}
                        disabled={!slot?.canEdit && !slot?.hasClass}
                        title={
                          slot?.hasClass
                            ? `${slot.classTitle}\nClick para ver detalles`
                            : ""
                        }
                      >
                        {slot ? getSlotContent(slot) : ""}
                      </button>

                      {/* Appointment details tooltip */}
                      {slot?.hasClass && slot.appointment && (
                        <div className="absolute bottom-0 left-0 right-0 text-xs">
                          <div className="bg-white border border-gray-200 rounded p-1 shadow-sm">
                            <div className="font-medium truncate">
                              {slot.appointment.student
                                ? `${slot.appointment.student.firstName} ${slot.appointment.student.lastName}`
                                : slot.appointment.professional
                                  ? `${slot.appointment.professional.firstName} ${slot.appointment.professional.lastName}`
                                  : "Sin asignar"}
                            </div>
                            {slot.appointment.location && (
                              <div className="text-gray-500 truncate">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {slot.appointment.location}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Con cita</span>
            </div>
            {isProfessional && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                <span>Bloqueado</span>
              </div>
            )}
            <div className="text-gray-500 ml-4">
              {isProfessional ? "Click derecho para bloquear" : ""}
            </div>
          </div>

          {/* Role-specific information */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {isAdmin &&
                "Como administrador, puedes gestionar todas las citas y horarios."}
              {isProfessional &&
                "Haz click en un horario libre para crear una cita. Click derecho para bloquear horarios."}
              {isStudent &&
                "Aquí puedes ver tus clases programadas. Contacta a tu profesional para programar nuevas citas."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        students={students}
        onCreateAppointment={handleCreateAppointment}
        loading={loading}
      />

      {isProfessional && (
        <ProfessionalConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          user={user}
          onSaveConfig={handleSaveConfig}
          loading={loading}
        />
      )}

      {/* Edit Appointment Modal - TODO: Implement */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedAppointment.title}</h3>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.type}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Fecha:</span>
                  <div>
                    {new Date(selectedAppointment.date).toLocaleDateString(
                      "es-ES",
                    )}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Horario:</span>
                  <div>
                    {selectedAppointment.startTime} -{" "}
                    {selectedAppointment.endTime}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Estudiante:</span>
                  <div>
                    {selectedAppointment.student
                      ? `${selectedAppointment.student.firstName} ${selectedAppointment.student.lastName}`
                      : "Sin asignar"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Profesional:</span>
                  <div>
                    {selectedAppointment.professional
                      ? `${selectedAppointment.professional.firstName} ${selectedAppointment.professional.lastName}`
                      : "Sin asignar"}
                  </div>
                </div>
              </div>
              {selectedAppointment.location && (
                <div>
                  <span className="font-medium">Ubicación:</span>
                  <div className="text-sm">{selectedAppointment.location}</div>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <span className="font-medium">Notas:</span>
                  <div className="text-sm">{selectedAppointment.notes}</div>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cerrar
                </Button>
                {(isAdmin ||
                  (isProfessional &&
                    selectedAppointment.professional?._id === user?.id) ||
                  (isStudent &&
                    selectedAppointment.student?._id === user?.id)) && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-800"
                      onClick={() =>
                        handleCancelAppointment(selectedAppointment._id)
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Cita
                    </Button>
                    {(isAdmin ||
                      (isProfessional &&
                        selectedAppointment.professional?._id ===
                          user?.id)) && (
                      <Button
                        onClick={() =>
                          handleEditAppointment(selectedAppointment)
                        }
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
