import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOAuth } from '../../hooks/useOAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { verifySupabaseSession } = useOAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Vérifier et authentifier avec la session Supabase
        const success = await verifySupabaseSession();

        if (!success) {
          // Si échec, rediriger vers login
          router.push('/login?error=auth_failed');
        }
      } catch (error) {
        console.error('Erreur callback authentification:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [router, verifySupabaseSession]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Authentification...</h2>
        <p>Redirection en cours...</p>
      </div>
    </div>
  );
}
