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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Star,
  Eye,
  UserCheck,
  Ban,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  date: string;
  isBlocked: boolean;
  hasClass: boolean;
  classTitle: string;
  appointment?: any;
  canEdit: boolean;
  canSchedule: boolean;
  isGlobalBlock?: boolean;
}

interface CalendarFilters {
  professional: string;
  student: string;
  specialty: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export function EnhancedUnifiedCalendar({
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
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<CalendarFilters>({
    professional: "all",
    student: "all",
    specialty: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Evaluation form
  const [evaluation, setEvaluation] = useState({
    rating: 5,
    comments: "",
    punctuality: 5,
    quality: 5,
    overall: 5,
  });

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  const specialties = ["teacher", "nutritionist", "psychologist"];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAppointments(),
        loadUsers(),
        loadBlockedTimes(),
      ]);
      generateScheduleGrid();
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        dateFrom: startOfWeek.toISOString().split("T")[0],
        dateTo: endOfWeek.toISOString().split("T")[0],
        limit: "100",
      });

      // Apply filters
      if (filters.professional !== "all") {
        params.append("professionalId", filters.professional);
      }
      if (filters.student !== "all") {
        params.append("studentId", filters.student);
      }
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Role-specific filters
      if (isProfessional && !isAdmin && filters.professional === "all") {
        params.append("professionalId", user!.id);
      } else if (isStudent && filters.student === "all") {
        params.append("studentId", user!.id);
      }

      console.log("🔍 Loading appointments with params:", params.toString());

      const response = await apiCall(`/admin/appointments?${params}`);

      console.log("📡 Appointments response:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Appointments loaded:", data.data?.appointments?.length || 0);
        setAppointments(data.data.appointments || []);
      } else {
        const errorText = await response.text();
        console.error("❌ Appointments API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        setAppointments([]); // Set empty array to prevent UI issues
      }
    } catch (error) {
      console.error("❌ Fatal error loading appointments:", error);
      setAppointments([]); // Set empty array to prevent UI issues

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("🌐 Network connectivity issue detected");
      }
    }
  };

  const loadUsers = async () => {
    try {
      if (isProfessional || isAdmin) {
        console.log("🔍 Loading students...");
        const studentsResponse = await apiCall("/admin/users?role=student&limit=100");

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          console.log("✅ Students loaded:", studentsData.data?.users?.length || 0);
          setStudents(studentsData.data.users || []);
        } else {
          console.error("❌ Students API error:", studentsResponse.status);
          setStudents([]);
        }
      }

      if (isAdmin || isStudent) {
        console.log("🔍 Loading professionals...");
        const professionalsResponse = await apiCall("/admin/users?limit=100");

        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json();
          const professionalUsers = professionalsData.data.users?.filter(
            (u: any) => ["teacher", "nutritionist", "psychologist"].includes(u.role)
          ) || [];
          console.log("✅ Professionals loaded:", professionalUsers.length);
          setProfessionals(professionalUsers);
        } else {
          console.error("❌ Professionals API error:", professionalsResponse.status);
          setProfessionals([]);
        }
      }
    } catch (error) {
      console.error("❌ Fatal error loading users:", error);
      setStudents([]);
      setProfessionals([]);
    }
  };

  const loadBlockedTimes = async () => {
    try {
      console.log("🔍 Loading blocked times...");
      const response = await apiCall("/admin/blocked-times");

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Blocked times loaded:", data.data?.length || 0);
        setBlockedTimes(data.data || []);
      } else {
        console.error("❌ Blocked times API error:", response.status);
        setBlockedTimes([]);
      }
    } catch (error) {
      console.error("❌ Fatal error loading blocked times:", error);
      setBlockedTimes([]);
    }
  };

  const generateScheduleGrid = () => {
    const grid: TimeSlot[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    days.forEach((day, dayIndex) => {
      timeSlots.forEach((time) => {
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        const dateStr = slotDate.toISOString().split("T")[0];

        // Find appointment for this slot
        const appointment = appointments.find((apt) => {
          const aptDate = new Date(apt.date);
          const dayDiff = (aptDate.getDay() + 6) % 7;
          return dayDiff === dayIndex && apt.startTime === time;
        });

        // Check if this time is blocked
        const isBlocked = blockedTimes.some((block) => {
          return (
            (block.type === "global" && isAdmin) ||
            (block.professionalId === user?.id && block.day === dayIndex && block.time === time) ||
            (block.date === dateStr && block.time === time)
          );
        });

        // Determine permissions
        let canEdit = false;
        let canSchedule = false;

        if (isAdmin) {
          canEdit = true;
          canSchedule = !isBlocked;
        } else if (isProfessional) {
          canEdit = !appointment || appointment.professional._id === user?.id;
          canSchedule = !isBlocked && !appointment;
        } else if (isStudent) {
          canEdit = appointment && appointment.student._id === user?.id;
          canSchedule = !isBlocked && !appointment && slotDate > new Date();
        }

        grid.push({
          day,
          dayIndex,
          time,
          date: dateStr,
          isBlocked,
          hasClass: !!appointment,
          classTitle: appointment?.title || appointment?.type || "",
          appointment,
          canEdit,
          canSchedule,
          isGlobalBlock: blockedTimes.some(b => b.type === "global" && b.date === dateStr && b.time === time),
        });
      });
    });

    setSchedule(grid);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isBlocked && !isAdmin) return;

    if (slot.hasClass && slot.appointment) {
      setSelectedAppointment(slot.appointment);
      setIsEditModalOpen(true);
    } else if (slot.canSchedule) {
      setSelectedSlot(slot);
      setIsCreateModalOpen(true);
    }
  };

  const handleSlotRightClick = (e: React.MouseEvent, slot: TimeSlot) => {
    e.preventDefault();
    if (!isProfessional && !isAdmin) return;
    
    setSelectedSlot(slot);
    setIsBlockModalOpen(true);
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      
      // Add selected slot information
      if (selectedSlot) {
        appointmentData.date = selectedSlot.date;
        appointmentData.startTime = selectedSlot.time;
        
        // Calculate end time
        const [hours, minutes] = selectedSlot.time.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const endDate = new Date(startDate.getTime() + (appointmentData.duration || 60) * 60000);
        appointmentData.endTime = endDate.toTimeString().slice(0, 5);
      }

      const response = await apiCall("/admin/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await loadAppointments();
        setIsCreateModalOpen(false);
        setSelectedSlot(null);
        alert("Cita agendada exitosamente");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error al agendar la cita");
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

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const response = await apiCall(`/admin/appointments/${appointmentId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        await loadAppointments();
        setIsEditModalOpen(false);
        alert("Clase marcada como completada");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert("Error al completar la clase");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateClass = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      const response = await apiCall(`/admin/appointments/${selectedAppointment._id}/evaluate`, {
        method: "POST",
        body: JSON.stringify(evaluation),
      });

      if (response.ok) {
        setIsEvaluationModalOpen(false);
        setEvaluation({ rating: 5, comments: "", punctuality: 5, quality: 5, overall: 5 });
        alert("Evaluación enviada exitosamente");
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Error al enviar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTime = async (blockData: any) => {
    try {
      setLoading(true);
      const response = await apiCall("/admin/blocked-times", {
        method: "POST",
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        await loadBlockedTimes();
        setIsBlockModalOpen(false);
        alert("Horario bloqueado exitosamente");
      }
    } catch (error) {
      console.error("Error blocking time:", error);
      alert("Error al bloquear horario");
    } finally {
      setLoading(false);
    }
  };

  const getSlotStyles = (slot: TimeSlot) => {
    if (slot.isGlobalBlock) {
      return "bg-red-200 border-red-400 text-red-800 cursor-not-allowed";
    } else if (slot.isBlocked) {
      return "bg-red-100 border-red-300 text-red-700 cursor-not-allowed";
    } else if (slot.hasClass) {
      const status = slot.appointment?.status;
      if (status === "completed") {
        return "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer";
      } else if (status === "cancelled") {
        return "bg-gray-100 border-gray-300 text-gray-600 cursor-pointer";
      } else {
        return "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 cursor-pointer";
      }
    } else if (slot.canSchedule) {
      return "bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer border-dashed";
    } else {
      return "bg-gray-50 border-gray-200 cursor-default opacity-50";
    }
  };

  const getSlotContent = (slot: TimeSlot) => {
    if (slot.isGlobalBlock) return "Bloqueado (Global)";
    if (slot.isBlocked) return "Bloqueado";
    if (slot.hasClass) {
      const apt = slot.appointment;
      if (isAdmin) {
        return `${apt.student?.firstName} - ${apt.professional?.firstName}`;
      } else if (isProfessional) {
        return apt.student ? `${apt.student.firstName} ${apt.student.lastName}` : "Sin asignar";
      } else if (isStudent) {
        return apt.professional ? `${apt.professional.firstName} ${apt.professional.lastName}` : "Sin asignar";
      }
      return slot.classTitle;
    }
    if (slot.canSchedule) return "Disponible";
    return "";
  };

  const formatWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short" 
    })} - ${endOfWeek.toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short" 
    })}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const clearFilters = () => {
    setFilters({
      professional: "all",
      student: "all",
      specialty: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
    });
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
                Calendario - {isStudent ? "Mis Clases" : isProfessional ? "Mi Agenda" : "Gestión General"}
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              {showCreateButton && (isProfessional || isAdmin || isStudent) && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isStudent ? "Agendar Clase" : "Nueva Cita"}
                </Button>
              )}
              {showConfigButton && isProfessional && (
                <Button variant="outline" onClick={() => setIsConfigModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(isAdmin || isStudent) && (
                  <div>
                    <Label>Profesional</Label>
                    <Select
                      value={filters.professional}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, professional: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {professionals.map(prof => (
                          <SelectItem key={prof._id} value={prof._id}>
                            {prof.firstName} {prof.lastName} ({prof.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(isAdmin || isProfessional) && (
                  <div>
                    <Label>Estudiante</Label>
                    <Select
                      value={filters.student}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, student: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {students.map(student => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Estado</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="scheduled">Programadas</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Cargando...</p>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-8 gap-1">
            {/* Header row */}
            <div className="font-medium text-sm p-2"></div>
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
                    (s) => s.time === time && s.dayIndex === dayIndex
                  );
                  
                  return (
                    <div key={`${time}-${dayIndex}`} className="relative">
                      <button
                        onClick={() => slot && handleSlotClick(slot)}
                        onContextMenu={(e) => slot && handleSlotRightClick(e, slot)}
                        className={`w-full h-14 border rounded-md text-xs font-medium transition-colors p-1 ${
                          slot ? getSlotStyles(slot) : "bg-gray-50 border-gray-200"
                        }`}
                        title={slot?.hasClass ? `${slot.classTitle}\nClick para ver detalles` : ""}
                      >
                        <div className="truncate">{slot ? getSlotContent(slot) : ""}</div>
                        {slot?.hasClass && slot.appointment && (
                          <div className="text-xs text-gray-500 truncate">
                            {slot.appointment.type}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span>Programada</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Completada</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span>Bloqueada</span>
            </div>
            {isAdmin && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-200 border border-red-400 rounded mr-2"></div>
                <span>Bloqueada (Global)</span>
              </div>
            )}
          </div>

          {/* Role-specific information */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {isAdmin && "Como administrador, puedes gestionar todas las citas, bloquear horarios globalmente y ver estadísticas completas."}
              {isProfessional && "Haz click en un horario libre para crear una cita. Click derecho para bloquear horarios. Puedes filtrar por estudiante."}
              {isStudent && "Haz click en un horario disponible para agendar una clase. Puedes evaluar clases completadas y filtrar por profesional."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSlot(null);
        }}
        students={students}
        onCreateAppointment={handleCreateAppointment}
        loading={loading}
        preSelectedSlot={selectedSlot ? {
          date: selectedSlot.date,
          time: selectedSlot.time,
        } : null}
      />

      {/* Professional Configuration Modal */}
      {isProfessional && (
        <ProfessionalConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          user={user}
          onSaveConfig={handleBlockTime}
          loading={loading}
        />
      )}

      {/* Appointment Details Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">{selectedAppointment.title}</h3>
                  <p className="text-sm text-gray-600">{selectedAppointment.type}</p>
                  <Badge className={
                    selectedAppointment.status === "completed" ? "bg-green-100 text-green-800" :
                    selectedAppointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {selectedAppointment.status === "completed" ? "Completada" :
                     selectedAppointment.status === "cancelled" ? "Cancelada" : "Programada"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {new Date(selectedAppointment.date).toLocaleDateString("es-ES")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Estudiante:</Label>
                  <div>
                    {selectedAppointment.student ? 
                      `${selectedAppointment.student.firstName} ${selectedAppointment.student.lastName}` :
                      "Sin asignar"
                    }
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Profesional:</Label>
                  <div>
                    {selectedAppointment.professional ? 
                      `${selectedAppointment.professional.firstName} ${selectedAppointment.professional.lastName}` :
                      "Sin asignar"
                    }
                  </div>
                </div>
              </div>

              {selectedAppointment.location && (
                <div>
                  <Label className="font-medium">Ubicación:</Label>
                  <div className="text-sm">{selectedAppointment.location}</div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <Label className="font-medium">Notas:</Label>
                  <div className="text-sm">{selectedAppointment.notes}</div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cerrar
                </Button>
                
                {/* Student can evaluate completed classes */}
                {isStudent && selectedAppointment.status === "completed" && (
                  <Button 
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsEvaluationModalOpen(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Evaluar Clase
                  </Button>
                )}

                {/* Professional can mark as completed */}
                {isProfessional && selectedAppointment.status === "scheduled" && 
                 selectedAppointment.professional?._id === user?.id && (
                  <Button 
                    onClick={() => handleCompleteAppointment(selectedAppointment._id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Completada
                  </Button>
                )}

                {/* Cancel appointment */}
                {selectedAppointment.status === "scheduled" && (
                  (isAdmin || 
                   (isProfessional && selectedAppointment.professional?._id === user?.id) ||
                   (isStudent && selectedAppointment.student?._id === user?.id)
                  )
                ) && (
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleCancelAppointment(selectedAppointment._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Cita
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Modal */}
      <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluar Clase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calificación General (1-5 estrellas)</Label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setEvaluation(prev => ({ ...prev, overall: rating }))}
                    className="text-2xl"
                  >
                    <Star className={`h-6 w-6 ${rating <= evaluation.overall ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Puntualidad</Label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setEvaluation(prev => ({ ...prev, punctuality: rating }))}
                    className="text-2xl"
                  >
                    <Star className={`h-5 w-5 ${rating <= evaluation.punctuality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Calidad de la Clase</Label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setEvaluation(prev => ({ ...prev, quality: rating }))}
                    className="text-2xl"
                  >
                    <Star className={`h-5 w-5 ${rating <= evaluation.quality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Comentarios</Label>
              <Textarea
                value={evaluation.comments}
                onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Comparte tu experiencia sobre la clase..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEvaluationModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEvaluateClass} disabled={loading}>
                {loading ? "Enviando..." : "Enviar Evaluación"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Time Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? "Bloquear Horario (Global)" : "Bloquear Mi Horario"}
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div>
                <p><strong>Día:</strong> {selectedSlot.day}</p>
                <p><strong>Hora:</strong> {selectedSlot.time}</p>
                <p><strong>Fecha:</strong> {new Date(selectedSlot.date).toLocaleDateString("es-ES")}</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsBlockModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleBlockTime({
                    date: selectedSlot.date,
                    time: selectedSlot.time,
                    day: selectedSlot.dayIndex,
                    type: isAdmin ? "global" : "professional",
                    professionalId: isProfessional ? user?.id : undefined,
                  })}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquear Horario
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
