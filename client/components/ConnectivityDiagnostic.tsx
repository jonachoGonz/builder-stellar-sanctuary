import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { API_BASE_URL, checkBackendHealth } from "../lib/api";

interface TestResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  message?: string;
  timing?: number;
}

export function ConnectivityDiagnostic() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  
  const testUrls = [
    `${API_BASE_URL}/health`,
    `${API_BASE_URL}/ping`, 
    `${API_BASE_URL}/auth/google/status`,
    `${window.location.origin}/api/health`,
    `/.netlify/functions/api/health`,
  ];

  const runTests = async () => {
    setRunning(true);
    setTests(testUrls.map(url => ({ url, status: 'pending' })));
    
    const results: TestResult[] = [];
    
    for (const url of testUrls) {
      const startTime = Date.now();
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        
        const timing = Date.now() - startTime;
        
        results.push({
          url,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          message: response.ok ? 'OK' : response.statusText,
          timing
        });
      } catch (error: any) {
        const timing = Date.now() - startTime;
        results.push({
          url,
          status: 'error',
          message: error.message || 'Network error',
          timing
        });
      }
      
      setTests([...results]);
    }
    
    setRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusBadge = (result: TestResult) => {
    const variant = result.status === 'success' ? 'default' : 
                  result.status === 'error' ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant}>
        {result.statusCode ? `${result.statusCode}` : result.status}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Diagnóstico de Conectividad
          </CardTitle>
          <Button 
            onClick={runTests} 
            disabled={running}
            size="sm"
            variant="outline"
          >
            {running ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Probar Nuevamente
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>URL Base de API:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">{API_BASE_URL}</code>
            </div>
            <div>
              <strong>Hostname Actual:</strong>
              <code className="block bg-gray-100 p-2 rounded mt-1">{window.location.hostname}</code>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-left p-3 font-medium">URL</th>
                  <th className="text-left p-3 font-medium">Código</th>
                  <th className="text-left p-3 font-medium">Mensaje</th>
                  <th className="text-left p-3 font-medium">Tiempo (ms)</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center">
                        {getStatusIcon(test.status)}
                      </div>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {test.url}
                      </code>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(test)}
                    </td>
                    <td className="p-3 text-sm">
                      {test.message || '-'}
                    </td>
                    <td className="p-3 text-sm">
                      {test.timing ? `${test.timing}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Nota:</strong> Este diagnóstico ayuda a identificar problemas de conectividad con el backend.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>✅ Verde: Conexión exitosa</li>
              <li>❌ Rojo: Error de conexión</li>
              <li>🔄 Azul: Prueba en progreso</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
