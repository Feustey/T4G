import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useOAuth } from '../../../hooks/useOAuth';
import Head from 'next/head';

export default function GitHubCallback() {
  const router = useRouter();
  const { handleOAuthCallback } = useOAuth();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !router.isReady || hasProcessedRef.current) return;

    const processCallback = async () => {
      hasProcessedRef.current = true;

      try {
        const { code, state, error: oauthError } = router.query;

        if (oauthError) {
          setError(`Erreur d'authentification: ${oauthError}`);
          setTimeout(() => router.push('/login?error=github_auth_failed'), 2000);
          return;
        }

        if (!code || !state) {
          setError("Paramètres d'authentification manquants");
          setTimeout(() => router.push('/login?error=invalid_callback'), 2000);
          return;
        }

        await handleOAuthCallback('github', code as string, state as string);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        hasProcessedRef.current = false;
        setTimeout(() => router.push('/login?error=github_callback_failed'), 2000);
      }
    };

    processCallback();
  }, [mounted, router.isReady, router.query, handleOAuthCallback, router]);

  if (!mounted) {
    return (
      <>
        <Head><title>Connexion GitHub...</title></Head>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center' }}><h2>Connexion en cours...</h2></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{error ? 'Erreur de connexion' : 'Connexion GitHub...'}</title>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 32, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {error ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: '#e53e3e', marginBottom: 8 }}>Erreur d&apos;authentification</h2>
              <p style={{ color: '#718096' }}>{error}</p>
              <p style={{ color: '#a0aec0', fontSize: 14, marginTop: 16 }}>Redirection vers la page de connexion...</p>
            </>
          ) : (
            <>
              <div style={{ width: 48, height: 48, border: '3px solid #f3f3f3', borderTop: '3px solid #333', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>Authentification GitHub</h2>
              <p style={{ color: '#718096' }}>Connexion en cours...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
