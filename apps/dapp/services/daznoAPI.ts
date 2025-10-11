// Service API pour l'intégration Dazno avec Token4Good
// Gère l'authentification double token (JWT + X-Dazno-Token)

export class DaznoAPIService {
  private daznoToken: string | null = null;
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://147.79.101.32:3000';

  // Stocker le token Dazno après l'authentification
  setDaznoToken(token: string) {
    this.daznoToken = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dazno-token', token);
    }
  }

  // Récupérer le token Dazno stocké
  getDaznoToken(): string | null {
    if (this.daznoToken) return this.daznoToken;
    
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('dazno-token');
      if (token) {
        this.daznoToken = token;
        return token;
      }
    }
    
    return null;
  }

  // Headers avec X-Dazno-Token et Authorization
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter X-Dazno-Token pour les routes Dazno
    const daznoToken = this.getDaznoToken();
    if (daznoToken) {
      headers['X-Dazno-Token'] = daznoToken;
    }
    
    // Token JWT standard pour l'auth Token4Good
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }
    }
    
    return headers;
  }

  // ============= USER MANAGEMENT =============

  async getUserProfile(userId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/users/${userId}/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('X-Dazno-Token manquant ou invalide');
      }
      if (response.status === 403) {
        throw new Error('Accès non autorisé à cette ressource');
      }
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return response.json();
  }

  async getT4GBalance(userId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/users/${userId}/tokens/t4g`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur récupération solde T4G: ${response.status}`);
    }
    
    return response.json();
  }

  async updateGamification(userId: string, points: number, action: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/users/${userId}/gamification`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ points, action }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur mise à jour gamification: ${response.status}`);
    }
    
    return response.ok;
  }

  // ============= LIGHTNING NETWORK =============

  async createLightningInvoice(amountSats: number, description: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/lightning/invoice`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        amount_msat: amountSats * 1000, // Convertir sats en millisats
        description,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur création invoice: ${response.status}`);
    }
    
    return response.json();
  }

  async payLightningInvoice(paymentRequest: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/lightning/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        payment_request: paymentRequest,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur paiement invoice: ${response.status}`);
    }
    
    return response.json();
  }

  async getLightningBalance(userId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/lightning/balance/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur récupération balance Lightning: ${response.status}`);
    }
    
    return response.json();
  }

  async getLightningTransactions(userId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(
      `${this.baseURL}/api/dazno/lightning/transactions/${userId}${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur récupération transactions: ${response.status}`);
    }
    
    return response.json();
  }

  // ============= AUTH =============

  async verifyDaznoSession(daznoToken: string) {
    const response = await fetch(`${this.baseURL}/api/auth/dazeno/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: daznoToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token Dazno invalide');
    }
    
    const data = await response.json();
    
    // Stocker le token Dazno pour les futures requêtes
    this.setDaznoToken(daznoToken);
    
    // Stocker le JWT Token4Good
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  }

  // ============= HELPERS =============

  clearTokens() {
    this.daznoToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dazno-token');
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    return this.getDaznoToken() !== null;
  }
}

// Instance singleton
export const daznoAPI = new DaznoAPIService();

// Types TypeScript
export interface DaznoUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  reputation_score: number;
  total_t4g_earned: number;
  total_t4g_spent: number;
  gamification_level: number;
}

export interface TokenBalance {
  t4g_balance: number;
  last_updated: string;
}

export interface LightningInvoice {
  payment_request: string;
  payment_hash: string;
  amount_msat: number;
  description: string;
  expires_at: string;
  status: string;
}

export interface LightningPayment {
  payment_hash: string;
  payment_preimage?: string;
  amount_msat: number;
  fee_msat: number;
  status: string;
  created_at: string;
}

export interface LightningBalance {
  balance_msat: number;
  pending_msat: number;
  reserved_msat: number;
  last_updated: string;
}

export interface LightningTransaction {
  id: string;
  transaction_type: 'invoice' | 'payment';
  amount_msat: number;
  fee_msat: number;
  status: string;
  payment_hash: string;
  description: string;
  created_at: string;
  settled_at?: string;
}