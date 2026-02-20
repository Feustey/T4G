import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

interface DebugInfo {
  hasToken: boolean;
  tokenPreview: string;
  isAuthenticated: boolean;
  user: any;
  apiUrl: string;
  backendHealth: string;
  metricsTest: string;
}

export default function DebugAuth() {
  const { user, isAuthenticated, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testingBackend, setTestingBackend] = useState(false);

  useEffect(() => {
    loadDebugInfo();
  }, [user, isAuthenticated]);

  const loadDebugInfo = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const info: DebugInfo = {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}` : 'NO TOKEN',
      isAuthenticated,
      user: user || null,
      apiUrl,
      backendHealth: 'Testing...',
      metricsTest: 'Not tested',
    };

    setDebugInfo(info);
  };

  const testBackend = async () => {
    setTestingBackend(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    try {
      // Test 1: Health check (no auth required)
      const healthRes = await fetch(`${apiUrl}/health`);
      const healthData = await healthRes.json();
      
      // Test 2: Metrics (auth required)
      let metricsStatus = 'No token';
      if (token) {
        const metricsRes = await fetch(`${apiUrl}/api/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        metricsStatus = `${metricsRes.status} ${metricsRes.statusText}`;
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          metricsStatus += ` - Data: ${JSON.stringify(metricsData).substring(0, 100)}...`;
        } else {
          const errorText = await metricsRes.text();
          metricsStatus += ` - Error: ${errorText}`;
        }
      }

      setDebugInfo(prev => prev ? {
        ...prev,
        backendHealth: `${healthRes.status} ${healthRes.statusText} - ${JSON.stringify(healthData)}`,
        metricsTest: metricsStatus,
      } : null);
    } catch (error) {
      setDebugInfo(prev => prev ? {
        ...prev,
        backendHealth: `Error: ${error instanceof Error ? error.message : String(error)}`,
        metricsTest: 'Failed',
      } : null);
    } finally {
      setTestingBackend(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    loadDebugInfo();
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Debug Authentification - Token4Good</title>
      </Head>
      <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <h1 style={{ color: '#333' }}>🔍 Debug Authentification</h1>
        
        {debugInfo && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>État de l&apos;Authentification</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>API URL:</strong>
              <div style={{ 
                padding: '10px', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '4px', 
                marginTop: '5px' 
              }}>
                {debugInfo.apiUrl}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Token présent:</strong>
              <div style={{ 
                padding: '10px', 
                backgroundColor: debugInfo.hasToken ? '#c8e6c9' : '#ffcdd2', 
                borderRadius: '4px', 
                marginTop: '5px',
                color: debugInfo.hasToken ? '#1b5e20' : '#b71c1c',
                fontWeight: 'bold',
              }}>
                {debugInfo.hasToken ? '✅ OUI' : '❌ NON'}
              </div>
              {debugInfo.hasToken && (
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px', 
                  marginTop: '5px',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                }}>
                  {debugInfo.tokenPreview}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Authentifié:</strong>
              <div style={{ 
                padding: '10px', 
                backgroundColor: debugInfo.isAuthenticated ? '#c8e6c9' : '#ffcdd2', 
                borderRadius: '4px', 
                marginTop: '5px',
                color: debugInfo.isAuthenticated ? '#1b5e20' : '#b71c1c',
                fontWeight: 'bold',
              }}>
                {debugInfo.isAuthenticated ? '✅ OUI' : '❌ NON'}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Utilisateur:</strong>
              <pre style={{ 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px', 
                marginTop: '5px',
                overflow: 'auto',
              }}>
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Backend Health:</strong>
              <pre style={{ 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px', 
                marginTop: '5px',
                overflow: 'auto',
              }}>
                {debugInfo.backendHealth}
              </pre>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Test /api/metrics:</strong>
              <pre style={{ 
                padding: '10px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px', 
                marginTop: '5px',
                overflow: 'auto',
              }}>
                {debugInfo.metricsTest}
              </pre>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={testBackend}
            disabled={testingBackend}
            style={{
              padding: '10px 20px',
              backgroundColor: testingBackend ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: testingBackend ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {testingBackend ? 'Test en cours...' : '🔄 Tester Backend'}
          </button>

          <button
            onClick={clearToken}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🗑️ Effacer Token
          </button>

          <button
            onClick={loadDebugInfo}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🔄 Rafraîchir
          </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2>Instructions de Diagnostic</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#f44336' }}>❌ Si &quot;Token présent: NON&quot;</h3>
            <ol>
              <li>Vous devez d&apos;abord vous connecter</li>
              <li>Allez sur <Link href="/landing">/landing</Link> ou <Link href="/login">/login</Link></li>
              <li>Connectez-vous avec un provider OAuth (T4G, LinkedIn, Dazno)</li>
              <li>Revenez sur cette page pour vérifier</li>
            </ol>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#ff9800' }}>⚠️ Si &quot;Token présent: OUI&quot; mais &quot;Authentifié: NON&quot;</h3>
            <ol>
              <li>Le token est peut-être expiré ou invalide</li>
              <li>Cliquez sur &quot;🗑️ Effacer Token&quot;</li>
              <li>Reconnectez-vous</li>
            </ol>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#2196F3' }}>ℹ️ Test Backend</h3>
            <ol>
              <li>Cliquez sur &quot;🔄 Tester Backend&quot;</li>
              <li>Vérifiez que &quot;Backend Health&quot; retourne un statut OK</li>
              <li>Vérifiez que &quot;Test /api/metrics&quot; retourne un code 200 (si vous êtes connecté)</li>
            </ol>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#4CAF50' }}>✅ Si tout est OK</h3>
            <p>Le dashboard devrait fonctionner correctement. Si ce n&apos;est pas le cas :</p>
            <ol>
              <li>Ouvrez la console du navigateur (F12)</li>
              <li>Regardez les logs <code>🔵 apiFetch</code></li>
              <li>Vérifiez les erreurs réseau dans l&apos;onglet &quot;Network&quot;</li>
            </ol>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <strong>💡 Astuce:</strong> Ouvrez la console du navigateur (F12) pour voir les logs détaillés des requêtes API.
        </div>
      </div>
    </>
  );
}
