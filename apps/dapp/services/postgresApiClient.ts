/**
 * PostgreSQL API Client for Token4Good
 * Replaces MongoDB-based data access with REST API calls to Rust backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ========== TYPES ==========

export interface ServiceCategory {
  id: string;
  name: string;
  kind?: string;
  description?: string;
  href?: string;
  default_price: number;
  default_unit: string;
  icon?: string;
  disabled: boolean;
  service_provider_type: string;
  audience: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  unit: string;
  description?: string;
  summary?: string;
  avatar?: string;
  price: number;
  rating: number[];
  blockchainId?: number;
  category?: CategoryIdName;
  provider?: UserWallet;
  supply: number;
}

export interface CategoryIdName {
  id: string;
  name: string;
}

export interface UserWallet {
  id: string;
  firstName: string;
  lastName: string;
  wallet?: string;
  avatar?: string;
  program?: string;
  graduatedYear?: string;
  about?: string;
}

export interface BlockchainTransaction {
  id: string;
  hash: string;
  block?: number;
  ts: string;
  from_address: string;
  to_address: string;
  method?: string;
  event?: string;
  target_id?: string;
  transfer_from?: string;
  transfer_to?: string;
  transfer_amount?: number;
  deal_id?: number;
  service_id?: number;
  service_buyer?: string;
  service_provider?: string;
  created_at?: string;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Sauvegarde une réponse dans le cache local
 */
function saveToCache(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`postgres_cache_${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('⚠️ PostgresAPI - Impossible de sauvegarder dans le cache:', error);
  }
}

/**
 * Récupère une réponse depuis le cache local
 */
function getFromCache<T>(key: string, maxAge = 24 * 60 * 60 * 1000): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`postgres_cache_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Vérifier si le cache n'est pas expiré
    if (Date.now() - timestamp < maxAge) {
      return data;
    }
    
    // Cache expiré, le supprimer
    localStorage.removeItem(`postgres_cache_${key}`);
    return null;
  } catch (error) {
    console.warn('⚠️ PostgresAPI - Impossible de lire le cache:', error);
    return null;
  }
}

/**
 * Attendre avec un délai (pour retry)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}_${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Pour les erreurs 4xx, ne pas retry
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Pour les erreurs 5xx, retry
        if (attempt === retries - 1) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }

      const data = await response.json();
      
      // Sauvegarder dans le cache pour les GET
      if (!options.method || options.method === 'GET') {
        saveToCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      // Si c'est la dernière tentative et que c'est une erreur réseau
      if (attempt === retries - 1) {
        // Essayer le cache pour les GET
        if (!options.method || options.method === 'GET') {
          const cachedData = getFromCache<T>(cacheKey);
          if (cachedData) {
            console.warn(`⚠️ PostgresAPI - Erreur réseau, utilisation du cache pour ${endpoint}`);
            return cachedData;
          }
        }
        throw error;
      }
      
      // Attendre avant de réessayer
      console.log(`⏳ PostgresAPI - Retry ${attempt + 1}/${retries} pour ${endpoint}...`);
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  
  throw new Error('Unreachable code');
}

// ========== SERVICE CATEGORIES ==========

export const categoriesAPI = {
  getAll: (): Promise<ServiceCategory[]> =>
    fetchAPI('/api/services/categories'),

  getById: (id: string): Promise<ServiceCategory> =>
    fetchAPI(`/api/services/categories/${id}`),

  getByAudience: (audience: string): Promise<ServiceCategory[]> =>
    fetchAPI(`/api/services/categories/audience/${audience}`),

  create: (data: Partial<ServiceCategory>): Promise<ServiceCategory> =>
    fetchAPI('/api/services/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ServiceCategory>): Promise<ServiceCategory> =>
    fetchAPI(`/api/services/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    fetchAPI(`/api/services/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ========== SERVICES ==========

export const servicesAPI = {
  getAll: (params?: {
    audience?: string;
    provider?: string;
    category?: string;
  }): Promise<Service[]> => {
    const query = new URLSearchParams();
    if (params?.audience) query.append('audience', params.audience);
    if (params?.provider) query.append('provider', params.provider);
    if (params?.category) query.append('category', params.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchAPI(`/api/services${queryString}`);
  },

  getById: (id: string): Promise<Service> =>
    fetchAPI(`/api/services/${id}`),

  getByCategory: (categoryId: string): Promise<Service[]> =>
    fetchAPI(`/api/services/category/${categoryId}`),

  getByProvider: (providerId: string): Promise<Service[]> =>
    fetchAPI(`/api/services/provider/${providerId}`),

  getByAudience: (audience: string): Promise<Service[]> =>
    fetchAPI(`/api/services/audience/${audience}`),

  create: (data: {
    name: string;
    unit?: string;
    description?: string;
    summary?: string;
    avatar?: string;
    price: number;
    audience: string;
    category_id?: string;
    service_provider_id: string;
    annotations?: string[];
  }): Promise<Service> =>
    fetchAPI('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Service>): Promise<Service> =>
    fetchAPI(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    fetchAPI(`/api/services/${id}`, {
      method: 'DELETE',
    }),
};

// ========== BLOCKCHAIN TRANSACTIONS ==========

export const transactionsAPI = {
  getByHash: (hash: string): Promise<BlockchainTransaction> =>
    fetchAPI(`/api/transactions/${hash}`),

  getByAddress: (address: string): Promise<BlockchainTransaction[]> =>
    fetchAPI(`/api/transactions/address/${address}`),

  create: (data: Partial<BlockchainTransaction>): Promise<BlockchainTransaction> =>
    fetchAPI('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTotalSupply: (): Promise<number> =>
    fetchAPI('/api/transactions/stats/total-supply'),

  getLastBlock: (): Promise<number | null> =>
    fetchAPI('/api/transactions/stats/last-block'),
};

// ========== COMPATIBILITY LAYER ==========
// Maps PostgreSQL API to MongoDB-style responses for gradual migration

export const compatibilityLayer = {
  /**
   * Convert PostgreSQL Service to MongoDB-style Service
   */
  serviceToDB: (service: Service) => ({
    _id: service.id,
    name: service.name,
    unit: service.unit,
    description: service.description,
    summary: service.summary,
    avatar: service.avatar,
    price: service.price,
    rating: service.rating,
    blockchainId: service.blockchainId,
    category: service.category?.id,
    serviceProvider: service.provider?.id,
    totalSupply: service.supply,
    audience: 'SERVICE_PROVIDER', // Default, could be enhanced
  }),

  /**
   * Convert PostgreSQL ServiceCategory to MongoDB-style
   */
  categoryToDB: (category: ServiceCategory) => ({
    _id: category.id,
    name: category.name,
    kind: category.kind,
    description: category.description,
    href: category.href,
    defaultPrice: category.default_price,
    defaultUnit: category.default_unit,
    icon: category.icon,
    disabled: category.disabled,
    serviceProviderType: category.service_provider_type,
    audience: category.audience,
  }),

  /**
   * Convert PostgreSQL Transaction to MongoDB-style
   */
  transactionToDB: (tx: BlockchainTransaction) => ({
    hash: tx.hash,
    block: tx.block,
    ts: new Date(tx.ts),
    from: tx.from_address,
    to: tx.to_address,
    method: tx.method,
    event: tx.event,
    targetId: tx.target_id,
    transferFrom: tx.transfer_from,
    transferTo: tx.transfer_to,
    transferAmount: tx.transfer_amount,
    dealId: tx.deal_id,
    serviceId: tx.service_id,
    serviceBuyer: tx.service_buyer,
    serviceProvider: tx.service_provider,
  }),
};
