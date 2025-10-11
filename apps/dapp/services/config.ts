const FALLBACK_API_BASE = 'http://localhost:3001/api';

const rawBase = process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_BASE;

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

  const response = await fetch(apiUrl(path), {
    credentials: credentials ?? 'include',
    headers,
    ...rest,
  });

  return response;
};

export const apiFetcher = async <T = unknown>(path: string): Promise<T> => {
  const response = await apiFetch(path);

  if (!response.ok) {
    throw new Error(`API request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
};
