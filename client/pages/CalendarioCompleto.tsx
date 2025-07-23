import { CalendarioCompleto } from "../components/CalendarioCompleto";

export default function CalendarioCompletoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Calendario / Agenda
          </h1>
          <p className="text-gray-600">
            Gestiona tu agenda de clases, evalúa sesiones y administra disponibilidad
          </p>
        </div>
        
        <CalendarioCompleto className="w-full" />
      </div>
    </div>
  );
}
