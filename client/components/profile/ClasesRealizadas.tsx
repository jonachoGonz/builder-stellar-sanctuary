import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ClasesRealizadasProps {
  professionalStats: {
    totalClassesTaught: number;
    totalStudents: number;
    classesThisMonth: number;
  };
  realStats?: any;
}

export function ClasesRealizadas({
  professionalStats,
  realStats,
}: ClasesRealizadasProps) {
  const stats = realStats || professionalStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Clases Realizadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Classes and Students Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {stats.totalClassesTaught}
            </div>
            <div className="text-sm text-gray-600">Total de clases</div>
          </div>
          <div className="text-center p-4 bg-secondary/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary">
              {stats.totalStudents}
            </div>
            <div className="text-sm text-gray-600">Total de alumnos</div>
          </div>
        </div>

        {/* Classes This Month */}
        <div className="text-center p-4 bg-accent/5 rounded-lg">
          <div className="text-2xl font-bold text-accent">
            {stats.classesThisMonth}
          </div>
          <div className="text-sm text-gray-600">
            Clases completadas del mes
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {Math.round((stats.classesThisMonth / 25) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Capacidad mensual</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {Math.round(stats.totalClassesTaught / stats.totalStudents) || 0}
            </div>
            <div className="text-xs text-gray-600">Clases por alumno</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
