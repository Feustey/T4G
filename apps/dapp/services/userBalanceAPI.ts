import { apiFetch } from './config';

export async function getUserBalance(): Promise<number> {
  const response = await apiFetch('/users/me/wallet');
  const result = await response.json();
  return result.balance as number;
}
