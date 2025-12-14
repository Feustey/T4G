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

  // ============= WEBHOOKS =============

  async configureWebhook(webhookUrl: string, events: string[]) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/webhook`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        webhook_url: webhookUrl,
        events
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur configuration webhook: ${response.status}`);
    }
    
    return response.json();
  }

  async getUserWebhooks(userId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/webhook/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur récupération webhooks: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteWebhook(webhookId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/webhook/${webhookId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur suppression webhook: ${response.status}`);
    }
    
    return response.ok;
  }

  // ============= LNURL =============

  async createLnurlPay(minSendable: number, maxSendable: number, metadata: string, commentAllowed?: number) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/lnurl/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        min_sendable: minSendable,
        max_sendable: maxSendable,
        metadata,
        comment_allowed: commentAllowed
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur création LNURL-pay: ${response.status}`);
    }
    
    return response.json();
  }

  async createLnurlWithdraw(minWithdrawable: number, maxWithdrawable: number, defaultDescription: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/lnurl/withdraw`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        min_withdrawable: minWithdrawable,
        max_withdrawable: maxWithdrawable,
        default_description: defaultDescription
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur création LNURL-withdraw: ${response.status}`);
    }
    
    return response.json();
  }

  async lnurlAuthVerify(k1: string, sig: string, key: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/lnurl/auth`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ k1, sig, key }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur vérification LNURL-auth: ${response.status}`);
    }
    
    return response.json();
  }

  // ============= MULTI-WALLETS =============

  async createWallet(name: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/wallet`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur création wallet: ${response.status}`);
    }
    
    return response.json();
  }

  async listWallets(userId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/wallet/list/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur liste wallets: ${response.status}`);
    }
    
    return response.json();
  }

  async getWalletDetails(walletId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/wallet/${walletId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur détails wallet: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteWallet(walletId: string) {
    const response = await fetch(`${this.baseURL}/api/dazno/v1/wallet/${walletId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur suppression wallet: ${response.status}`);
    }
    
    return response.ok;
  }

  async getWalletInvoices(walletId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(
      `${this.baseURL}/api/dazno/v1/wallet/${walletId}/invoices${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur invoices wallet: ${response.status}`);
    }
    
    return response.json();
  }

  async getWalletPayments(walletId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(
      `${this.baseURL}/api/dazno/v1/wallet/${walletId}/payments${params}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur paiements wallet: ${response.status}`);
    }
    
    return response.json();
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

// ============= WEBHOOK TYPES =============

export interface WebhookConfig {
  id: string;
  user_id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered?: string;
}

export interface WebhookEvent {
  event_type: string;
  timestamp: string;
  data: any;
}

// ============= LNURL TYPES =============

export interface LnurlPayResponse {
  lnurl: string;
  callback: string;
  min_sendable: number;
  max_sendable: number;
  metadata: string;
  comment_allowed?: number;
  tag: string; // "payRequest"
}

export interface LnurlWithdrawResponse {
  lnurl: string;
  callback: string;
  k1: string;
  min_withdrawable: number;
  max_withdrawable: number;
  default_description: string;
  tag: string; // "withdrawRequest"
}

export interface LnurlAuthResponse {
  status: string; // "OK" | "ERROR"
  reason?: string;
  event?: string;
}

// ============= WALLET TYPES =============

export interface WalletInfo {
  id: string;
  user_id: string;
  name: string;
  balance_msat: number;
  created_at: string;
  is_default: boolean;
}

export interface WalletDetails {
  id: string;
  user_id: string;
  name: string;
  balance_msat: number;
  pending_msat: number;
  reserved_msat: number;
  total_received_msat: number;
  total_sent_msat: number;
  total_invoices: number;
  total_payments: number;
  created_at: string;
  updated_at?: string;
  is_default: boolean;
}