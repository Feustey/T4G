import { CategoryType } from '../types';
import { apiFetch } from './config';

export async function getCategories(): Promise<CategoryType[]> {
  const response = await apiFetch('/service-categories/as_consumer');
  const result = await response.json();
  return result;
}
