import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { apiClient } from '../services/apiClient';
// Note: Supabase OTP désactivé - Utilisation d'OAuth uniquement (t4g, LinkedIn, Dazno)
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const useOAuth = () => {
  const { login } = useAuth();
  const router = useRouter();

  /**
   * Vérifier si l'utilisateur a déjà une session Dazno active
   * Utilise le backend Rust pour vérifier le token (évite le proxy Next.js)
   */
  const checkExistingDaznoSession = async (): Promise<string | null> => {
    try {
      const daznoToken = localStorage.getItem('dazno_token');
      if (!daznoToken) return null;

      await apiClient.verifyDaznoSession(daznoToken);
      return daznoToken;
    } catch {
      localStorage.removeItem('dazno_token');
      return null;
    }
  };

  /**
   * Authentification avec Supabase OTP (email magic link)
   * NOTE: Désactivé - Utilisation d'OAuth uniquement (t4g, LinkedIn, Dazno)
   */
  /*
  const loginWithOTP = async (email: string) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Email de connexion envoyé !' };
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      throw error;
    }
  };
  */

  /**
   * Vérifier la session Supabase et authentifier l'utilisateur
   * NOTE: Désactivé - Utilisation d'OAuth uniquement (t4g, LinkedIn, Dazno)
   */
  /*
  const verifySupabaseSession = async () => {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        return false;
      }

      // Login avec le backend via Supabase
      await login('supabase', {
        token: session.access_token,
        providerUserData: {
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        }
      });

      // Rediriger vers dashboard
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error('Erreur vérification session Supabase:', error);
      return false;
    }
  };
  */

  /**
   * Authentification avec Dazno (session existante ou nouvelle)
   * Le backend Rust vérifie le token directement auprès de Dazno
   */
  const loginWithDazno = async (daznoToken?: string) => {
    try {
      let token = daznoToken;
      if (!token) {
        token = await checkExistingDaznoSession();
      }

      if (!token) {
        throw new Error('Aucune session Dazno active');
      }

      localStorage.setItem('dazno_token', token);

      // Login via backend Rust (vérifie le token Dazno et retourne JWT)
      await login('dazeno', { token });

      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur authentification Dazno:', error);
      throw error;
    }
  };

  /**
   * Authentification avec LinkedIn OAuth
   */
  const loginWithLinkedIn = () => {
    // Utilise NEXT_PUBLIC_APP_URL pour garantir que le redirect_uri correspond à l'URL
    // enregistrée dans l'app OAuth (évite les problèmes si le site est accessible via
    // plusieurs domaines, ex: app.token-for-good.com et t4g.dazno.de).
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
    const redirectUri = encodeURIComponent(`${appOrigin}/auth/callback/linkedin`);
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID;

    if (!clientId) {
      console.error('LINKEDIN_CLIENT_ID non configuré');
      throw new Error('Configuration LinkedIn manquante');
    }

    // Rediriger vers LinkedIn OAuth avec les scopes nécessaires
    const scope = encodeURIComponent('openid profile email');
    const state = Math.random().toString(36).substring(7);

    // Stocker le state pour validation
    sessionStorage.setItem('linkedin_oauth_state', state);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    window.location.href = authUrl;
  };

  /**
   * Authentification avec t4g OAuth
   */
  const loginWitht4g = () => {
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
    const redirectUri = encodeURIComponent(`${appOrigin}/auth/callback/t4g`);
    const clientId = process.env.NEXT_PUBLIC_T4G_CLIENT_ID || process.env.CLIENT_ID;
    const authUrl = process.env.NEXT_PUBLIC_T4G_AUTH_URL || process.env.AUTH_URL;

    if (!clientId || !authUrl) {
      console.error('T4G OAuth non configuré');
      throw new Error('Configuration t4g manquante');
    }

    // Rediriger vers t4g OAuth
    const scope = encodeURIComponent('openid profile email');
    const state = Math.random().toString(36).substring(7);

    // Stocker le state pour validation
    sessionStorage.setItem('t4g_oauth_state', state);

    const fullAuthUrl = `${authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    window.location.href = fullAuthUrl;
  };

  /**
   * Authentification avec GitHub OAuth
   */
  const loginWithGitHub = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    if (!clientId) {
      console.error('GITHUB_CLIENT_ID non configuré');
      throw new Error('Configuration GitHub manquante');
    }

    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
    const redirectUri = encodeURIComponent(`${appOrigin}/auth/callback/github`);
    const scope = encodeURIComponent('read:user user:email');
    const state = Math.random().toString(36).substring(7);

    sessionStorage.setItem('github_oauth_state', state);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    window.location.href = authUrl;
  };

  /**
   * Authentification Magic Link - envoie l'email
   */
  const sendMagicLink = async (email: string): Promise<{ success: boolean; dev_link?: string }> => {
    const locale = router.locale || (router as { defaultLocale?: string }).defaultLocale || 'fr';
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app').replace(/\/$/, '');
    const response = await fetch(`${apiBase}/api/auth/magic-link/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, locale }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'envoi");
    }

    return response.json();
  };

  /**
   * Gérer le callback OAuth (LinkedIn, t4g ou GitHub)
   * Appelle directement le backend Rust (/api/auth/exchange/{provider}) en 1 étape.
   */
  const handleOAuthCallback = useCallback(async (provider: 'linkedin' | 't4g' | 'github', code: string, state: string) => {
    try {
      // Vérifier le state pour éviter les attaques CSRF
      const savedState = sessionStorage.getItem(`${provider}_oauth_state`);

      // En développement local, être plus permissif avec la validation du state
      if (process.env.NODE_ENV === 'production' && savedState !== state) {
        throw new Error('State invalide - possible attaque CSRF');
      }

      // Log en dev pour debug
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OAuth Debug] Provider: ${provider}, State reçu: ${state}, State sauvegardé: ${savedState}`);
        if (savedState !== state) {
          console.warn('[OAuth Warning] State mismatch détecté mais ignoré en développement');
        }
      }

      // Appel direct au backend Rust : échange le code et retourne un JWT
      // redirect_uri doit correspondre EXACTEMENT à ce qui a été envoyé lors de l'autorisation
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app').replace(/\/$/, '');
      const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '');
      const redirectUri = `${appOrigin}/auth/callback/${provider}`;
      const response = await fetch(`${apiBase}/api/auth/exchange/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: redirectUri }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || 'Échec authentification OAuth');
      }

      const authData = await response.json(); // AuthResponse { token, user, expires_at }
      apiClient.setToken(authData.token);

      // Nettoyer le state seulement après succès complet
      sessionStorage.removeItem(`${provider}_oauth_state`);

      // Rediriger vers le dashboard (avec locale pour i18n)
      router.push('/dashboard', '/dashboard', { locale: router.locale || 'fr' });
    } catch (error) {
      console.error(`Erreur callback ${provider}:`, error);
      throw error;
    }
  }, [router]);

  /**
   * Initialiser l'authentification (vérifier sessions existantes)
   */
  const initAuth = async () => {
    // 1. Vérifier session Dazno existante
    const daznoToken = await checkExistingDaznoSession();
    if (daznoToken) {
      await loginWithDazno(daznoToken);
      return;
    }

    // 2. Vérifier session Supabase - DÉSACTIVÉ
    // const hasSupabaseSession = await verifySupabaseSession();
    // if (hasSupabaseSession) {
    //   return;
    // }

    // Aucune session active
    return false;
  };

  /** Désactivé - Supabase remplacé par OAuth (t4g, LinkedIn, Dazno). Retourne false pour rediriger vers login. */
  const verifySupabaseSession = async () => false;

  return {
    loginWithDazno,
    loginWithLinkedIn,
    loginWitht4g,
    loginWithGitHub,
    sendMagicLink,
    handleOAuthCallback,
    checkExistingDaznoSession,
    initAuth,
    verifySupabaseSession,
  };
};
