import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

export function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      console.log("🔍 Checking API status at:", API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setDetails(data);
        console.log("✅ API is connected:", data);
      } else {
        setStatus('disconnected');
        setDetails({ error: `HTTP ${response.status}: ${response.statusText}` });
        console.error("❌ API returned error:", response.status, response.statusText);
      }
    } catch (error: any) {
      setStatus('disconnected');
      setDetails({ error: error.message || 'Network error' });
      console.error("❌ API connection failed:", error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'disconnected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">
          API Status: {status === 'checking' ? 'Verificando...' : 
                     status === 'connected' ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
      
      {details && (
        <div className="mt-2 text-xs">
          <div><strong>URL:</strong> {API_BASE_URL}</div>
          {details.status && <div><strong>Server:</strong> {details.server}</div>}
          {details.environment && <div><strong>Environment:</strong> {details.environment}</div>}
          {details.error && <div><strong>Error:</strong> {details.error}</div>}
        </div>
      )}
      
      <button 
        onClick={checkApiStatus}
        className="mt-2 text-xs underline hover:no-underline"
      >
        Verificar nuevamente
      </button>
    </div>
  );
}
