import { useState } from "react";
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

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  onCreateAppointment: (data: any) => Promise<void>;
  loading: boolean;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  students,
  onCreateAppointment,
  loading,
}: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    studentId: "",
    date: "",
    startTime: "",
    duration: 60,
    location: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.studentId || !formData.date || !formData.startTime) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    // Calculate end time
    const [hours, minutes] = formData.startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endDate = new Date(startDate.getTime() + formData.duration * 60000);
    const endTime = endDate.toTimeString().slice(0, 5);

    await onCreateAppointment({
      ...formData,
      endTime,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      studentId: "",
      date: "",
      startTime: "",
      duration: 60,
      location: "",
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título de la Sesión *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Sesión de Entrenamiento"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo de Sesión</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Entrenamiento Funcional</SelectItem>
                  <SelectItem value="strength">Musculación</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="nutrition">Consulta Nutricional</SelectItem>
                  <SelectItem value="psychology">Sesión Psicológica</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="pilates">Pilates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="studentId">Estudiante *</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => handleInputChange("studentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} - {student.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Hora Inicio *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duración (min)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleInputChange("duration", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar lugar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sala Principal">Sala Principal</SelectItem>
                <SelectItem value="Área CrossFit">Área CrossFit</SelectItem>
                <SelectItem value="Sala Zen">Sala Zen</SelectItem>
                <SelectItem value="Área de Pesas">Área de Pesas</SelectItem>
                <SelectItem value="Consultorio 1">Consultorio 1</SelectItem>
                <SelectItem value="Consultorio 2">Consultorio 2</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas adicionales para la sesión..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
