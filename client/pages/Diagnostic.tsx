import { ConnectivityDiagnostic } from "../components/ConnectivityDiagnostic";

export default function Diagnostic() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico del Sistema
          </h1>
          <p className="text-gray-600">
            Herramientas para diagnosticar problemas de conectividad
          </p>
        </div>

        <ConnectivityDiagnostic />
      </div>
    </div>
  );
}
