/**
 * Hook pour gérer les appels API avec fallback automatique
 */

import useSWR, { SWRConfiguration } from 'swr';
import { apiFetcher } from '../services/config';
import { useNetwork } from '../contexts/NetworkContext';

export interface UseApiWithFallbackOptions<T> extends SWRConfiguration<T> {
  fallbackData: T;
  retries?: number;
  timeout?: number;
}

/**
 * Hook SWR avec gestion automatique du fallback et du cache
 * 
 * @example
 * const { data, error, isLoading, isUsingCache } = useApiWithFallback(
 *   '/api/metrics',
 *   { fallbackData: FALLBACK_METRICS }
 * );
 */
export function useApiWithFallback<T>(
  path: string | null,
  options: UseApiWithFallbackOptions<T>
) {
  const { isOnline, apiAvailable } = useNetwork();
  const {
    fallbackData,
    retries = 2,
    timeout = 10000,
    ...swrOptions
  } = options;

  const { data, error, isLoading, mutate } = useSWR<T>(
    path,
    (url: string) => apiFetcher<T>(url, { retries, timeout }),
    {
      fallbackData,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: retries,
      errorRetryInterval: 3000,
      ...swrOptions,
    }
  );

  // Déterminer si on utilise le cache
  const isNetworkError = error && (error as any)?.isNetworkError;
  const hasNetworkIssue = !isOnline || !apiAvailable || isNetworkError;
  const isUsingCache = hasNetworkIssue && data !== fallbackData;

  return {
    data: data || fallbackData,
    error,
    isLoading,
    isUsingCache,
    hasNetworkIssue,
    mutate,
  };
}
