import { useState } from "react";
import { apiCall } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function ConnectivityTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTests = async () => {
    setTesting(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      environment: {
        hostname: window.location.hostname,
        origin: window.location.origin,
        userAgent: navigator.userAgent,
      },
      tests: {},
    };

    // Test 1: Health check
    try {
      const response = await apiCall("/health");
      const data = await response.json();
      testResults.tests.health = {
        status: response.ok ? "success" : "error",
        data,
        error: null,
      };
    } catch (error: any) {
      testResults.tests.health = {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    // Test 2: Auth status
    try {
      const response = await apiCall("/auth/google/status");
      const data = await response.json();
      testResults.tests.authStatus = {
        status: response.ok ? "success" : "error",
        data,
        error: null,
      };
    } catch (error: any) {
      testResults.tests.authStatus = {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    // Test 3: Login endpoint (without credentials)
    try {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "", password: "" }),
      });
      const data = await response.text();
      testResults.tests.loginEndpoint = {
        status: response.status === 400 ? "success" : "warning", // 400 is expected for empty credentials
        data: data,
        error: null,
        note: "Expected 400 error for empty credentials",
      };
    } catch (error: any) {
      testResults.tests.loginEndpoint = {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Prueba de Conectividad API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          {testing ? "Ejecutando pruebas..." : "Ejecutar Pruebas"}
        </Button>

        {results && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <strong>Timestamp:</strong>{" "}
              {new Date(results.timestamp).toLocaleString()}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Información del Entorno:</h4>
              <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                <div>
                  <strong>Hostname:</strong> {results.environment.hostname}
                </div>
                <div>
                  <strong>Origin:</strong> {results.environment.origin}
                </div>
                <div>
                  <strong>User Agent:</strong> {results.environment.userAgent}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Resultados de las Pruebas:</h4>

              {Object.entries(results.tests).map(
                ([testName, result]: [string, any]) => (
                  <div key={testName} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(result.status)}
                        <span className="ml-2 font-medium capitalize">
                          {testName}
                        </span>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>

                    {result.error && (
                      <div className="text-red-600 text-sm mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}

                    {result.note && (
                      <div className="text-blue-600 text-sm mb-2">
                        <strong>Nota:</strong> {result.note}
                      </div>
                    )}

                    {result.data && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600">
                          Ver datos de respuesta
                        </summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {typeof result.data === "string"
                            ? result.data
                            : JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
