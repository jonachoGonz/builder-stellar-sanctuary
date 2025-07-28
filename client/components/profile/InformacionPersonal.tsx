import { User, Mail, Phone, Calendar, Activity, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User as UserType } from "../../contexts/AuthContext";

interface InformacionPersonalProps {
  user: UserType;
  isEditing: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  editData: any;
  handleInputChange: (field: string, value: string) => void;
  handleSave: () => void;
  getRoleDisplayName: (role: string) => string;
}

export function InformacionPersonal({
  user,
  isEditing,
  isStudent,
  isAdmin,
  isProfessional,
  editData,
  handleInputChange,
  handleSave,
  getRoleDisplayName,
}: InformacionPersonalProps) {
  const getWeeklyClasses = (plan: string) => {
    switch (plan) {
      case "pro":
        return "3";
      case "basic":
        return "2";
      case "elite":
        return "4";
      case "champion":
        return "5";
      default:
        return "1";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Información Personal
          </CardTitle>
          {isEditing && (
            <Button onClick={handleSave} className="btn-primary">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Input
                id="firstName"
                value={editData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.firstName || "No especificado"}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Input
                id="lastName"
                value={editData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.lastName || "No especificado"}
              </div>
            )}
          </div>

          {/* Email (not editable) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Label>
            <div className="p-3 bg-gray-100 rounded-lg border">
              {user.email}
              <span className="text-xs text-gray-500 ml-2">(No editable)</span>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              Teléfono
            </Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Input
                id="phone"
                value={editData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.phone || "No especificado"}
              </div>
            )}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Fecha de Nacimiento
            </Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Input
                id="birthDate"
                type="date"
                value={editData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.birthDate
                  ? new Date(user.birthDate).toLocaleDateString("es-ES")
                  : "No especificado"}
              </div>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Ocupación</Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Input
                id="occupation"
                value={editData.occupation}
                onChange={(e) => handleInputChange("occupation", e.target.value)}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.occupation || "No especificado"}
              </div>
            )}
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel" className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Nivel de Actividad
            </Label>
            {isEditing && (isStudent || isAdmin) ? (
              <Select
                value={editData.activityLevel}
                onValueChange={(value) =>
                  handleInputChange("activityLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentario</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="very-active">Muy Activo</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                {user.activityLevel === "sedentary"
                  ? "Sedentario"
                  : user.activityLevel === "active"
                    ? "Activo"
                    : user.activityLevel === "very-active"
                      ? "Muy Activo"
                      : "No especificado"}
              </div>
            )}
          </div>

          {/* Role/Plan Field */}
          <div className="space-y-2">
            <Label htmlFor="role">
              {isProfessional ? "Rol / Especialidad" : "Plan Actual"}
            </Label>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              {isProfessional ? (
                <>
                  <div className="font-semibold text-primary">
                    {getRoleDisplayName(user.role)}
                  </div>
                  {user.specialty && (
                    <div className="text-sm text-gray-600 mt-1">
                      Especialidad: {user.specialty}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Profesional certificado
                  </div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-primary">
                    {user.plan || "Plan Trial"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getWeeklyClasses(user.plan || "")} clases por semana
                  </div>
                  {isAdmin && (
                    <div className="text-xs text-gray-500 mt-1">
                      Campo asignado por el administrador (No editable)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Contacto de Emergencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Nombre</Label>
              {isEditing && (isStudent || isAdmin) ? (
                <Input
                  id="emergencyContactName"
                  value={editData.emergencyContactName}
                  onChange={(e) =>
                    handleInputChange("emergencyContactName", e.target.value)
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {user.emergencyContact?.name || "No especificado"}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Teléfono</Label>
              {isEditing && (isStudent || isAdmin) ? (
                <Input
                  id="emergencyContactPhone"
                  value={editData.emergencyContactPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyContactPhone", e.target.value)
                  }
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {user.emergencyContact?.phone || "No especificado"}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
