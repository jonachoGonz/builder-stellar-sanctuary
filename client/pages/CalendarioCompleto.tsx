import { useState } from "react";
import { CalendarioCompleto } from "../components/CalendarioCompleto";
import { TeamsStyleCalendar } from "../components/TeamsStyleCalendar";
import { Button } from "../components/ui/button";

export default function CalendarioCompletoPage() {
  const [calendarView, setCalendarView] = useState<"teams" | "classic">("teams");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sistema de Calendario / Agenda
              </h1>
              <p className="text-gray-600">
                Gestiona tu agenda de clases, evalúa sesiones y administra
                disponibilidad
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={calendarView === "teams" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("teams")}
              >
                Vista Teams
              </Button>
              <Button
                variant={calendarView === "classic" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("classic")}
              >
                Vista Clásica
              </Button>
            </div>
          </div>
        </div>

        {calendarView === "teams" ? (
          <TeamsStyleCalendar className="w-full" />
        ) : (
          <CalendarioCompleto className="w-full" />
        )}
      </div>
    </div>
  );
}
