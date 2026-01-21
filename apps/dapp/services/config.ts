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
  const { headers, credentials, ...rest } = init;
  
  const url = apiUrl(path);
  console.log('🔵 apiFetch - URL:', url);

  try {
    const response = await fetch(url, {
      credentials: credentials ?? 'include',
      headers,
      ...rest,
    });
    
    console.log('🔵 apiFetch - Response:', response.status);
    return response;
  } catch (error) {
    console.error('🔴 apiFetch - Failed to fetch:', url, error);
    throw error;
  }
};

export const apiFetcher = async <T = unknown>(path: string): Promise<T> => {
  try {
    const response = await apiFetch(path);

    if (!response.ok) {
      console.warn(`⚠️ API request failed for ${path}: ${response.status}`);
      throw new Error(`API request failed for ${path}: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`🔴 apiFetcher failed for ${path}:`, error);
    throw error;
  }
};
