import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface MiProgresoProps {
  userStats: {
    classesCompleted: number;
    totalClasses: number;
    currentStreak: number;
    completionRate: number;
    nextGoal: string;
  };
}

export function MiProgreso({ userStats }: MiProgresoProps) {
  // Calculate attendance percentage
  const attendancePercentage = Math.round(
    (userStats.classesCompleted / userStats.totalClasses) * 100,
  );

  // Calculate pending classes
  const pendingClasses = userStats.totalClasses - userStats.classesCompleted;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Mi Progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completed Classes Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Clases Completadas</span>
            <span className="font-medium">
              {userStats.classesCompleted}/{userStats.totalClasses}
            </span>
          </div>
          <Progress value={userStats.completionRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {attendancePercentage}%
            </div>
            <div className="text-sm text-gray-600">
              Porcentaje de asistencia
            </div>
          </div>
          <div className="text-center p-4 bg-secondary/5 rounded-lg">
            <div className="text-2xl font-bold text-secondary">
              {pendingClasses}
            </div>
            <div className="text-sm text-gray-600">Clases pendientes</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-accent/5 rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {userStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Días seguidos</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {userStats.classesCompleted}
            </div>
            <div className="text-sm text-gray-600">Clases agendadas</div>
          </div>
        </div>

        {/* Next Goal */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Próximo objetivo</div>
          <div className="font-semibold text-accent">{userStats.nextGoal}</div>
        </div>
      </CardContent>
    </Card>
  );
}
