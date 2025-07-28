import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { WelcomeModal } from "../components/WelcomeModal";
import { useAuth, usePermissions } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";
import { Encabezado } from "../components/profile/Encabezado";
import { Perfil } from "../components/profile/Perfil";

export function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { canManageUsers, isStudent, isAdmin, isProfessional } =
    usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [realAppointments, setRealAppointments] = useState<any[]>([]);
  const [realStats, setRealStats] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    occupation: "",
    activityLevel: "",
    medicalConditions: "",
    injuries: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Initialize editData with user data when user is loaded
  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        occupation: user.occupation || "",
        activityLevel: user.activityLevel || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        emergencyContactName: user.emergencyContact?.name || "",
        emergencyContactPhone: user.emergencyContact?.phone || "",
      });

      // Load real data for professionals
      if (isProfessional) {
        loadProfessionalData();
      }
    }
  }, [user, isProfessional]);

  const loadProfessionalData = async () => {
    try {
      setDataLoading(true);

      // Load upcoming appointments for this professional
      const appointmentsResponse = await apiCall(
        `/admin/appointments?professionalId=${user?.id}&status=scheduled&limit=3`,
      );

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setRealAppointments(appointmentsData.data.appointments || []);
      }

      // Load professional stats
      const statsResponse = await apiCall(
        `/admin/appointments?professionalId=${user?.id}&limit=1000`,
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const appointments = statsData.data.appointments || [];

        const stats = {
          totalClassesTaught: appointments.filter(
            (apt) => apt.status === "completed",
          ).length,
          totalStudents: new Set(
            appointments.map((apt) => apt.student?._id).filter(Boolean),
          ).size,
          averageRating: 4.7, // This would come from actual rating data
          classesThisMonth: appointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            const now = new Date();
            return (
              aptDate.getMonth() === now.getMonth() &&
              aptDate.getFullYear() === now.getFullYear()
            );
          }).length,
          joinDate: user?.memberSince
            ? new Date(user.memberSince).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })
            : "Enero 2024",
        };

        setRealStats(stats);
      }
    } catch (error) {
      console.error("Error loading professional data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // User stats - can be made dynamic later
  const userStats = {
    classesCompleted: 45,
    totalClasses: 48,
    currentStreak: 12,
    joinDate: user?.memberSince
      ? new Date(user.memberSince).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Enero 2024",
    nextGoal: "50 clases",
    completionRate: 94,
  };

  // Professional stats - for teachers, nutritionists, psychologists
  const professionalStats = {
    totalClassesTaught: 127,
    totalStudents: 35,
    averageRating: 4.7,
    classesThisMonth: 23,
    joinDate: user?.memberSince
      ? new Date(user.memberSince).toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        })
      : "Enero 2024",
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      teacher: "Entrenador Personal",
      nutritionist: "Nutricionista",
      psychologist: "Psicólogo",
      admin: "Administrador",
      student: "Estudiante",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="h-4 w-4 fill-yellow-400/50 text-yellow-400"
          />,
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Mock upcoming classes for students
  const upcomingClasses = [
    {
      id: 1,
      date: "2024-01-16",
      time: "10:00",
      trainer: "Carlos Mendoza",
      type: "Entrenamiento Funcional",
      location: "Sala Principal",
    },
    {
      id: 2,
      date: "2024-01-18",
      time: "15:30",
      trainer: "María González",
      type: "Yoga",
      location: "Sala Zen",
    },
    {
      id: 3,
      date: "2024-01-20",
      time: "09:00",
      trainer: "Diego Ramirez",
      type: "Musculación",
      location: "Área de Pesas",
    },
  ];

  // Mock upcoming classes for professionals
  const upcomingProfessionalClasses = [
    {
      id: 1,
      className: "Entrenamiento Funcional",
      date: "2024-01-16",
      time: "10:00",
      duration: "60 min",
      student: "Ana García",
      location: "Sala Principal",
    },
    {
      id: 2,
      className: "Consulta Nutricional",
      date: "2024-01-18",
      time: "15:30",
      duration: "45 min",
      student: "Carlos Ruiz",
      location: "Consultorio 2",
    },
    {
      id: 3,
      className: "Sesión de Yoga",
      date: "2024-01-20",
      time: "09:00",
      duration: "90 min",
      student: "María López",
      location: "Sala Zen",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUser({
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        birthDate: editData.birthDate,
        gender: editData.gender as any,
        occupation: editData.occupation,
        activityLevel: editData.activityLevel as any,
        medicalConditions: editData.medicalConditions,
        injuries: editData.injuries,
        emergencyContact:
          editData.emergencyContactName && editData.emergencyContactPhone
            ? {
                name: editData.emergencyContactName,
                phone: editData.emergencyContactPhone,
              }
            : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        occupation: user.occupation || "",
        activityLevel: user.activityLevel || "",
        medicalConditions: user.medicalConditions || "",
        injuries: user.injuries || "",
        emergencyContactName: user.emergencyContact?.name || "",
        emergencyContactPhone: user.emergencyContact?.phone || "",
      });
    }
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <WelcomeModal
        userName={user.firstName}
        userPlan={user.plan || "Plan Trial"}
        isNewUser={true} // You can make this dynamic based on user registration date
      />

      {/* Header Component */}
      <Header />

      {/* Encabezado Component */}
      <Encabezado
        user={user}
        isProfessional={isProfessional}
        isStudent={isStudent}
        isAdmin={isAdmin}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
        getRoleDisplayName={getRoleDisplayName}
        userStats={userStats}
        professionalStats={professionalStats}
      />

      {/* Perfil Component */}
      <Perfil
        user={user}
        isStudent={isStudent}
        isProfessional={isProfessional}
        isAdmin={isAdmin}
        isEditing={isEditing}
        editData={editData}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        getRoleDisplayName={getRoleDisplayName}
        renderStarRating={renderStarRating}
        userStats={userStats}
        professionalStats={professionalStats}
        realStats={realStats}
        upcomingClasses={upcomingClasses}
        realAppointments={realAppointments}
        upcomingProfessionalClasses={upcomingProfessionalClasses}
      />
    </div>
  );
}
