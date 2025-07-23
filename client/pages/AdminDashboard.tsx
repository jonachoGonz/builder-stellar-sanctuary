import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserManagementModal } from "../components/UserManagementModal";
import { EnhancedUnifiedCalendar } from "../components/EnhancedUnifiedCalendar";
import { PlanManagement } from "../components/PlanManagement";
import {
  Users,
  Calendar,
  TrendingUp,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  GraduationCap,
  User,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";

export function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
  });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "calendar" | "plans">("users");

  // Get admin info from real user data
  const getAdminInfo = () => {
    if (!user) return null;

    const calculateSystemStats = () => {
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.isActive).length;
      const totalStudents = users.filter((u) => u.role === "student").length;
      const totalTeachers = users.filter((u) =>
        ["teacher", "nutritionist", "psychologist"].includes(u.role)
      ).length;
      const totalClasses = 0; // Will be loaded from appointments API
      const upcomingClasses = 0; // Will be loaded from appointments API

      // Calculate revenue based on active students and their plans
      const revenue = users
        .filter((u) => u.role === "student" && u.isActive)
        .reduce((total, student) => {
          const planPrices: { [key: string]: number } = {
            basic: 29.99,
            basico: 29.99,
            pro: 49.99,
            premium: 79.99,
          };
          const price =
            planPrices[student.plan?.toLowerCase() || "basic"] || 29.99;
          return total + price;
        }, 0);

      return {
        totalUsers,
        activeUsers,
        totalStudents,
        totalTeachers,
        totalClasses,
        upcomingClasses,
        monthlyRevenue: revenue,
        growthRate: calculateGrowthRate(),
      };
    };

    const calculateGrowthRate = () => {
      // Simple growth calculation based on new users this month
      const thisMonth = new Date();
      const newUsersThisMonth = users.filter((u) => {
        const memberDate = new Date(u.memberSince);
        return (
          memberDate.getMonth() === thisMonth.getMonth() &&
          memberDate.getFullYear() === thisMonth.getFullYear()
        );
      }).length;

      const lastMonthTotal = users.length - newUsersThisMonth;
      if (lastMonthTotal === 0) return 0;

      return Math.round((newUsersThisMonth / lastMonthTotal) * 100);
    };

    const stats = calculateSystemStats();

    return {
      name: `${user.firstName} ${user.lastName}`,
      role: "Administrador",
      ...stats,
      memberSince: user.memberSince
        ? new Date(user.memberSince).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })
        : "Enero 2024",
    };
  };

  const adminInfo = getAdminInfo();

  // Load users and stats from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No se encontró token de autenticación");
        return;
      }

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        role: filterRole !== "all" ? filterRole : "",
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar usuarios");
      }

      const data = await response.json();
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch (error: any) {
      console.error("Error loading users:", error);
      setError(error.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [pagination.currentPage, searchTerm, filterRole]);

  useEffect(() => {
    // Reset to first page when search/filter changes
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [searchTerm, filterRole]);

  const displayStats = {
    totalUsers: stats?.totalUsers || 0,
    activeStudents: stats?.usersByRole?.students || 0,
    totalTeachers: stats?.professionals || 0,
    revenue: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`,
    growth: `+${stats?.growthRate || 0}%`,
  };

  // Users are already filtered by the API, so we just use them directly
  const filteredUsers = users;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "teacher":
        return <GraduationCap className="h-4 w-4" />;
      case "nutritionist":
        return <Users className="h-4 w-4" />;
      case "psychologist":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string, specialty?: string) => {
    const variants = {
      admin: "destructive",
      teacher: "secondary",
      nutritionist: "default",
      psychologist: "outline",
      student: "default",
    } as const;

    const roleLabels = {
      admin: "Admin",
      teacher: "Entrenador",
      nutritionist: "Nutricionista",
      psychologist: "Psicólogo",
      student: "Estudiante",
    } as const;

    return (
      <div className="space-y-1">
        <Badge variant={variants[role as keyof typeof variants] || "default"}>
          {getRoleIcon(role)}
          <span className="ml-1">
            {roleLabels[role as keyof typeof roleLabels] || role}
          </span>
        </Badge>
        {specialty &&
          ["teacher", "nutritionist", "psychologist"].includes(role) && (
            <div className="text-xs text-gray-500">{specialty}</div>
          )}
      </div>
    );
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode("create");
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setModalMode("edit");
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar usuario");
      }

      // Reload users after deletion
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      alert(error.message || "Error al eliminar usuario");
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      const token = localStorage.getItem("authToken");
      const isEdit = modalMode === "edit" && selectedUser;

      const url = isEdit
        ? `/api/admin/users/${selectedUser._id}`
        : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar usuario");
      }

      // Reload users and stats after save
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      throw new Error(error.message || "Error al guardar usuario");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !adminInfo) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gym-dark mb-4">
            Error de Acceso
          </h2>
          <p className="text-gray-600">
            No se pudo cargar la información del usuario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gym-dark">
                Panel de Administración
              </h1>
              <p className="text-gray-600">
                Gestiona usuarios, clases y configuración del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="btn-primary" onClick={handleCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  loadUsers();
                  loadStats();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Gestión de Usuarios
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "calendar"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("calendar")}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Calendario de Citas
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "plans"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("plans")}
            >
              <TrendingUp className="h-4 w-4 mr-2 inline" />
              Gestión de Planes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "users" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Usuarios
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +3 desde la semana pasada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Estudiantes Activos
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.activeStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    85% de retención mensual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profesionales
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.totalTeachers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio 4.8/5 estrellas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ingresos Mensuales
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.revenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {displayStats.growth} vs mes anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users Management */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <Button
                        size="sm"
                        className="btn-primary"
                        onClick={handleCreateUser}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Usuario
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar usuarios..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="student">Estudiantes</SelectItem>
                          <SelectItem value="teacher">Entrenadores</SelectItem>
                          <SelectItem value="nutritionist">
                            Nutricionistas
                          </SelectItem>
                          <SelectItem value="psychologist">
                            Psicólogos
                          </SelectItem>
                          <SelectItem value="admin">Administradores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {error}
                      </div>
                    )}

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando usuarios...</span>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user._id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getRoleBadge(user.role, user.specialty)}
                              </TableCell>
                              <TableCell>
                                {user.role === "student" && user.plan ? (
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {user.plan}
                                  </Badge>
                                ) : user.role === "student" ? (
                                  <Badge variant="secondary">Sin plan</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Profesional
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.isActive ? "default" : "secondary"
                                  }
                                >
                                  {user.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {/* Pagination */}
                    {!loading && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          Mostrando {users.length} de {pagination.totalUsers}{" "}
                          usuarios
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage - 1,
                              }))
                            }
                            disabled={!pagination.hasPrev}
                          >
                            Anterior
                          </Button>
                          <span className="text-sm">
                            Página {pagination.currentPage} de{" "}
                            {pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: prev.currentPage + 1,
                              }))
                            }
                            disabled={!pagination.hasNext}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Stats */}
              <div className="space-y-6">
                {/* Role Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Distribución por Rol
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats?.usersByRole && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Estudiantes</span>
                          <span className="font-medium">
                            {stats.usersByRole.students}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Entrenadores</span>
                          <span className="font-medium">
                            {stats.usersByRole.teachers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Nutricionistas</span>
                          <span className="font-medium">
                            {stats.usersByRole.nutritionists}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Psicólogos</span>
                          <span className="font-medium">
                            {stats.usersByRole.psychologists}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Administradores</span>
                          <span className="font-medium">
                            {stats.usersByRole.admins}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Clase
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Gestionar Horarios
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ver Reportes
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === "calendar" && <EnhancedUnifiedCalendar />}

        {activeTab === "plans" && <PlanManagement />}
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        mode={modalMode}
      />
    </div>
  );
}
