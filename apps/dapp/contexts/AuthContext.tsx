import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  lightning_address: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, provider: string, providerToken?: string, providerUserData?: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le token au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
      // TODO: Valider le token et récupérer l'utilisateur
      // Pour l'instant, on peut décoder le JWT pour obtenir les infos basiques
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          // Token valide
          // TODO: Récupérer les infos complètes de l'utilisateur depuis l'API
          setUser({
            id: payload.user_id || '',
            email: payload.email || '',
            firstname: '',
            lastname: '',
            role: payload.role || '',
            lightning_address: '',
          });
        } else {
          // Token expiré
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    provider: string,
    providerToken?: string,
    providerUserData?: any
  ): Promise<void> => {
    try {
      const response = await apiClient.login({
        email,
        provider,
        token: providerToken,
      } as any);

      setToken(response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        firstname: response.user.first_name,
        lastname: response.user.last_name,
        role: response.user.role,
        lightning_address: '',
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.clearToken();
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
