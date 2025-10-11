// Hook React pour l'intégration Dazno avec Token4Good
// Gère l'état d'authentification et les opérations Dazno

import { useState, useEffect, useCallback } from 'react';
import { daznoAPI, DaznoUserProfile, TokenBalance, LightningBalance } from '../services/daznoAPI';

interface UseDaznoReturn {
  // État d'authentification
  isAuthenticated: boolean;
  daznoToken: string | null;
  userProfile: DaznoUserProfile | null;
  
  // Balances
  t4gBalance: TokenBalance | null;
  lightningBalance: LightningBalance | null;
  
  // États de chargement
  loading: {
    auth: boolean;
    profile: boolean;
    t4gBalance: boolean;
    lightningBalance: boolean;
  };
  
  // Erreurs
  error: string | null;

  // Actions
  authenticateWithDazno: (daznoToken: string) => Promise<any>;
  refreshData: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setError: (error: string) => void;
  
  // Opérations Lightning
  createInvoice: (amount: number, description: string) => Promise<any>;
  payInvoice: (paymentRequest: string) => Promise<any>;
  
  // Gamification
  addPoints: (points: number, action: string) => Promise<void>;
}

export const useDazno = (userId?: string): UseDaznoReturn => {
  // États
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [daznoToken, setDaznoToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<DaznoUserProfile | null>(null);
  const [t4gBalance, setT4gBalance] = useState<TokenBalance | null>(null);
  const [lightningBalance, setLightningBalance] = useState<LightningBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    auth: false,
    profile: false,
    t4gBalance: false,
    lightningBalance: false,
  });

  // Initialisation - vérifier les tokens stockés
  useEffect(() => {
    const token = daznoAPI.getDaznoToken();
    if (token) {
      setDaznoToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  // Actualiser les données utilisateur
  const refreshData = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    setError(null);
    setLoading(prev => ({ ...prev, profile: true, t4gBalance: true, lightningBalance: true }));

    try {
      const results = await Promise.allSettled([
        daznoAPI.getUserProfile(userId),
        daznoAPI.getT4GBalance(userId),
        daznoAPI.getLightningBalance(userId),
      ]);

      // Gestion du profil
      if (results[0].status === 'fulfilled') {
        setUserProfile(results[0].value);
      } else {
        console.error('Erreur chargement profil:', results[0].reason);
        if (results[0].reason?.message?.includes('X-Dazno-Token')) {
          setError('Session Dazno expirée');
          setIsAuthenticated(false);
        } else {
          setError('Impossible de charger le profil utilisateur.');
        }
      }

      // Gestion du solde T4G
      if (results[1].status === 'fulfilled') {
        setT4gBalance(results[1].value);
      } else {
        console.error('Erreur chargement solde T4G:', results[1].reason);
        setError(prev => prev ? `${prev} Impossible de charger le solde T4G.` : 'Impossible de charger le solde T4G.');
      }

      // Gestion du solde Lightning
      if (results[2].status === 'fulfilled') {
        setLightningBalance(results[2].value);
      } else {
        console.error('Erreur chargement solde Lightning:', results[2].reason);
        setError(prev => prev ? `${prev} Impossible de charger le solde Lightning.` : 'Impossible de charger le solde Lightning.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, profile: false, t4gBalance: false, lightningBalance: false }));
    }
  }, [isAuthenticated, userId]);

  // Charger les données quand l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && userId) {
      refreshData();
    }
  }, [isAuthenticated, userId, refreshData]);

  // Authentification avec Dazno
  const authenticateWithDazno = async (daznoAuthToken: string) => {
    try {
      setLoading(prev => ({ ...prev, auth: true }));
      setError(null);

      // Vérifier le token avec le backend Token4Good
      const authData = await daznoAPI.verifyDaznoSession(daznoAuthToken);
      
      setDaznoToken(daznoAuthToken);
      setIsAuthenticated(true);
      
      return authData;
    } catch (err: any) {
      setError(err.message);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, auth: false }));
    }
  };

  // Déconnexion
  const logout = () => {
    daznoAPI.clearTokens();
    setIsAuthenticated(false);
    setDaznoToken(null);
    setUserProfile(null);
    setT4gBalance(null);
    setLightningBalance(null);
    setError(null);
  };

  // Effacer l'erreur
  const clearError = () => {
    setError(null);
  };

  // Créer une invoice Lightning
  const createInvoice = async (amount: number, description: string) => {
    try {
      setError(null);
      const invoice = await daznoAPI.createLightningInvoice(amount, description);
      
      // Actualiser le solde après création
      await refreshData();
      
      return invoice;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Payer une invoice Lightning
  const payInvoice = async (paymentRequest: string) => {
    try {
      setError(null);
      const payment = await daznoAPI.payLightningInvoice(paymentRequest);
      
      // Actualiser les soldes après paiement
      await refreshData();
      
      return payment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Ajouter des points de gamification
  const addPoints = async (points: number, action: string) => {
    if (!userId) return;
    
    try {
      setError(null);
      await daznoAPI.updateGamification(userId, points, action);
      
      // Actualiser le profil pour voir les nouveaux points
      await refreshData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    // État
    isAuthenticated,
    daznoToken,
    userProfile,
    t4gBalance,
    lightningBalance,
    loading,
    error,

    // Actions
    authenticateWithDazno,
    refreshData,
    logout,
    clearError,
    setError,
    createInvoice,
    payInvoice,
    addPoints,
  };
};

// Hook pour les transactions Lightning
export const useLightningTransactions = (userId: string) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (limit?: number) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const txs = await daznoAPI.getLightningTransactions(userId, limit);
      setTransactions(txs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions(50); // Charger les 50 dernières transactions
  }, [fetchTransactions, userId]);

  return {
    transactions,
    loading,
    error,
    refresh: fetchTransactions,
  };
};