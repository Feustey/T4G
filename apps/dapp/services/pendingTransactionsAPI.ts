import { PendingTransactionType } from '../types';
import { apiFetch } from './config';

export async function getUserPendingTransactions(): Promise<
  PendingTransactionType[]
> {
  const response = await apiFetch('/users/me/pending');
  const result = await response.json();
  return result as PendingTransactionType[];
}
