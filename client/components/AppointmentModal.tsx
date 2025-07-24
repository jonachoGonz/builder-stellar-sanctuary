import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import { Button } from "./ui/button";
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
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any;
  onSave: (appointmentData: any) => Promise<void>;
  mode: "create" | "edit";
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSave,
  mode,
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    professionalId: "",
    type: "personal-training",
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    duration: 60,
    location: "",
    room: "",
    deductFromPlan: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Load students and professionals
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or appointment changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && appointment) {
        setFormData({
          studentId: appointment.student?._id || "",
          professionalId: appointment.professional?._id || "",
          type: appointment.type || "personal-training",
          title: appointment.title || "",
          description: appointment.description || "",
          date: appointment.date
            ? new Date(appointment.date).toISOString().split("T")[0]
            : "",
          startTime: appointment.startTime || "",
          endTime: appointment.endTime || "",
          duration: appointment.duration || 60,
          location: appointment.location || "",
          room: appointment.room || "",
          deductFromPlan:
            appointment.deductFromPlan !== undefined
              ? appointment.deductFromPlan
              : true,
        });
      } else {
        // Reset to defaults for create mode
        setFormData({
          studentId: "",
          professionalId: "",
          type: "personal-training",
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          duration: 60,
          location: "",
          room: "",
          deductFromPlan: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, appointment]);

  const loadUsers = async () => {
    try {
      // Load students
      const studentsResponse = await apiCall(
        "/admin/users?role=student&limit=100",
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.data.users);
      }

      // Load professionals
      const professionalsResponse = await apiCall("/admin/users?limit=100");

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate end time when start time or duration changes
    if (field === "startTime" || field === "duration") {
      const startTime = field === "startTime" ? value : formData.startTime;
      const duration = field === "duration" ? value : formData.duration;

      if (startTime && duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + parseInt(duration);
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

        setFormData((prev) => ({ ...prev, endTime }));
      }
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.studentId) newErrors.studentId = "Estudiante es requerido";
    if (!formData.professionalId)
      newErrors.professionalId = "Profesional es requerido";
    if (!formData.title.trim()) newErrors.title = "Título es requerido";
    if (!formData.date) newErrors.date = "Fecha es requerida";
    if (!formData.startTime)
      newErrors.startTime = "Hora de inicio es requerida";
    if (!formData.endTime) newErrors.endTime = "Hora de fin es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || "Error al guardar la cita" });
    } finally {
      setLoading(false);
    }
  };

  const appointmentTypes = [
    { value: "trial-class", label: "Clase de Prueba" },
    { value: "personal-training", label: "Entrenamiento Personal" },
    { value: "training-kinesiology", label: "Entrenamiento + Kinesiología" },
    { value: "first-nutrition", label: "Primera Sesión de Nutrición" },
    { value: "nutrition-followup", label: "Seguimiento Nutricional" },
    { value: "psychology-session", label: "Sesión de Psicología" },
    { value: "evaluation", label: "Evaluación" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Programar Nueva Cita" : "Editar Cita"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información de la Cita</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student">Estudiante *</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    handleInputChange("studentId", value)
                  }
                >
                  <SelectTrigger
                    className={errors.studentId ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.studentId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="professional">Profesional *</Label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) =>
                    handleInputChange("professionalId", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.professionalId ? "border-destructive" : ""
                    }
                  >
                    <SelectValue placeholder="Seleccionar profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem
                        key={professional._id}
                        value={professional._id}
                      >
                        {professional.firstName} {professional.lastName} (
                        {professional.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professionalId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.professionalId}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="type">Tipo de Cita</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-destructive" : ""}
                placeholder="Ej: Entrenamiento Personal - Juan Pérez"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Detalles adicionales sobre la cita..."
                rows={3}
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Programación</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && (
                  <p className="text-sm text-destructive mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="startTime">Hora de Inicio *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={errors.startTime ? "border-destructive" : ""}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duración (min)</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) =>
                    handleInputChange("duration", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Ej: Sala principal, Consultorio 1"
                />
              </div>

              <div>
                <Label htmlFor="room">Sala/Consultorio</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  placeholder="Ej: Sala A, Consultorio Nutrición"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="deductFromPlan"
                checked={formData.deductFromPlan}
                onCheckedChange={(checked) =>
                  handleInputChange("deductFromPlan", checked)
                }
              />
              <Label htmlFor="deductFromPlan">
                Descontar del plan del estudiante
              </Label>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Guardando..."
                : mode === "create"
                  ? "Programar Cita"
                  : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
