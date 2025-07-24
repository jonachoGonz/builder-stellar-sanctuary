import { useState, useEffect } from "react";
import { apiCall } from "../lib/api";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Calendar,
  TrendingUp,
  Info,
  BarChart3,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface AutoCompleteStats {
  pendientesCompletar: number;
  completadasHoy: number;
  completadasSemana: number;
  clasesAtrasadas: number;
  recomendacion: string;
}

interface AutoCompleteResult {
  completadas: number;
  errores: number;
  detalles: {
    claseId: string;
    alumno: string;
    profesional: string;
    fecha: string;
    hora: string;
    estadoAnterior: string;
    estadoNuevo: string;
  }[];
  totalEvaluadas: number;
}

export function AutoCompleteManager() {
  const [stats, setStats] = useState<AutoCompleteStats | null>(null);
  const [lastResult, setLastResult] = useState<AutoCompleteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();

    // Auto-refresh stats every 30 seconds
    const statsInterval = setInterval(loadStats, 30000);

    // Auto-execute completion every 5 minutes
    const autoCompleteInterval = setInterval(async () => {
      try {
        console.log("🔄 Auto-executing class completion check...");
        await executeAutoComplete(true); // Silent execution
      } catch (error) {
        console.error("Auto-complete execution error:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(statsInterval);
      clearInterval(autoCompleteInterval);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/calendario/auto-complete-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        throw new Error("Error al cargar estadísticas");
      }
    } catch (error) {
      console.error("Error loading auto-complete stats:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAutoComplete = async (silentMode = false) => {
    if (
      !silentMode &&
      !confirm(
        "¿Estás seguro de que quieres ejecutar el auto-completado de clases?",
      )
    ) {
      return;
    }

    try {
      setExecuting(true);
      const response = await apiCall("/calendario/completar-automatico", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLastResult(data.data);

        toast({
          title: "Éxito",
          description: data.message,
        });

        // Refresh stats after execution
        await loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al ejecutar auto-completado",
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };

  const getStatusColor = (
    count: number,
    type: "pending" | "overdue" | "success",
  ) => {
    if (type === "success") return "text-green-600";
    if (type === "overdue" && count > 0) return "text-red-600";
    if (type === "pending" && count > 0) return "text-yellow-600";
    return "text-gray-600";
  };

  const getStatusBadge = (
    count: number,
    type: "pending" | "overdue" | "success",
  ) => {
    if (type === "success") return "bg-green-100 text-green-800";
    if (type === "overdue" && count > 0) return "bg-red-100 text-red-800";
    if (type === "pending" && count > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              Cargando estadísticas...
            </p>
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
          <h2 className="text-2xl font-bold">Auto-Completado de Clases</h2>
          <p className="text-gray-600">
            Gestiona la finalización automática de clases pasadas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadStats} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button
            onClick={executeAutoComplete}
            disabled={executing || (stats?.pendientesCompletar || 0) === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            {executing ? "Ejecutando..." : "Ejecutar Auto-Completado"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendientes de Completar
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(stats.pendientesCompletar, "pending")}`}
              >
                {stats.pendientesCompletar}
              </div>
              <p className="text-xs text-muted-foreground">
                Clases que deberían estar completadas
              </p>
              {stats.pendientesCompletar > 0 && (
                <Badge
                  className={getStatusBadge(
                    stats.pendientesCompletar,
                    "pending",
                  )}
                >
                  Acción requerida
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completadas Hoy
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(stats.completadasHoy, "success")}`}
              >
                {stats.completadasHoy}
              </div>
              <p className="text-xs text-muted-foreground">
                Clases completadas en las últimas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completadas Esta Semana
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(stats.completadasSemana, "success")}`}
              >
                {stats.completadasSemana}
              </div>
              <p className="text-xs text-muted-foreground">
                Clases completadas en los últimos 7 días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clases Atrasadas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getStatusColor(stats.clasesAtrasadas, "overdue")}`}
              >
                {stats.clasesAtrasadas}
              </div>
              <p className="text-xs text-muted-foreground">
                Clases agendadas de hace más de 7 días
              </p>
              {stats.clasesAtrasadas > 0 && (
                <Badge
                  className={getStatusBadge(stats.clasesAtrasadas, "overdue")}
                >
                  Requiere atención
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendation */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Recomendación del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{stats.recomendacion}</p>
            {stats.pendientesCompletar > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Hay {stats.pendientesCompletar} clases que deberían
                  completarse automáticamente. Se recomienda ejecutar el proceso
                  ahora para mantener los registros actualizados.
                </p>
              </div>
            )}
            {stats.clasesAtrasadas > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  🚨 Hay {stats.clasesAtrasadas} clases muy atrasadas (más de 7
                  días). Revisa estos casos manualmente para determinar su
                  estado correcto.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Execution Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Resultados de la Última Ejecución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.completadas}
                </div>
                <p className="text-sm text-gray-600">Clases Completadas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {lastResult.errores}
                </div>
                <p className="text-sm text-gray-600">Errores</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {lastResult.totalEvaluadas}
                </div>
                <p className="text-sm text-gray-600">Total Evaluadas</p>
              </div>
            </div>

            {lastResult.detalles.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">
                  Detalles de Clases Completadas (muestra):
                </h4>
                <div className="space-y-2">
                  {lastResult.detalles.map((detalle, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-medium">{detalle.alumno}</span>
                        <span className="text-gray-600 mx-2">con</span>
                        <span className="font-medium">
                          {detalle.profesional}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(detalle.fecha).toLocaleDateString("es-ES")}{" "}
                        {detalle.hora}
                      </div>
                    </div>
                  ))}
                  {lastResult.completadas > lastResult.detalles.length && (
                    <p className="text-sm text-gray-600 text-center">
                      ... y{" "}
                      {lastResult.completadas - lastResult.detalles.length}{" "}
                      clases más
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo Funciona el Auto-Completado?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <p>
                Las clases se completan automáticamente 30 minutos después de su
                hora de finalización
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <p>
                Para clases sin hora de fin definida, se asume una duración de 1
                hora
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <p>
                Al completarse, se actualiza automáticamente el plan del
                estudiante
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <p>
                Solo se procesan clases con estado "agendada" (no canceladas)
              </p>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
              <p>
                Se recomienda ejecutar este proceso diariamente para mantener
                los registros actualizados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
