import { GlobalMetricsType } from '../types';
import { apiFetch } from './config';

export async function getGlobalMetrics(): Promise<GlobalMetricsType[]> {
  try {
    const response = await apiFetch('/metrics');

    if (!response.ok) {
      console.error('Error on /metrics:', response.statusText);
      return [];
    }

    return (await response.json()) as GlobalMetricsType[];
  } catch (error) {
    console.error('Error on /metrics:', error);
    return [];
  }
}
