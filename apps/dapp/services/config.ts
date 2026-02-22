const FALLBACK_API_BASE = 'http://localhost:3000';

const rawBase = process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_BASE;

console.log('🔵 config.ts - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔵 config.ts - API_BASE_URL:', rawBase);

export const API_BASE_URL = rawBase.replace(/\/$/, '');

export const apiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (
  path: string,
  init: RequestInit = {}
): Promise<Response> => {
  // Ne pas faire de fetch côté serveur (SSR)
  if (typeof window === 'undefined') {
    console.warn('⚠️ apiFetch called during SSR, skipping');
    throw new Error('API calls are not supported during SSR');
  }

  const { headers, credentials, ...rest } = init;
  
  // Récupérer le token JWT du localStorage
  const token = localStorage.getItem('token');
  
  // Construire les headers avec l'authentification
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const url = apiUrl(path);
  console.log('🔵 apiFetch - URL:', url);
  console.log('🔵 apiFetch - Has token:', !!token);
  console.log('🔵 apiFetch - Headers:', authHeaders);

  try {
    const response = await fetch(url, {
      credentials: credentials ?? 'include',
      headers: authHeaders,
      ...rest,
    });
    
    console.log('🔵 apiFetch - Response:', response.status, response.statusText);
    
    // Log détaillé des erreurs
    if (!response.ok) {
      const errorText = await response.clone().text();
      console.error('🔴 apiFetch - Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
    }
    
    return response;
  } catch (error) {
    // Amélioration du diagnostic d'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = 
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      errorMessage.includes('ERR_CONNECTION_REFUSED') ||
      errorMessage.includes('ERR_NAME_NOT_RESOLVED');
    
    console.error('🔴 apiFetch - Failed to fetch:', url);
    console.error('🔴 apiFetch - Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: errorMessage,
      isNetworkError,
      apiBaseUrl: API_BASE_URL,
      hasToken: !!token,
      environment: typeof window !== 'undefined' ? 'browser' : 'server',
    });
    
    // Message d'erreur plus informatif pour l'utilisateur
    if (isNetworkError) {
      const friendlyError = new Error(
        `Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${API_BASE_URL}`
      );
      (friendlyError as any).originalError = error;
      (friendlyError as any).url = url;
      throw friendlyError;
    }
    
    throw error;
  }
};

/**
 * Sauvegarde une réponse dans le cache local
 */
const saveToCache = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`fetcher_cache_${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('⚠️ Impossible de sauvegarder dans le cache:', error);
  }
};

/**
 * Récupère une réponse depuis le cache local
 */
const getFromCache = <T = unknown>(key: string, maxAge = 24 * 60 * 60 * 1000): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`fetcher_cache_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Vérifier si le cache n'est pas expiré
    if (Date.now() - timestamp < maxAge) {
      return data;
    }
    
    // Cache expiré, le supprimer
    localStorage.removeItem(`fetcher_cache_${key}`);
    return null;
  } catch (error) {
    console.warn('⚠️ Impossible de lire le cache:', error);
    return null;
  }
};

/**
 * Attendre avec un délai (pour retry)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiFetcher = async <T = unknown>(
  path: string,
  options: {
    retries?: number;
    timeout?: number;
    useCacheFallback?: boolean;
  } = {}
): Promise<T> => {
  const { 
    retries = 3, 
    timeout = 10000,
    useCacheFallback = true 
  } = options;

  const cacheKey = path;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await apiFetch(path, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.clone().text().catch(() => 'Unable to read error response');
        console.warn(`⚠️ API request failed for ${path}: ${response.status}`, errorText);
        
        // Pour les erreurs 4xx, ne pas retry
        if (response.status >= 400 && response.status < 500) {
          const error = new Error(
            `API request failed for ${path}: ${response.status} ${response.statusText}`
          ) as any;
          error.status = response.status;
          error.statusText = response.statusText;
          error.path = path;
          error.responseBody = errorText;
          throw error;
        }
        
        // Pour les erreurs 5xx, on peut retry
        if (attempt === retries - 1) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        
        // Attendre avant de réessayer (exponential backoff)
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }

      const data = (await response.json()) as T;
      
      // Sauvegarder dans le cache
      saveToCache(cacheKey, data);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
        errorMessage.includes('Impossible de se connecter') ||
        errorMessage.includes('aborted'); // Timeout
      
      // Si c'est la dernière tentative
      if (attempt === retries - 1) {
        // Essayer le cache en cas d'erreur réseau
        if (isNetworkError && useCacheFallback) {
          const cachedData = getFromCache<T>(cacheKey);
          if (cachedData) {
            console.warn(`⚠️ Toutes les tentatives ont échoué pour ${path}, utilisation du cache`);
            return cachedData;
          }
        }
        
        // Si c'est déjà une erreur formatée, la propager
        if (error && typeof error === 'object' && 'status' in error) {
          console.error(`🔴 apiFetcher failed for ${path}:`, error);
          throw error;
        }
        
        // Créer une erreur formatée
        console.error(`🔴 apiFetcher failed for ${path} after ${retries} attempts:`, error);
        
        const formattedError = new Error(
          isNetworkError
            ? `Impossible de se connecter au serveur (${path}). Vérifiez que le backend est accessible sur ${API_BASE_URL}`
            : `Erreur lors de l'appel API ${path}: ${errorMessage}`
        ) as any;
        formattedError.originalError = error;
        formattedError.path = path;
        formattedError.isNetworkError = isNetworkError;
        formattedError.apiBaseUrl = API_BASE_URL;
        throw formattedError;
      }
      
      // Attendre avant de réessayer (exponential backoff)
      console.log(`⏳ Retry ${attempt + 1}/${retries} pour ${path}...`);
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  
  // Normalement inaccessible
  throw new Error('Unreachable code');
};
