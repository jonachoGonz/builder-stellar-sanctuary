import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Settings,
  UserPlus,
  Save,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface Professional {
  id: string;
  name: string;
  role: string;
  specialty: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  assignedStudents: string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  plan: string;
  remainingClasses: number;
  assignedProfessionals: {
    teacher?: string;
    nutritionist?: string;
    psychologist?: string;
  };
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  professionalTypes: string[];
  color: string;
}

export function ScheduleManagement() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    [],
  );
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockProfessionals: Professional[] = [
      {
        id: "1",
        name: "Carlos Mendoza",
        role: "teacher",
        specialty: "Entrenamiento Funcional",
        workingHours: {
          start: "08:00",
          end: "20:00",
          days: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
        assignedStudents: ["1", "2"],
      },
      {
        id: "2",
        name: "María González",
        role: "nutritionist",
        specialty: "Nutrición Deportiva",
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
        assignedStudents: ["1"],
      },
      {
        id: "3",
        name: "Ana Silva",
        role: "psychologist",
        specialty: "Psicología Deportiva",
        workingHours: {
          start: "10:00",
          end: "19:00",
          days: ["tuesday", "wednesday", "thursday", "friday", "saturday"],
        },
        assignedStudents: [],
      },
    ];

    const mockStudents: Student[] = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@email.com",
        plan: "pro",
        remainingClasses: 9,
        assignedProfessionals: {
          teacher: "1",
          nutritionist: "2",
        },
      },
      {
        id: "2",
        name: "María Silva",
        email: "maria@email.com",
        plan: "elite",
        remainingClasses: 12,
        assignedProfessionals: {
          teacher: "1",
        },
      },
    ];

    const mockAppointmentTypes: AppointmentType[] = [
      {
        id: "1",
        name: "Clase de Prueba",
        duration: 60,
        professionalTypes: ["teacher"],
        color: "#10B981",
      },
      {
        id: "2",
        name: "Entrenamiento Personal",
        duration: 60,
        professionalTypes: ["teacher"],
        color: "#3B82F6",
      },
      {
        id: "3",
        name: "Primera Sesión Nutricional",
        duration: 90,
        professionalTypes: ["nutritionist"],
        color: "#F59E0B",
      },
      {
        id: "4",
        name: "Sesión de Psicología",
        duration: 60,
        professionalTypes: ["psychologist"],
        color: "#EC4899",
      },
    ];

    setProfessionals(mockProfessionals);
    setStudents(mockStudents);
    setAppointmentTypes(mockAppointmentTypes);
  }, []);

  const assignStudentToProfessional = (
    studentId: string,
    professionalId: string,
    professionalType: string,
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              assignedProfessionals: {
                ...student.assignedProfessionals,
                [professionalType]: professionalId,
              },
            }
          : student,
      ),
    );

    setProfessionals((prev) =>
      prev.map((professional) =>
        professional.id === professionalId
          ? {
              ...professional,
              assignedStudents: [
                ...professional.assignedStudents.filter(
                  (id) => id !== studentId,
                ),
                studentId,
              ],
            }
          : professional,
      ),
    );
  };

  const getRoleDisplayName = (role: string) => {
    const names = {
      teacher: "Entrenador",
      nutritionist: "Nutricionista",
      psychologist: "Psicólogo",
    };
    return names[role as keyof typeof names] || role;
  };

  const getDayDisplayName = (day: string) => {
    const names = {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom",
    };
    return names[day as keyof typeof names] || day;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gym-dark">
          Gestión de Horarios y Asignaciones
        </h2>
        <div className="flex space-x-2">
          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Estudiante a Profesional</DialogTitle>
              </DialogHeader>
              {/* Assignment form content */}
              <div className="space-y-4">
                <div>
                  <Label>Estudiante</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profesional</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem
                          key={professional.id}
                          value={professional.id}
                        >
                          {professional.name} -{" "}
                          {getRoleDisplayName(professional.role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full btn-primary">Asignar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Professionals Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Profesionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Horarios</TableHead>
                <TableHead>Estudiantes Asignados</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell className="font-medium">
                    {professional.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRoleDisplayName(professional.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{professional.specialty}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {professional.workingHours.start} -{" "}
                        {professional.workingHours.end}
                      </div>
                      <div className="text-gray-500">
                        {professional.workingHours.days
                          .map(getDayDisplayName)
                          .join(", ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {professional.assignedStudents.length} estudiantes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProfessional(professional)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsScheduleDialogOpen(true)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Students and Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes y Asignaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Clases Restantes</TableHead>
                <TableHead>Entrenador</TableHead>
                <TableHead>Nutricionista</TableHead>
                <TableHead>Psicólogo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        {student.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{student.plan}</Badge>
                  </TableCell>
                  <TableCell>{student.remainingClasses}</TableCell>
                  <TableCell>
                    {student.assignedProfessionals.teacher ? (
                      <Badge variant="outline" className="text-blue-600">
                        {
                          professionals.find(
                            (p) =>
                              p.id === student.assignedProfessionals.teacher,
                          )?.name
                        }
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.assignedProfessionals.nutritionist ? (
                      <Badge variant="outline" className="text-green-600">
                        {
                          professionals.find(
                            (p) =>
                              p.id ===
                              student.assignedProfessionals.nutritionist,
                          )?.name
                        }
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.assignedProfessionals.psychologist ? (
                      <Badge variant="outline" className="text-purple-600">
                        {
                          professionals.find(
                            (p) =>
                              p.id ===
                              student.assignedProfessionals.psychologist,
                          )?.name
                        }
                      </Badge>
                    ) : (
                      <span className="text-gray-400">No asignado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsAssignDialogOpen(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Appointment Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Profesionales</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.duration} min</TableCell>
                  <TableCell>
                    {type.professionalTypes
                      .map((prof) => getRoleDisplayName(prof))
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: type.color }}
                    ></div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
