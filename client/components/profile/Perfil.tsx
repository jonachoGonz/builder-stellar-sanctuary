import { TuPlan } from "./TuPlan";
import { MiProgreso } from "./MiProgreso";
import { ClasesRealizadas } from "./ClasesRealizadas";
import { Evaluacion } from "./Evaluacion";
import { InformacionPersonal } from "./InformacionPersonal";
import { ProximasClases } from "./ProximasClases";
import { User as UserType } from "../../contexts/AuthContext";

interface PerfilProps {
  user: UserType;
  isStudent: boolean;
  isProfessional: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  editData: any;
  handleInputChange: (field: string, value: string) => void;
  handleSave: () => void;
  getRoleDisplayName: (role: string) => string;
  renderStarRating: (rating: number) => JSX.Element[];
  userStats: any;
  professionalStats: any;
  realStats: any;
  upcomingClasses: any[];
  realAppointments: any[];
  upcomingProfessionalClasses: any[];
}

export function Perfil({
  user,
  isStudent,
  isProfessional,
  isAdmin,
  isEditing,
  editData,
  handleInputChange,
  handleSave,
  getRoleDisplayName,
  renderStarRating,
  userStats,
  professionalStats,
  realStats,
  upcomingClasses,
  realAppointments,
  upcomingProfessionalClasses,
}: PerfilProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Plan/Role Section */}
      <div className="mb-8">
        {isStudent && <TuPlan user={user} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Progress/Stats and Evaluation */}
        <div className="space-y-6">
          {/* Progress/Professional Stats */}
          {isStudent && <MiProgreso userStats={userStats} />}
          {isProfessional && (
            <ClasesRealizadas
              professionalStats={professionalStats}
              realStats={realStats}
            />
          )}

          {/* Evaluation - Teachers only */}
          {isProfessional && (
            <Evaluacion
              professionalStats={professionalStats}
              realStats={realStats}
              renderStarRating={renderStarRating}
            />
          )}
        </div>

        {/* Right Column - Personal Information and Upcoming Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <InformacionPersonal
            user={user}
            isEditing={isEditing}
            isStudent={isStudent}
            isAdmin={isAdmin}
            isProfessional={isProfessional}
            editData={editData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            getRoleDisplayName={getRoleDisplayName}
          />

          {/* Upcoming Classes - Students and Teachers only */}
          <ProximasClases
            isProfessional={isProfessional}
            isStudent={isStudent}
            upcomingClasses={upcomingClasses}
            realAppointments={realAppointments}
            upcomingProfessionalClasses={upcomingProfessionalClasses}
          />
        </div>
      </div>
    </div>
  );
}
