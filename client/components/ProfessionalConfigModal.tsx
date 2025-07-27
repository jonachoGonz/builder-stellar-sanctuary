import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Settings, Plus, X } from "lucide-react";

interface ProfessionalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaveConfig: (config: any) => Promise<void>;
  loading: boolean;
}

interface BlockedTime {
  day: string;
  startTime: string;
  endTime: string;
}

export function ProfessionalConfigModal({
  isOpen,
  onClose,
  user,
  onSaveConfig,
  loading,
}: ProfessionalConfigModalProps) {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [workingHours, setWorkingHours] = useState({
    startTime: "08:00",
    endTime: "20:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });
  const [newBlockedTime, setNewBlockedTime] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (user?.workingHours) {
      setWorkingHours({
        startTime: user.workingHours.start || "08:00",
        endTime: user.workingHours.end || "20:00",
        workingDays: user.workingHours.days || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
      });
    }

    // Load blocked times from user data
    if (user?.blockedTimes) {
      setBlockedTimes(user.blockedTimes);
    }
  }, [user]);

  const days = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  const handleAddBlockedTime = () => {
    if (
      !newBlockedTime.day ||
      !newBlockedTime.startTime ||
      !newBlockedTime.endTime
    ) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (newBlockedTime.startTime >= newBlockedTime.endTime) {
      alert("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    setBlockedTimes([...blockedTimes, { ...newBlockedTime }]);
    setNewBlockedTime({ day: "", startTime: "", endTime: "" });
  };

  const handleRemoveBlockedTime = (index: number) => {
    setBlockedTimes(blockedTimes.filter((_, i) => i !== index));
  };

  const handleWorkingDayToggle = (day: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSave = async () => {
    const config = {
      workingHours: {
        start: workingHours.startTime,
        end: workingHours.endTime,
        days: workingHours.workingDays,
      },
      blockedTimes,
    };

    await onSaveConfig(config);
  };

  const getDayLabel = (dayValue: string) => {
    return days.find((d) => d.value === dayValue)?.label || dayValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración de Horarios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horario de Trabajo</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={workingHours.startTime}
                  onChange={(e) =>
                    setWorkingHours((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora de Fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={workingHours.endTime}
                  onChange={(e) =>
                    setWorkingHours((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Días de Trabajo</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {days.map((day) => (
                  <Badge
                    key={day.value}
                    variant={
                      workingHours.workingDays.includes(day.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleWorkingDayToggle(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked Times */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horarios Bloqueados</h3>

            {/* Add new blocked time */}
            <div className="border rounded-lg p-4 mb-4">
              <Label className="text-sm font-medium mb-3 block">
                Agregar Nuevo Bloqueo
              </Label>
              <div className="grid grid-cols-4 gap-3">
                <Select
                  value={newBlockedTime.day}
                  onValueChange={(value) =>
                    setNewBlockedTime((prev) => ({
                      ...prev,
                      day: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  placeholder="Hora inicio"
                  value={newBlockedTime.startTime}
                  onChange={(e) =>
                    setNewBlockedTime((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />

                <Input
                  type="time"
                  placeholder="Hora fin"
                  value={newBlockedTime.endTime}
                  onChange={(e) =>
                    setNewBlockedTime((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />

                <Button onClick={handleAddBlockedTime} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* List of blocked times */}
            <div className="space-y-2">
              {blockedTimes.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No hay horarios bloqueados
                </p>
              ) : (
                blockedTimes.map((blocked, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">
                      <span className="font-medium">
                        {getDayLabel(blocked.day)}
                      </span>
                      {" - "}
                      {blocked.startTime} a {blocked.endTime}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBlockedTime(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
