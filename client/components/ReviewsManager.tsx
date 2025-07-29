import { useState, useEffect } from "react";
import { useAuth, usePermissions } from "../contexts/AuthContext";
import { apiCall } from "../lib/api";
import {
  Star,
  Search,
  Filter,
  Calendar,
  User,
  MessageSquare,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Review {
  _id: string;
  alumnoId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profesionalId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  fecha: string;
  hora: string;
  especialidad: string;
  titulo?: string;
  evaluacion: {
    puntaje: number;
    comentario: string;
    puntualidad: number;
    calidad: number;
    fechaEvaluacion: string;
  };
}

interface ProfessionalStats {
  profesionalId: string;
  nombre: string;
  especialidad: string;
  totalReviews: number;
  averageRating: number;
  averagePunctuality: number;
  averageQuality: number;
  lastReviewDate: string;
}

export function ReviewsManager() {
  const { user } = useAuth();
  const { isAdmin, isProfessional, isStudent } = usePermissions();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [professionalStats, setProfessionalStats] = useState<
    ProfessionalStats[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterProfessional, setFilterProfessional] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [viewMode, setViewMode] = useState<"reviews" | "stats">("reviews");

  useEffect(() => {
    loadReviews();
    if (isAdmin || isProfessional) {
      loadProfessionalStats();
    }
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiCall(
        "/calendario/agenda?estado=completada&limit=100",
      );
      if (response.ok) {
        const data = await response.json();
        // Filter only classes with evaluations
        const reviewedClasses = data.data.agenda.filter(
          (clase: any) => clase.evaluacion,
        );
        setReviews(reviewedClasses);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionalStats = async () => {
    try {
      const response = await apiCall(
        "/calendario/agenda?estado=completada&limit=1000",
      );
      if (response.ok) {
        const data = await response.json();
        const allCompletedClasses = data.data.agenda.filter(
          (clase: any) => clase.evaluacion,
        );

        // Group by professional and calculate stats
        const statsMap = new Map<
          string,
          {
            profesional: any;
            reviews: any[];
            totalRating: number;
            totalPunctuality: number;
            totalQuality: number;
          }
        >();

        allCompletedClasses.forEach((clase: any) => {
          const profId = clase.profesionalId._id;
          if (!statsMap.has(profId)) {
            statsMap.set(profId, {
              profesional: clase.profesionalId,
              reviews: [],
              totalRating: 0,
              totalPunctuality: 0,
              totalQuality: 0,
            });
          }

          const stats = statsMap.get(profId)!;
          stats.reviews.push(clase);
          stats.totalRating += clase.evaluacion.puntaje;
          stats.totalPunctuality += clase.evaluacion.puntualidad;
          stats.totalQuality += clase.evaluacion.calidad;
        });

        const professionalStatsArray: ProfessionalStats[] = Array.from(
          statsMap.entries(),
        ).map(([profId, stats]) => ({
          profesionalId: profId,
          nombre: `${stats.profesional.firstName} ${stats.profesional.lastName}`,
          especialidad: stats.profesional.role,
          totalReviews: stats.reviews.length,
          averageRating: Number(
            (stats.totalRating / stats.reviews.length).toFixed(1),
          ),
          averagePunctuality: Number(
            (stats.totalPunctuality / stats.reviews.length).toFixed(1),
          ),
          averageQuality: Number(
            (stats.totalQuality / stats.reviews.length).toFixed(1),
          ),
          lastReviewDate: stats.reviews.sort(
            (a, b) =>
              new Date(b.evaluacion.fechaEvaluacion).getTime() -
              new Date(a.evaluacion.fechaEvaluacion).getTime(),
          )[0].evaluacion.fechaEvaluacion,
        }));

        setProfessionalStats(
          professionalStatsArray.sort(
            (a, b) => b.averageRating - a.averageRating,
          ),
        );
      }
    } catch (error) {
      console.error("Error loading professional stats:", error);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.alumnoId.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.alumnoId.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.profesionalId.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.profesionalId.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.evaluacion.comentario
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" ||
      (filterRating === "5" && review.evaluacion.puntaje === 5) ||
      (filterRating === "4" && review.evaluacion.puntaje === 4) ||
      (filterRating === "3" && review.evaluacion.puntaje === 3) ||
      (filterRating === "low" && review.evaluacion.puntaje <= 2);

    const matchesProfessional =
      filterProfessional === "all" ||
      review.profesionalId._id === filterProfessional;

    const matchesSpecialty =
      filterSpecialty === "all" || review.especialidad === filterSpecialty;

    return (
      matchesSearch && matchesRating && matchesProfessional && matchesSpecialty
    );
  });

  const getUniqueValues = (key: string) => {
    const values = new Set(
      reviews.map((review) =>
        key === "professional"
          ? review.profesionalId._id
          : key === "specialty"
            ? review.especialidad
            : "",
      ),
    );
    return Array.from(values);
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClass =
      size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getSpecialtyName = (specialty: string) => {
    const names = {
      teacher: "Kinesiología",
      nutritionist: "Nutrición",
      psychologist: "Psicología",
    };
    return names[specialty as keyof typeof names] || specialty;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">
              Cargando evaluaciones...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Evaluaciones</h2>
          <p className="text-gray-600">
            {isStudent
              ? "Revisa tus evaluaciones y las de otros estudiantes"
              : isProfessional
                ? "Revisa las evaluaciones de tus clases"
                : "Gestiona todas las evaluaciones del sistema"}
          </p>
        </div>
        {(isAdmin || isProfessional) && (
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "reviews" ? "default" : "outline"}
              onClick={() => setViewMode("reviews")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Evaluaciones
            </Button>
            <Button
              variant={viewMode === "stats" ? "default" : "outline"}
              onClick={() => setViewMode("stats")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
          </div>
        )}
      </div>

      {/* Stats View */}
      {viewMode === "stats" && (isAdmin || isProfessional) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Mejor Calificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {professionalStats.length > 0 && (
                  <div>
                    <p className="font-medium">{professionalStats[0].nombre}</p>
                    <p className="text-sm text-gray-600">
                      {getSpecialtyName(professionalStats[0].especialidad)}
                    </p>
                    {renderStars(professionalStats[0].averageRating, "md")}
                    <p className="text-xs text-gray-500 mt-1">
                      {professionalStats[0].totalReviews} evaluaciones
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Total de Evaluaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews.length}</div>
                <p className="text-sm text-gray-600">
                  Evaluaciones registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Promedio General
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 && (
                  <div>
                    <div className="text-2xl font-bold">
                      {(
                        reviews.reduce(
                          (sum, r) => sum + r.evaluacion.puntaje,
                          0,
                        ) / reviews.length
                      ).toFixed(1)}
                    </div>
                    {renderStars(
                      reviews.reduce(
                        (sum, r) => sum + r.evaluacion.puntaje,
                        0,
                      ) / reviews.length,
                      "md",
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Professional Rankings */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Profesionales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalStats.map((stat, index) => (
                  <div
                    key={stat.profesionalId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {stat.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{stat.nombre}</h3>
                        <p className="text-sm text-gray-600">
                          {getSpecialtyName(stat.especialidad)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(stat.averageRating, "md")}
                      <div className="text-sm text-gray-600 mt-1">
                        {stat.totalReviews} evaluaciones
                      </div>
                      <div className="text-xs text-gray-500">
                        Puntualidad:{" "}
                        {renderStars(stat.averagePunctuality, "sm")}
                      </div>
                      <div className="text-xs text-gray-500">
                        Calidad: {renderStars(stat.averageQuality, "sm")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews View */}
      {viewMode === "reviews" && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar evaluaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="low">≤ 2 estrellas</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterSpecialty}
                  onValueChange={setFilterSpecialty}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="teacher">Kinesiología</SelectItem>
                    <SelectItem value="nutritionist">Nutrición</SelectItem>
                    <SelectItem value="psychologist">Psicología</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.alumnoId.firstName[0]}
                            {review.alumnoId.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {review.alumnoId.firstName}{" "}
                            {review.alumnoId.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Clase con {review.profesionalId.firstName}{" "}
                            {review.profesionalId.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.fecha).toLocaleDateString("es-ES")}{" "}
                            - {review.hora}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium">General:</span>
                          {renderStars(review.evaluacion.puntaje, "md")}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium">
                            Puntualidad:
                          </span>
                          {renderStars(review.evaluacion.puntualidad, "sm")}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium">Calidad:</span>
                          {renderStars(review.evaluacion.calidad, "sm")}
                        </div>
                      </div>

                      {review.evaluacion.comentario && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm italic">
                            "{review.evaluacion.comentario}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge className="mb-2">
                        {getSpecialtyName(review.especialidad)}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Evaluado el{" "}
                        {new Date(
                          review.evaluacion.fechaEvaluacion,
                        ).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredReviews.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">
                    {reviews.length === 0
                      ? "No hay evaluaciones disponibles aún"
                      : "No se encontraron evaluaciones con los filtros aplicados"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Información del Sistema de Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start">
              <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
              <p>
                Los estudiantes pueden evaluar las clases completadas con
                calificaciones de 1 a 5 estrellas
              </p>
            </div>
            <div className="flex items-start">
              <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
              <p>
                Las evaluaciones incluyen puntualidad, calidad de la clase y
                comentarios opcionales
              </p>
            </div>
            <div className="flex items-start">
              <BarChart3 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <p>
                Las estadísticas ayudan a identificar a los mejores
                profesionales y áreas de mejora
              </p>
            </div>
            <div className="flex items-start">
              <MessageSquare className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
              <p>
                Los comentarios proporcionan feedback valioso para mejorar la
                calidad del servicio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
