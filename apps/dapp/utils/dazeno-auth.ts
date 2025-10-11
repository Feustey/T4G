export async function checkDaznoSession(): Promise<{
  authenticated: boolean;
  user?: any;
  token?: string;
}> {
  try {
    // Vérifier d'abord s'il y a un token dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Vérifier le token via l'API Dazno
      const response = await fetch('https://dazno.de/api/auth/verify-session', {
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
    const response = await fetch('https://dazno.de/api/auth/verify-session', {
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
    console.error('Erreur vérification session Dazno:', error);
    return { authenticated: false };
  }
}