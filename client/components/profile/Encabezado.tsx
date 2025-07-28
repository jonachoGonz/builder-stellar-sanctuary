import { Link } from "react-router-dom";
import { User, LayoutDashboard, Edit3, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { User as UserType } from "../../contexts/AuthContext";

interface EncabezadoProps {
  user: UserType;
  isProfessional: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  getRoleDisplayName: (role: string) => string;
  userStats: any;
  professionalStats: any;
}

export function Encabezado({
  user,
  isProfessional,
  isStudent,
  isAdmin,
  isEditing,
  onToggleEdit,
  getRoleDisplayName,
  userStats,
  professionalStats,
}: EncabezadoProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-6">
          {/* Profile Image */}
          <div className="bg-white/20 p-6 rounded-full">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-16 w-16" />
            )}
          </div>

          {/* User Information */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              ¡Bienvenido, {user.firstName} {user.lastName}!
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              {/* Role/Plan Badge */}
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                {isAdmin
                  ? "Administrador"
                  : isProfessional
                    ? getRoleDisplayName(user.role)
                    : user.plan || "Plan Trial"}
              </Badge>

              {/* Specialty Badge for Teachers */}
              {isProfessional && user.specialty && (
                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                  {user.specialty}
                </Badge>
              )}

              {/* Member Since Date */}
              <span className="text-white/80">
                Miembro desde{" "}
                {isProfessional
                  ? professionalStats.joinDate
                  : userStats.joinDate}
              </span>
            </div>
            <p className="text-white/90 mt-2">
              Tu perfil está configurado y listo. ¡Hora de comenzar a entrenar!
            </p>
          </div>

          {/* Action Menu */}
          <div className="flex flex-col space-y-2">
            <Link to="/dashboard">
              <Button className="bg-white text-primary hover:bg-gray-100 font-semibold">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            {(isStudent || isAdmin) && (
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onToggleEdit}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
