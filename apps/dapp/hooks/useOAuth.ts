import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
// Note: Supabase OTP désactivé - Utilisation d'OAuth uniquement (t4g, LinkedIn, Dazno)
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const useOAuth = () => {
  const { login } = useAuth();
  const router = useRouter();

  /**
   * Vérifier si l'utilisateur a déjà une session Dazno active
   */
  const checkExistingDaznoSession = async (): Promise<string | null> => {
    try {
      // Vérifier si on a un token Dazno dans le localStorage
      const daznoToken = localStorage.getItem('dazno_token');
      if (!daznoToken) return null;

      // Vérifier que le token est toujours valide
      const verifyUrl = process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://dazno.de/api/auth/verify-session';
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${daznoToken}`,
        },
      });

      if (response.ok) {
        return daznoToken;
      } else {
        // Token invalide, le supprimer
        localStorage.removeItem('dazno_token');
        return null;
      }
    } catch (error) {
      console.error('Erreur vérification session Dazno:', error);
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
   */
  const loginWithDazno = async (daznoToken?: string) => {
    try {
      // Si pas de token fourni, vérifier s'il y a une session existante
      let token = daznoToken;
      if (!token) {
        token = await checkExistingDaznoSession();
      }

      if (!token) {
        throw new Error('Aucune session Dazno active');
      }

      // Sauvegarder le token
      localStorage.setItem('dazno_token', token);

      // Vérifier le token Dazno avec le backend
      const verifyUrl = process.env.NEXT_PUBLIC_DAZNO_VERIFY_URL || 'https://dazno.de/api/auth/verify-session';
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('dazno_token');
        throw new Error('Token Dazno invalide');
      }

      const daznoUser = await response.json();

      // Login avec le backend via Dazno
      await login('dazeno', {
        token: token,
        providerUserData: {
          email: daznoUser.user.email,
          name: daznoUser.user.name,
        }
      });

      // Rediriger vers dashboard
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
    // Construire l'URL de redirection pour LinkedIn OAuth
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/linkedin`);
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
    // Construire l'URL de redirection pour t4g OAuth
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/t4g`);
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

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/github`);
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
    const response = await fetch('/api/auth/magic-link/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de l'envoi");
    }

    return response.json();
  };

  /**
   * Gérer le callback OAuth (LinkedIn, t4g ou GitHub)
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

      // Échanger le code contre les données utilisateur via notre API
      const response = await fetch(`/api/auth/callback/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec authentification OAuth');
      }

      const userData = await response.json();

      // Login avec le backend via le provider
      await login(provider, {
        providerUserData: {
          email: userData.email,
          given_name: userData.given_name || userData.firstName,
          family_name: userData.family_name || userData.lastName,
          name: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim(),
          sub: userData.sub || userData.id,
          ...(provider === 'github' && { login: userData.login }),
        },
      });

      // Nettoyer le state seulement après succès complet
      sessionStorage.removeItem(`${provider}_oauth_state`);

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error(`Erreur callback ${provider}:`, error);
      throw error;
    }
  }, [login, router]);

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

  return {
    loginWithDazno,
    loginWithLinkedIn,
    loginWitht4g,
    loginWithGitHub,
    sendMagicLink,
    handleOAuthCallback,
    checkExistingDaznoSession,
    initAuth,
  };
};
