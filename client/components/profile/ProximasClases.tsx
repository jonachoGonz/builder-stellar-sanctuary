import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface ProximasClasesProps {
  isProfessional: boolean;
  isStudent: boolean;
  upcomingClasses: any[];
  realAppointments: any[];
  upcomingProfessionalClasses: any[];
}

export function ProximasClases({
  isProfessional,
  isStudent,
  upcomingClasses,
  realAppointments,
  upcomingProfessionalClasses,
}: ProximasClasesProps) {
  // Get the classes to display
  const classesToShow = isProfessional
    ? realAppointments.length > 0
      ? realAppointments
      : upcomingProfessionalClasses
    : upcomingClasses;

  // Show only if user is student or professional
  if (!isStudent && !isProfessional) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Próximas Clases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classesToShow.length > 0 ? (
            <>
              {classesToShow.slice(0, 3).map((classItem) => (
                <div
                  key={classItem.id || classItem._id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  {isProfessional ? (
                    // Professional class display
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">
                          {classItem.title ||
                            classItem.className ||
                            classItem.type ||
                            "Sesión"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {classItem.duration
                            ? `${classItem.duration} min`
                            : "60 min"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">Fecha y Hora:</div>
                          <div>
                            {new Date(classItem.date).toLocaleDateString(
                              "es-ES",
                            )}{" "}
                            • {classItem.startTime || classItem.time}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Estudiante:</div>
                          <div>
                            {classItem.student
                              ? `${classItem.student.firstName} ${classItem.student.lastName}`
                              : classItem.student || "Por asignar"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Lugar:</span>{" "}
                        {classItem.location || "Por definir"}
                      </div>
                    </>
                  ) : (
                    // Student class display
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{classItem.type}</div>
                        <div className="text-sm text-gray-600">
                          {classItem.trainer} • {classItem.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {new Date(classItem.date).toLocaleDateString("es-ES")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {classItem.time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 text-center">
                <Link to="/calendar">
                  <Button variant="outline">
                    {isProfessional
                      ? "Ver Todo Mi Calendario"
                      : "Ver Todas las Clases"}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            // No classes message
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">
                <p>No tienes clases agendadas</p>
              </div>
              <Link to="/calendar">
                <Button className="btn-primary">Agenda tus clases ahora</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
