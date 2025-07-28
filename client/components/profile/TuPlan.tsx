import { Link } from "react-router-dom";
import { Award, CheckCircle, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User as UserType } from "../../contexts/AuthContext";

interface TuPlanProps {
  user: UserType;
}

export function TuPlan({ user }: TuPlanProps) {
  const getWeeklyClasses = (plan: string) => {
    switch (plan) {
      case "pro":
        return "3";
      case "basic":
        return "2";
      case "elite":
        return "4";
      case "champion":
        return "5";
      default:
        return "1";
    }
  };

  const getPlanFeatures = (plan: string) => {
    const baseFeatures = [
      "Ver y reservar clases disponibles",
      "Acceder a tu calendario personal",
      "Revisar tu progreso y estadísticas",
      "Conectar con profesionales expertos",
    ];

    switch (plan) {
      case "elite":
      case "champion":
        return [
          ...baseFeatures,
          "Entrenador personal asignado",
          "Plan nutricional premium",
          "Seguimiento personalizado avanzado",
        ];
      case "pro":
        return [
          ...baseFeatures,
          "Plan nutricional personalizado",
          "Evaluaciones mensuales",
        ];
      default:
        return baseFeatures;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Award className="h-6 w-6 mr-2 text-primary" />
          Tu Plan: {user.plan || "Plan Trial"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">
              ¿Qué puedes hacer ahora?
            </h3>
            <div className="space-y-3">
              {getPlanFeatures(user.plan || "").map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {getWeeklyClasses(user.plan || "")} clases
              </div>
              <div className="text-gray-600">por semana</div>
            </div>
            <Link to="/calendar" className="w-full">
              <Button className="w-full btn-primary text-lg py-3">
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Comenzar a Entrenar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
