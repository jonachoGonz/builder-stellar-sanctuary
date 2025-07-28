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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
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
  const [offlineMode, setOfflineMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState<Date | null>(
    null,
  );
  const [authError, setAuthError] = useState(false);

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
  // Generate 30-minute time slots from 8:00 to 20:30
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) {
      // Don't add :30 for the last hour
      timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  const specialties = ["teacher", "nutritionist", "psychologist"];

  // Mobile touch handling
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate, filters]);

  // Regenerate schedule grid when appointments or blocked times change
  useEffect(() => {
    if (
      appointments.length > 0 ||
      (Array.isArray(blockedTimes) && blockedTimes.length > 0)
    ) {
      generateScheduleGrid();
    }
  }, [appointments, blockedTimes, currentDate, user]);

  // Cleanup touch timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
      }
    };
  }, [touchTimer]);

  // Test basic connectivity
  const testConnectivity = async () => {
    try {
      console.log("🔍 Testing connectivity...");
      const response = await fetch(window.location.origin + "/api/test", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      console.log("👍 Connectivity test response:", response.status);
      return response.status < 500;
    } catch (error) {
      console.error("👎 Connectivity test failed:", error);
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setNetworkError(false);

    try {
      console.log("🔄 Starting calendar data load...");

      // Load data with individual error handling
      const results = await Promise.allSettled([
        loadAppointments(),
        loadUsers(),
        loadBlockedTimes(),
      ]);

      // Check results and log any failures
      const [appointmentsResult, usersResult, blockedTimesResult] = results;

      let hasAuthError = false;

      if (appointmentsResult.status === "rejected") {
        console.error(
          "❌ Failed to load appointments:",
          appointmentsResult.reason,
        );
        if (
          appointmentsResult.reason?.message?.includes("401") ||
          appointmentsResult.reason?.message?.includes("403")
        ) {
          hasAuthError = true;
        }
      }

      if (usersResult.status === "rejected") {
        console.error("❌ Failed to load users:", usersResult.reason);
        if (
          usersResult.reason?.message?.includes("401") ||
          usersResult.reason?.message?.includes("403")
        ) {
          hasAuthError = true;
        }
      }

      if (blockedTimesResult.status === "rejected") {
        console.error(
          "❌ Failed to load blocked times:",
          blockedTimesResult.reason,
        );
        if (
          blockedTimesResult.reason?.message?.includes("401") ||
          blockedTimesResult.reason?.message?.includes("403")
        ) {
          hasAuthError = true;
        }
      }

      setAuthError(hasAuthError);

      // Check if all requests failed (network issue)
      const allFailed = results.every((result) => result.status === "rejected");
      if (allFailed) {
        console.error(
          "🌐 All API calls failed - likely network connectivity issue",
        );
        setNetworkError(true);
        setOfflineMode(true);
      } else {
        // At least some data loaded successfully
        setNetworkError(false);
        setOfflineMode(false);
        setRetryCount(0);
        setLastSuccessfulLoad(new Date());
      }

      generateScheduleGrid();
      console.log("✅ Calendar data load completed");
    } catch (error) {
      console.error("❌ Critical error loading calendar data:", error);
      setNetworkError(true);
      setOfflineMode(true);
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

      // Use calendario endpoint which handles all user roles properly
      const calendarParams = new URLSearchParams({
        fechaInicio: startOfWeek.toISOString().split("T")[0],
        fechaFin: endOfWeek.toISOString().split("T")[0],
        limit: "100",
      });

      // Apply filters based on role and permissions
      if (filters.professional !== "all" && (isAdmin || isProfessional)) {
        calendarParams.append("profesionalId", filters.professional);
      }
      if (filters.student !== "all" && (isAdmin || isProfessional)) {
        calendarParams.append("alumnoId", filters.student);
      }
      if (filters.status !== "all") {
        calendarParams.append("estado", filters.status);
      }

      const response = await apiCall(`/calendario/agenda?${calendarParams}`);

      console.log("📡 Appointments response:", {
        url: `/calendario/agenda?${calendarParams}`,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      // Read response body once
      const responseText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          // Handle both agenda and appointments response formats
          const appointments =
            data.data?.agenda || data.data?.appointments || [];
          console.log("✅ Appointments loaded:", appointments.length);
          setAppointments(appointments);
        } catch (parseError) {
          console.error("❌ Error parsing appointments response:", parseError);
          setAppointments([]);
          throw new Error("Error parsing response data");
        }
      } else {
        console.error("❌ Appointments API error:", {
          status: response.status,
          statusText: response.statusText,
          error: responseText,
        });
        setAppointments([]); // Set empty array to prevent UI issues

        // Check for authentication errors
        if (response.status === 401 || response.status === 403) {
          console.warn(
            "🔒 Authentication error - user may need to login again",
          );
          setAuthError(true);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("❌ Fatal error loading appointments:", error);
      setAppointments([]); // Set empty array to prevent UI issues

      // Handle specific error types
      if (error.message?.includes("AUTH_ERROR")) {
        setAuthError(true);
      } else if (error.message?.includes("NETWORK_ERROR")) {
        setNetworkError(true);
      }

      // Re-throw to let Promise.allSettled handle it
      throw error;
    }
  };

  const loadUsers = async () => {
    try {
      const promises = [];

      if (isAdmin) {
        console.log("🔍 Loading students...");
        promises.push(
          apiCall("/admin/users?role=student&limit=100").then(
            async (response) => {
              const responseText = await response.text();
              if (response.ok) {
                try {
                  const data = JSON.parse(responseText);
                  console.log(
                    "✅ Students loaded:",
                    data.data?.users?.length || 0,
                  );
                  setStudents(data.data.users || []);
                } catch (parseError) {
                  console.error(
                    "❌ Error parsing students response:",
                    parseError,
                  );
                  setStudents([]);
                  throw new Error("Error parsing students data");
                }
              } else {
                console.error("❌ Students API error:", response.status);
                setStudents([]);
                if (response.status === 401 || response.status === 403) {
                  setAuthError(true);
                }
                throw new Error(`Students API error: ${response.status}`);
              }
            },
          ),
        );
      }

      if (isAdmin) {
        console.log("🔍 Loading professionals...");
        promises.push(
          apiCall("/admin/users?limit=100").then(async (response) => {
            const responseText = await response.text();
            if (response.ok) {
              try {
                const data = JSON.parse(responseText);
                const professionalUsers =
                  data.data.users?.filter((u: any) =>
                    ["teacher", "nutritionist", "psychologist"].includes(
                      u.role,
                    ),
                  ) || [];
                console.log(
                  "✅ Professionals loaded:",
                  professionalUsers.length,
                );
                setProfessionals(professionalUsers);
              } catch (parseError) {
                console.error(
                  "❌ Error parsing professionals response:",
                  parseError,
                );
                setProfessionals([]);
                throw new Error("Error parsing professionals data");
              }
            } else {
              console.error("❌ Professionals API error:", response.status);
              setProfessionals([]);
              if (response.status === 401 || response.status === 403) {
                setAuthError(true);
              }
              throw new Error(`Professionals API error: ${response.status}`);
            }
          }),
        );
      }

      // Wait for all user loading to complete
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error: any) {
      console.error("❌ Fatal error loading users:", error);
      setStudents([]);
      setProfessionals([]);

      // Handle specific error types
      if (error.message?.includes("AUTH_ERROR")) {
        setAuthError(true);
      } else if (error.message?.includes("NETWORK_ERROR")) {
        setNetworkError(true);
      }

      throw error;
    }
  };

  const loadBlockedTimes = async () => {
    try {
      console.log("🔍 Loading blocked times...");
      const response = await apiCall("/calendario/bloqueos");

      // Read response body once
      const responseText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          const blockedTimesData = Array.isArray(data.data) ? data.data : [];
          console.log("✅ Blocked times loaded:", blockedTimesData.length);
          setBlockedTimes(blockedTimesData);
        } catch (parseError) {
          console.error("❌ Error parsing blocked times response:", parseError);
          setBlockedTimes([]);
          throw new Error("Error parsing blocked times data");
        }
      } else {
        console.error("❌ Blocked times API error:", response.status);
        setBlockedTimes([]);
        if (response.status === 401 || response.status === 403) {
          setAuthError(true);
        }
        if (response.status !== 404) {
          throw new Error(`Blocked times API error: ${response.status}`);
        }
      }
    } catch (error: any) {
      console.error("❌ Fatal error loading blocked times:", error);
      setBlockedTimes([]);

      // Handle specific error types
      if (error.message?.includes("AUTH_ERROR")) {
        setAuthError(true);
      } else if (error.message?.includes("NETWORK_ERROR")) {
        setNetworkError(true);
      }

      throw error;
    }
  };

  const generateScheduleGrid = () => {
    // Ensure blockedTimes is always an array to prevent runtime errors
    if (!Array.isArray(blockedTimes)) {
      console.warn(
        "⚠️ blockedTimes is not an array, initializing as empty array",
      );
      setBlockedTimes([]);
      return;
    }

    const grid: TimeSlot[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((time) => {
        const slotDate = new Date(startOfWeek);
        slotDate.setDate(startOfWeek.getDate() + dayIndex);
        const dateStr = slotDate.toISOString().split("T")[0];

        // Find appointment for this slot (handle both exact time matches and time ranges)
        const appointment = appointments.find((apt) => {
          const aptDate = new Date(apt.date);
          const dayDiff = (aptDate.getDay() + 6) % 7;

          // Check for exact time match or if appointment spans this time slot
          const aptStart = apt.startTime;
          const aptEnd = apt.endTime;

          if (dayDiff === dayIndex) {
            // Exact match
            if (aptStart === time) return true;

            // Check if current time slot falls within appointment duration
            const currentTimeMinutes =
              parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
            const startMinutes =
              parseInt(aptStart.split(":")[0]) * 60 +
              parseInt(aptStart.split(":")[1]);
            const endMinutes = aptEnd
              ? parseInt(aptEnd.split(":")[0]) * 60 +
                parseInt(aptEnd.split(":")[1])
              : startMinutes + 60;

            return (
              currentTimeMinutes >= startMinutes &&
              currentTimeMinutes < endMinutes
            );
          }
          return false;
        });

        // Check if this time is blocked
        const isBlocked =
          Array.isArray(blockedTimes) &&
          blockedTimes.some((block) => {
            return (
              (block.type === "global" &&
                (block.date === dateStr || block.day === dayIndex) &&
                block.time === time) ||
              (block.professionalId === user?.id &&
                block.day === dayIndex &&
                block.time === time) ||
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
          isGlobalBlock:
            Array.isArray(blockedTimes) &&
            blockedTimes.some(
              (b) =>
                b.type === "global" && b.date === dateStr && b.time === time,
            ),
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

  // Mobile touch handlers for long press (simulates right-click)
  const handleTouchStart = (e: React.TouchEvent, slot: TimeSlot) => {
    setTouchStartTime(Date.now());
    const timer = setTimeout(() => {
      if (isProfessional || isAdmin) {
        // Vibrate if available (mobile feedback)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        setSelectedSlot(slot);
        setIsBlockModalOpen(true);
      }
    }, 500); // 500ms long press
    setTouchTimer(timer);
  };

  const handleTouchEnd = (e: React.TouchEvent, slot: TimeSlot) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }

    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500) {
      // Short tap, treat as normal click
      handleSlotClick(slot);
    }
  };

  const handleTouchCancel = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);

      // Add selected slot information
      if (selectedSlot) {
        appointmentData.date = selectedSlot.date;
        appointmentData.startTime = selectedSlot.time;

        // Calculate end time based on duration
        const [hours, minutes] = selectedSlot.time.split(":");
        const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const endMinutes = startMinutes + (appointmentData.duration || 60);
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        appointmentData.endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
      }

      const response = await apiCall("/admin/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const newAppointment = await response.json();

        // Immediately update local state for instant visual feedback
        setAppointments((prev) => [...prev, newAppointment.data]);

        // Regenerate schedule grid to show new appointment immediately
        generateScheduleGrid();

        // Reload from server to ensure consistency
        await loadAppointments();
        setIsCreateModalOpen(false);
        setSelectedSlot(null);
        alert("Cita agendada exitosamente");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error al agendar la cita");
      // Reload to ensure consistency
      loadAppointments();
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
      const response = await apiCall(
        `/admin/appointments/${selectedAppointment._id}/evaluate`,
        {
          method: "POST",
          body: JSON.stringify(evaluation),
        },
      );

      if (response.ok) {
        setIsEvaluationModalOpen(false);
        setEvaluation({
          rating: 5,
          comments: "",
          punctuality: 5,
          quality: 5,
          overall: 5,
        });
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
        // Immediately update local state for instant visual feedback
        const newBlock = {
          _id: `temp-${Date.now()}`,
          ...blockData,
          createdAt: new Date(),
        };
        setBlockedTimes((prev) =>
          Array.isArray(prev) ? [...prev, newBlock] : [newBlock],
        );

        // Regenerate schedule grid to show blocked time immediately
        generateScheduleGrid();

        // Then reload from server to get the actual data
        await loadBlockedTimes();
        setIsBlockModalOpen(false);
        alert("Horario bloqueado exitosamente");
      }
    } catch (error) {
      console.error("Error blocking time:", error);
      alert("Error al bloquear horario");
      // Reload to ensure consistency
      loadBlockedTimes();
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
        return "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 cursor-pointer";
      } else if (status === "scheduled") {
        return "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 cursor-pointer";
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
      const status = apt?.status;
      let content = "";

      if (isAdmin) {
        content = `${apt.student?.firstName} - ${apt.professional?.firstName}`;
      } else if (isProfessional) {
        content = apt.student
          ? `${apt.student.firstName} ${apt.student.lastName}`
          : "Sin asignar";
      } else if (isStudent) {
        content = apt.professional
          ? `${apt.professional.firstName} ${apt.professional.lastName}`
          : "Sin asignar";
      }

      // Add status indicator for better visibility
      if (status === "completed") {
        content += " ✓";
      } else if (status === "cancelled") {
        content += " ✗";
      }

      return content || slot.classTitle;
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
                Calendario -{" "}
                {isStudent
                  ? "Mis Clases"
                  : isProfessional
                    ? "Mi Agenda"
                    : "Gestión General"}
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(isAdmin || isStudent) && (
                  <div>
                    <Label>Profesional</Label>
                    <Select
                      value={filters.professional}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, professional: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {professionals.map((prof) => (
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
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, student: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {students.map((student) => (
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
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
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

          {authError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Error de Autenticación
                    </h3>
                    <p className="text-xs text-yellow-600 mt-1">
                      Tu sesión ha expirado. Por favor, inicia sesión
                      nuevamente.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Clear auth token and redirect to login
                    localStorage.removeItem("authToken");
                    window.location.href = "/auth";
                  }}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          )}

          {networkError && !authError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      {offlineMode
                        ? "Modo Sin Conexión"
                        : "Error de Conectividad"}
                    </h3>
                    <p className="text-xs text-red-600 mt-1">
                      {offlineMode
                        ? "No se pudo cargar los datos del servidor. Mostrando datos locales disponibles."
                        : "Algunos datos podrían no estar actualizados. Verifica tu conexión."}
                    </p>
                    {retryCount > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Intentos de reconexión: {retryCount}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setRetryCount((prev) => prev + 1);

                    // Test connectivity first
                    const isConnected = await testConnectivity();
                    if (!isConnected) {
                      alert(
                        "No se puede conectar al servidor. Verifica tu conexión a internet.",
                      );
                      return;
                    }

                    loadData();
                  }}
                  disabled={loading}
                >
                  Reintentar
                </Button>
              </div>
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
                    (s) => s.time === time && s.dayIndex === dayIndex,
                  );

                  return (
                    <div key={`${time}-${dayIndex}`} className="relative">
                      <button
                        onClick={() => slot && handleSlotClick(slot)}
                        onContextMenu={(e) =>
                          slot && handleSlotRightClick(e, slot)
                        }
                        onTouchStart={(e) => slot && handleTouchStart(e, slot)}
                        onTouchEnd={(e) => slot && handleTouchEnd(e, slot)}
                        onTouchCancel={handleTouchCancel}
                        className={`w-full h-14 border rounded-md text-xs font-medium transition-colors p-1 ${
                          slot
                            ? getSlotStyles(slot)
                            : "bg-gray-50 border-gray-200"
                        }`}
                        title={
                          slot?.hasClass
                            ? `${slot.classTitle}\nClick para ver detalles`
                            : ""
                        }
                      >
                        <div className="truncate">
                          {slot ? getSlotContent(slot) : ""}
                        </div>
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

          {/* Role-specific information */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {isAdmin &&
                "Como administrador, puedes gestionar todas las citas, bloquear horarios globalmente y ver estadísticas completas."}
              {isProfessional &&
                "Haz click en un horario libre para crear una cita. Click derecho (o mantén presionado en móvil) para bloquear horarios."}
              {isStudent &&
                "Haz click en un horario disponible para agendar una clase. Puedes evaluar clases completadas y filtrar por profesional."}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              📱 En móvil: Mantén presionado un horario para bloquearlo
            </p>
            {lastSuccessfulLoad && (
              <p className="text-xs text-blue-600 mt-1">
                Última actualización:{" "}
                {lastSuccessfulLoad.toLocaleTimeString("es-ES")}
              </p>
            )}
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
        preSelectedSlot={
          selectedSlot
            ? {
                date: selectedSlot.date,
                time: selectedSlot.time,
              }
            : null
        }
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
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.type}
                  </p>
                  <Badge
                    className={
                      selectedAppointment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedAppointment.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }
                  >
                    {selectedAppointment.status === "completed"
                      ? "Completada"
                      : selectedAppointment.status === "cancelled"
                        ? "Cancelada"
                        : "Programada"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {new Date(selectedAppointment.date).toLocaleDateString(
                      "es-ES",
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedAppointment.startTime} -{" "}
                    {selectedAppointment.endTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Estudiante:</Label>
                  <div>
                    {selectedAppointment.student
                      ? `${selectedAppointment.student.firstName} ${selectedAppointment.student.lastName}`
                      : "Sin asignar"}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Profesional:</Label>
                  <div>
                    {selectedAppointment.professional
                      ? `${selectedAppointment.professional.firstName} ${selectedAppointment.professional.lastName}`
                      : "Sin asignar"}
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
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
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
                {isProfessional &&
                  selectedAppointment.status === "scheduled" &&
                  selectedAppointment.professional?._id === user?.id && (
                    <Button
                      onClick={() =>
                        handleCompleteAppointment(selectedAppointment._id)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Completada
                    </Button>
                  )}

                {/* Cancel appointment */}
                {selectedAppointment.status === "scheduled" &&
                  (isAdmin ||
                    (isProfessional &&
                      selectedAppointment.professional?._id === user?.id) ||
                    (isStudent &&
                      selectedAppointment.student?._id === user?.id)) && (
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
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Evaluation Modal */}
      <Dialog
        open={isEvaluationModalOpen}
        onOpenChange={setIsEvaluationModalOpen}
      >
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
                      setEvaluation((prev) => ({ ...prev, overall: rating }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-6 w-6 ${rating <= evaluation.overall ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
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
                      setEvaluation((prev) => ({
                        ...prev,
                        punctuality: rating,
                      }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-5 w-5 ${rating <= evaluation.punctuality ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
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
                      setEvaluation((prev) => ({ ...prev, quality: rating }))
                    }
                    className="text-2xl"
                  >
                    <Star
                      className={`h-5 w-5 ${rating <= evaluation.quality ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Comentarios</Label>
              <Textarea
                value={evaluation.comments}
                onChange={(e) =>
                  setEvaluation((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                placeholder="Comparte tu experiencia sobre la clase..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEvaluationModalOpen(false)}
              >
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
                <p>
                  <strong>Día:</strong> {selectedSlot.day}
                </p>
                <p>
                  <strong>Hora:</strong> {selectedSlot.time}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedSlot.date).toLocaleDateString("es-ES")}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsBlockModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() =>
                    handleBlockTime({
                      date: selectedSlot.date,
                      time: selectedSlot.time,
                      day: selectedSlot.dayIndex,
                      type: isAdmin ? "global" : "professional",
                      professionalId: isProfessional ? user?.id : undefined,
                    })
                  }
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
