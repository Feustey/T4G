export async function checkDaznoSession(): Promise<{
  authenticated: boolean;
  user?: any;
  token?: string;
}> {
  // En développement local, ne pas essayer de vérifier Dazno (pas de session cross-domain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { authenticated: false };
    }
  }

  try {
    // Vérifier d'abord s'il y a un token dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      // Passer par le proxy API pour éviter CORS (appel serveur → api.dazno.de)
      const response = await fetch('/api/auth/dazno-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: urlToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated ?? true,
          user: data.user,
          token: urlToken,
        };
      }
    }

    // Vérifier s'il y a un token en localStorage (session persistée)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dazno_token') : null;
    if (storedToken) {
      const response = await fetch('/api/auth/dazno-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: storedToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated ?? true,
          user: data.user,
          token: storedToken,
        };
      } else {
        localStorage.removeItem('dazno_token');
      }
    }

    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}
