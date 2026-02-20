import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

interface ConfigStatus {
  name: string;
  value: string | undefined;
  isPublic: boolean;
  required: boolean;
  status: 'ok' | 'missing' | 'warning';
}

export default function TestAuthConfig() {
  const [configs, setConfigs] = useState<ConfigStatus[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Vérifier les variables d'environnement côté client (NEXT_PUBLIC_*)
    const publicConfigs: ConfigStatus[] = [
      {
        name: 'NEXT_PUBLIC_API_URL',
        value: process.env.NEXT_PUBLIC_API_URL,
        isPublic: true,
        required: true,
        status: process.env.NEXT_PUBLIC_API_URL ? 'ok' : 'missing',
      },
      {
        name: 'NEXT_PUBLIC_APP_URL',
        value: process.env.NEXT_PUBLIC_APP_URL,
        isPublic: true,
        required: true,
        status: process.env.NEXT_PUBLIC_APP_URL ? 'ok' : 'missing',
      },
      {
        name: 'NEXT_PUBLIC_LINKEDIN_CLIENT_ID',
        value: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        isPublic: true,
        required: false,
        status: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? 'ok' : 'warning',
      },
      {
        name: 'NEXT_PUBLIC_T4G_CLIENT_ID',
        value: process.env.NEXT_PUBLIC_T4G_CLIENT_ID,
        isPublic: true,
        required: false,
        status: process.env.NEXT_PUBLIC_T4G_CLIENT_ID ? 'ok' : 'warning',
      },
      {
        name: 'NEXT_PUBLIC_T4G_AUTH_URL',
        value: process.env.NEXT_PUBLIC_T4G_AUTH_URL,
        isPublic: true,
        required: false,
        status: process.env.NEXT_PUBLIC_T4G_AUTH_URL ? 'ok' : 'warning',
      },
    ];

    setConfigs(publicConfigs);
  }, []);

  const testBackendConnection = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  const [backendTest, setBackendTest] = useState<{ success?: boolean; data?: any; error?: string } | null>(null);
  const [testingBackend, setTestingBackend] = useState(false);

  const handleTestBackend = async () => {
    setTestingBackend(true);
    const result = await testBackendConnection();
    setBackendTest(result);
    setTestingBackend(false);
  };

  if (!mounted) {
    return (
      <div style={{ padding: '20px' }}>Chargement...</div>
    );
  }

  const missingRequired = configs.filter(c => c.required && c.status === 'missing');
  const missingOptional = configs.filter(c => !c.required && c.status === 'warning');

  return (
    <>
      <Head>
        <title>Test Configuration Authentification - Token4Good</title>
      </Head>
      <div style={{ 
        padding: '40px', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}>
        <h1 style={{ color: '#2d3748', marginBottom: '30px' }}>
          🔧 Test Configuration Authentification
        </h1>

        {/* Variables d'environnement */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>
            Variables d&apos;Environnement (NEXT_PUBLIC_*)
          </h2>
          
          {missingRequired.length > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#fed7d7',
              border: '1px solid #fc8181',
              borderRadius: '4px',
              marginBottom: '20px',
            }}>
              <h3 style={{ color: '#c53030', marginBottom: '10px' }}>
                ❌ Variables Requises Manquantes
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {missingRequired.map(config => (
                  <li key={config.name} style={{ color: '#742a2a' }}>
                    <strong>{config.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missingOptional.length > 0 && (
            <div style={{
              padding: '15px',
              backgroundColor: '#feebc8',
              border: '1px solid #f6ad55',
              borderRadius: '4px',
              marginBottom: '20px',
            }}>
              <h3 style={{ color: '#c05621', marginBottom: '10px' }}>
                ⚠️ Variables Optionnelles Manquantes (OAuth)
              </h3>
              <p style={{ color: '#744210', marginBottom: '10px' }}>
                Ces variables sont nécessaires pour l&apos;authentification OAuth :
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {missingOptional.map(config => (
                  <li key={config.name} style={{ color: '#744210' }}>
                    <strong>{config.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#edf2f7' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Variable</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e0' }}>Valeur</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #cbd5e0' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #cbd5e0' }}>Requis</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config, index) => (
                <tr key={config.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {config.name}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                    {config.value ? (
                      config.name.includes('SECRET') || config.name.includes('SECRET') ? (
                        '••••••••'
                      ) : (
                        config.value.length > 50 ? `${config.value.substring(0, 50)}...` : config.value
                      )
                    ) : (
                      <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Non défini</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {config.status === 'ok' && <span style={{ color: '#38a169', fontSize: '20px' }}>✅</span>}
                    {config.status === 'missing' && <span style={{ color: '#e53e3e', fontSize: '20px' }}>❌</span>}
                    {config.status === 'warning' && <span style={{ color: '#d69e2e', fontSize: '20px' }}>⚠️</span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {config.required ? (
                      <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>OUI</span>
                    ) : (
                      <span style={{ color: '#718096' }}>Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Test Backend */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>
            Test Connexion Backend
          </h2>
          
          <button
            onClick={handleTestBackend}
            disabled={testingBackend}
            style={{
              padding: '12px 24px',
              backgroundColor: testingBackend ? '#cbd5e0' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: testingBackend ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            {testingBackend ? 'Test en cours...' : '🔄 Tester Backend'}
          </button>

          {backendTest && (
            <div style={{
              padding: '15px',
              backgroundColor: backendTest.success ? '#c6f6d5' : '#fed7d7',
              border: `1px solid ${backendTest.success ? '#68d391' : '#fc8181'}`,
              borderRadius: '4px',
            }}>
              {backendTest.success ? (
                <>
                  <h3 style={{ color: '#22543d', marginBottom: '10px' }}>✅ Backend Accessible</h3>
                  <pre style={{ 
                    backgroundColor: '#f7fafc', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px',
                  }}>
                    {JSON.stringify(backendTest.data, null, 2)}
                  </pre>
                </>
              ) : (
                <>
                  <h3 style={{ color: '#742a2a', marginBottom: '10px' }}>❌ Backend Inaccessible</h3>
                  <p style={{ color: '#742a2a' }}>
                    {backendTest.error || 'Erreur inconnue'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>
            📋 Instructions
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#e53e3e' }}>❌ Si des variables requises sont manquantes :</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li>Créer ou éditer le fichier <code>.env.local</code> à la racine du projet</li>
              <li>Ajouter les variables manquantes :
                <pre style={{ 
                  backgroundColor: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '12px',
                }}>
{`NEXT_PUBLIC_API_URL=https://apirust-production.up.railway.app
NEXT_PUBLIC_APP_URL=http://localhost:4200
NEXTAUTH_URL=http://localhost:4200`}
                </pre>
              </li>
              <li>Redémarrer le serveur Next.js (Ctrl+C puis <code>npm run dev</code>)</li>
            </ol>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#d69e2e' }}>⚠️ Pour activer l&apos;authentification OAuth :</h3>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>LinkedIn :</strong>
                <pre style={{ 
                  backgroundColor: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '12px',
                }}>
{`LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=votre_client_id`}
                </pre>
              </li>
              <li><strong>T4G :</strong>
                <pre style={{ 
                  backgroundColor: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '12px',
                }}>
{`CLIENT_ID=votre_t4g_client_id
CLIENT_SECRET=votre_t4g_client_secret
NEXT_PUBLIC_T4G_CLIENT_ID=votre_t4g_client_id
NEXT_PUBLIC_T4G_AUTH_URL=https://oauth.t4g.com`}
                </pre>
              </li>
              <li>Redémarrer le serveur après modification</li>
            </ol>
          </div>

          <div>
            <h3 style={{ color: '#38a169' }}>✅ Note importante :</h3>
            <p style={{ color: '#2d3748' }}>
              Les variables <code>NEXT_PUBLIC_*</code> sont accessibles côté client (navigateur).
              Les autres variables (comme <code>LINKEDIN_CLIENT_SECRET</code>) sont uniquement accessibles côté serveur (routes API).
            </p>
            <p style={{ color: '#718096', fontSize: '14px', marginTop: '10px' }}>
              ⚠️ Ne jamais exposer les secrets (CLIENT_SECRET, etc.) dans le code client !
            </p>
          </div>
        </div>

        {/* Liens utiles */}
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#edf2f7',
          borderRadius: '8px',
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>🔗 Pages Utiles</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/login" style={{ color: '#4299e1', textDecoration: 'none' }}>
                → Page de connexion
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/debug-auth" style={{ color: '#4299e1', textDecoration: 'none' }}>
                → Diagnostic authentification
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/landing" style={{ color: '#4299e1', textDecoration: 'none' }}>
                → Page d&apos;accueil
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
