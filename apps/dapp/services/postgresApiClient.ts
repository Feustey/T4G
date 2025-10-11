/**
 * PostgreSQL API Client for Token4Good
 * Replaces MongoDB-based data access with REST API calls to Rust backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
