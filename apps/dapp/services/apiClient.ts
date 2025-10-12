/**
 * Token4Good v2 API Client
 * Remplace les appels directs MongoDB par des appels REST vers backend Rust
 */

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    } else if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        }
        if (response.status === 403) {
          throw new Error('Accès non autorisé.');
        }
        if (response.status === 404) {
          throw new Error('Ressource non trouvée.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur HTTP: ${response.status}`
        );
      }

      // Pour les réponses sans contenu (204)
      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur réseau inconnue');
    }
  }

  // ============= USERS API =============

  async getUsers(params?: { role?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.set('role', params.role);
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));

    const query = queryParams.toString();
    return this.request<User[]>(`/api/users${query ? `?${query}` : ''}`);
  }

  async getUser(userId: string) {
    return this.request<User>(`/api/users/${userId}`);
  }

  async getCurrentUser() {
    return this.request<User>('/api/users/me');
  }

  async createUser(userData: CreateUserRequest) {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<User>) {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request<void>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============= MENTORING API =============

  async getMentoringRequests(params?: {
    status?: string;
    mentee_id?: string;
    mentor_id?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.mentee_id) queryParams.set('mentee_id', params.mentee_id);
    if (params?.mentor_id) queryParams.set('mentor_id', params.mentor_id);

    const query = queryParams.toString();
    return this.request<MentoringRequest[]>(
      `/api/mentoring/requests${query ? `?${query}` : ''}`
    );
  }

  async getMentoringRequest(requestId: string) {
    return this.request<MentoringRequest>(
      `/api/mentoring/requests/${requestId}`
    );
  }

  async createMentoringRequest(data: CreateMentoringRequest) {
    return this.request<MentoringRequest>('/api/mentoring/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignMentor(requestId: string, mentorId: string) {
    return this.request<MentoringRequest>(
      `/api/mentoring/requests/${requestId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify({ mentor_id: mentorId }),
      }
    );
  }

  // ============= RGB PROOFS API =============

  async getProofs(params?: { contract_id?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.contract_id)
      queryParams.set('contract_id', params.contract_id);

    const query = queryParams.toString();
    return this.request<RGBProof[]>(`/api/proofs${query ? `?${query}` : ''}`);
  }

  async getProof(proofId: string) {
    return this.request<RGBProof>(`/api/proofs/${proofId}`);
  }

  async createProof(data: CreateProofRequest) {
    return this.request<CreateProofResponse>('/api/proofs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyProof(proofId: string) {
    return this.request<VerifyProofResponse>(`/api/proofs/${proofId}/verify`);
  }

  async transferProof(proofId: string, data: TransferProofRequest) {
    return this.request<TransferProofResponse>(
      `/api/proofs/${proofId}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getProofHistory(proofId: string) {
    return this.request<ProofTransfer[]>(`/api/proofs/${proofId}/history`);
  }

  // ============= LIGHTNING NETWORK API =============

  async getLightningNodeInfo() {
    return this.request<LightningNodeInfo>('/api/lightning/node/info');
  }

  async createLightningInvoice(data: CreateInvoiceRequest) {
    return this.request<LightningInvoice>('/api/lightning/invoice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async payLightningInvoice(paymentRequest: string) {
    return this.request<PaymentResponse>('/api/lightning/payment', {
      method: 'POST',
      body: JSON.stringify({ payment_request: paymentRequest }),
    });
  }

  async getPaymentStatus(paymentHash: string) {
    return this.request<PaymentStatus>(
      `/api/lightning/payment/${paymentHash}/status`
    );
  }

  // ============= AUTH API =============

  async login(credentials: LoginRequest) {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async refreshToken() {
    return this.request<RefreshTokenResponse>('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async logout() {
    this.clearToken();
  }

  // ============= METRICS API =============

  async getMetrics() {
    return this.request<MetricsResponse>('/api/metrics');
  }

  // ============= ADMIN API =============

  async getAdminWallets(params?: { limit?: number; offset?: number; min_balance?: number }) {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';
    return this.request<AdminWalletInfo[]>(`/api/admin/wallets${queryString}`);
  }

  async getAdminStats() {
    return this.request<AdminStats>('/api/admin/stats');
  }

  // ============= USER WALLET API =============

  async getUserWallet(userId: string) {
    return this.request<UserWallet>(`/api/users/${userId}/wallet`);
  }

  // ============= HEALTH CHECK =============

  async healthCheck() {
    return this.request<HealthCheckResponse>('/health');
  }
}

// Singleton instance
export const apiClient = new APIClient();

// ============= TypeScript Types =============

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN';
  program?: string;
  graduated_year?: number;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  program?: string;
  graduated_year?: number;
  password?: string;
}

export interface MentoringRequest {
  id: string;
  title: string;
  description: string;
  mentee_id: string;
  mentor_id?: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateMentoringRequest {
  title: string;
  description: string;
  mentee_id: string;
  tags?: string[];
}

export interface RGBProof {
  id: string;
  contract_id: string;
  mentor_id: string;
  mentee_id: string;
  request_id: string;
  rating: number;
  comment: string;
  timestamp: number;
  signature: string;
}

export interface CreateProofRequest {
  request_id: string;
  mentor_id: string;
  mentee_id: string;
  rating: number;
  comment?: string;
}

export interface CreateProofResponse {
  proof: RGBProof;
  contract_id: string;
  signature: string;
}

export interface VerifyProofResponse {
  valid: boolean;
  proof?: RGBProof;
}

export interface TransferProofRequest {
  from_outpoint: string;
  to_outpoint: string;
  amount: number;
}

export interface TransferProofResponse {
  transfer_id: string;
  status: string;
}

export interface ProofTransfer {
  id: string;
  proof_id: string;
  from_address: string;
  to_address: string;
  amount: number;
  timestamp: number;
  txid: string;
}

export interface LightningNodeInfo {
  identity_pubkey: string;
  alias: string;
  num_channels: number;
  synced_to_chain: boolean;
}

export interface CreateInvoiceRequest {
  amount_msat: number;
  description: string;
  expiry_seconds?: number;
}

export interface LightningInvoice {
  payment_request: string;
  payment_hash: string;
  amount_msat: number;
  description: string;
  expiry: number;
}

export interface PaymentResponse {
  payment_hash: string;
  payment_preimage?: string;
  amount_msat: number;
  status: string;
}

export interface PaymentStatus {
  payment_hash: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
}

export interface LoginRequest {
  email: string;
  password?: string;
  provider?: string;
  token?: string;
  provider_user_data?: any;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface HealthCheckResponse {
  status: string;
  database: boolean;
  lightning: boolean;
  rgb: boolean;
  timestamp: string;
}

export interface MetricsResponse {
  total_users: number;
  total_mentoring_requests: number;
  total_rgb_proofs: number;
  active_mentoring_requests: number;
  completed_mentoring_requests: number;
  lightning?: {
    num_channels: number;
    synced_to_chain: boolean;
    total_capacity_msat: number;
  };
  timestamp: string;
}

export interface AdminWalletInfo {
  user_id: string;
  username: string;
  email: string;
  lightning_address: string;
  balance_msat: number;
  pending_balance_msat: number;
  total_received_msat: number;
  total_sent_msat: number;
  num_transactions: number;
  last_transaction_at?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_mentoring_requests: number;
  total_rgb_proofs: number;
  total_lightning_volume_msat: number;
  active_users_last_30_days: number;
  timestamp: string;
}

export interface UserWallet {
  user_id: string;
  lightning_address: string;
  balance_msat: number;
  pending_balance_msat: number;
  total_received_msat: number;
  total_sent_msat: number;
  recent_transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'PAYMENT' | 'INVOICE' | 'TRANSFER';
  amount_msat: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  created_at: string;
  completed_at?: string;
}
