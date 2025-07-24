import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  StarOff,
  Tag,
  Eye,
  EyeOff,
  Search,
  Filter,
  Save,
  X,
  DollarSign,
  Calendar,
  Users,
  Percent,
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

interface Plan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  classesPorSemana: number;
  clasesTotales: number;
  durationWeeks: number;
  benefits: string[];
  popular: boolean;
  active: boolean;
  category: "trial" | "basic" | "premium" | "elite" | "custom";
  discountCodes: DiscountCode[];
  metadata: {
    color: string;
    icon?: string;
    order: number;
  };
  createdBy: any;
  updatedBy: any;
  createdAt: string;
  updatedAt: string;
}

interface DiscountCode {
  code: string;
  percentage: number;
  maxUses: number;
  currentUses: number;
  expiryDate?: string;
  active: boolean;
}

export function PlanManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedPlanForDiscount, setSelectedPlanForDiscount] =
    useState<Plan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    currency: "CLP",
    classesPorSemana: 1,
    clasesTotales: 4,
    durationWeeks: 4,
    benefits: [""],
    popular: false,
    active: true,
    category: "basic" as "trial" | "basic" | "premium" | "elite" | "custom",
    metadata: {
      color: "#3B82F6",
      icon: "star",
      order: 0,
    },
  });

  const [newDiscountCode, setNewDiscountCode] = useState({
    code: "",
    percentage: 10,
    maxUses: 100,
    expiryDate: "",
    active: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/plans/admin");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data.plans);
      } else {
        throw new Error("Error al cargar planes");
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      currency: "CLP",
      classesPorSemana: 1,
      clasesTotales: 4,
      durationWeeks: 4,
      benefits: [""],
      popular: false,
      active: true,
      category: "basic",
      metadata: {
        color: "#3B82F6",
        icon: "star",
        order: 0,
      },
    });
    setModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      classesPorSemana: plan.classesPorSemana,
      clasesTotales: plan.clasesTotales,
      durationWeeks: plan.durationWeeks,
      benefits: plan.benefits.length > 0 ? plan.benefits : [""],
      popular: plan.popular,
      active: plan.active,
      category: plan.category,
      metadata: plan.metadata,
    });
    setModalOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      // Filter out empty benefits
      const cleanedBenefits = formData.benefits.filter(
        (benefit) => benefit.trim() !== "",
      );

      const planData = {
        ...formData,
        benefits: cleanedBenefits,
      };

      const url = editingPlan
        ? `/plans/admin/${editingPlan._id}`
        : "/plans/admin";
      const method = editingPlan ? "PUT" : "POST";

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingPlan
            ? "Plan actualizado correctamente"
            : "Plan creado correctamente",
        });
        setModalOpen(false);
        loadPlans();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el plan");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await apiCall(`/plans/admin/${plan._id}`, {
        method: "PUT",
        body: JSON.stringify({ active: !plan.active }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Plan ${!plan.active ? "activado" : "desactivado"} correctamente`,
        });
        loadPlans();
      } else {
        throw new Error("Error al actualizar el plan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    }
  };

  const handleTogglePopular = async (plan: Plan) => {
    try {
      const response = await apiCall(`/plans/admin/${plan._id}`, {
        method: "PUT",
        body: JSON.stringify({ popular: !plan.popular }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Plan ${!plan.popular ? "marcado como" : "desmarcado de"} popular`,
        });
        loadPlans();
      } else {
        throw new Error("Error al actualizar el plan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres desactivar el plan "${plan.name}"?`,
      )
    ) {
      return;
    }

    try {
      const response = await apiCall(`/plans/admin/${plan._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Plan desactivado correctamente",
        });
        loadPlans();
      } else {
        throw new Error("Error al desactivar el plan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar el plan",
        variant: "destructive",
      });
    }
  };

  const handleManageDiscounts = (plan: Plan) => {
    setSelectedPlanForDiscount(plan);
    setDiscountModalOpen(true);
  };

  const handleAddDiscountCode = async () => {
    if (!selectedPlanForDiscount || !newDiscountCode.code) return;

    try {
      const response = await apiCall(
        `/plans/admin/${selectedPlanForDiscount._id}/discount-codes`,
        {
          method: "POST",
          body: JSON.stringify({
            action: "add",
            discountCode: newDiscountCode,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Código de descuento agregado correctamente",
        });
        setNewDiscountCode({
          code: "",
          percentage: 10,
          maxUses: 100,
          expiryDate: "",
          active: true,
        });
        loadPlans();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al agregar código de descuento",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSeedDefaultPlans = async () => {
    if (
      !confirm("¿Estás seguro de que quieres crear los planes por defecto?")
    ) {
      return;
    }

    try {
      const response = await apiCall("/plans/admin/seed", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Planes por defecto creados correctamente",
        });
        loadPlans();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al crear planes por defecto",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ""],
    });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || plan.category === categoryFilter;
    const matchesActive =
      activeFilter === "all" || plan.active.toString() === activeFilter;

    return matchesSearch && matchesCategory && matchesActive;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Cargando planes...</p>
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
          <h2 className="text-2xl font-bold">Gestión de Planes</h2>
          <p className="text-gray-600">
            Administra los planes de suscripción disponibles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSeedDefaultPlans} variant="outline">
            Crear Planes por Defecto
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar planes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card
            key={plan._id}
            className={`${!plan.active ? "opacity-60" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: plan.metadata.color }}
                  ></div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePopular(plan)}
                    title={
                      plan.popular ? "Quitar de popular" : "Marcar como popular"
                    }
                  >
                    {plan.popular ? (
                      <StarOff className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleActive(plan)}
                    title={plan.active ? "Desactivar" : "Activar"}
                  >
                    {plan.active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {plan.currency} ${plan.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  / {plan.durationWeeks} sem
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.classesPorSemana} clases/semana
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.clasesTotales} clases totales
                </div>
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-2 text-gray-400" />
                  {plan.category}
                </div>
                {plan.discountCodes.length > 0 && (
                  <div className="flex items-center text-sm">
                    <Percent className="h-4 w-4 mr-2 text-gray-400" />
                    {plan.discountCodes.filter((dc) => dc.active).length}{" "}
                    códigos de descuento
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {plan.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                    {benefit}
                  </div>
                ))}
                {plan.benefits.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{plan.benefits.length - 3} beneficios más
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManageDiscounts(plan)}
                >
                  <Tag className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePlan(plan)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              No se encontraron planes con los filtros aplicados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plan Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Plan Básico"
                />
              </div>
              <div>
                <Label htmlFor="slug">Identificador (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="plan-basico"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ideal para comenzar tu transformación"
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">CLP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Classes */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="classesPorSemana">Clases por semana *</Label>
                <Input
                  id="classesPorSemana"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.classesPorSemana}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      classesPorSemana: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="clasesTotales">Clases totales *</Label>
                <Input
                  id="clasesTotales"
                  type="number"
                  min="1"
                  value={formData.clasesTotales}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clasesTotales: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="durationWeeks">Duración (semanas) *</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  min="1"
                  max="52"
                  value={formData.durationWeeks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationWeeks: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Benefits */}
            <div>
              <Label>Beneficios</Label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Beneficio del plan"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addBenefit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Beneficio
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.metadata.color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, color: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.metadata.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metadata: {
                        ...formData.metadata,
                        order: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, popular: checked as boolean })
                  }
                />
                <Label htmlFor="popular">Plan popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <Label htmlFor="active">Plan activo</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlan}>
                <Save className="h-4 w-4 mr-2" />
                {editingPlan ? "Actualizar" : "Crear"} Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Codes Modal */}
      <Dialog open={discountModalOpen} onOpenChange={setDiscountModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Códigos de Descuento - {selectedPlanForDiscount?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing discount codes */}
            {selectedPlanForDiscount?.discountCodes &&
              selectedPlanForDiscount.discountCodes.length > 0 && (
                <div>
                  <Label>Códigos Existentes</Label>
                  <div className="space-y-2">
                    {selectedPlanForDiscount.discountCodes.map(
                      (code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">{code.code}</div>
                            <div className="text-sm text-gray-600">
                              {code.percentage}% - {code.currentUses}/
                              {code.maxUses} usos
                            </div>
                          </div>
                          <Badge
                            variant={code.active ? "default" : "secondary"}
                          >
                            {code.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Add new discount code */}
            <div>
              <Label>Nuevo Código de Descuento</Label>
              <div className="space-y-3">
                <Input
                  placeholder="Código (ej: DESCUENTO10)"
                  value={newDiscountCode.code}
                  onChange={(e) =>
                    setNewDiscountCode({
                      ...newDiscountCode,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Porcentaje</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newDiscountCode.percentage}
                      onChange={(e) =>
                        setNewDiscountCode({
                          ...newDiscountCode,
                          percentage: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Máx usos</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newDiscountCode.maxUses}
                      onChange={(e) =>
                        setNewDiscountCode({
                          ...newDiscountCode,
                          maxUses: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">
                    Fecha de expiración (opcional)
                  </Label>
                  <Input
                    type="date"
                    value={newDiscountCode.expiryDate}
                    onChange={(e) =>
                      setNewDiscountCode({
                        ...newDiscountCode,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={handleAddDiscountCode}
                  disabled={!newDiscountCode.code}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Código
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
