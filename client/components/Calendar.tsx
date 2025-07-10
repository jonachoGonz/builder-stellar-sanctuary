import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
  studentName?: string;
  color?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: string, time: string) => void;
  viewMode?: "week" | "month";
  workingHours?: {
    start: string;
    end: string;
  };
}

export function Calendar({
  events = [],
  onEventClick,
  onTimeSlotClick,
  viewMode = "week",
  workingHours = { start: "08:00", end: "20:00" },
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTimeSlots = () => {
    const slots = [];
    const start = parseInt(workingHours.start.split(":")[0]);
    const end = parseInt(workingHours.end.split(":")[0]);

    for (let hour = start; hour <= end; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getEventsForDateAndTime = (date: string, time: string) => {
    return events.filter(
      (event) => event.date === date && event.startTime === time,
    );
  };

  const weekDates = getWeekDates(currentDate);
  const timeSlots = getTimeSlots();

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getEventColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "trial-class": "bg-green-100 text-green-800 border-green-200",
      "personal-training": "bg-blue-100 text-blue-800 border-blue-200",
      "first-nutrition": "bg-orange-100 text-orange-800 border-orange-200",
      "nutrition-followup": "bg-orange-100 text-orange-800 border-orange-200",
      "psychology-session": "bg-purple-100 text-purple-800 border-purple-200",
      "group-class": "bg-cyan-100 text-cyan-800 border-cyan-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || colors.default;
  };

  if (viewMode === "week") {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendario Semanal</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {weekDates[0].toLocaleDateString("es-ES", {
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1">
            {/* Header row */}
            <div className="p-2 text-center font-medium text-sm">Hora</div>
            {weekDates.map((date, index) => (
              <div key={index} className="p-2 text-center font-medium text-sm">
                <div>
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
                </div>
                <div className="text-lg">{date.getDate()}</div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time) => (
              <>
                <div
                  key={time}
                  className="p-2 text-center text-sm text-gray-600 border-r"
                >
                  {time}
                </div>
                {weekDates.map((date, dayIndex) => {
                  const dateStr = formatDate(date);
                  const dayEvents = getEventsForDateAndTime(dateStr, time);

                  return (
                    <div
                      key={`${time}-${dayIndex}`}
                      className="p-1 border border-gray-200 min-h-[60px] hover:bg-gray-50 cursor-pointer"
                      onClick={() => onTimeSlotClick?.(dateStr, time)}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`mb-1 p-1 rounded text-xs ${getEventColor(
                            event.type,
                          )} cursor-pointer`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.title}
                          </div>
                          {event.studentName && (
                            <div className="truncate">{event.studentName}</div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length === 0 && onTimeSlotClick && (
                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Month view - simplified for now
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vista Mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500">
          Vista mensual en desarrollo...
        </div>
      </CardContent>
    </Card>
  );
}
