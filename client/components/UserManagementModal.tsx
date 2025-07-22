import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { User } from "../contexts/AuthContext";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: (userData: any) => Promise<void>;
  mode: "create" | "edit";
}

export function UserManagementModal({
  isOpen,
  onClose,
  user,
  onSave,
  mode,
}: UserManagementModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    role: "student",
    plan: "trial",
    specialty: "",
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    isActive: true,
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
          role: user.role || "student",
          plan: user.plan || "trial",
          specialty: user.specialty || "",
          workingHours: user.workingHours || {
            start: "09:00",
            end: "18:00",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          },
          isActive: user.isActive !== undefined ? user.isActive : true,
          password: "",
        });
      } else {
        // Reset to defaults for create mode
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          birthDate: "",
          role: "student",
          plan: "trial",
          specialty: "",
          workingHours: {
            start: "09:00",
            end: "18:00",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          },
          isActive: true,
          password: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const handleWorkingHoursChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [field]: value }
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        days: prev.workingHours.days.includes(day)
          ? prev.workingHours.days.filter(d => d !== day)
          : [...prev.workingHours.days, day]
      }
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (mode === "create" && !formData.password) {
      newErrors.password = "La contraseña es requerida para nuevos usuarios";
    }

    if (formData.role !== "student" && !formData.specialty.trim()) {
      newErrors.specialty = "La especialidad es requerida para profesionales";
    }

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
      const submitData = { ...formData };
      
      // Don't send empty password on edit
      if (mode === "edit" && !submitData.password) {
        delete submitData.password;
      }

      await onSave(submitData);
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || "Error al guardar el usuario" });
    } finally {
      setLoading(false);
    }
  };

  const isProfessional = ["teacher", "nutritionist", "psychologist"].includes(formData.role);
  const isStudent = formData.role === "student";

  const dayLabels = {
    monday: "Lunes",
    tuesday: "Martes", 
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
            </div>

            {mode === "create" && (
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}
          </div>

          {/* Role and Plan/Specialty */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rol y Configuración</h3>
            
            <div>
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="teacher">Entrenador</SelectItem>
                  <SelectItem value="nutritionist">Nutricionista</SelectItem>
                  <SelectItem value="psychologist">Psicólogo</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isStudent && (
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleInputChange("plan", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial (Gratis)</SelectItem>
                    <SelectItem value="basic">Básico - $172.800</SelectItem>
                    <SelectItem value="pro">Pro - $208.500</SelectItem>
                    <SelectItem value="elite">Elite - $268.000</SelectItem>
                    <SelectItem value="champion">Champion - $350.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isProfessional && (
              <div>
                <Label htmlFor="specialty">Especialidad *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange("specialty", e.target.value)}
                  placeholder="Ej: Entrenamiento Funcional, Nutrición Deportiva, etc."
                  className={errors.specialty ? "border-destructive" : ""}
                />
                {errors.specialty && (
                  <p className="text-sm text-destructive mt-1">{errors.specialty}</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Usuario Activo</Label>
            </div>
          </div>

          {/* Working Hours for Professionals */}
          {isProfessional && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Horarios de Trabajo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Hora de Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) => handleWorkingHoursChange("start", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">Hora de Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) => handleWorkingHoursChange("end", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Días de Trabajo</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {Object.entries(dayLabels).map(([day, label]) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Switch
                        id={day}
                        checked={formData.workingHours.days.includes(day)}
                        onCheckedChange={() => handleDayToggle(day)}
                      />
                      <Label htmlFor={day} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
            <Button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
