/**
 * NetworkContext - Gestion de l'état réseau et disponibilité API
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../services/config';

interface NetworkContextType {
  isOnline: boolean;
  apiAvailable: boolean;
  checkAPI: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  apiAvailable: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  checkAPI: async () => {},
});

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [apiAvailable, setApiAvailable] = useState(true);

  const checkAPI = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setApiAvailable(response.ok);
      console.log(`✅ API disponible: ${response.ok}`);
    } catch (error) {
      setApiAvailable(false);
      console.warn('⚠️ API indisponible:', error);
    }
  };

  useEffect(() => {
    // Gérer les événements online/offline du navigateur
    const handleOnline = () => {
      console.log('🌐 Connexion réseau rétablie');
      setIsOnline(true);
      checkAPI();
    };
    
    const handleOffline = () => {
      console.log('🔴 Connexion réseau perdue');
      setIsOnline(false);
      setApiAvailable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la disponibilité de l'API périodiquement
    const interval = setInterval(checkAPI, 30000); // Toutes les 30s
    
    // Vérification initiale
    checkAPI();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, apiAvailable, checkAPI }}>
      {children}
    </NetworkContext.Provider>
  );
};
