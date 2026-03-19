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

        case 'github':
          if (!credentials?.providerUserData) {
            throw new Error('Données utilisateur GitHub manquantes');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email,
            provider: 'github',
            provider_user_data: credentials.providerUserData,
          });
          break;

        case 'magic_link':
          if (!credentials?.providerUserData) {
            throw new Error('Données utilisateur Magic Link manquantes');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email,
            provider: 'magic_link',
            provider_user_data: credentials.providerUserData,
          });
          break;

        case 'lnurl':
          if (!credentials?.providerUserData) {
            throw new Error('Données utilisateur LNURL-Auth manquantes');
          }
          response = await apiClient.login({
            email: credentials.providerUserData.email || '',
            provider: 'lnurl',
            provider_user_data: credentials.providerUserData,
          });
          break;

        case 'credentials':
        case 'custom': {
          // Auth personnalisée pour tests - utilise provider t4g
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis');
          }
          
          // Extraire le rôle du mot de passe pour les tests
          const testRole = credentials.password; // admin, alumni, student
          const emailParts = credentials.email.split('@')[0].split('.');
          const firstname = emailParts[0] || 'Test';
          const lastname = emailParts[1] || 'User';
          
          response = await apiClient.login({
            email: credentials.email,
            provider: 't4g',
            provider_user_data: {
              email: credentials.email,
              name: `${firstname.charAt(0).toUpperCase() + firstname.slice(1)} ${lastname.charAt(0).toUpperCase() + lastname.slice(1)}`,
              id: `test_${testRole}_${Date.now()}`,
              role: testRole,
            },
          });
          break;
        }

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

      console.log('🟢 AuthContext - Login réussi, user:', response.user);
      setUser(response.user);
      setError(null);
      console.log('🟢 AuthContext - States mis à jour');
    } catch (err) {
      console.error('🔴 AuthContext - Erreur de connexion:', err);
      
      // Message d'erreur plus clair pour le backend non accessible
      let errorMessage: string;
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const isLocal = backendUrl.includes('localhost');
        errorMessage = isLocal 
          ? `⚠️ Backend non accessible (${backendUrl}). Assurez-vous que le backend Rust est démarré localement.`
          : `⚠️ Backend non accessible (${backendUrl}). Vérifiez que le serveur est en ligne.`;
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
export async function signIn(_provider: string, _options?: any) {
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
