/**
 * AuthContext - Remplace NextAuth par le système JWT du backend Rust
 * Gère l'authentification avec les providers OAuth (t4g, LinkedIn, Dazno)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, type User } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (provider: string, credentials?: any) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'utilisateur au montage
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger l'utilisateur depuis le token stocké
  const loadUser = async () => {
    try {
      setLoading(true);
      
      // Vérifier que nous sommes côté client
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      apiClient.setToken(token);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Token invalide ou expiré
      if (typeof window !== 'undefined') {
        apiClient.clearToken();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec différents providers
  const login = async (provider: string, credentials?: any) => {
    try {
      setLoading(true);
      setError(null);

      let response;

      switch (provider) {
        case 'dazno':
        case 'dazeno':
          if (!credentials?.token) {
            throw new Error('Token Dazno manquant');
          }
          response = await apiClient.login({
            email: '',
            provider: 'dazeno',
            token: credentials.token,
          });
          break;

        case 't4g':
          if (!credentials?.providerUserData) {
            throw new Error('Données utilisateur t4g manquantes');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email,
            provider: 't4g',
            provider_user_data: credentials.providerUserData,
          });
          break;

        case 'linkedin':
          if (!credentials?.providerUserData) {
            throw new Error('Données utilisateur LinkedIn manquantes');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email,
            provider: 'linkedin',
            provider_user_data: credentials.providerUserData,
          });
          break;

        case 'credentials':
        case 'custom':
          // Auth personnalisée pour tests (FAKE_AUTH)
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis');
          }
          response = await apiClient.login({
            email: credentials.email,
            password: credentials.password,
          });
          break;

        case 'supabase':
          // Authentification via Supabase
          if (!credentials?.token || !credentials?.providerUserData) {
            throw new Error('Token Supabase ou données utilisateur manquants');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email,
            provider: 'supabase',
            token: credentials.token,
            provider_user_data: credentials.providerUserData,
          });
          break;

        default:
          throw new Error(`Provider non supporté: ${provider}`);
      }

      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      // Message d'erreur plus clair pour le backend non accessible
      let errorMessage: string;
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://apirust-production.up.railway.app';
        errorMessage = `⚠️ Backend non accessible (${backendUrl}). Vérifiez que Railway est en ligne.`;
      } else {
        errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    if (typeof window !== 'undefined') {
      apiClient.clearToken();
    }
    setUser(null);
    setError(null);
    // Redirection vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Rafraîchir la session
  const refreshSession = async () => {
    try {
      const response = await apiClient.refreshToken();
      apiClient.setToken(response.token);
      await loadUser();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du token:', err);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

// Hook pour remplacer next-auth useSession
export function useSession() {
  const { user, loading } = useAuth();
  
  return {
    data: user ? { user } : null,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
  };
}

// Fonction pour remplacer next-auth getSession (côté serveur)
export async function getSession() {
  try {
    const user = await apiClient.getCurrentUser();
    return { user };
  } catch {
    return null;
  }
}

// Fonction pour remplacer next-auth signIn
export async function signIn(provider: string, options?: any) {
  // Cette fonction est utilisée dans les composants
  // Elle doit être appelée via useAuth().login() à la place
  console.warn(
    'signIn() est déprécié. Utilisez useAuth().login() à la place.'
  );
  return { ok: false, error: 'Utilisez useAuth().login()' };
}

// Fonction pour remplacer next-auth signOut
export async function signOut() {
  apiClient.clearToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
