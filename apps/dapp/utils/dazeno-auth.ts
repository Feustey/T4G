export async function checkDaznoSession(): Promise<{
  authenticated: boolean;
  user?: any;
  token?: string;
}> {
  // En développement local, ne pas essayer de vérifier Dazno (CORS)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[Dazno] Vérification ignorée en développement local');
      return { authenticated: false };
    }
  }

  try {
    const verifyUrl = process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://dazno.de/api/auth/verify-session';
    
    // Vérifier d'abord s'il y a un token dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Vérifier le token via l'API Dazno
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated,
          user: data.user,
          token,
        };
      }
    }

    // Sinon, vérifier via les cookies cross-domain
    const response = await fetch(verifyUrl, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        authenticated: data.authenticated,
        user: data.user,
      };
    }

    return { authenticated: false };
  } catch (error) {
    // Ne logger qu'en mode verbose
    if (process.env.NODE_ENV !== 'development') {
      console.error('Erreur vérification session Dazno:', error);
    }
    return { authenticated: false };
  }
}