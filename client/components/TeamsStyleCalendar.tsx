import { useState, useEffect } from "react";
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
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AppointmentModal } from "./AppointmentModal";

interface TeamsStyleCalendarProps {
  className?: string;
}

interface Appointment {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  professional: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  title: string;
  description?: string;
  type: string;
  status: string;
  location?: string;
  room?: string;
}

interface TimeSlot {
  time: string;
  day: string;
  date: Date;
  appointments: Appointment[];
  isBlocked: boolean;
  isPastTime: boolean;
}

export function TeamsStyleCalendar({ className = "" }: TeamsStyleCalendarProps) {
  const { user } = useAuth();
  const { isAdmin, isProfessional, isStudent } = usePermissions();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Generate time slots for 24-hour view with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // Load appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      const response = await apiCall(
        `/admin/appointments?startDate=${startDate}&endDate=${endDate}&limit=1000`
      );
      
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

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  // Generate calendar slots
  const generateCalendarSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    weekDates.forEach((date, dayIndex) => {
      timeSlots.forEach((time) => {
        const slotAppointments = appointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          return (
            aptDate.toDateString() === date.toDateString() &&
            apt.startTime <= time &&
            apt.endTime > time
          );
        });

        // Check if time is in the past
        const now = new Date();
        const slotDateTime = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);
        const isPastTime = slotDateTime < now;

        slots.push({
          time,
          day: weekDays[dayIndex],
          date,
          appointments: slotAppointments,
          isBlocked: false, // TODO: Implement blocking logic
          isPastTime,
        });
      });
    });

    return slots;
  };

  const calendarSlots = generateCalendarSlots();

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Handle slot click
  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isPastTime && !isAdmin) return;
    
    if (slot.appointments.length > 0) {
      // Show appointment details
      setSelectedAppointment(slot.appointments[0]);
    } else {
      // Create new appointment
      setSelectedSlot(slot);
      setIsAppointmentModalOpen(true);
    }
  };

  // Get appointment display info
  const getAppointmentDisplay = (appointment: Appointment) => {
    const duration = appointment.duration || 60;
    const blocks = Math.ceil(duration / 30); // Number of 30-min blocks
    
    return {
      title: appointment.title,
      subtitle: `${appointment.student.firstName} ${appointment.student.lastName}`,
      professional: `${appointment.professional.firstName} ${appointment.professional.lastName}`,
      duration: `${duration}min`,
      blocks,
      color: getAppointmentColor(appointment.type, appointment.status),
    };
  };

  // Get appointment color based on type and status
  const getAppointmentColor = (type: string, status: string) => {
    if (status === 'cancelled') return 'bg-red-100 border-red-300 text-red-800';
    if (status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
    
    switch (type) {
      case 'training':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'nutrition':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'psychology':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Format date for display
  const formatDateHeader = (date: Date, dayName: string) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return (
      <div className="text-center">
        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {dayName}
        </div>
        <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'} ${isToday ? 'bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
          {date.getDate()}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="day">Día</SelectItem>
            </SelectContent>
          </Select>
          
          {(isAdmin || isProfessional) && (
            <Button onClick={() => setIsAppointmentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <div className="grid grid-cols-8 min-w-[800px]">
              {/* Time column header */}
              <div className="sticky top-0 bg-gray-50 z-10 border-r border-b border-gray-300 p-3">
                <div className="text-sm font-medium text-gray-600"></div>
              </div>

              {/* Day headers */}
              {weekDates.map((date, index) => (
                <div
                  key={index}
                  className="sticky top-0 bg-gray-50 z-10 border-r border-b border-gray-300 p-3"
                >
                  {formatDateHeader(date, weekDays[index])}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map((time) => (
                <div key={time} className="contents">
                  {/* Time label */}
                  <div className="border-r border-b border-gray-200 p-2 text-xs text-gray-500 text-right sticky left-0 bg-white z-5">
                    {time}
                  </div>
                  
                  {/* Day columns */}
                  {weekDates.map((date, dayIndex) => {
                    const slot = calendarSlots.find(
                      s => s.time === time && s.date.toDateString() === date.toDateString()
                    );
                    
                    const appointment = slot?.appointments[0];
                    const isFirst30Min = time.endsWith(':00');
                    
                    return (
                      <div
                        key={`${time}-${dayIndex}`}
                        className={`relative border-r border-gray-200 h-[32px] hover:bg-blue-50 cursor-pointer group transition-colors ${
                          isFirst30Min ? 'border-b border-gray-300' : 'border-b border-gray-100'
                        } ${slot?.isPastTime ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        onClick={() => slot && handleSlotClick(slot)}
                      >
                        {appointment && (
                          <div
                            className={`absolute inset-0 m-0.5 rounded border ${getAppointmentColor(appointment.type, appointment.status)} p-1 text-xs overflow-hidden shadow-sm`}
                            style={{
                              // Extend the appointment block for longer sessions
                              height: `${Math.max(1, Math.ceil(appointment.duration / 30)) * 30 - 4}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="font-medium truncate">
                              {appointment.title}
                            </div>
                            <div className="truncate opacity-75">
                              {appointment.student.firstName} {appointment.student.lastName}
                            </div>
                            <div className="text-xs opacity-50">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                            {appointment.duration > 30 && (
                              <div className="text-xs opacity-50 font-medium">
                                {appointment.duration}min
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Hover indicator for empty slots */}
                        {!appointment && !slot?.isPastTime && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedSlot(null);
          setSelectedAppointment(null);
        }}
        onSave={async () => {
          await loadAppointments();
          setIsAppointmentModalOpen(false);
          setSelectedSlot(null);
        }}
        initialData={
          selectedSlot
            ? {
                date: selectedSlot.date.toISOString().split('T')[0],
                startTime: selectedSlot.time,
                endTime: (() => {
                  const [hours, minutes] = selectedSlot.time.split(':').map(Number);
                  const endTime = new Date();
                  endTime.setHours(hours, minutes + 60, 0, 0);
                  return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                })(),
              }
            : undefined
        }
      />

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Entrenamiento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Nutrición</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Psicología</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Completada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Cancelada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
