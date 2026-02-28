import { apiClient } from '../services/apiClient';

export async function checkDaznoSession(): Promise<{
  authenticated: boolean;
  user?: { id: string; email: string; name: string; role?: string };
  token?: string;
}> {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { authenticated: false };
    }
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      const user = await apiClient.verifyDaznoSession(urlToken);
      return { authenticated: true, user, token: urlToken };
    }

    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('dazno_token') : null;
    if (storedToken) {
      const user = await apiClient.verifyDaznoSession(storedToken);
      return { authenticated: true, user, token: storedToken };
    }

    return { authenticated: false };
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dazno_token');
    }
    return { authenticated: false };
  }
}
