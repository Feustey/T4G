import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import Head from 'next/head';

export default function MagicLinkCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!router.isReady || hasProcessed.current) return;

    const { token } = router.query;

    if (!token || typeof token !== 'string') {
      setStatus('error');
      setErrorMessage('Lien invalide ou incomplet');
      return;
    }

    hasProcessed.current = true;

    const verify = async () => {
      try {
        const response = await fetch('/api/auth/magic-link/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Vérification échouée');
        }

        const userData = await response.json();

        await login('magic_link', {
          providerUserData: {
            email: userData.email,
            given_name: userData.given_name,
            family_name: userData.family_name,
            name: userData.name || userData.given_name,
            sub: userData.sub,
          },
        });

        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 1000);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue');
        setTimeout(() => router.push('/login?error=magic_link_failed'), 2500);
      }
    };

    verify();
  }, [router.isReady, router.query, login, router]);

  return (
    <>
      <Head>
        <title>{status === 'error' ? 'Lien invalide' : 'Connexion en cours...'}</title>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 32, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeIn 0.3s ease' }}>
          {status === 'loading' && (
            <>
              <div style={{ width: 48, height: 48, border: '3px solid #f3f3f3', borderTop: '3px solid #f7931a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>Vérification en cours</h2>
              <p style={{ color: '#999' }}>Validation de votre lien de connexion...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: '#1a1a2e', marginBottom: 8 }}>Connexion réussie</h2>
              <p style={{ color: '#999' }}>Redirection vers le tableau de bord...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <h2 style={{ color: '#e53e3e', marginBottom: 8 }}>Lien invalide</h2>
              <p style={{ color: '#666', marginBottom: 8 }}>{errorMessage}</p>
              <p style={{ color: '#999', fontSize: 14 }}>Redirection vers la page de connexion...</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
