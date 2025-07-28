import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface EvaluacionProps {
  professionalStats: {
    averageRating: number;
    totalStudents: number;
  };
  realStats?: any;
  renderStarRating: (rating: number) => JSX.Element[];
}

export function Evaluacion({
  professionalStats,
  realStats,
  renderStarRating,
}: EvaluacionProps) {
  const stats = realStats || professionalStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-400" />
          Evaluación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Average Rating Display */}
        <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center space-x-1 mb-2">
            {renderStarRating(stats.averageRating)}
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            Promedio de evaluación de los alumnos a las clases
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Basado en {stats.totalStudents} evaluaciones totales
          </div>
        </div>

        {/* Additional Rating Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">95%</div>
            <div className="text-xs text-gray-600">Satisfacción</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">98%</div>
            <div className="text-xs text-gray-600">Recomendación</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
