import { StatusType } from '../types';
import { apiFetch } from './config';

export async function setUserAbout(about: string): Promise<StatusType> {
  let status: StatusType = 'PENDING';

  try {
    const res = await apiFetch('/users/me/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ about }),
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
