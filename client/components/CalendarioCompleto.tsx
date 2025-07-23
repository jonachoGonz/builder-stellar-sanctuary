import { useState, useEffect, useCallback } from "react";
import { useAuth, usePermissions } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  Ban,
  Star,
  Eye,
  AlertTriangle,
  Settings,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CalendarioCompletoProps {
  className?: string;
}

interface ClaseAgenda {
  _id: string;
  alumnoId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profesionalId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    specialty?: string;
  };
  fecha: string;
  hora: string;
  horaFin?: string;
  estado: "agendada" | "completada" | "cancelada";
  especialidad: string;
  titulo?: string;
  notas?: string;
  evaluacion?: {
    puntaje: number;
    comentario: string;
    puntualidad: number;
    calidad: number;
    fechaEvaluacion: string;
  };
}

interface Bloqueo {
  _id: string;
  tipo: "global" | "profesional";
  profesionalId?: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  fecha: string;
  hora?: string;
  horaFin?: string;
  todoElDia: boolean;
  motivo?: string;
  activo: boolean;
}

interface PlanUsuario {
  _id: string;
  tipoPlan: string;
  clasesPorSemana: number;
  clasesTotales: number;
  clasesUsadas: number;
  clasesRestantes: number;
  fechaVencimiento: string;
  activo: boolean;
}

interface TimeSlot {
  day: string;
  dayIndex: number;
  time: string;
  date: string;
  isBlocked: boolean;
  hasClass: boolean;
  clase?: ClaseAgenda;
  canEdit: boolean;
  canSchedule: boolean;
  isGlobalBlock?: boolean;
}

interface Filtros {
  profesionalId: string;
  alumnoId: string;
  especialidad: string;
  estado: string;
}

export function CalendarioCompleto({
  className = "",
}: CalendarioCompletoProps) {
  const { user } = useAuth();
  const { isAdmin, isProfessional, isStudent } = usePermissions();

  // Estados principales
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agenda, setAgenda] = useState<ClaseAgenda[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [planUsuario, setPlanUsuario] = useState<PlanUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados de datos auxiliares
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [profesionales, setProfesionales] = useState<any[]>([]);

  // Estados de filtros
  const [filtros, setFiltros] = useState<Filtros>({
    profesionalId: "all",
    alumnoId: "all",
    especialidad: "all",
    estado: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados de modales
  const [modalAgendar, setModalAgendar] = useState(false);
  const [modalBloquear, setModalBloquear] = useState(false);
  const [modalEvaluar, setModalEvaluar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedClase, setSelectedClase] = useState<ClaseAgenda | null>(null);

  // Estados de formularios
  const [formAgendar, setFormAgendar] = useState({
    alumnoId: "",
    profesionalId: "",
    especialidad: "",
    titulo: "",
    notas: "",
  });

  const [formBloquear, setFormBloquear] = useState({
    tipo: "profesional" as "global" | "profesional",
    todoElDia: false,
    motivo: "",
  });

  const [formEvaluar, setFormEvaluar] = useState({
    puntaje: 5,
    comentario: "",
    puntualidad: 5,
    calidad: 5,
  });

  // Configuración de horarios (30 minutos)
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // Touch handling for mobile
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  // Efectos
  useEffect(() => {
    if (user) {
      loadData();
      if (isStudent) {
        loadPlanUsuario();
      }
    }
  }, [user, currentDate, filtros]);

  useEffect(() => {
    generateScheduleGrid();
  }, [agenda, bloqueos, currentDate]);

  // Funciones de carga de datos
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadAgenda(), loadBloqueos(), loadUsuarios()]);
    } catch (err: any) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const loadAgenda = async () => {
    try {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        fechaInicio: startOfWeek.toISOString().split("T")[0],
        fechaFin: endOfWeek.toISOString().split("T")[0],
      });

      // Aplicar filtros
      if (filtros.profesionalId !== "all") {
        params.append("profesionalId", filtros.profesionalId);
      }
      if (filtros.alumnoId !== "all") {
        params.append("alumnoId", filtros.alumnoId);
      }
      if (filtros.especialidad !== "all") {
        params.append("especialidad", filtros.especialidad);
      }
      if (filtros.estado !== "all") {
        params.append("estado", filtros.estado);
      }

      const response = await apiCall(`/calendario/agenda?${params}`);

      if (response.ok) {
        const data = await response.json();
        setAgenda(data.data.agenda || []);
      } else {
        throw new Error("Error al cargar agenda");
      }
    } catch (error) {
      console.error("Error loading agenda:", error);
      setAgenda([]);
    }
  };

  const loadBloqueos = async () => {
    try {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        fechaInicio: startOfWeek.toISOString().split("T")[0],
        fechaFin: endOfWeek.toISOString().split("T")[0],
      });

      const response = await apiCall(`/calendario/bloqueos?${params}`);

      if (response.ok) {
        const data = await response.json();
        setBloqueos(data.data || []);
      } else {
        setBloqueos([]);
      }
    } catch (error) {
      console.error("Error loading blocks:", error);
      setBloqueos([]);
    }
  };

  const loadUsuarios = async () => {
    try {
      if (isAdmin || isProfessional) {
        const studentsResponse = await apiCall(
          "/admin/users?role=student&limit=100",
        );
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setEstudiantes(studentsData.data.users || []);
        }
      }

      if (isAdmin || isStudent) {
        const professionalsResponse = await apiCall("/admin/users?limit=100");
        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json();
          const professionalUsers =
            professionalsData.data.users?.filter((u: any) =>
              ["teacher", "nutritionist", "psychologist"].includes(u.role),
            ) || [];
          setProfesionales(professionalUsers);
        }
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadPlanUsuario = async () => {
    try {
      const response = await apiCall(`/calendario/plan`);
      if (response.ok) {
        const data = await response.json();
        setPlanUsuario(data.data);
      }
    } catch (error) {
      console.error("Error loading user plan:", error);
    }
  };

  // Generar grid del calendario
  const generateScheduleGrid = () => {
    const grid: TimeSlot[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((time) => {
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        const dateStr = slotDate.toISOString().split("T")[0];

        // Buscar clase para este slot
        const clase = agenda.find((cl) => {
          const claseDate = new Date(cl.fecha);
          const dayDiff = (claseDate.getDay() + 6) % 7;
          return dayDiff === dayIndex && cl.hora === time;
        });

        // Verificar si está bloqueado
        const isBlocked = bloqueos.some((bloque) => {
          if (bloque.fecha !== dateStr) return false;
          if (bloque.todoElDia) return true;
          if (bloque.hora === time) return true;
          return false;
        });

        // Determinar permisos
        let canEdit = false;
        let canSchedule = false;

        if (isAdmin) {
          canEdit = true;
          canSchedule = !isBlocked;
        } else if (isProfessional) {
          canEdit = !clase || clase.profesionalId._id === user?.id;
          canSchedule = !isBlocked && !clase;
        } else if (isStudent) {
          canEdit = clase && clase.alumnoId._id === user?.id;
          canSchedule =
            !isBlocked &&
            !clase &&
            slotDate > new Date() &&
            planUsuario?.clasesRestantes! > 0;
        }

        const isGlobalBlock = bloqueos.some(
          (b) =>
            b.tipo === "global" &&
            b.fecha === dateStr &&
            (b.todoElDia || b.hora === time),
        );

        grid.push({
          day,
          dayIndex,
          time,
          date: dateStr,
          isBlocked,
          hasClass: !!clase,
          clase,
          canEdit,
          canSchedule,
          isGlobalBlock,
        });
      });
    });

    setSchedule(grid);
  };

  // Manejadores de eventos
  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isBlocked && !isAdmin) return;

    if (slot.hasClass && slot.clase) {
      setSelectedClase(slot.clase);
      setModalDetalle(true);
    } else if (slot.canSchedule) {
      setSelectedSlot(slot);
      if (isProfessional || isAdmin) {
        // Pre-llenar datos para profesionales
        setFormAgendar({
          ...formAgendar,
          profesionalId: isProfessional ? user?.id || "" : "",
          especialidad: isProfessional ? user?.role || "" : "",
        });
      }
      setModalAgendar(true);
    }
  };

  const handleLongPress = (slot: TimeSlot) => {
    if (!isProfessional && !isAdmin) return;
    setSelectedSlot(slot);
    setModalBloquear(true);
  };

  // Touch handlers para móvil
  const handleTouchStart = (e: React.TouchEvent, slot: TimeSlot) => {
    const timer = setTimeout(() => {
      handleLongPress(slot);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setTouchTimer(timer);
  };

  const handleTouchEnd = (slot: TimeSlot) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
      handleSlotClick(slot);
    }
  };

  const handleTouchCancel = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  // Crear nueva clase
  const handleCrearClase = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);

      const claseData = {
        ...formAgendar,
        fecha: selectedSlot.date,
        hora: selectedSlot.time,
        horaFin: calculateEndTime(selectedSlot.time, 60), // 60 minutos por defecto
      };

      const response = await apiCall("/calendario/agenda", {
        method: "POST",
        body: JSON.stringify(claseData),
      });

      if (response.ok) {
        setModalAgendar(false);
        resetFormAgendar();
        await loadData();
        if (isStudent) await loadPlanUsuario();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al crear la clase");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la clase");
    } finally {
      setLoading(false);
    }
  };

  // Crear bloqueo
  const handleCrearBloqueo = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);

      const bloqueoData = {
        ...formBloquear,
        fecha: selectedSlot.date,
        hora: formBloquear.todoElDia ? undefined : selectedSlot.time,
      };

      const response = await apiCall("/calendario/bloqueos", {
        method: "POST",
        body: JSON.stringify(bloqueoData),
      });

      if (response.ok) {
        setModalBloquear(false);
        resetFormBloquear();
        await loadBloqueos();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al crear el bloqueo");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el bloqueo");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de clase
  const handleActualizarClase = async (claseId: string, updates: any) => {
    try {
      setLoading(true);

      const response = await apiCall(`/calendario/agenda/${claseId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadData();
        if (isStudent) await loadPlanUsuario();
        setModalDetalle(false);
        setModalEvaluar(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al actualizar la clase");
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar la clase");
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const resetFormAgendar = () => {
    setFormAgendar({
      alumnoId: "",
      profesionalId: isProfessional ? user?.id || "" : "",
      especialidad: isProfessional ? user?.role || "" : "",
      titulo: "",
      notas: "",
    });
  };

  const resetFormBloquear = () => {
    setFormBloquear({
      tipo: isAdmin ? "global" : "profesional",
      todoElDia: false,
      motivo: "",
    });
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

  const getSlotStyles = (slot: TimeSlot) => {
    if (slot.isGlobalBlock) {
      return "bg-red-200 border-red-400 text-red-800 cursor-not-allowed";
    } else if (slot.isBlocked) {
      return "bg-red-100 border-red-300 text-red-700 cursor-not-allowed";
    } else if (slot.hasClass) {
      const estado = slot.clase?.estado;
      if (estado === "completada") {
        return "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer";
      } else if (estado === "cancelada") {
        return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 cursor-pointer";
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
    if (slot.hasClass && slot.clase) {
      const clase = slot.clase;
      const estado = clase.estado;

      let content = "";
      if (isAdmin) {
        content = `${clase.alumnoId.firstName} - ${clase.profesionalId.firstName}`;
      } else if (isProfessional) {
        content = `${clase.alumnoId.firstName} ${clase.alumnoId.lastName}`;
      } else if (isStudent) {
        content = `${clase.profesionalId.firstName} ${clase.profesionalId.lastName}`;
      }

      // Agregar indicador de estado
      if (estado === "completada") content += " ✓";
      else if (estado === "cancelada") content += " ✗";

      return content;
    }
    if (slot.canSchedule) return "Disponible";
    return "";
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
                Calendario -{" "}
                {isStudent
                  ? "Mis Clases"
                  : isProfessional
                    ? "Mi Agenda"
                    : "Gestión General"}
              </CardTitle>

              {/* Información del plan para estudiantes */}
              {isStudent && planUsuario && (
                <div className="mt-2 text-sm text-gray-600">
                  Plan {planUsuario.tipoPlan} - Clases restantes:{" "}
                  {planUsuario.clasesRestantes}
                  {planUsuario.clasesPorSemana &&
                    ` (Máx ${planUsuario.clasesPorSemana}/semana)`}
                </div>
              )}

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
              {(isProfessional || isAdmin || isStudent) && (
                <Button onClick={() => setModalAgendar(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isStudent ? "Agendar Clase" : "Nueva Clase"}
                </Button>
              )}
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(isAdmin || isStudent) && (
                  <div>
                    <Label>Profesional</Label>
                    <Select
                      value={filtros.profesionalId}
                      onValueChange={(value) =>
                        setFiltros((prev) => ({
                          ...prev,
                          profesionalId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {profesionales.map((prof) => (
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
                      value={filtros.alumnoId}
                      onValueChange={(value) =>
                        setFiltros((prev) => ({ ...prev, alumnoId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {estudiantes.map((student) => (
                          <SelectItem key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Especialidad</Label>
                  <Select
                    value={filtros.especialidad}
                    onValueChange={(value) =>
                      setFiltros((prev) => ({ ...prev, especialidad: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="teacher">Kinesiología</SelectItem>
                      <SelectItem value="nutritionist">Nutrición</SelectItem>
                      <SelectItem value="psychologist">Psicología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select
                    value={filtros.estado}
                    onValueChange={(value) =>
                      setFiltros((prev) => ({ ...prev, estado: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="agendada">Agendadas</SelectItem>
                      <SelectItem value="completada">Completadas</SelectItem>
                      <SelectItem value="cancelada">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Cargando...</p>
            </div>
          )}

          {/* Grid del calendario */}
          <div className="grid grid-cols-8 gap-1">
            {/* Fila de encabezados */}
            <div className="font-medium text-sm p-2"></div>
            {days.map((day) => (
              <div key={day} className="text-center font-medium text-sm py-2">
                {day}
              </div>
            ))}

            {/* Filas de horarios */}
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
                          e.preventDefault();
                          if (slot) handleLongPress(slot);
                        }}
                        onTouchStart={(e) => slot && handleTouchStart(e, slot)}
                        onTouchEnd={() => slot && handleTouchEnd(slot)}
                        onTouchCancel={handleTouchCancel}
                        className={`w-full h-12 border rounded-md text-xs font-medium transition-colors p-1 ${
                          slot
                            ? getSlotStyles(slot)
                            : "bg-gray-50 border-gray-200"
                        }`}
                        title={
                          slot?.hasClass
                            ? `${slot.clase?.titulo}\nClick para ver detalles`
                            : ""
                        }
                      >
                        <div className="truncate">
                          {slot ? getSlotContent(slot) : ""}
                        </div>
                        {slot?.hasClass && slot.clase && (
                          <div className="text-xs text-gray-500 truncate">
                            {slot.clase.especialidad}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span>Agendada</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Completada ✓</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
              <span>Cancelada ✗</span>
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

          {/* Información específica por rol */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {isAdmin &&
                "Como administrador, puedes gestionar todas las citas y bloquear horarios globalmente."}
              {isProfessional &&
                "Haz click en un horario libre para crear una clase. Click derecho (o mantén presionado en móvil) para bloquear horarios."}
              {isStudent &&
                "Haz click en un horario disponible para agendar una clase. Puedes evaluar clases completadas."}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              📱 En móvil: Mantén presionado un horario para bloquearlo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal para agendar clase */}
      <Dialog open={modalAgendar} onOpenChange={setModalAgendar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agendar Nueva Clase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-gray-50 rounded">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Hora:</strong> {selectedSlot.time}
                </p>
              </div>
            )}

            {(isAdmin || isStudent) && (
              <div>
                <Label>Profesional</Label>
                <Select
                  value={formAgendar.profesionalId}
                  onValueChange={(value) =>
                    setFormAgendar((prev) => ({
                      ...prev,
                      profesionalId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesionales.map((prof) => (
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
                  value={formAgendar.alumnoId}
                  onValueChange={(value) =>
                    setFormAgendar((prev) => ({ ...prev, alumnoId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {estudiantes.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Especialidad</Label>
              <Select
                value={formAgendar.especialidad}
                onValueChange={(value) =>
                  setFormAgendar((prev) => ({ ...prev, especialidad: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Kinesiología</SelectItem>
                  <SelectItem value="nutritionist">Nutrición</SelectItem>
                  <SelectItem value="psychologist">Psicología</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Título</Label>
              <Input
                value={formAgendar.titulo}
                onChange={(e) =>
                  setFormAgendar((prev) => ({
                    ...prev,
                    titulo: e.target.value,
                  }))
                }
                placeholder="Título de la sesión"
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={formAgendar.notas}
                onChange={(e) =>
                  setFormAgendar((prev) => ({ ...prev, notas: e.target.value }))
                }
                placeholder="Notas adicionales"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalAgendar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearClase} disabled={loading}>
                {loading ? "Agendando..." : "Agendar Clase"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para bloquear horario */}
      <Dialog open={modalBloquear} onOpenChange={setModalBloquear}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bloquear Horario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-gray-50 rounded">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Hora:</strong> {selectedSlot.time}
                </p>
              </div>
            )}

            {isAdmin && (
              <div>
                <Label>Tipo de Bloqueo</Label>
                <Select
                  value={formBloquear.tipo}
                  onValueChange={(value) =>
                    setFormBloquear((prev) => ({
                      ...prev,
                      tipo: value as "global" | "profesional",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="global">Global (Todos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="todoElDia"
                checked={formBloquear.todoElDia}
                onChange={(e) =>
                  setFormBloquear((prev) => ({
                    ...prev,
                    todoElDia: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="todoElDia">Bloquear todo el día</Label>
            </div>

            <div>
              <Label>Motivo</Label>
              <Input
                value={formBloquear.motivo}
                onChange={(e) =>
                  setFormBloquear((prev) => ({
                    ...prev,
                    motivo: e.target.value,
                  }))
                }
                placeholder="Motivo del bloqueo"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalBloquear(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCrearBloqueo}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Ban className="h-4 w-4 mr-2" />
                Bloquear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalles de clase */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Clase</DialogTitle>
          </DialogHeader>
          {selectedClase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">{selectedClase.titulo}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedClase.especialidad}
                  </p>
                  <Badge
                    className={
                      selectedClase.estado === "completada"
                        ? "bg-green-100 text-green-800"
                        : selectedClase.estado === "cancelada"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }
                  >
                    {selectedClase.estado === "completada"
                      ? "Completada"
                      : selectedClase.estado === "cancelada"
                        ? "Cancelada"
                        : "Agendada"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {new Date(selectedClase.fecha).toLocaleDateString("es-ES")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedClase.hora}{" "}
                    {selectedClase.horaFin && `- ${selectedClase.horaFin}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Estudiante:</Label>
                  <div>
                    {selectedClase.alumnoId.firstName}{" "}
                    {selectedClase.alumnoId.lastName}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Profesional:</Label>
                  <div>
                    {selectedClase.profesionalId.firstName}{" "}
                    {selectedClase.profesionalId.lastName}
                  </div>
                </div>
              </div>

              {selectedClase.notas && (
                <div>
                  <Label className="font-medium">Notas:</Label>
                  <div className="text-sm">{selectedClase.notas}</div>
                </div>
              )}

              {selectedClase.evaluacion && (
                <div>
                  <Label className="font-medium">Evaluación:</Label>
                  <div className="text-sm">
                    <p>Puntaje: {selectedClase.evaluacion.puntaje}/5 ⭐</p>
                    <p>Puntualidad: {selectedClase.evaluacion.puntualidad}/5</p>
                    <p>Calidad: {selectedClase.evaluacion.calidad}/5</p>
                    {selectedClase.evaluacion.comentario && (
                      <p>Comentario: {selectedClase.evaluacion.comentario}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalDetalle(false)}
                >
                  Cerrar
                </Button>

                {/* Estudiante puede evaluar clases completadas */}
                {isStudent &&
                  selectedClase.estado === "completada" &&
                  !selectedClase.evaluacion && (
                    <Button
                      onClick={() => {
                        setModalDetalle(false);
                        setModalEvaluar(true);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Evaluar Clase
                    </Button>
                  )}

                {/* Profesional puede marcar como completada */}
                {isProfessional &&
                  selectedClase.estado === "agendada" &&
                  selectedClase.profesionalId._id === user?.id && (
                    <Button
                      onClick={() =>
                        handleActualizarClase(selectedClase._id, {
                          estado: "completada",
                        })
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}

                {/* Cancelar clase */}
                {selectedClase.estado === "agendada" &&
                  (isAdmin ||
                    (isProfessional &&
                      selectedClase.profesionalId._id === user?.id) ||
                    (isStudent && selectedClase.alumnoId._id === user?.id)) && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-800"
                      onClick={() =>
                        handleActualizarClase(selectedClase._id, {
                          estado: "cancelada",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Clase
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de evaluación */}
      <Dialog open={modalEvaluar} onOpenChange={setModalEvaluar}>
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
                    onClick={() =>
                      setFormEvaluar((prev) => ({ ...prev, puntaje: rating }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-6 w-6 ${rating <= formEvaluar.puntaje ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
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
                    onClick={() =>
                      setFormEvaluar((prev) => ({
                        ...prev,
                        puntualidad: rating,
                      }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-5 w-5 ${rating <= formEvaluar.puntualidad ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
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
                    onClick={() =>
                      setFormEvaluar((prev) => ({ ...prev, calidad: rating }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-5 w-5 ${rating <= formEvaluar.calidad ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Comentarios</Label>
              <Textarea
                value={formEvaluar.comentario}
                onChange={(e) =>
                  setFormEvaluar((prev) => ({
                    ...prev,
                    comentario: e.target.value,
                  }))
                }
                placeholder="Comparte tu experiencia sobre la clase..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalEvaluar(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  selectedClase &&
                  handleActualizarClase(selectedClase._id, {
                    evaluacion: formEvaluar,
                  })
                }
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Evaluación"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
