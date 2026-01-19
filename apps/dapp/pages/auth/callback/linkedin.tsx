import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useOAuth } from '../../../hooks/useOAuth';
import Head from 'next/head';

export default function LinkedInCallback() {
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
      // Verrouiller immédiatement pour éviter les appels multiples
      hasProcessedRef.current = true;

      try {
        const { code, state, error: oauthError } = router.query;

        // Vérifier si OAuth a renvoyé une erreur
        if (oauthError) {
          console.error('Erreur OAuth LinkedIn:', oauthError);
          setError(`Erreur d'authentification: ${oauthError}`);
          setTimeout(() => {
            router.push('/login?error=linkedin_auth_failed');
          }, 2000);
          return;
        }

        // Vérifier que nous avons le code et le state
        if (!code || !state) {
          console.error('Code ou state manquant');
          setError('Paramètres d\'authentification manquants');
          setTimeout(() => {
            router.push('/login?error=invalid_callback');
          }, 2000);
          return;
        }

        // Traiter le callback OAuth
        await handleOAuthCallback('linkedin', code as string, state as string);
        
      } catch (err) {
        console.error('Erreur callback LinkedIn:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        // Réinitialiser en cas d'erreur pour permettre un nouveau essai
        hasProcessedRef.current = false;
        setTimeout(() => {
          router.push('/login?error=linkedin_callback_failed');
        }, 2000);
      }
    };

    // Traiter le callback
    processCallback();
  }, [mounted, router.isReady, router.query, handleOAuthCallback]);

  // Afficher un loader pendant l'hydratation
  if (!mounted) {
    return (
      <>
        <Head>
          <title>Connexion LinkedIn...</title>
        </Head>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>🔄 Connexion en cours...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{error ? 'Erreur de connexion' : 'Connexion LinkedIn...'}</title>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
          {error ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
              <h2 style={{ color: '#e53e3e', marginBottom: '10px' }}>
                Erreur d&apos;authentification
              </h2>
              <p style={{ color: '#718096' }}>{error}</p>
              <p style={{ color: '#a0aec0', fontSize: '14px', marginTop: '20px' }}>
                Redirection vers la page de connexion...
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                <div className="spinner" style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #0077B5',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
              <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>
                Authentification LinkedIn
              </h2>
              <p style={{ color: '#718096' }}>
                Connexion en cours...
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
