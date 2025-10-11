import { StatusType } from '../types';
import { apiFetch } from './config';

export async function activateUserWallet(): Promise<StatusType> {
  let status: StatusType = 'PENDING';
  try {
    const res = await apiFetch('/users/me/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status === 200) {
      return (status = 'SUCCESS');
    }
  } catch (error) {
    console.log(error);
    return (status = 'ERROR');
  }
  return Promise.resolve(status);
}
