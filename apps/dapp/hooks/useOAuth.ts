import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
   */
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

  /**
   * Vérifier la session Supabase et authentifier l'utilisateur
   */
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

      // Login avec le backend
      await login(
        daznoUser.user.email,
        'dazeno',
        token,
        {
          email: daznoUser.user.email,
          name: daznoUser.user.name,
        }
      );

      // Rediriger vers dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur authentification Dazno:', error);
      throw error;
    }
  };

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

    // 2. Vérifier session Supabase
    const hasSupabaseSession = await verifySupabaseSession();
    if (hasSupabaseSession) {
      return;
    }

    // Aucune session active
    return false;
  };

  return {
    loginWithOTP,
    loginWithDazno,
    verifySupabaseSession,
    checkExistingDaznoSession,
    initAuth,
  };
};
