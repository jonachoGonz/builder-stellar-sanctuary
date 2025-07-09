import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  const [classes, setClasses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Get admin info from real user data
  const getAdminInfo = () => {
    if (!user) return null;

    const calculateSystemStats = () => {
      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.isActive).length;
      const totalStudents = users.filter((u) => u.role === "student").length;
      const totalTeachers = users.filter((u) => u.role === "teacher").length;
      const totalClasses = classes.length;
      const upcomingClasses = classes.filter(
        (c) => new Date(c.date) > new Date(),
      ).length;

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

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockUsers = [
      {
        id: "1",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@email.com",
        role: "student",
        plan: "pro",
        isActive: true,
        memberSince: "2024-01-15",
      },
      {
        id: "2",
        firstName: "María",
        lastName: "González",
        email: "maria@email.com",
        role: "teacher",
        plan: null,
        isActive: true,
        memberSince: "2023-12-01",
      },
      {
        id: "3",
        firstName: "Carlos",
        lastName: "Mendoza",
        email: "carlos@email.com",
        role: "teacher",
        plan: null,
        isActive: true,
        memberSince: "2023-10-15",
      },
      {
        id: "4",
        firstName: "Ana",
        lastName: "Silva",
        email: "ana@email.com",
        role: "student",
        plan: "basic",
        isActive: false,
        memberSince: "2024-02-01",
      },
    ];

    const mockClasses = [
      {
        id: "1",
        title: "Entrenamiento Funcional",
        instructor: "Carlos Mendoza",
        date: "2024-01-16",
        time: "10:00",
        capacity: "12/15",
        status: "scheduled",
      },
      {
        id: "2",
        title: "Yoga Matutino",
        instructor: "María González",
        date: "2024-01-16",
        time: "08:00",
        capacity: "8/12",
        status: "scheduled",
      },
    ];

    setUsers(mockUsers);
    setClasses(mockClasses);
  }, []);

  const stats = {
    totalUsers: users.length,
    activeStudents: users.filter((u) => u.role === "student" && u.isActive)
      .length,
    totalTeachers: users.filter((u) => u.role === "teacher").length,
    totalClasses: classes.length,
    revenue: "$2,450,000",
    growth: "+12%",
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "teacher":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      teacher: "secondary",
      student: "default",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "default"}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </Badge>
    );
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      setUsers(users.filter((u) => u.id !== userId));
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
              <Button className="btn-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                85% de retención mensual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profesores</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
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
              <div className="text-2xl font-bold">{stats.revenue}</div>
              <p className="text-xs text-muted-foreground">
                {stats.growth} vs mes anterior
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
                  <Button size="sm" className="btn-primary">
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
                      <SelectItem value="teacher">Profesores</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
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
                      <TableRow key={user.id}>
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
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.plan ? (
                            <Badge variant="outline" className="capitalize">
                              {user.plan}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
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
                              onClick={() => handleDeleteUser(user.id)}
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
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Classes */}
          <div className="space-y-6">
            {/* Today's Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Clases de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm">{classItem.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {classItem.instructor} • {classItem.time}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {classItem.capacity}
                      </Badge>
                      <Badge
                        variant={
                          classItem.status === "scheduled"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {classItem.status === "scheduled"
                          ? "Programada"
                          : "Completada"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  Ver Todas las Clases
                </Button>
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
      </div>

      {/* User Edit Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" defaultValue={selectedUser.firstName} />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" defaultValue={selectedUser.lastName} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={selectedUser.email} />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="teacher">Profesor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedUser.role === "student" && (
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select defaultValue={selectedUser.plan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                      <SelectItem value="champion">Champion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button className="btn-primary">Guardar Cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
