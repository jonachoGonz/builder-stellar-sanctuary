import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  MapPin,
  Building,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  CalendarDays,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface Block {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    endDate?: string;
  };
  type: "global" | "professional" | "location" | "room";
  professionalId?: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  location?: string;
  room?: string;
  active: boolean;
  reason?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
}

export function BlockingManager() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const { toast } = useToast();

  // Real-time updates
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing blocks for real-time updates");
      loadBlocks();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    allDay: false,
    isRecurring: false,
    recurrencePattern: {
      frequency: "weekly" as const,
      interval: 1,
      daysOfWeek: [] as string[],
      dayOfMonth: 1,
      endDate: "",
    },
    type: "global" as const,
    professionalId: "",
    location: "",
    room: "",
    reason: "",
  });

  useEffect(() => {
    loadBlocks();
    loadProfessionals();
  }, []);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/admin/blocked-times");
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.data.blocks);
      } else {
        throw new Error("Error al cargar bloqueos");
      }
    } catch (error) {
      console.error("Error loading blocks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los bloqueos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await apiCall("/admin/users?limit=100");
      if (response.ok) {
        const data = await response.json();
        const professionalUsers = data.data.users?.filter((u: any) =>
          ["teacher", "nutritionist", "psychologist"].includes(u.role),
        ) || [];
        setProfessionals(professionalUsers);
      }
    } catch (error) {
      console.error("Error loading professionals:", error);
    }
  };

  const handleCreateBlock = () => {
    setEditingBlock(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      allDay: false,
      isRecurring: false,
      recurrencePattern: {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
        endDate: "",
      },
      type: "global",
      professionalId: "",
      location: "",
      room: "",
      reason: "",
    });
    setModalOpen(true);
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      description: block.description || "",
      date: block.date ? block.date.split('T')[0] : "",
      startDate: block.startDate ? block.startDate.split('T')[0] : "",
      endDate: block.endDate ? block.endDate.split('T')[0] : "",
      startTime: block.startTime || "",
      endTime: block.endTime || "",
      allDay: block.allDay || false,
      isRecurring: block.isRecurring || false,
      recurrencePattern: block.recurrencePattern || {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
        endDate: "",
      },
      type: block.type,
      professionalId: block.professionalId?._id || "",
      location: block.location || "",
      room: block.room || "",
      reason: block.reason || "",
    });
    setModalOpen(true);
  };

  const handleSaveBlock = async () => {
    try {
      // Validate required fields
      if (!formData.title) {
        toast({
          title: "Error",
          description: "El título es requerido",
          variant: "destructive",
        });
        return;
      }

      if (formData.type === "professional" && !formData.professionalId) {
        toast({
          title: "Error",
          description: "Debe seleccionar un profesional",
          variant: "destructive",
        });
        return;
      }

      if (formData.type === "location" && !formData.location) {
        toast({
          title: "Error",
          description: "Debe especificar una ubicación",
          variant: "destructive",
        });
        return;
      }

      if (formData.type === "room" && !formData.room) {
        toast({
          title: "Error",
          description: "Debe especificar una sala",
          variant: "destructive",
        });
        return;
      }

      const blockData = {
        ...formData,
        recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
      };

      const url = editingBlock
        ? `/admin/blocked-times/${editingBlock._id}`
        : "/admin/blocked-times";
      const method = editingBlock ? "PUT" : "POST";

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingBlock
            ? "Bloqueo actualizado correctamente"
            : "Bloqueo creado correctamente",
        });
        setModalOpen(false);
        loadBlocks();

        // Trigger custom event for calendar components to update
        window.dispatchEvent(new CustomEvent('calendarUpdate', {
          detail: {
            type: editingBlock ? 'block_updated' : 'block_created',
            data: blockData
          }
        }));
        console.log("✅ Bloqueo guardado - Real-time update triggered");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el bloqueo");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (block: Block) => {
    try {
      const response = await apiCall(`/admin/blocked-times/${block._id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !block.active }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Bloqueo ${!block.active ? "activado" : "desactivado"} correctamente`,
        });
        loadBlocks();

        // Trigger custom event for calendar components to update
        window.dispatchEvent(new CustomEvent('calendarUpdate', {
          detail: { type: 'block_status_changed', blockId: block._id, active: !block.active }
        }));
        console.log("✅ Estado de bloqueo cambiado - Real-time update triggered");
      } else {
        throw new Error("Error al actualizar el bloqueo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el bloqueo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBlock = async (block: Block) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el bloqueo "${block.title}"?`)) {
      return;
    }

    try {
      const response = await apiCall(`/admin/blocked-times/${block._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Bloqueo eliminado correctamente",
        });
        loadBlocks();

        // Trigger custom event for calendar components to update
        window.dispatchEvent(new CustomEvent('calendarUpdate', {
          detail: { type: 'block_deleted', blockId: block._id }
        }));
        console.log("✅ Bloqueo eliminado - Real-time update triggered");
      } else {
        throw new Error("Error al eliminar el bloqueo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el bloqueo",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "global":
        return <Shield className="h-4 w-4" />;
      case "professional":
        return <User className="h-4 w-4" />;
      case "location":
        return <MapPin className="h-4 w-4" />;
      case "room":
        return <Building className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeDisplayName = (type: string) => {
    const names = {
      global: "Global",
      professional: "Profesional",
      location: "Ubicación",
      room: "Sala",
    };
    return names[type as keyof typeof names] || type;
  };

  const formatDateRange = (block: Block) => {
    if (block.date) {
      const date = new Date(block.date);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else if (block.startDate && block.endDate) {
      const start = new Date(block.startDate);
      const end = new Date(block.endDate);
      return `${start.toLocaleDateString("es-ES")} - ${end.toLocaleDateString("es-ES")}`;
    }
    return "Sin fecha";
  };

  const formatTimeRange = (block: Block) => {
    if (block.allDay) {
      return "Todo el día";
    } else if (block.startTime && block.endTime) {
      return `${block.startTime} - ${block.endTime}`;
    }
    return "Sin horario";
  };

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch =
      block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || block.type === typeFilter;
    const matchesActive = activeFilter === "all" || block.active.toString() === activeFilter;

    return matchesSearch && matchesType && matchesActive;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Cargando bloqueos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Bloqueos de Horarios</h2>
          <p className="text-gray-600">
            Administra los bloqueos globales y específicos del calendario
          </p>
        </div>
        <Button onClick={handleCreateBlock}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Bloqueo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar bloqueos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="professional">Profesional</SelectItem>
                <SelectItem value="location">Ubicación</SelectItem>
                <SelectItem value="room">Sala</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blocks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlocks.map((block) => (
                <TableRow key={block._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{block.title}</div>
                      {block.description && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {block.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(block.type)}
                      <span>{getTypeDisplayName(block.type)}</span>
                      {block.type === "professional" && block.professionalId && (
                        <Badge variant="outline" className="text-xs">
                          {block.professionalId.firstName} {block.professionalId.lastName}
                        </Badge>
                      )}
                      {block.type === "location" && block.location && (
                        <Badge variant="outline" className="text-xs">
                          {block.location}
                        </Badge>
                      )}
                      {block.type === "room" && block.room && (
                        <Badge variant="outline" className="text-xs">
                          {block.room}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateRange(block)}
                      {block.isRecurring && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Recurrente
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatTimeRange(block)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={block.active ? "default" : "secondary"}>
                      {block.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {block.createdBy.firstName} {block.createdBy.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBlock(block)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(block)}
                        title={block.active ? "Desactivar" : "Activar"}
                      >
                        {block.active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBlock(block)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBlocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No se encontraron bloqueos con los filtros aplicados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? "Editar Bloqueo" : "Crear Nuevo Bloqueo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Bloqueo de mantenimiento"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción opcional del bloqueo"
                rows={3}
              />
            </div>

            {/* Type and Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Bloqueo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (Todo el sistema)</SelectItem>
                    <SelectItem value="professional">Profesional específico</SelectItem>
                    <SelectItem value="location">Ubicación específica</SelectItem>
                    <SelectItem value="room">Sala específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "professional" && (
                <div>
                  <Label htmlFor="professionalId">Profesional *</Label>
                  <Select
                    value={formData.professionalId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professionalId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar profesional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional._id} value={professional._id}>
                          {professional.firstName} {professional.lastName} ({professional.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === "location" && (
                <div>
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Sala principal, Gimnasio, etc."
                  />
                </div>
              )}

              {formData.type === "room" && (
                <div>
                  <Label htmlFor="room">Sala *</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    placeholder="Sala 1, Sala de yoga, etc."
                  />
                </div>
              )}
            </div>

            {/* Date Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="singleDate"
                  checked={!!formData.date}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        date: new Date().toISOString().split('T')[0],
                        startDate: "",
                        endDate: "",
                      });
                    } else {
                      setFormData({ ...formData, date: "" });
                    }
                  }}
                />
                <Label htmlFor="singleDate">Fecha específica</Label>
              </div>

              {formData.date ? (
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Time Configuration */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={formData.allDay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allDay: checked as boolean })
                  }
                />
                <Label htmlFor="allDay">Todo el día</Label>
              </div>

              {!formData.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Hora Inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora Fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div>
              <Label htmlFor="reason">Motivo / Notas Administrativas</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Motivo del bloqueo para referencia interna"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveBlock}>
                <Save className="h-4 w-4 mr-2" />
                {editingBlock ? "Actualizar" : "Crear"} Bloqueo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
