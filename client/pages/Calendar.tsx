import { useAuth } from "../contexts/AuthContext";
import { EnhancedUnifiedCalendar } from "../components/EnhancedUnifiedCalendar";

export function Calendar() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Calendario
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu agenda y visualiza tus clases programadas
          </p>
        </div>

        <EnhancedUnifiedCalendar
          viewMode="week"
          showCreateButton={true}
          showConfigButton={true}
          className="w-full"
        />
      </div>
    </div>
  );
}
